from django.db import models as db
from django.contrib.auth.models import User

class Conversation(db.Model):
    user1=db.ForeignKey(User,related_name="conv_user1",on_delete=db.CASCADE)
    user2=db.ForeignKey(User,related_name="conv_user2",on_delete=db.CASCADE)
    createdAt = db.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints=[db.UniqueConstraint(
            fields=["user1","user2"],
            name="unique_converstaion"
        )]
        
    def save(self,*args,**kwargs):
        if self.user1_id > self.user2_id:
            self.user1,self.user2 = self.user2, self.user1
        
        super().save(*args,**kwargs)
    
    
    def __str__(self):
        return f"Conversation({self.user1.username}, {self.user2.username})"
    

class ChatMessage(db.Model):
    conversation = db.ForeignKey(Conversation,related_name="messages",on_delete=db.CASCADE)
    sender = db.ForeignKey(User,on_delete=db.CASCADE,related_name="sent_messages")
    receiver = db.ForeignKey(User,on_delete=db.CASCADE,related_name="received_messages")
    message = db.TextField()
    is_read = db.BooleanField(default=False)
    createdAt = db.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering=["createdAt"]
    
    def __str__(self):
        return f"{self.sender}-> {self.receiver}"
    
    
class ConversationStatus(db.Model):
    conversation = db.ForeignKey(Conversation, related_name="status", on_delete=db.CASCADE)
    user = db.ForeignKey(User,on_delete=db.CASCADE)
    unread_count = db.PositiveIntegerField(default=0)
    last_seen = db.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ("conversation","user")