from django.db.models import F

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView, DestroyAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser

from api.serializers import PostsSerializer

from api.Models.post import Posts


class PostCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostsSerializer
    parser_classes = [MultiPartParser,JSONParser,FormParser]
    
    def perform_create(self, serializer):
        user = self.request.user
        profile = user.profile
    
        serializer.save(
            userName = user.username,
            userImage = profile.profile_picture
        )


class PostsListView(ListAPIView):
    serializer_class = PostsSerializer
    queryset = Posts.objects.all()
    

class ToggleLikes(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,pk):
        try:
            post = Posts.objects.get(pk=pk)
        except Posts.DoesNotExist:
            return Response({"error":"Post not found"},status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get("action")
        
        if action == "like":
            post.likes = F("likes") + 1
        elif action == "unlike" and post.likes>0:
            post.likes = F("likes") - 1
            
        post.save(update_fields=["likes"])
        post.refresh_from_db(fields=["likes"])
        return Response({"likes":post.likes}, status=status.HTTP_200_OK)
    
    
class PostDeleteView(DestroyAPIView):
    serializer_class=PostsSerializer
    permission_classes=[IsAuthenticated]
    
    def get_queryset(self):
        return Posts.objects.filter(userName=self.request.user.username)
    
    def perform_destroy(self, instance):
        if instance.postImage:
            instance.postImage.delete(save=False)
        
        instance.delete()
    
