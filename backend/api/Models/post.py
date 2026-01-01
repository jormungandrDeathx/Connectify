from django.db import models as db

class Posts(db.Model):
    class Meta:
        ordering = ['-createdAt']
    userName = db.CharField( max_length=100)
    userImage = db.ImageField(upload_to="Media/Posts/userImages/",default="Avatar_kw0szi.jpg" , blank=True, null=True)
    message = db.TextField()
    postImage = db.ImageField(upload_to="Media/Posts/userPosts/",blank=True,null=True)
    likes = db.PositiveIntegerField(default=0)
    createdAt = db.DateTimeField()
    
    def __str__(self):
        return self.userName