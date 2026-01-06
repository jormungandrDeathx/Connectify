from django.db import models as db
from django.conf import settings

class Posts(db.Model):
    userName = db.CharField( max_length=100)
    userImage = db.ImageField(upload_to="Media/Posts/userImages/",default=settings.DEFAULT_AVATAR, max_length=500 , blank=True, null=True)
    message = db.TextField()
    postImage = db.ImageField(upload_to="Media/Posts/userPosts/",blank=True,null=True)
    likes = db.PositiveIntegerField(default=0)
    createdAt = db.DateTimeField()
    
    class Meta:
        ordering = ['-createdAt']
    
    def __str__(self):
        return self.userName