from django.core.management.base import BaseCommand
from api.services.load_random_users import load_random_users

class Command(BaseCommand):
    help = "Load fake users"
    
    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=50)
        
    def handle(self, *args, **options):
        created = load_random_users(options["count"])
        self.stdout.write(
            self.style.SUCCESS(f"created {created} users")
        )