from django.urls import re_path
from .consumers import GlobalConsumer, ChatConsumer, FriendRequestsNotification,PresenceConsumer

websocket_urlpattern = [
    re_path(r"^ws/chat/$",ChatConsumer.as_asgi()),
    re_path(r"^ws/chat/global/$",GlobalConsumer.as_asgi()),
    re_path(r"^ws/friendRequestNotification/$",FriendRequestsNotification.as_asgi()),
    re_path(r"^ws/presence/$",PresenceConsumer.as_asgi())
   
    
]