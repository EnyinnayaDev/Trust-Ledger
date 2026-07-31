from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Trader, Lender, Transaction, Vouch, LoanOutcome
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seeds realistic demo data for TrustLedger showcase'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding demo data...')

        # Clean up existing demo data
        User.objects.filter(username__startswith='demo_').delete()

        # --- Create Traders ---
        trader_data = [
            {
                'username': 'demo_amara',
                'email': 'amara@trustledger.demo',
                'password': 'demo1234',
                'phone_number': '08011112222',
                'market_name': 'Tejuosho Market',
                'state': 'Lagos',
                'days_active': 25,
                'avg_daily_sale': 18000,
                'growth': 1.3,
            },
            {
                'username': 'demo_chidi',
                'email': 'chidi@trustledger.demo',
                'password': 'demo1234',
                'phone_number': '08022223333',
                'market_name': 'Onitsha Main Market',
                'state': 'Anambra',
                'days_active': 15,
                'avg_daily_sale': 11000,
                'growth': 1.0,
            },
            {
                'username': 'demo_grace',
                'email': 'grace@trustledger.demo',
                'password': 'demo1234',
                'phone_number': '08033334444',
                'market_name': 'Wuse Market',
                'state': 'Abuja',
                'days_active': 6,
                'avg_daily_sale': 7000,
                'growth': 0.7,
            },
        ]

        traders = []
        for td in trader_data:
            user = User.objects.create_user(
                username=td['username'],
                email=td['email'],
                password=td['password'],
            )
            trader = Trader.objects.create(
                user=user,
                phone_number=td['phone_number'],
                market_name=td['market_name'],
                state=td['state'],
            )
            traders.append((trader, td))
            self.stdout.write(f'  Created trader: {td["username"]}')

        # --- Create Lender ---
        lender_user = User.objects.create_user(
            username='demo_quickcredit',
            email='quickcredit@trustledger.demo',
            password='demo1234',
        )
        lender = Lender.objects.create(
            user=lender_user,
            institution_name='QuickCredit MFI',
            is_verified=True,
        )
        self.stdout.write('  Created lender: demo_quickcredit')

        # --- Seed Transactions ---
        today = date.today()
        for trader, td in traders:
            days_active = td['days_active']
            avg_sale = td['avg_daily_sale']
            growth = td['growth']

            # Pick random active days in the last 30
            active_days = sorted(random.sample(range(1, 31), days_active))

            for i, days_ago in enumerate(active_days):
                tx_date = today - timedelta(days=days_ago)

                # Sales grow over time based on growth factor
                progress = i / max(days_active - 1, 1)
                sale_amount = avg_sale * (1 + (growth - 1) * progress)
                sale_amount = round(sale_amount * random.uniform(0.85, 1.15), 2)

                Transaction.objects.create(
                    trader=trader,
                    transaction_type='sale',
                    amount=sale_amount,
                    date=tx_date,
                    note='Daily sales',
                )

                # Add occasional expenses (every 3rd active day)
                if i % 3 == 0:
                    expense = round(sale_amount * random.uniform(0.2, 0.4), 2)
                    Transaction.objects.create(
                        trader=trader,
                        transaction_type='expense',
                        amount=expense,
                        date=tx_date,
                        note='Restock',
                    )

            self.stdout.write(f'  Seeded transactions for: {trader.market_name}')

        # --- Seed Vouches ---
        # Good trader (amara) vouches for medium trader (chidi)
        Vouch.objects.create(
            voucher=traders[0][0],
            vouchee=traders[1][0],
        )
        # Good trader (amara) vouches for risky trader (grace)
        Vouch.objects.create(
            voucher=traders[0][0],
            vouchee=traders[2][0],
        )
        # Medium trader (chidi) vouches for good trader (amara)
        Vouch.objects.create(
            voucher=traders[1][0],
            vouchee=traders[0][0],
        )
        self.stdout.write('  Seeded vouches')

        # --- Seed Loan Outcomes ---
        # Good trader: 3 repaid
        for _ in range(3):
            LoanOutcome.objects.create(
                trader=traders[0][0],
                lender=lender,
                amount=round(random.uniform(20000, 50000), 2),
                outcome='repaid',
            )

        # Medium trader: 1 repaid, 1 late
        LoanOutcome.objects.create(
            trader=traders[1][0],
            lender=lender,
            amount=25000,
            outcome='repaid',
        )
        LoanOutcome.objects.create(
            trader=traders[1][0],
            lender=lender,
            amount=15000,
            outcome='late',
        )

        # Risky trader: 1 defaulted
        LoanOutcome.objects.create(
            trader=traders[2][0],
            lender=lender,
            amount=10000,
            outcome='defaulted',
        )
        self.stdout.write('  Seeded loan outcomes')

        self.stdout.write(self.style.SUCCESS('\nDemo data seeded successfully!'))
        self.stdout.write('\nDemo accounts:')
        self.stdout.write('  Traders (password: demo1234):')
        self.stdout.write('    demo_amara     → Tejuosho Market, Lagos (HIGH score)')
        self.stdout.write('    demo_chidi     → Onitsha Main Market, Anambra (MEDIUM score)')
        self.stdout.write('    demo_grace     → Wuse Market, Abuja (LOW score)')
        self.stdout.write('  Lender (password: demo1234):')
        self.stdout.write('    demo_quickcredit → QuickCredit MFI (verified)')