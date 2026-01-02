from django.core.management.base import BaseCommand
from api.services.load_random_users import load_random_users

class Command(BaseCommand):
    help = "Load fake users"
    
        
    def handle(self, *args, **options):
        created = load_random_users()
        self.stdout.write(
            self.style.SUCCESS(f"created {created} users")
        )