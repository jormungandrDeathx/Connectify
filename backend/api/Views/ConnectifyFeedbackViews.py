from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


from api.Models.connectify_feedback import UsersFeedback


class Comment(APIView):
    permission_classes=[]
    def post(self,request):
        email=request.data.get("email").strip()
        name=request.data.get("name").strip()
        comment=request.data.get("comment").strip()
        
        if not (email or name or comment):
            return Response({"error":"All feilds must be filled"},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            UsersFeedback.objects.create(Email=email,Name=name,Comment=comment)
        except Exception as e:
            print(e)
            return Response({"backendError":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({"message":"Message received! Our team will respond soon."},status=status.HTTP_200_OK)