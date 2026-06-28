from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Trader(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=15, unique=True)
    market_name = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    trust_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.market_name}"
    
class Lender(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    institution_name = models.CharField(max_length=150)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.institution_name


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('sale', 'Sale'),
        ('expense', 'Expense'),
        ('debt', 'Debt Obligation'),
    ]

    trader = models.ForeignKey(Trader, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.trader} - {self.transaction_type} - {self.amount}"


class Vouch(models.Model):
    voucher = models.ForeignKey(Trader, on_delete=models.CASCADE, related_name='vouches_given')
    vouchee = models.ForeignKey(Trader, on_delete=models.CASCADE, related_name='vouches_received')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('voucher', 'vouchee')

    def __str__(self):
        return f"{self.voucher} vouches for {self.vouchee}"


class LoanOutcome(models.Model):
    OUTCOME_CHOICES = [
        ('repaid', 'Repaid'),
        ('defaulted', 'Defaulted'),
        ('late', 'Late'),
    ]

    trader = models.ForeignKey(Trader, on_delete=models.CASCADE, related_name='loan_outcomes')
    lender = models.ForeignKey(Lender, on_delete=models.CASCADE, related_name='loan_outcomes')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    outcome = models.CharField(max_length=10, choices=OUTCOME_CHOICES)
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.trader} - {self.outcome} ({self.amount})"


class FraudFlag(models.Model):
    trader = models.ForeignKey(Trader, on_delete=models.CASCADE, related_name='fraud_flags')
    reason = models.CharField(max_length=255)
    flagged_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.trader} - {self.reason}"