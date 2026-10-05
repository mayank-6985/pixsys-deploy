from .base import *
from decouple import config , Csv
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = config('LOCAL_ALLOWED_HOSTS' , cast=Csv())

# database
LOCAL_MONGODB_URI=config('TEST_MONGODB_URI')
DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'HOST': LOCAL_MONGODB_URI,
        'NAME': 'PIXSYS_TEST',
    },
}

# cors configuration
CORS_ALLOW_CREDENTIALS=True

CORS_ALLOWED_ORIGINS = [
    "https://unsettled-manual-dynasty.ngrok-free.dev",
    "https://tragicomical-epileptically-davin.ngrok-free.dev",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5173",
    "https://pixsysglobal.com",
    "https://pixsys.onrender.com",
    "https://admin.pixsysglobal.com",
    "http://admin.pixsysglobal.com"
]

# csrf setup
CSRF_TRUSTED_ORIGINS = [
    "https://unsettled-manual-dynasty.ngrok-free.dev",
    "https://tragicomical-epileptically-davin.ngrok-free.dev",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5173",
    "https://pixsys.onrender.com",
    "https://admin.pixsysglobal.com",
    "http://admin.pixsysglobal.com"
]


from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = (
    *default_headers,
    'ngrok-skip-browser-warning',
) 


# AWS SETUP

# AWS S3 Settings (Commented out to use local storage as requested)
# AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='dummy')
# AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='dummy')
# AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='dummy')
# AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='dummy')

# Optional: Set signature version explicitly for presigned URLs
# AWS_S3_SIGNATURE_VERSION = 's3v4'
# AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
# AWS_S3_OBJECT_PARAMETERS = {
#     'CacheControl': 'max-age=86400',  # Cache for a day
#     'StorageClass': 'STANDARD'  # Pick your storage flavor
# }
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'