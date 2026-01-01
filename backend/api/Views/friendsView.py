from django.contrib.auth.models import User

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView

from api.serializers import FriendRequestSerialiser, FriendListSerializer

from api.Models.friends import FriendRequest

class SendFriendrequest(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request,user_id):
        from_user = request.user
        try:
            to_user = User.objects.get(id=user_id)
        except:
            return Response({"error":"User not found"},status=status.HTTP_404_NOT_FOUND)
        
        if FriendRequest.objects.filter(from_user=from_user,to_user=to_user).exists():
            return Response({"error":"Request already sent"},status=status.HTTP_400_BAD_REQUEST)
        
        if FriendRequest.objects.filter(from_user=to_user,to_user=from_user).exists():
            return Response({"error":"User already sent you a request"},status=status.HTTP_400_BAD_REQUEST)
        
        fr = FriendRequest.objects.create(
            from_user=from_user,
            to_user=to_user
        )
        
       
        
        return Response(FriendRequestSerialiser(fr,context={"request":request}).data,status=status.HTTP_201_CREATED)
    

class AcceptFriendRequest(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request,request_id):
        try:
            fr = FriendRequest.objects.get(id=request_id,to_user=request.user)
            
        except:
            return Response({"error":"Friend request not found"},status=status.HTTP_404_NOT_FOUND)
        
        fr.status="accepted"
        fr.save()
        
        request.user.profile.friends.add(fr.from_user.profile)
        fr.from_user.profile.friends.add(request.user.profile)
        
        return Response({"message":"Friend Request Accepted"})
    

class DeclineFriendRequest(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request,request_id):
        try:
            fr = FriendRequest.objects.get(id=request_id,to_user=request.user)
            
            
        except:
            return Response({"error":"Not found"},status=status.HTTP_404_NOT_FOUND)
        
        fr.status="declined"
        fr.save()
        if fr.status=="declined":
            fr.delete()
        
        return Response({"message":"FriendRequest Declined"})
    

class CancelFriendRequest(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self,request,request_id):
    
        try:
            fr = FriendRequest.objects.get(id=request_id,from_user=request.user)
            
        except:
            return Response({"error":"not found"},status=status.HTTP_404_NOT_FOUND)
        
        fr.delete()
        return Response({"message":"friend request cancelled"})
    
    
class ReceivedFriendRequest(ListAPIView):
    serializer_class = FriendRequestSerialiser
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FriendRequest.objects.filter(
            to_user = self.request.user, status = "pending"
        )
    
class SentFriendRequest(ListAPIView):
    serializer_class = FriendRequestSerialiser
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FriendRequest.objects.filter(from_user=self.request.user,status="pending")
    
    
class FriendList(ListAPIView):
    serializer_class = FriendListSerializer
    permission_classes=[IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.profile.friends.all()
    
    
class RemoveFriend(APIView):
    permission_classes=[IsAuthenticated]
    def delete(self,request,user_id):
        try:
            other_user = User.objects.get(id=user_id)
        except:
            return Response({"error":"User not found"},status=status.HTTP_404_NOT_FOUND)
        
        user_profile = request.user.profile
        other_profile = other_user.profile
        
        if not user_profile.friends.filter(id=other_profile.id).exists():
            return Response({"error":"Not friends"},status=status.HTTP_400_BAD_REQUEST)
        
        user_profile.friends.remove(other_profile)
        other_profile.friends.remove(user_profile)
        
        FriendRequest.objects.filter(from_user=request.user,to_user=other_user,status="accepted").delete()
        FriendRequest.objects.filter(from_user=other_user,to_user=request.user,status="accepted").delete()
        
        return Response({"message":"Friend removed successfully"})
    