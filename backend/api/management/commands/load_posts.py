from django.core.management import BaseCommand
from api.services.load_fake_posts import load_fake_posts

class Command(BaseCommand):
    help = "load fake posts"
    
    def handle(self, *args, **options):
        created = load_fake_posts()
        self.stdout.write(
            self.style.SUCCESS(f"created {created} posts")
        )      