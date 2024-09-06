"""
Django settings for project.

For more information see:
https://docs.djangoproject.com/en/4.2/topics/settings/
https://docs.djangoproject.com/en/4.2/ref/settings/
"""
import os
import sys
import io
import environ
from pathlib import Path
from urllib.parse import urlparse
from google.cloud import secretmanager


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# From Google App Engine's example on how to access Secret Settings -- three methods
# NOTE: if you plan to run the webservice not GAE then this .env file is needed (and it needs to set the database access plus VLLM settings)
env = environ.Env(DEBUG=(bool, False))
env_file = os.path.join(BASE_DIR, ".env")
if os.path.isfile(env_file):
    # 1. Use a local secret file, if provided
    env.read_env(env_file)
elif os.getenv("TRAMPOLINE_CI", None):
    # 2. Create local settings if running with CI, for unit testing
    placeholder = (
        f"SECRET_KEY=a\n"
        f"DATABASE_URL=sqlite://{os.path.join(BASE_DIR, 'db.sqlite3')}"
    )
    env.read_env(io.StringIO(placeholder))
elif os.environ.get("GOOGLE_CLOUD_PROJECT", None):
    # 3. Pull secrets from Secret Manager
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    client = secretmanager.SecretManagerServiceClient()
    settings_name = os.environ.get("SETTINGS_NAME", "django_settings")
    name = f"projects/{project_id}/secrets/{settings_name}/versions/latest"
    payload = client.access_secret_version(name=name).payload.data.decode("UTF-8")
    env.read_env(io.StringIO(payload))
else:
    raise Exception("No local .env or GOOGLE_CLOUD_PROJECT detected. No secrets found.")


SECRET_KEY = os.environ['SECRET_KEY']  # load from environment for security


# Deployment checklist: https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/
# SECURITY WARNING: don't run with debug turned on in production!
# Change this to "False" when you are ready for production
DEBUG = True if os.environ.get("DJANGO_DEBUG") else False
print("DEBUG MODE:", DEBUG)

# GAE SECURITY WARNING: It's recommended that you use this when
# running in production. The URL will be known once you first deploy
# to App Engine. This code takes the URL and converts it to both these settings formats.
APPENGINE_URL = env("APPENGINE_URL", default=None)
if APPENGINE_URL:
    # Ensure a scheme is present in the URL before it's processed.
    if not urlparse(APPENGINE_URL).scheme:
        APPENGINE_URL = f"https://{APPENGINE_URL}"

    ALLOWED_HOSTS = [urlparse(APPENGINE_URL).netloc]
    ALLOWED_HOSTS += ["simba.publicinterest.ai"]  # HA - add custom domains here :-)
    CSRF_TRUSTED_ORIGINS = [APPENGINE_URL]
    SECURE_SSL_REDIRECT = True
else:
    ALLOWED_HOSTS = ["*"]



# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # HA added for django REST framework
    'corsheaders',  # HA added to resolve CORS error in browser
    'endpoints',
    'pagebox'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # HA: added to resolve CORS error 
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
     # HA removed 202404 'settings.middleware.TimingMiddleware',  # HA added to measure API time
]

ROOT_URLCONF = 'settings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'settings.wsgi.application'

# Database 
# (HA: replaced below for GAE)
DATABASES = {"default": env.db()}
# If the flag as been set, configure to use proxy
if os.getenv("USE_CLOUD_SQL_AUTH_PROXY", None):
    DATABASES["default"]["HOST"] = "127.0.0.1"
    DATABASES["default"]["PORT"] = 5432
# Use a in-memory sqlite3 database when testing in CI systems
if os.getenv("TRAMPOLINE_CI", None):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
        }
    }


# Password validation
AUTH_PASSWORD_VALIDATORS = [{
    'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
}, {
    'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
}, {
    'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
}, {
    'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Berlin'
USE_I18N = True
USE_L10N = True
USE_TZ = True
TIME_FORMAT = 'H:i'
DATE_FORMAT = 'Y.m.d'
DATETIME_FORMAT = 'Y.m.d H:i'


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'  # GAE
STATIC_ROOT = 'static'  # GAE suggestion
STATICFILES_DIRS = []


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# HA This is for the Django REST framework. 
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # API is public to all (called by browser-extension)
    ]
}

# HA 
CORS_ORIGIN_ALLOW_ALL = True

# Caching Backend 
# - Not necessary to include snippet on GAE (memcached is active/configured already)
# - For other installs, use below, which also requires memcached to be installed/running 
# - Since 202404 we are not using caching currently
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
#         'LOCATION': '127.0.0.1:11211',
#     }
# }

# HA
# (might be useful to configure below, however leaving at default on GAE for now)
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#             'stream': sys.stderr,  # Output to stderr
#         },
#         'file': {
#             'class': 'logging.FileHandler',  # or RotatingFileHandler
#             'filename': 'simba-backend.log',
#         },
#     },
#     'root': {
#         'handlers': ['file'],
#         'level': 'INFO',
#     }
# }
