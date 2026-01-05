from django.contrib.auth.models import User
from django.db import models as db
from django.conf import settings


class Profile(db.Model):
    user = db.OneToOneField(User, on_delete=db.CASCADE)
    profile_picture = db.ImageField(upload_to='Media/ProfilePictures/',blank=True,null=True) 
    phone_number = db.CharField()
    pincode = db.CharField(null=True,blank=True)
    street_number = db.CharField(null=True,blank=True)
    street_name = db.CharField(null=True,blank=True)
    city = db.CharField(null=True,blank=True)
    state = db.CharField(null=True,blank=True)
    country = db.CharField(null=True,blank=True)
    createdAt = db.DateTimeField(null=True,blank=True)
    friends = db.ManyToManyField("self",blank=True,symmetrical=False)
    is_online = db.BooleanField(default=False)
    last_seen = db.DateTimeField(null=True,blank=True)
    
    def save(self, *args, **kwargs):
        if not self.profile_picture:
            self.profile_picture = settings.DEFAULT_AVATAR
        super().save(*args, **kwargs)
     
    def __str__(self):
        return self.user.username