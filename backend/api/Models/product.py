import uuid
from django.db import models as db
from django.conf import settings

class Products(db.Model):
    id=db.UUIDField(
        primary_key=True,default=uuid.uuid4,editable=False
    )
    product_id = db.IntegerField()
    productName = db.CharField(max_length=1000)
    productPrice = db.FloatField(max_length=100)
    productDesc = db.CharField(max_length=1000)
    productCat = db.CharField(max_length=200)
    productImage = db.URLField(max_length=1000)
    productRate = db.FloatField()
    productCount = db.IntegerField()
    
    class Meta:
        ordering = ['-id']
    
    def __str__(self):
        return self.productName
    

class Feedback(db.Model):
    feedback_id = db.IntegerField()
    category = db.CharField(max_length=50)
    userName = db.CharField(max_length=50)
    profile_picture = db.ImageField(upload_to='Media/Feedback',default="Avatar_hzjeqe.jpg",max_length=500, blank=True,null=True) 
    rating = db.IntegerField()
    message = db.CharField()
    product = db.CharField()
    
    class Meta:
        ordering=['-id']
    
    def __str__(self):
        return self.product