"""
Django settings for Digital World Tour & Travels project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dw-tour-travel-default-key')

DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',') if host.strip()]
if 'testserver' not in ALLOWED_HOSTS and DEBUG:
    ALLOWED_HOSTS.append('testserver')


# Application definition

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.users.apps.UsersConfig',
    'apps.customers.apps.CustomersConfig',
    'apps.tickets.apps.TicketsConfig',
    'apps.visas.apps.VisasConfig',
    'apps.hotels.apps.HotelsConfig',
    'apps.payments.apps.PaymentsConfig',
    'apps.invoices.apps.InvoicesConfig',
    'apps.notifications.apps.NotificationsConfig',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

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

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database Configuration (PostgreSQL with configurable environment variables)
DB_ENGINE = os.getenv('DB_ENGINE', 'django.db.backends.postgresql')
DB_NAME = os.getenv('DB_NAME', 'digital_world_travels')
DB_USER = os.getenv('DB_USER', 'dw_travel_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

if DB_ENGINE == 'django.db.backends.sqlite3':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / (DB_NAME if DB_NAME.endswith('.sqlite3') else 'db.sqlite3'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST': DB_HOST,
            'PORT': DB_PORT,
            'CONN_MAX_AGE': int(os.getenv('DB_CONN_MAX_AGE', '600')),
        }
    }



# Password validation
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
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kathmandu'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Auth User Model
AUTH_USER_MODEL = 'users.User'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'common.pagination.StandardResultsSetPagination',
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Simple JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', '60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME_DAYS', '7'))),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Spectacular OpenAPI Documentation Settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Digital World Tour & Travels API',
    'DESCRIPTION': 'REST API backend for Digital World Tour & Travels (Janakpur Dham, Nepal)',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'ENUM_NAME_OVERRIDES': {
        'TicketStatusEnum': 'apps.tickets.models.TicketStatus',
        'VisaStatusEnum': 'apps.visas.models.VisaStatus',
        'VisaTypeEnum': 'apps.visas.models.VisaType',
        'HotelBookingStatusEnum': 'apps.hotels.models.HotelBookingStatus',
    },


}



# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    origin.strip() 
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000').split(',')
    if origin.strip()
]

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True


# ================================================================
# Flight API Provider Configuration (Travelport / Amadeus / Duffel / Mock)
# ================================================================
FLIGHT_API_PROVIDER = os.getenv('FLIGHT_API_PROVIDER', 'mock').lower()  # 'mock', 'travelport', 'amadeus', 'duffel'

# Travelport GDS (Travelport+ Pre-Production Air API v11)
TRAVELPORT_CLIENT_ID = os.getenv('TRAVELPORT_CLIENT_ID', '')
TRAVELPORT_CLIENT_SECRET = os.getenv('TRAVELPORT_CLIENT_SECRET', '')
TRAVELPORT_USERNAME = os.getenv('TRAVELPORT_USERNAME', '')
TRAVELPORT_PASSWORD = os.getenv('TRAVELPORT_PASSWORD', '')
TRAVELPORT_ACCESSGROUP = os.getenv('TRAVELPORT_ACCESSGROUP', '')
TRAVELPORT_PCC = os.getenv('TRAVELPORT_PCC', os.getenv('TRAVELPORT_TARGET_BRANCH', 'P1234567'))
TRAVELPORT_TARGET_BRANCH = TRAVELPORT_PCC
TRAVELPORT_ENVIRONMENT = os.getenv('TRAVELPORT_ENVIRONMENT', 'preproduction')  # 'preproduction' or 'production'
TRAVELPORT_OAUTH_URL = os.getenv('TRAVELPORT_OAUTH_URL', 'https://auth.pp.travelport.net/oauth/token')
TRAVELPORT_API_BASE_URL = os.getenv('TRAVELPORT_API_BASE_URL', 'https://api.pp.travelport.net/11/air/')

# Amadeus Self-Service API
AMADEUS_CLIENT_ID = os.getenv('AMADEUS_CLIENT_ID', '')
AMADEUS_CLIENT_SECRET = os.getenv('AMADEUS_CLIENT_SECRET', '')
AMADEUS_ENVIRONMENT = os.getenv('AMADEUS_ENVIRONMENT', 'test')  # 'test' or 'production'

# Duffel API
DUFFEL_ACCESS_TOKEN = os.getenv('DUFFEL_ACCESS_TOKEN', os.getenv('DUFFEL_API_TOKEN', ''))
DUFFEL_API_TOKEN = DUFFEL_ACCESS_TOKEN
DUFFEL_API_BASE_URL = os.getenv('DUFFEL_API_BASE_URL', 'https://api.duffel.com')

# Pricing & Markup Engine
FLIGHT_BASE_CURRENCY = os.getenv('FLIGHT_BASE_CURRENCY', 'NPR')
FLIGHT_AGENCY_MARKUP_PERCENT = float(os.getenv('FLIGHT_AGENCY_MARKUP_PERCENT', '5.0'))
FLIGHT_PRICE_LOCK_MINUTES = int(os.getenv('FLIGHT_PRICE_LOCK_MINUTES', '15'))



