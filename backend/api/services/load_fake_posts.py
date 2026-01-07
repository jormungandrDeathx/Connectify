import os,requests,json
from urllib.parse import urlparse
from django.conf import settings
from django.core.files.base import ContentFile
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
            message = item.get("message"),
            likes = randint(0,5000),
            createdAt = dt
        )
        
        try:
            if item.get("userImage"):
                img = requests.get(item["userImage"], timeout=10)
                img.raise_for_status()
                if img.status_code == 200 and img.content:
                    userFilename = os.path.basename(urlparse(item["userImage"]).path)
                    if not userFilename or "." not in userFilename:
                        userFilename = f"user_{post_id}.jpg"
                    post.userImage.save(
                        userFilename,
                        ContentFile(img.content),
                        save=False
                    )
                    print(f"Profile Picture saved: {userFilename}")
                else:
                    print(f"Failed to download userimage: HTTP {img.status_code}")
                    
            if item.get("postImage"):
                img = requests.get(item["postImage"], timeout=10)
                if img.status_code == 200 and img.content:
                    postFilename = os.path.basename(urlparse(item["postImage"]).path)
                    if not postFilename or "." not in postFilename:
                        postFilename=f"posts_{post_id}.jpg"
                    post.postImage.save(
                        postFilename,
                        ContentFile(img.content),
                        save=False
                    )
                    print(f"Profile Picture saved: {postFilename}")
                else:
                    print(f"Failed to download image: HTTP {img.status_code}")
        
        except requests.exceptions.Timeout:
            print(f"Image download timeout")
        except requests.exceptions.RequestException as e:
            print(f"Image download error: {e}")
        except Exception as e:
            print(f"unexpected error : {e}")
            pass
        
        post.save()
        created+=1
        
    return created           