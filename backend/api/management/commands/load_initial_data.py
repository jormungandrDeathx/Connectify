from django.core.management import BaseCommand,call_command
from django.conf import settings
from django.db import transaction

from api.Models.user import User,Profile
from api.Models.post import Posts
from api.Models.product import Feedback


class Command(BaseCommand):
    help="Load initial users, posts and feedbacks"
    
    def handle(self, *args, **options):
        if User.objects.exists():
            self.stdout.write("Data Exists")
            return
        
        self.stdout.write("Loading inital data...")
        
        with transaction.atomic():
            call_command("load_users")
            call_command("load_products")
            call_command("load_posts")
            call_command("load_feedbacks")
            
        self.stdout.write(self.style.SUCCESS("loaded successfully"))