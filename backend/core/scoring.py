from datetime import date, timedelta
from django.db.models import Sum


def calculate_trust_score(trader):
    """
    Calculates a trust score on a 350-850 scale.
    Combines: transaction consistency, income trend, vouch network strength,
    loan repayment history, and fraud flag penalties.
    """
    breakdown = {}
    score = 350  # baseline floor

    # --- 1. Transaction consistency (up to +200) ---
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_transactions = trader.transactions.filter(date__gte=thirty_days_ago)
    days_logged = recent_transactions.values('date').distinct().count()
    consistency_score = min(days_logged / 30, 1.0) * 200
    breakdown['transaction_consistency'] = round(consistency_score, 1)
    score += consistency_score

    # --- 2. Income trend (up to +200) ---
    last_30_sales = recent_transactions.filter(
        transaction_type='sale'
    ).aggregate(total=Sum('amount'))['total'] or 0

    sixty_days_ago = date.today() - timedelta(days=60)
    previous_30_sales = trader.transactions.filter(
        transaction_type='sale',
        date__gte=sixty_days_ago,
        date__lt=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    if previous_30_sales > 0:
        growth_ratio = (last_30_sales - previous_30_sales) / previous_30_sales
        trend_score = max(min(growth_ratio, 1.0), -1.0) * 200
    else:
        trend_score = 100 if last_30_sales > 0 else 0
    breakdown['income_trend'] = round(trend_score, 1)
    score += trend_score

    # --- 3. Vouch network strength (up to +150) ---
    vouches_received = trader.vouches_received.select_related('voucher')
    voucher_count = vouches_received.count()
    if voucher_count > 0:
        avg_voucher_score = sum(
            v.voucher.trust_score for v in vouches_received
        ) / voucher_count
        vouch_score = min(voucher_count / 5, 1.0) * (avg_voucher_score / 850) * 150
    else:
        vouch_score = 0
        avg_voucher_score = 0
    breakdown['vouch_network'] = {
        'score_contribution': round(vouch_score, 1),
        'voucher_count': voucher_count,
        'avg_voucher_score': round(avg_voucher_score, 1),
    }
    score += vouch_score

    # --- 4. Loan repayment history (up to +120, defaults penalize heavily) ---
    outcomes = trader.loan_outcomes.all()
    repaid_count = outcomes.filter(outcome='repaid').count()
    late_count = outcomes.filter(outcome='late').count()
    defaulted_count = outcomes.filter(outcome='defaulted').count()
    loan_score = (repaid_count * 40) - (late_count * 20) - (defaulted_count * 120)
    breakdown['loan_history'] = {
        'repaid': repaid_count,
        'late': late_count,
        'defaulted': defaulted_count,
        'score_contribution': loan_score,
    }
    score += loan_score

    # --- 5. Fraud flag penalty ---
    unresolved_flags = trader.fraud_flags.filter(resolved=False).count()
    fraud_penalty = unresolved_flags * 100
    breakdown['fraud_flags'] = {
        'unresolved_count': unresolved_flags,
        'penalty': fraud_penalty,
    }
    score -= fraud_penalty

    final_score = max(350, min(850, round(score)))
    breakdown['final_score'] = final_score

    return breakdown