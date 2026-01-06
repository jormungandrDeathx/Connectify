from django.core.management import BaseCommand
from api.services.load_fake_products import load_products

class Command(BaseCommand):
    help="load products"
    def handle(self, *args, **options):
        created = load_products()
        self.stdout.write(
            self.style.SUCCESS(f"created {created} products")
        )