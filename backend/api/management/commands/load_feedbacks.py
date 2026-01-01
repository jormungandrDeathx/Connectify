from django.core.management import BaseCommand
from api.services.load_feedbacks import load_feedbacks

class Command(BaseCommand):
    help = "load feedbacks"
    def handle(self, *args, **options):
        created = load_feedbacks()
        self.stdout.write(
            self.style.SUCCESS(f"created {created} feedbacks")
        )
        