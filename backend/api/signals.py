from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.Models.friends import FriendRequest

def friend_request_payload(instance):
    from_profile = getattr(instance.from_user, "profile", None)
    return {
        "id":instance.id,
        "from_user":instance.from_user.id,
        "to_user":instance.to_user.id,
        "from_username":instance.from_user.username,
        "from_profile":(
            from_profile.profile_picture.url if from_profile and from_profile.profile_picture else None
        ),
        "status":instance.status,
        "createdAt":instance.createdAt.isoformat()
    }
    
def friend_payload(user):
    profile = getattr(user, "profile", None)
    
    return{
        "id":user.id,
        "username":user.username,
        "profile_picture":(
            profile.profile_picture.url if profile and profile.profile_picture else None
        )
    }


@receiver(post_save,sender=FriendRequest)
def friend_request_events(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    payload = friend_request_payload(instance)
    if created:
        
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.to_user.id}",
            {
                "type":"friendRequest",
                "data":payload
            }
        )

        async_to_sync(channel_layer.group_send)(
            f"user_{instance.from_user.id}",
            {
                "type":"sentRequest",
                "data":payload               
            }
        )
    elif instance.status == "accepted":
        from_friend = friend_payload(instance.from_user)
        to_friend = friend_payload(instance.to_user)
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.from_user.id}",
            {
                "type":"friendRequestUpdate",
                "action":"accepted",
                "request_id":instance.id,
                "friend":to_friend
            }
        )
        
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.to_user.id}",
            {
                "type":"friendRequestUpdate",
                "action":"accepted",
                "request_id":instance.id,
                "friend":from_friend
            }
        )
        
    elif instance.status == "declined":
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.to_user.id}",
            {
                "type":"friendRequestUpdate",
                "action":"declined",
                "request_id":instance.id
                
            }
        )
        
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.from_user.id}",
            {
                "type":"friendRequestUpdate",
                "action":"declined",
                "request_id":instance.id
            }
        )
        
@receiver(post_delete,sender=FriendRequest)
def removedFriends(sender,instance,**kwargs):
    channel_layer=get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(
        f"user_{instance.from_user.id}",
        {
            "type":"friendRequestUpdate",
            "action":"removed",
            "request_id":instance.id,
            "friend_id":instance.to_user.id
        }
        
    )
    
    async_to_sync(channel_layer.group_send)(
        f"user_{instance.to_user.id}",
        {
            "type":"friendRequestUpdate",
            "action":"removed",
            "request_id":instance.id,
            "friend_id":instance.from_user.id
        }
    )
    
    


    