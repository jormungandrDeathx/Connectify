from channels.generic.websocket import WebsocketConsumer,AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import json
from django.contrib.auth.models import User
from .utils import get_or_create_conversation
from api.Models.chat import ChatMessage,ConversationStatus
from .serializers import ChatMessageSerialiser
from django.utils import timezone
from urllib.parse import parse_qs
from .presence import user_connected, refresh_presence, get_online_users, _key
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.core.cache import cache



class GlobalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query = parse_qs(self.scope['query_string'].decode())
        token = query.get("token",[None])[0]
        
        if not token:
            await self.close()
            return
        
        try:
            access = AccessToken(token)
            self.user = await database_sync_to_async(User.objects.get)(id=access["user_id"])
        except Exception:
            await self.close()
            return
        
        self.group_name=f"chat_global_{self.user.id}"
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        
    async def chat_notify(self,event):
        await self.send(text_data=json.dumps({
            "sender":event["data"]["sender"],
            "message":event["data"]["message"]
        }))
        

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query=self.scope['query_string'].decode()
        params=parse_qs(query)
        token = params.get("token",None)[0]
        peer_id = params.get("peer",None)[0]
        
        if not token or not peer_id:
            await self.close()
            return
            
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            self.peer = await database_sync_to_async(User.objects.get)(id=peer_id)
        except:
            await self.close()
            return
        
        try:
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            self.other = await database_sync_to_async(User.objects.get)(id=int(peer_id))
        except User.DoesNotExist:
            await self.close()
            return
        
        a,b = sorted([self.user.id,self.other.id])   
        self.room_group_name = f"chat_{a}_{b}"
        
        await database_sync_to_async(self._mark_messages_read)()
            
        await self.channel_layer.group_add(
                self.room_group_name,self.channel_name
            )
            
            
        await self.accept()
               
            
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        
        
    async def receive(self, text_data = None, bytes_data = None):
        payload = json.loads(text_data)
        msg_txt = payload.get("message")
        
        if not msg_txt:
            return
        
        msg =await database_sync_to_async(self._save_message)(msg_txt)
        
       
        serialized = ChatMessageSerialiser(msg).data
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type":"chat_message",
                "message":serialized
            }
        )
        
        await self.channel_layer.group_send(
            f"chat_global_{self.peer.id}",{
                "type":"chat_notify",
                "data":{
                    "sender":self.user.id,
                    "message":msg_txt
                }
            }
        )
            
    async def chat_message(self,event):
        message = event["message"]
        if self.user.id == message["receiver"]:
            await database_sync_to_async(
                ChatMessage.objects.filter(id=message["id"]).update
            )(is_read=True)
        await self.send(text_data=json.dumps(message))
        
        
    def _save_message(self,msg_txt):
        conv,_ = get_or_create_conversation(self.user,self.other)
        
        msg = ChatMessage.objects.create(
            conversation = conv,
            sender = self.user,
            receiver = self.other,
            message=msg_txt,
            is_read = False
        )        
        
        status,_ = ConversationStatus.objects.get_or_create(
            conversation = conv,
            user=self.other
        )
        
        status.unread_count+=1
        status.save(update_fields=["unread_count"])
        
        return msg
    
        
    def _mark_messages_read(self):
        conv,_ = get_or_create_conversation(self.user, self.other)
        
        ChatMessage.objects.filter(
            conversation = conv,
            receiver = self.user,
            is_read = False
        ).update(is_read=True)
        
        ConversationStatus.objects.update_or_create(
            conversation = conv,
            user =self.user,
            defaults={
                "unread_count":0,
                "last_seen":timezone.now()
            }
        )
        

class FriendRequestsNotification(WebsocketConsumer):
    def connect(self):
        self.room_group_name=None
        
        query = self.scope['query_string'].decode()
        params = parse_qs(query)
        
        token_list = params.get("token")
        if not token_list:
            self.close()
            return
        
        token =token_list[0]
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            self.user = User.objects.get(id=user_id)
        except Exception:
            self.close()
            return
        
        self.room_group_name = f"user_{self.user.id}"
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()
        
    def disconnect(self, code):
        if self.room_group_name:
            async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        
    def friendRequest(self,event):
        self.send(text_data=json.dumps({
            "type":"friendRequest",
            "data":event["data"]
            
        }))
        
    def sentRequest(self,event):
        self.send(text_data=json.dumps({
            "type":"sentRequest",
            "data":event["data"]
        }))
    
    def friendRequestUpdate(self,event):
        payload = {
            "type":"friendRequestUpdate",
            "action":event["action"],
            "request_id":event["request_id"],
        }
        
        if "friend" in event:
            payload["friend"] = event["friend"]
            
        if "friend_id" in event:
            payload["friend_id"] = event["friend_id"]
            
        self.send(text_data=json.dumps(payload))


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query = parse_qs(self.scope['query_string'].decode())
        token = query.get("token",[None])[0]
        
        if not token:
            await self.close()
            return
        
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            self.user = await database_sync_to_async(User.objects.get)(id = user_id)
        except Exception :
            await self.close()
            return
        
        self.group_name = "presence_global"
        
        
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        await database_sync_to_async(user_connected)(self.user.id)
        await database_sync_to_async(self._mark_profile_online)()
        
        online_users = await database_sync_to_async(get_online_users)()
        await self.send(text_data=json.dumps({
            "type":"online_users",
            "data":online_users
        }))
        
        await self.channel_layer.group_send(
            self.group_name,{
                "type":"presence_update",
                "data":{
                    "user_id":self.user.id,
                    "is_online":True,
                    "last_seen":None
                }     
            }
            )
        
    
    async def receive(self, text_data = None, bytes_data = None):
        payload = json.loads(text_data or "{}")
        if payload.get("type") == "ping":
            await database_sync_to_async(refresh_presence)(self.user.id)
            await database_sync_to_async(self._update_last_seen)()
            
            
        if payload.get("type") == "logout":
            cache.delete(_key(self.user.id))
            
            await database_sync_to_async(self._mark_profile_offline)()
            
            await self.channel_layer.group_send(
                self.group_name,{
                    "type":"presence_update",
                    "data":{
                        "user_id":self.user.id,
                        "is_online":False,
                        "last_seen":timezone.now().isoformat()
                    }
                }
            )
            
                   
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        
            
    async def presence_update(self,event):
        await self.send(text_data=json.dumps({
            "type":"presence_update",
            "data":event["data"]
        }))
        
             
    def _mark_profile_online(self):
        self.user.profile.is_online=True
        self.user.profile.save(update_fields=["is_online"])
        
    def _mark_profile_offline(self):
        self.user.profile.is_online=False
        self.user.profile.last_seen=timezone.now()
        type(self.user.profile).objects.filter(user=self.user,is_online=True).update(is_online=False,last_seen=timezone.now())
        
        
    def _update_last_seen(self):
        profile = self.user.profile
        profile.last_seen = timezone.now()
        profile.save(update_fields=["last_seen"])
        
        
    