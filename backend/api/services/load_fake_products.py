import os, json
from django.conf import settings

from api.Models.product import Products

def load_products():
    path = os.path.join(settings.BASE_DIR, "api","Data", "fake_products.json")
    
    if not os.path.exists(path):
        raise FileNotFoundError("fake_products.json file not found")
    
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    created = 0
    
    for item in data:
        product_id = item.get("product_id")
        
        if Products.objects.filter(product_id=product_id).exists():
            continue
        
        product = Products(
            product_id=product_id,
            productName = item.get("productName"),
            productPrice = item.get("productPrice"),
            productDesc = item.get("productDesc"),
            productCat = item.get("productCat"),
            productImage = item.get("productImage"),
            productRate = item.get("productRate"),
            productCount = item.get("productCount")
        )
        
        product.save()
        created+=1
        
    return created