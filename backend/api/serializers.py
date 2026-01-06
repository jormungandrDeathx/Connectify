from django.conf import settings

from rest_framework import serializers
from django.contrib.auth.models import User

from api.Models.user import Profile
from api.Models.post import Posts
from api.Models.product import Products, Feedback
from api.Models.friends import FriendRequest
from api.Models.chat import ChatMessage



class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = "user.username", read_only=True)
    email = serializers.EmailField(source = "user.email", read_only = True)
    first_name = serializers.CharField(source = "user.first_name", read_only = True)
    last_name = serializers.CharField(source = "user.last_name", read_only=True)
    
    class Meta:
        model = Profile
        fields = "__all__"

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "profile_picture"]
    
    def get_profile_picture(self, obj):
        """Safely get profile picture URL"""
        try:
            if hasattr(obj, 'profile') and obj.profile:
                if obj.profile.profile_picture and hasattr(obj.profile.profile_picture, 'url'):
                    request = self.context.get('request')
                    if request:
                        return request.build_absolute_uri(obj.profile.profile_picture.url)
                    return obj.profile.profile_picture.url
        except (AttributeError, ValueError, Exception) as e:
            # Log the error for debugging
            print(f"Profile picture error: {e}")
            pass
        
        return None
    
    def to_representation(self, instance):
        """Override to handle profile picture safely during creation"""
        representation = super().to_representation(instance)
        
        # Ensure profile exists and refresh from DB
        if hasattr(instance, 'profile'):
            try:
                instance.profile.refresh_from_db()
            except:
                pass
        
        return representation
        
    def validate(self, data):
        user = self.instance
        username = data.get("username")
        email = data.get("email")
        
        if email:
            qs = User.objects.filter(email=email)
            if user:
                qs = qs.exclude(id=user.id)
            if qs.exists():
                raise serializers.ValidationError({"error": "This Gmail is already registered"})
        
        if username:
            qs = User.objects.filter(username=username)
            if user:
                qs = qs.exclude(id=user.id)
            if qs.exists():
                raise serializers.ValidationError({"error": "This username is already taken"})
        
        return data
        
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create_user(**validated_data, password=password)
        
        # Ensure profile is created immediately
        profile,created = Profile.objects.get_or_create(user=user)
        
        return user
    
    def update(self, instance, validated_data):
        request = self.context.get("request")
        
        # Update user fields
        instance = super().update(instance, validated_data)
        
        # Handle profile picture updates
        if request and hasattr(instance, 'profile'):
            profile = instance.profile
            changed = False
            
            # Check for new upload
            new_upload = request.FILES.get("profile_picture")
            
            if new_upload:
                if profile.profile_picture and profile.profile_picture.name != settings.DEFAULT_AVATAR:
                    profile.profile_picture.delete(save=False)
                profile.profile_picture = new_upload
                changed = True
            
            # Check for removal (empty string)
            elif request.data.get("profile_picture") == "":
                if profile.profile_picture and profile.profile_picture.name != settings.DEFAULT_AVATAR:
                    profile.profile_picture.delete(save=False)
                profile.profile_picture = settings.DEFAULT_AVATAR
                changed = True
            
            if changed:
                profile.save()
        
        return instance

    
class FriendRequestSerialiser(serializers.ModelSerializer):
    from_user = serializers.IntegerField(source="from_user.id",read_only=True)
    from_username = serializers.CharField(source="from_user.username")
    from_profile = serializers.SerializerMethodField()
    
    class Meta:
        model=FriendRequest
        fields=["id","from_user","to_user","from_username","from_profile","status","createdAt"]
        
    def get_from_profile(self,obj):
        request = self.context.get("request")
        profile = obj.from_user.profile
        if profile.profile_picture and request:
            return request.build_absolute_uri(profile.profile_picture.url)
            
        return None
    
    
class FriendListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id")
    username = serializers.CharField(source="user.username")
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ["id","username","profile_picture"]
        
    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required = True)
    new_password = serializers.CharField(required = True)
        
class PostsSerializer(serializers.ModelSerializer):
    postImage = serializers.ImageField()
    
    
    class Meta:
        model =Posts
        fields = '__all__'
        read_only_fields = ['id','userName','userImage','likes']
   
        
class ProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = "__all__"
        
        
        
class PeopleSerialiser(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id")
    email = serializers.EmailField(source="user.email")
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    
    profile_picture = serializers.SerializerMethodField()
    
    city = serializers.CharField(allow_blank=True, required=False)
    state = serializers.CharField(allow_blank=True, required=False)
    country = serializers.CharField(allow_blank=True, required=False)
    createdAt = serializers.DateTimeField(required=False)
    
    
    class Meta:
        model=Profile
        fields="__all__"
        
    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None
        
        
class FeedbackSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields='__all__'
        
        
class ChatMessageSerialiser(serializers.ModelSerializer):
    sender = serializers.IntegerField(source="sender.id")
    receiver = serializers.IntegerField(source="receiver.id")
    
    class Meta:
        model = ChatMessage
        fields = "__all__"