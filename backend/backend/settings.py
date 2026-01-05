from pathlib import Path
import cloudinary
from corsheaders.defaults import default_headers
from dotenv import load_dotenv
import os
from datetime import timedelta
import dj_database_url


load_dotenv()


cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

BASE_DIR = Path(__file__).resolve().parent.parent

EMAIL_BANNER=os.getenv("EMAIL_BANNER")

DEFAULT_AVATAR=os.getenv("DEFAULT_AVATAR")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")


DEBUG = False


ALLOWED_HOSTS = [
    "connectify-5w08.onrender.com",
    ".onrender.com",
    "connectify2026.netlify.app",
    "localhost",
    "127.0.0.1",
]



INSTALLED_APPS = [
    'corsheaders',
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary_storage',
    'cloudinary',
    'rest_framework',
    'channels',
    'rest_framework_simplejwt',
    'api.apps.ApiConfig',
    
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

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

SITE_URL = os.getenv("SITE_URL")

WSGI_APPLICATION = 'backend.wsgi.application'

ASGI_APPLICATION = 'backend.asgi.application'





CHANNEL_LAYERS={
    'default':{
        "BACKEND":"channels_redis.core.RedisChannelLayer",
        "CONFIG":{
            "hosts":[os.getenv("REDIS_URL")]
    }
    }
}


CACHES = {
    "default":{
        "BACKEND":"django_redis.cache.RedisCache",
        "LOCATION":os.getenv("REDIS_URL"),
        "OPTIONS":{
            "CLIENT_CLASS":"django_redis.client.DefaultClient"
        }
    }
}


DATABASES = {
    "default":dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True
    )
    
}




STORAGES = {
    'default':{'BACKEND':'cloudinary_storage.storage.MediaCloudinaryStorage'},
    'staticfiles':{
        'BACKEND':'django.contrib.staticfiles.storage.StaticFilesStorage'
    },
}


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


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'

STATIC_ROOT = BASE_DIR / "static"


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "https://connectify2026.netlify.app",
]


CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = list(default_headers)+[
    "authorization",
    "content-type"
]


CSRF_TRUSTED_ORIGINS = [
    "https://connectify2026.netlify.app"
]

CORS_ALLOW_ALL_ORIGINS=False

CORS_ALLOW_METHODS=[
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT"
]

REST_FRAMEWORK={
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS':"api.pagination.CustomPagination",
    'PAGE_SIZE':20,
}



SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=1440),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':True,
    'BLACKLIST_AFTER_ROTATION':True
}

