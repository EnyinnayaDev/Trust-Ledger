from django.db.models import Sum, Count
from datetime import date, timedelta
from .models import FraudFlag


def check_for_fraud(trader):
    """
    Runs a set of rule-based checks on a trader's activity.
    Creates FraudFlag records for any suspicious patterns detected.
    Skips creating a flag if an identical unresolved one already exists.
    """

    # --- Check 1: Sudden income spike ---
    # Flag if last 7 days sales are more than 5x the previous 7 days
    today = date.today()
    last_7_days = today - timedelta(days=7)
    prev_7_days = today - timedelta(days=14)

    recent_sales = trader.transactions.filter(
        transaction_type='sale',
        date__gte=last_7_days
    ).aggregate(total=Sum('amount'))['total'] or 0

    previous_sales = trader.transactions.filter(
        transaction_type='sale',
        date__gte=prev_7_days,
        date__lt=last_7_days
    ).aggregate(total=Sum('amount'))['total'] or 0

    if previous_sales > 0 and recent_sales > (previous_sales * 5):
        reason = "Sudden income spike: last 7 days sales are 5x higher than previous 7 days."
        _create_flag_if_not_exists(trader, reason)

    # --- Check 2: Abnormally high transaction frequency ---
    # Flag if trader logs more than 20 transactions in a single day
    today_count = trader.transactions.filter(date=today).count()
    if today_count > 20:
        reason = f"Abnormal transaction frequency: {today_count} transactions logged today."
        _create_flag_if_not_exists(trader, reason)

    # --- Check 3: Identical transaction amounts repeated suspiciously ---
    # Flag if the same amount appears more than 10 times in the last 7 days
    repeated = trader.transactions.filter(
        date__gte=last_7_days
    ).values('amount').annotate(count=Count('amount')).filter(count__gt=10)

    if repeated.exists():
        for entry in repeated:
            reason = f"Repeated identical amount: ₦{entry['amount']} logged {entry['count']} times in 7 days."
            _create_flag_if_not_exists(trader, reason)

    # --- Check 4: High debt-to-sales ratio ---
    # Flag if total debt obligations exceed total sales in the last 30 days
    thirty_days_ago = today - timedelta(days=30)
    total_sales = trader.transactions.filter(
        transaction_type='sale',
        date__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_debt = trader.transactions.filter(
        transaction_type='debt',
        date__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    if total_sales > 0 and total_debt > (total_sales * 2):
        reason = "High debt-to-sales ratio: debt obligations are more than 2x total sales in 30 days."
        _create_flag_if_not_exists(trader, reason)


def _create_flag_if_not_exists(trader, reason):
    """Avoids creating duplicate unresolved flags for the same reason."""
    already_exists = FraudFlag.objects.filter(
        trader=trader,
        reason=reason,
        resolved=False
    ).exists()
    if not already_exists:
        FraudFlag.objects.create(trader=trader, reason=reason)