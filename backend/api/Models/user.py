from django.contrib.auth.models import User
from django.db import models as db
from django.conf import settings

class Profile(db.Model):
    user = db.OneToOneField(User, on_delete=db.CASCADE)
    profile_picture = db.ImageField(upload_to='Media/ProfilePictures/',default="Avatar_hzjeqe.jpg", max_length=500,blank=True,null=True) 
    phone_number = db.CharField(max_length=30,blank=True, null=True)
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
    
    class Meta:
        ordering = ['-id']
     
    def __str__(self):
        return self.user.username