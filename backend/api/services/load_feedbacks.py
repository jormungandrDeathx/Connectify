import os,json,requests
from urllib.parse import urlparse
from django.conf import settings
from django.core.files.base import ContentFile
from api.Models.product import Feedback

def load_feedbacks():
    path = os.path.join(settings.BASE_DIR,"api","Data","fake_product_reviews.json")
    
    if not os.path.exists(path):
        raise FileNotFoundError("fake_product_reviews.json not found")
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    created = 0
    
    for item in data:
        feedback_id = item.get("id")
        
        if Feedback.objects.filter(feedback_id=feedback_id).exists():
            continue
        
        feedback = Feedback(
            feedback_id = feedback_id,
            category = item.get("category"),
            userName = item.get("name"),
            rating = item.get("rating"),
            message = item.get("message"),
            product = item.get("product")
            )
        
        try:
            img = requests.get(item.get("profile_image"), timeout=10)
            img.raise_for_status()
            if img.status_code == 200:
                filename = os.path.basename(urlparse(item["profile_image"]).path)
                
                if not filename or "." not in filename:
                    filename = f"profile_{feedback_id}.jpg"
                feedback.profile_picture.save(
                    filename,ContentFile(img.content),
                    save=False
                )
                print(f"Profile picture saved: ${filename}")
            else:
                print(f"Failed to download image: HTTP {img.status_code}")
                
        except requests.exceptions.Timeout:
            print("Image download Timeout")
        except requests.exceptions.RequestException as e:
            print(f"Image download error: {e}")
        except Exception as e:
            print(f"Unexpected error saving profile picture: {e}")
            pass 
        
        feedback.save()
        created+=1
        
    return created
                