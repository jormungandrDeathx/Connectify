from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView, ListAPIView


from api.serializers import ProductsSerializer, FeedbackSerialiser

from api.Models.product import Products, Feedback

class ProductsListView(ListAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class = ProductsSerializer
    queryset = Products.objects.all()
    
    
class ProductDetailView(RetrieveAPIView):
    permission_classes=[IsAuthenticated]
    queryset = Products.objects.all()
    serializer_class=ProductsSerializer
    lookup_field = "id"
    
    
class FeedbackListView(ListAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class = FeedbackSerialiser
    queryset = Feedback.objects.all()
    
    