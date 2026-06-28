from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction, Vouch, LoanOutcome, FraudFlag
from .scoring import calculate_trust_score


def update_trader_score(trader):
    breakdown = calculate_trust_score(trader)
    trader.trust_score = calculate_trust_score('final_score')
    trader.save(update_fields=['trust_score'])


@receiver(post_save, sender=Transaction)
def transaction_saved(sender, instance, **kwargs):
    update_trader_score(instance.trader)


@receiver(post_save, sender=Vouch)
def vouch_saved(sender, instance, **kwargs):
    update_trader_score(instance.vouchee)


@receiver(post_save, sender=LoanOutcome)
def loan_outcome_saved(sender, instance, **kwargs):
    update_trader_score(instance.trader)


@receiver(post_save, sender=FraudFlag)
def fraud_flag_saved(sender, instance, **kwargs):
    update_trader_score(instance.trader)