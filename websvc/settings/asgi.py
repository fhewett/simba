import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')
application = get_asgi_application()


# HA: if channels are used:
#from channels.routing import ProtocolTypeRouter, URLRouter
#from channels.auth import AuthMiddlewareStack
#application = ProtocolTypeRouter({'http': get_asgi_application(),})
