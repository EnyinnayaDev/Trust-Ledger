from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates a superuser non-interactively'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@trustledger.com',
                password='admin1234'
            )
            self.stdout.write('Superuser created.')
        else:
            self.stdout.write('Superuser already exists.')