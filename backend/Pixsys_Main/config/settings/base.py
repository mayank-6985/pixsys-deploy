import os
from pathlib import Path
from decouple import config, Csv
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-za1!+nfz41%s^ka$xu(cae+jmv3l0cx@gw!0v9u1!-3mh0job0'
SECRET_KEY = config('SECRET_KEY')

# Application definition

INSTALLED_APPS = [
  
    'config.apps.MongoAdminConfig',
    'config.apps.MongoAuthConfig',
    'config.apps.MongoContentTypesConfig',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_mongodb_backend',
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'drf_spectacular_sidecar',    
    'apps.Auth',
    'apps.News',
    'apps.Utils',
    'apps.Solutions',
    'apps.Products',
    'apps.Home',
    'apps.Download', 
    'apps.Contact',
    'apps.Search',
]

# Use custom user model with email as username
AUTH_USER_MODEL = 'Auth.User'

MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database


# Database routers
# https://docs.djangoproject.com/en/dev/ref/settings/#database-routers
DATABASE_ROUTERS = ["django_mongodb_backend.routers.MongoRouter"]

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Optional but recommended: Enables compression and caching support
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ──────────────────────────────────────────────
# Media files (user-uploaded content on local disk)
# ──────────────────────────────────────────────
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Maximum upload size (20 MB).  Django rejects anything larger before
# it even reaches view code, returning a 413 response.
DATA_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024   # 20 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 20 * 1024 * 1024    # 20 MB

# Default primary key field type

DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'

MIGRATION_MODULES = {
    'admin': 'mongo_migrations.admin',
    'auth': 'mongo_migrations.auth',
    'contenttypes': 'mongo_migrations.contenttypes',
}


# logging
# It is generally better to put logs in their own folder
LOGS_DIR = BASE_DIR / 'Logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    
    'formatters': {
        'standard': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
        # THE FIX: Use RotatingFileHandler instead of FileHandler
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler', 
            'filename': LOGS_DIR / 'application.log',
            'maxBytes': 1024 * 1024 * 5,  # 5 MB limit per file
            'backupCount': 5,             # Keep a maximum of 5 old files
            'formatter': 'standard',
        },
    },
    
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# REST Framework settings
REST_FRAMEWORK = {
    # Use header-based JWT authentication (Authorization: Bearer <token>)
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    # This ensures no permissions are required globally
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# Simple JWT and cookie config
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

JWT_AUTH_COOKIE_NAME = 'access_token'
JWT_REFRESH_COOKIE_NAME = 'refresh_token'
JWT_COOKIE_SECURE = False
JWT_COOKIE_SAMESITE = 'Lax'


# API DOCUMENTATION SETTINGS
SPECTACULAR_SETTINGS = {
    'TITLE': 'Your API Project Title',
    'DESCRIPTION': 'Detailed description of what your API does.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    
    # Use the sidecar for Swagger and ReDoc static assets
    'SWAGGER_UI_DIST': 'SIDECAR',
    'SWAGGER_UI_FAVICON_HREF': 'SIDECAR',
    'REDOC_DIST': 'SIDECAR',
    
    # Swagger always accessible
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
}

# Document Bearer token authentication for Swagger/OpenAPI
SPECTACULAR_SETTINGS.setdefault('COMPONENTS', {})
SPECTACULAR_SETTINGS['COMPONENTS'].setdefault('securitySchemes', {})
SPECTACULAR_SETTINGS['COMPONENTS']['securitySchemes']['bearerAuth'] = {
    'type': 'http',
    'scheme': 'bearer',
    'bearerFormat': 'JWT',
}

# Apply bearerAuth globally (individual views can override)
SPECTACULAR_SETTINGS.setdefault('SECURITY', [])
if {'bearerAuth': []} not in SPECTACULAR_SETTINGS['SECURITY']:
    SPECTACULAR_SETTINGS['SECURITY'].append({'bearerAuth': []})



