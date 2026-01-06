from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import BadHeaderError
from django.template.loader import render_to_string
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser

from api.serializers import UserSerializer, ProfileSerializer, ChangePasswordSerializer

from api.Models.emailOtp import EmailVerification
from api.Models.user import Profile

import secrets
import datetime
import os,requests

BREVO_URL = "https://api.brevo.com/v3/smtp/email"

def send_otp(email, htmlFile, username):
        otp = str(secrets.randbelow(900000)+100000)
        hashed_otp = make_password(otp)
        
        EmailVerification.objects.update_or_create(
            email=email,
            defaults={'otp':hashed_otp}
        )
        subject = "Your Connectify OTP Verification Code"
        banner_url = settings.EMAIL_BANNER
        
        html = render_to_string(htmlFile,{
            "banner_url":banner_url,
            "username":username,
            "otp":otp,
            "year":datetime.datetime.now().year
        })
        
        headers = {
            "api-key":os.getenv("BREVO_API_KEY"),
            "Content-Type":"application/json"
        }
        
        payload = {
            "sender":{
                "name":"Connectify",
                "email":os.getenv("BREVO_SENDER")
            },
            "to":[{"email":email}],
            "subject":subject,
            "htmlContent":html,
        }
            
        try:
            sent = requests.post(BREVO_URL, json=payload, headers=headers)
            sent.raise_for_status()
            return True
        except Exception as e:
            print("Email Error: ",e)
            return False


class SendEmailVerification(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        email = request.data.get("email","").strip()
        username = request.data.get("username","").strip()
        
        if (email==None):
            return Response({"error":"try again!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not email or not email.endswith("@gmail.com"):
            return Response({"error":"Only Gmail Accounts Allowed!"},status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({"error":"Gmail is already registered!"},status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({"error":"Username already registered!"},status=status.HTTP_400_BAD_REQUEST)
        
        
        try:
            sent=send_otp(email,"ConnectifySignUpOTP.html", username)
            
            if not sent:
                return Response({"error":"Failed to send OTP, try again!"},status=status.HTTP_400_BAD_REQUEST)
            
        except BadHeaderError:
            return HttpResponseRedirect("/")
            
        except Exception as e:
            print("Email Error: ",e)
            return Response({"error":"try again!"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            "message":"OTP sent to Gmail."
        },status=status.HTTP_200_OK)
        
    
        
        
class VerifyOTP(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        email=request.data.get("email","").strip().lower()
        otp = request.data.get("otp","").strip()
        
        if not email or not otp:
            return Response({"error":"Email and otp required!"},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp_obj=EmailVerification.objects.get(email=email)
        except EmailVerification.DoesNotExist :
            return Response({"error":"No OTP found!"},status=status.HTTP_404_NOT_FOUND)
            
        if otp_obj.is_expired():
            otp_obj.delete()
            return Response({"error":"OTP expired!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not check_password(otp, otp_obj.otp):
            return Response({"error":"Invalid OTP!"},status=status.HTTP_404_NOT_FOUND)
        
        otp_obj.delete()
        
        return Response({"message":"OTP verified."},status=status.HTTP_200_OK)
    


class SignupView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()
        
        profile,_ = Profile.objects.get_or_create(user=user)
        
        request = self.request
       
        profile.phone_number = request.data.get("phone_number")
        profile.pincode = request.data.get("pincode")
        profile.street_name = request.data.get("street_name")
        profile.street_number = request.data.get("street_number")
        profile.city = request.data.get("city","")
        profile.state = request.data.get("state","")
        profile.country = request.data.get("country","")
        profile.createdAt = timezone.now()
        
        profile.save() 
        
        
        html = render_to_string("ConnectifyWelcome.html",{
            "banner_url":settings.EMAIL_BANNER,
            "username":user.first_name,
            "get_started_url":"https://connectify2026.netlify.app/",
            "support_email":os.getenv("BREVO_SENDER"),
            "year": datetime.datetime.now().year
        })
        
        headers = {
            "api-key":os.getenv("BREVO_API_KEY"),
            "Content-Type":"application/json"
        }
        
        payload={
            "sender":{
                "name":"Connectify",
                "email":os.getenv("BREVO_SENDER")
            },
            "to":[{"email":user.email}],
            "subject":"Welcome to Connectify! 🎉",
            "htmlContent":html
        }
        try:
            res=requests.post(BREVO_URL, json=payload, headers=headers)
            res.raise_for_status()
        except Exception as e:
            print("Signup Email Failed: ",e)
        

        
        
class AccountVerification(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        email = request.data.get("email").strip().lower()
        
        if(email==None):
            return Response({"error":"Email required!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not email or not email.endswith("@gmail.com"):
            return Response({"error":"Only Gmail accounts allowed!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not User.objects.filter(email=email).exists():
            return Response({"error":"We couldn't find your account. Create a new account?"},status=status.HTTP_404_NOT_FOUND)
        
        user = User.objects.get(email=email)
        
        
        
        try:
            sent = send_otp(email, "ConnectifyForgetPasswordOTP.html", user.username)
            
            if sent ==0:
                return Response({"error":"Failed to send OTP, try again!"},status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print("Email error: ",e)
            return Response({"error":"try again"},status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"message":"OTP sent to Registered Gmail!","username":user.username},status=status.HTTP_200_OK)
    
    
class ForgetPasswordView(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        email= request.data.get("email")
        password = request.data.get("password")
        
        if (email==None):
            return Response({"error":"try again!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not email or not email.endswith("@gmail.com"):
            return Response({"error":"Only Gmail account allowed!"},status=status.HTTP_400_BAD_REQUEST)
        
        if not User.objects.filter(email=email).exists():
            return Response({"error":"We couldn't find your account. Create a new account?"},status=status.HTTP_400_BAD_REQUEST)
        
        user =User.objects.get(email=email)
        
        user.set_password(password)
        user.save(update_fields=["password"])
        
        return Response({"message":"Password updated successfully."},status=status.HTTP_200_OK)
    
    
class ProfileView(RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
        
        
class UpdateProfileView(UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser,FormParser,JSONParser]
    
    def get_object(self):
        return self.request.user
    

class ChangePasswordOtp(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self, request):
        user=request.user
        email = user.email
        username = user.username
        old_password = request.data.get("old_password")
        
        if not user.check_password(old_password):
            return Response({"old_password":"Incorrect password!"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            sent = send_otp(email, "ConnectifyChangePasswordOtp.html", username)
            if sent==0:
                return Response({"error":"Failed to send OTP. Try again!"})
        except Exception:
            return Response({"error":"try again!"})
        
        return Response({"message":"OTP sent to Registered Gmail."})
   
class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    
    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user        
        old_password = serializer.validated_data.get("old_password")
        new_password = serializer.validated_data.get("new_password")
        
        if not user.check_password(old_password):
            return Response({"old_password":"Incorrect password!"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save(update_fields=["password"])
        
        return Response({"message":"Password updated successfully. Please log in again."},status=status.HTTP_200_OK)
    
    
class DeleteAccountOtp(APIView):
    permission_classes = [IsAuthenticated]
    
    def post (self,request):
        email = request.user.email
        username = request.user.username
        
        try:
            sent=send_otp(email, "ConnectifyDeleteAccountOTP.html", username)
            
            if sent==0:
                return Response({"error":"Failed to send OTP, try again!"},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Email Error: ",e)
            return Response({"error":"try again"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message":"OTP sent to Gmail!"},status=status.HTTP_200_OK)
    

class DeleteAccountVerifyOtp(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,request):
        email = request.user.email
        otp = request.data.get("otp").strip()
        
        if not otp:
            return Response({"error":"OTP is required!"},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            otp_obj = EmailVerification.objects.get(email=email)
        except EmailVerification.DoesNotExist:
            return Response({"error":"No OTP found!"},status=status.HTTP_404_NOT_FOUND)
        
        if otp_obj.is_expired():
            otp_obj.delete()
            return Response({"error":"OTP is expired!"},status=status.HTTP_408_REQUEST_TIMEOUT)
        
        if not check_password(otp, otp_obj.otp):
            return Response({"error":"Invalid OTP!"},status=status.HTTP_400_BAD_REQUEST)
        
        otp_obj.delete()
        return Response({"message":"OTP Verified!"},status=status.HTTP_200_OK)
    
    
class DeleteAccountView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        self.perform_destroy(user)
        
        return Response({
            "message":"Account Deleted Successfully."
        }, status=status.HTTP_200_OK)