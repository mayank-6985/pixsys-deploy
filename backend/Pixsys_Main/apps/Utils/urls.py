from django.urls import path
# <<<<<<< HEAD
# from .views import GenerateUploadURLView

# urlpatterns = [
#     # ... your other urls ...
#     path('generate-upload-url/', GenerateUploadURLView.as_view(), name='generate-upload-url'),
# ]
from .views import FileUploadView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
]
