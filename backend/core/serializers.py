from rest_framework import serializers
from .models import Trader, Lender, Transaction, Vouch, LoanOutcome, FraudFlag


class TraderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trader
        fields = ['id', 'user', 'phone_number', 'market_name', 'state', 'trust_score', 'created_at']
        read_only_fields = ['trust_score', 'created_at']


class LenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lender
        fields = ['id', 'user', 'institution_name', 'is_verified', 'created_at']
        read_only_fields = ['is_verified', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'trader', 'transaction_type', 'amount', 'note', 'date', 'created_at']
        read_only_fields = ['trader', 'created_at']


class VouchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vouch
        fields = ['id', 'voucher', 'vouchee', 'created_at']
        read_only_fields = ['voucher', 'created_at']
        
    def validate(self, data):
        return data


class LoanOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanOutcome
        fields = ['id', 'trader', 'lender', 'amount', 'outcome', 'reported_at']
        read_only_fields = ['lender', 'reported_at']


class FraudFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudFlag
        fields = ['id', 'trader', 'reason', 'flagged_at', 'resolved']
        read_only_fields = ['flagged_at']