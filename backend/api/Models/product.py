import uuid
from django.db import models as db

class Products(db.Model):
    id=db.UUIDField(
        primary_key=True,default=uuid.uuid4,editable=False
    )
    product_id = db.CharField(max_length=50, unique=True)
    productName = db.CharField(max_length=100)
    productPrice = db.FloatField(max_length=20)
    productDesc = db.CharField(max_length=100)
    productCat = db.CharField(max_length=100)
    productImage = db.URLField()
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
    profile_picture = db.ImageField(upload_to='Media/Feedback/',default="Avatar_kw0szi.jpg",blank=True,null=True) 
    rating = db.IntegerField()
    message = db.CharField()
    product = db.CharField()
    
    def __str__(self):
        return self.product