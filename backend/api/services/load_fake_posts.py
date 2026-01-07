import os,json
from django.conf import settings
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from api.Models.post import Posts
from random import randint


def load_fake_posts():
    filePath = os.path.join(settings.BASE_DIR, "api", "Data", "fake_posts.json")
    if not os.path.exists(filePath):
        raise FileNotFoundError("fake_posts.json not found")
    
    with open(filePath ,"r", encoding="utf-8") as f:
        data = json.load(f)
        
    
    created = 0
    
    for item in data:
        post_id = item.get("id")
        if not post_id or Posts.objects.filter(id=post_id).exists():
            continue
        
        dt=parse_datetime(item.get("createdAt"))
        
        if dt and timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
        
        post = Posts(
            userName = item.get("userName"),
            userImage = item.get("userImage"),
            message = item.get("message"),
            postImage = item.get("postImage"),
            likes = randint(0,5000),
            createdAt = dt
        )
        post.save()
        created+=1
        
    return created           