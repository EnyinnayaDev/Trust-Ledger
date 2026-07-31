from django.core.management.base import BaseCommand
from core.models import Trader
from core.scoring import calculate_trust_score


class Command(BaseCommand):
    help = 'Recalculates trust scores for all traders'

    def handle(self, *args, **kwargs):
        traders = Trader.objects.all()
        for trader in traders:
            breakdown = calculate_trust_score(trader)
            trader.trust_score = breakdown['final_score']
            trader.save(update_fields=['trust_score'])
            self.stdout.write(f'  {trader.market_name}: {breakdown["final_score"]}')
        self.stdout.write(self.style.SUCCESS(f'Recalculated {traders.count()} trader scores.'))