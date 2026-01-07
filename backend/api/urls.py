from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView


from api.Views.ConnectifyFeedbackViews import Comment

from api.Views.authViews import (SendEmailVerification, VerifyOTP, ProfileView, SignupView, AccountVerification, ForgetPasswordView, UpdateProfileView, ChangePasswordView, DeleteAccountOtp, DeleteAccountVerifyOtp, DeleteAccountView, ChangePasswordOtp)

from api.Views.peopleView import PeopleView

from api.Views.postViews import (PostsListView, PostCreateView, PostDeleteView, ToggleLikes)

from api.Views.productViews import (ProductsListView, ProductDetailView, FeedbackListView)

from api.Views.friendsView import (SendFriendrequest, SentFriendRequest, AcceptFriendRequest, DeclineFriendRequest, CancelFriendRequest, ReceivedFriendRequest, FriendList, RemoveFriend)

from api.Views.chatViews import (ChatHistory, UnreadMessagesView, Userstatus)

from api.Views.healthView import Health

urlpatterns = [
    path('token/',TokenObtainPairView.as_view(),name="token_obtain_pair"),
    path('refresh/',TokenRefreshView.as_view(),name="token_refresh"),
    path("comment/",Comment.as_view()),
    path("auth/send-otp/",SendEmailVerification.as_view()),
    path("auth/verify-otp/",VerifyOTP.as_view()),
    path("profile/",ProfileView.as_view(), name="profile"),
    path('signup/',SignupView.as_view(),name='signup'),
    path("auth/forgetPassword/",AccountVerification.as_view()),
    path("auth/passwordReset/",ForgetPasswordView.as_view()),
    path('updateProfile/',UpdateProfileView.as_view(),name="update-profile"),
    path("auth/changePasswordOtp/",ChangePasswordOtp.as_view() ),
    path("auth/changePassword/",ChangePasswordView.as_view(),name="change-password"),
    path("auth/deleteOtp/",DeleteAccountOtp.as_view()),
    path("auth/deleteVerifyOtp/",DeleteAccountVerifyOtp.as_view()),
    path("delete-account/",DeleteAccountView.as_view(),name='delete-account'),    
    path('users/', PeopleView.as_view(), name='import-users'),
    path('posts/',PostsListView.as_view(),name="posts_list"),
    path('posts/<int:pk>/like/',ToggleLikes.as_view()),
    path('createPost/',PostCreateView.as_view(),name="post-create"),
    path('deletePost/<int:pk>/',PostDeleteView.as_view(),name="Delete-Post"),
    path("products/",ProductsListView.as_view(), name="products"),
    path("products/<uuid:id>",ProductDetailView.as_view()),
    path("feedback/",FeedbackListView.as_view(),name='Feedback'),
    path("friends/send/<int:user_id>/",SendFriendrequest.as_view()),
    path("friends/accept/<int:request_id>/",AcceptFriendRequest.as_view()),
    path("friends/decline/<int:request_id>/",DeclineFriendRequest.as_view()),
    path("friends/cancel/<int:request_id>/",CancelFriendRequest.as_view()),
    path("friends/received/",ReceivedFriendRequest.as_view()),
    path("friends/sent/",SentFriendRequest.as_view()),
    path("friends/list/",FriendList.as_view()),
    path("friends/remove/<int:user_id>/",RemoveFriend.as_view()),
    path("chat/history/<int:peer_id>/",ChatHistory.as_view()),
    path("chat/isOnline/<int:user_id>/",Userstatus.as_view()),
    path("chat/unread/",UnreadMessagesView.as_view()),
    path("health/",Health.as_view())
]