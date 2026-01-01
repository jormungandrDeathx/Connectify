from django.contrib import admin
from api.Models.connectify_feedback import UsersFeedback

class CommentAdmin(admin.ModelAdmin):
    list_display = ("Email","Name","Comment","CreatedAt")
    
admin.site.register(UsersFeedback, CommentAdmin)
