from django.contrib.auth.models import User

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.serializers import ChatMessageSerialiser

from api.Models.chat import Conversation, ChatMessage, ConversationStatus

from api.presence import get_user_presence


class ChatHistory(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request, peer_id):
        user = request.user
        a,b = sorted([user.id,peer_id])
        
        try:
            conv = Conversation.objects.get(user1_id=a,user2_id=b)
        except Conversation.DoesNotExist:
            return Response([])
        
        messages = ChatMessage.objects.filter(conversation=conv).order_by("createdAt")
        
        return Response(ChatMessageSerialiser(messages,many=True).data)
    
    
class Userstatus(APIView):
    def get(self,request,user_id):
        try:
            user = User.objects.get(id=user_id)
            presence = get_user_presence(user)
        except:
            return Response({"error":"users not found"},status=status.HTTP_404_NOT_FOUND)
        
        
        
        return Response(presence)
        
    
class UnreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        qs = ConversationStatus.objects.filter(user=request.user,
                                               unread_count__gt=0)
        
        return Response({
            "total_unread":sum(i.unread_count for i in qs),
            "by_user":{
                i.conversation.user1.id if i.conversation.user1!=request.user else i.conversation.user2.id: i.unread_count
                for i in qs
            }
        })