import os,json,requests
from urllib.parse import urlparse
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.utils.dateparse import parse_datetime
from django.conf import settings
from api.Models.user import Profile


def load_random_users(count=50):
    api=f"https://randomuser.me/api/?results={count}"
    response = requests.get(api, timeout=20)
    response.raise_for_status()
    
    results = response.json()["results"]
    
    filePath = os.path.join(settings.BASE_DIR, "output.json")
    with open(filePath, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)
        
    existing_emails = set(
        User.objects.values_list("email",flat=True)
    )
    
    existing_username = set(
        User.objects.values_list("username",flat=True)
    )
    
    # new_items = [u for u in results if u["email"] not in existing_emails]
    
    # if not new_items:
    #     return 0
    
    created = 0
    users=[]
    
    for item in results:
        username = item["login"]["username"]
        email = item["email"]
        
        if email in existing_emails or username in existing_username:
            continue
        
        user = User(
            email=email,
            username=username,
            first_name = item["name"]["first"],
            last_name = item["name"]["last"],
            )
        user.set_password(item["login"]["password"])
        users.append(user)
        
        existing_emails.add(email)
        existing_username.add(username)
        
    
    User.objects.bulk_create(users, batch_size=100)
    
    users_by_email = {
        u.email: u
        for u in User.objects.filter(email__in=[i["email"] for i in results])
    }
    
    
    
    for item in results:
        user = users_by_email.get(item["email"])
        if not user:
            continue
        
        profile,_ = Profile.objects.get_or_create(user=user)
        
        
        
        
        profile.phone_number = item["phone"]
        profile.street_number = item["location"]["street"]["number"]
        profile.street_name = str(item["location"]["street"]["name"])
        profile.city = item["location"]["city"]
        profile.state = item["location"]["state"]
        profile.country = item["location"]["country"]
        profile.createdAt = parse_datetime(item["registered"]["date"])
        
        
        try:
            img = requests.get(item["picture"]["large"], timeout=10)
            if img.status_code == 200:
                filename = os.path.basename(urlparse(item["picture"]["large"]).path)
                profile.profile_picture.save(
                    filename,ContentFile(img.content),
                    save=False
                )
        except Exception:
            pass
        
        profile.save()
        created +=1
        
    return created