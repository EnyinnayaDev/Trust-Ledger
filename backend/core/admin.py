from django.contrib import admin
from .models import FraudFlag, Trader, Lender, Transaction, Vouch, LoanOutcome
# Register your models here.

admin.site.register(Trader)
admin.site.register(Lender)
admin.site.register(Transaction)
admin.site.register(Vouch)
admin.site.register(LoanOutcome)
admin.site.register(FraudFlag)