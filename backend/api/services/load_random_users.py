import os,json,requests
from urllib.parse import urlparse

from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.utils.dateparse import parse_datetime
from django.conf import settings

from api.Models.user import Profile

import cloudinary.uploader


def load_random_users():

    filePath = os.path.join(settings.BASE_DIR, "api", "Data","fake_users.json")
    if not os.path.exists(filePath):
        raise FileNotFoundError("fake_usrs.json not found")
    
    with open(filePath, 'r', encoding='utf-8') as f:
        results = json.load(f)
        
    existing_emails = set(
        User.objects.values_list("email",flat=True)
    )
    
    existing_username = set(
        User.objects.values_list("username",flat=True)
    )
    
    
    created = 0
    
    
    for item in results:
        username = item["login"]["username"]
        email = item["email"]
        
        if email in existing_emails or username in existing_username:
            continue
        
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name = item["name"]["first"],
            last_name = item["name"]["last"],
            password=item["login"]["password"]
            )
        
        existing_emails.add(email)
        existing_username.add(username)
    
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
        profile.pincode = item["location"]["postcode"]
        profile.city = item["location"]["city"]
        profile.state = item["location"]["state"]
        profile.country = item["location"]["country"]
        profile.createdAt = parse_datetime(item["registered"]["date"])    
        profile.profile_picture = item["picture"]["large"]
        profile.save()
        created +=1
        
    return created