from rest_framework import serializers
from .models import Trader, Lender, Transaction, Vouch, LoanOutcome, FraudFlag
from django.contrib.auth.models import User

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
        


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['trader', 'lender'], write_only=True)

    # Trader fields
    phone_number = serializers.CharField(required=False)
    market_name = serializers.CharField(required=False)
    state = serializers.CharField(required=False)

    # Lender fields
    institution_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role',
            'phone_number', 'market_name', 'state',
            'institution_name'
        ]

    def validate(self, data):
        role = data.get('role')
        if role == 'trader':
            if not data.get('phone_number'):
                raise serializers.ValidationError("phone_number is required for traders.")
            if not data.get('market_name'):
                raise serializers.ValidationError("market_name is required for traders.")
            if not data.get('state'):
                raise serializers.ValidationError("state is required for traders.")
        if role == 'lender':
            if not data.get('institution_name'):
                raise serializers.ValidationError("institution_name is required for lenders.")
        return data

    def create(self, validated_data):
        role = validated_data.pop('role')
        phone_number = validated_data.pop('phone_number', None)
        market_name = validated_data.pop('market_name', None)
        state = validated_data.pop('state', None)
        institution_name = validated_data.pop('institution_name', None)
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        if role == 'trader':
            Trader.objects.create(
                user=user,
                phone_number=phone_number,
                market_name=market_name,
                state=state,
            )
        elif role == 'lender':
            Lender.objects.create(
                user=user,
                institution_name=institution_name,
            )
        return user