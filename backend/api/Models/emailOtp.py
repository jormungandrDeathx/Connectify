from django.db import models as db
from django.utils import timezone
from datetime import timedelta

class EmailVerification(db.Model):
    email = db.EmailField(unique=True)
    otp = db.CharField(max_length=256)
    createdAt = db.DateTimeField(auto_now_add=True)
    
    def is_expired(self):
        timezone.now()>self.createdAt+timedelta(minutes=5)