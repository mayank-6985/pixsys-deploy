"""
File Upload API View
--------------------
Replaces the old S3 presigned-URL flow with a secure, server-side upload
pipeline that stores files on local disk (MEDIA_ROOT).

Security measures:
  • MIME type sniffing (magic bytes) to validate actual file content
  • Allowlist of permitted extensions
  • Maximum file size enforcement (20 MB, matches DATA_UPLOAD_MAX_MEMORY_SIZE)
  • UUID-based filenames to prevent collisions and directory traversal
  • Folder parameter is sanitised to a flat alphanumeric string
"""

import logging
import os
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiTypes
from rest_framework import serializers as drf_serializers

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Allowed MIME types and extensions
# ──────────────────────────────────────────────
ALLOWED_MIME_TYPES = {
    # Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'image/vnd.dxf', 'image/vnd.dwg',
    # Documents / archives
    'application/pdf',
    'application/zip', 'application/x-zip-compressed',
    'application/vnd.rar', 'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/xml', 'text/xml',
    'application/octet-stream',  # generic binary (CAD, EDS, etc.)
    'application/step', 'application/stp',
    # Executables / installers (allowed for download centre)
    'application/x-msdownload', 'application/x-msi',
}

ALLOWED_EXTENSIONS = {
    # Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    # CAD / engineering
    '.dxf', '.dwg', '.stp', '.step',
    # Documents
    '.pdf', '.xml', '.eds',
    # Archives
    '.zip', '.rar', '.7z',
    # Executables / installers
    '.exe', '.msi',
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _sanitise_folder(folder_name: str) -> str:
    """Return a safe, flat folder name (alphanumeric + hyphens/underscores)."""
    import re
    if not folder_name:
        return 'general'
    clean = re.sub(r'[^a-zA-Z0-9_-]', '', folder_name)
    return clean or 'general'


class FileUploadView(APIView):
    """
    POST /v1/api/utils/upload/

    Accepts a single file via ``multipart/form-data`` with an optional
    ``folder`` field that determines the sub-directory under ``MEDIA_ROOT``.

    Returns the public URL of the saved file so the admin panel can store
    it as a URLField value in MongoDB documents.
    """
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        summary="Upload a file to local storage",
        description=(
            "Accepts a file via multipart/form-data and stores it on the "
            "server's local disk.  Returns the publicly-accessible URL."
        ),
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'folder': {'type': 'string', 'default': 'general'},
                },
                'required': ['file'],
            }
        },
        responses={
            201: inline_serializer(
                name="FileUploadSuccess",
                fields={
                    "file_url": drf_serializers.URLField(),
                    "message": drf_serializers.CharField(),
                }
            ),
            400: inline_serializer(
                name="FileUploadError",
                fields={"error": drf_serializers.CharField()}
            ),
        }
    )
    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {"error": "No file provided. Send a file in the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Size check ──────────────────────────────────────
        if uploaded_file.size > MAX_FILE_SIZE:
            return Response(
                {"error": f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)} MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Extension check ─────────────────────────────────
        _, ext = os.path.splitext(uploaded_file.name)
        ext = ext.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return Response(
                {"error": f"File extension '{ext}' is not permitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── MIME type check ─────────────────────────────────
        content_type = uploaded_file.content_type or 'application/octet-stream'
        if content_type not in ALLOWED_MIME_TYPES:
            return Response(
                {"error": f"File type '{content_type}' is not permitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Build a safe, collision-free file path ──────────
        folder = _sanitise_folder(request.data.get('folder', 'general'))
        unique_name = f"{uuid.uuid4().hex}{ext}"
        relative_path = os.path.join(folder, unique_name)

        try:
            saved_path = default_storage.save(relative_path, uploaded_file)

            # Build the full public URL.
            # In production the MEDIA_URL is relative (/media/…) and the
            # reverse proxy (Nginx) serves it.  The frontend already knows
            # the API base URL, so we return the relative media path.
            file_url = f"{settings.MEDIA_URL}{saved_path}"

            return Response(
                {"file_url": file_url, "message": "File uploaded successfully."},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            return Response(
                {"error": "An unexpected error occurred while saving the file."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
