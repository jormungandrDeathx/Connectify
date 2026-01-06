from django.db import models as db
from django.contrib.auth.models import User

class FriendRequest(db.Model):
    from_user = db.ForeignKey(User,related_name="sent_requests",on_delete=db.CASCADE)
    to_user = db.ForeignKey(User,related_name="received_requests",on_delete=db.CASCADE)
    status = db.CharField(max_length=20,choices=(
        ("pending","Pending"),
        ("accepted","Accepted"),
        ("declined","Declined")
    ),default="pending",db_index=True)
    createdAt = db.DateTimeField(auto_now_add=True,db_index=True)
    
    class Meta:
        ordering = ["-id"]
        unique_together = ("from_user","to_user")
        
    def __str__(self):
        return f"{self.from_user.username}->{self.to_user.username} ({self.status})"