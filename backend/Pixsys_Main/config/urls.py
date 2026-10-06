"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
      # Schema (raw)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI (interactive)
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),

    # Redoc UI (clean docs)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema')),
    path('admin/', admin.site.urls),
    path('v1/api/news/' , include("apps.News.urls")),
    path('v1/api/solutions/' , include("apps.Solutions.urls")),
    path('v1/api/products/' , include("apps.Products.urls")),
    path('v1/api/home/' , include("apps.Home.urls")),
    # Auth endpoints (token in body)
    path('v1/api/auth/', include('apps.Auth.urls')),
    path('v1/api/downloads/' , include("apps.Download.urls")),
    path('v1/api/contactus/' , include("apps.Contact.urls")),
    path('v1/api/search/' ,include('apps.Search.urls')),

    # File upload endpoint (replaces the old S3 presigned-URL flow)
    path('v1/api/utils/', include('apps.Utils.urls')),
]

from django.urls import re_path
from django.views.static import serve

# Serve user-uploaded media files.
# In production, Nginx should handle /media/ directly, but if it returns 403 or DEBUG=False prevents it,
# we force Django to serve the files.
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]

