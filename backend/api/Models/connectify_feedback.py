from django.db import models as db

class UsersFeedback(db.Model):
    Email = db.EmailField(unique=False)
    Name = db.CharField(max_length=25)
    Comment = db.TextField(max_length=200)
    CreatedAt = db.DateTimeField(auto_now_add=True)
    