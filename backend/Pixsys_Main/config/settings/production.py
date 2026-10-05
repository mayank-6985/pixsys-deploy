from .base import *
from decouple import config , Csv
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = config('PRODUCTION_ALLOWED_HOSTS' , cast=Csv())

DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'HOST': 'mongodb://localhost:27017/',
        'NAME': 'PIXSYS',
    },
}

# cors configuration
CORS_ALLOW_CREDENTIALS=False

CORS_ALLOWED_ORIGINS = [
    'https://pixsysglobal.com',
    'https://www.pixsysglobal.com',
    'http://pixsysglobal.com',
    'http://www.pixsysglobal.com',
    'http://api.pixsysglobal.com',
    'https://api.pixsysglobal.com'
]

CSRF_TRUSTED_ORIGINS = [
    'https://pixsysglobal.com',
    'https://www.pixsysglobal.com',
    'http://pixsysglobal.com',
    'http://www.pixsysglobal.com',
    'http://api.pixsysglobal.com',
    'https://api.pixsysglobal.com'
]