from django.shortcuts import render
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Trader, Lender, Transaction, Vouch, LoanOutcome, FraudFlag
from .scoring import calculate_trust_score
from .permissions import IsOwnerTrader, IsOwnerTransaction, IsOwnerVouch, IsOwnerLoanOutcome
from .serializers import (
    TraderSerializer, LenderSerializer, TransactionSerializer,
    VouchSerializer, LoanOutcomeSerializer, FraudFlagSerializer
)

# Create your views here.

class TraderViewSet(viewsets.ModelViewSet):
    serializer_class = TraderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Trader.objects.all()
        return Trader.objects.filter(user=user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerTrader()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def search(self, request):
        user = request.user
        is_verified_lender = hasattr(user, 'lender') and user.lender.is_verified
        if not (user.is_staff or is_verified_lender):
            return Response({"error": "Only verified lenders can search traders."}, status=status.HTTP_403_FORBIDDEN)

        query = request.query_params.get('q', '')
        if not query:
            return Response({"error": "Please provide a search query using ?q="}, status=status.HTTP_400_BAD_REQUEST)

        results = Trader.objects.filter(
            Q(user__username__icontains=query) |
            Q(phone_number__icontains=query) |
            Q(market_name__icontains=query)
        )
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def score(self, request, pk=None):
        try:
            trader = Trader.objects.get(pk=pk)
        except Trader.DoesNotExist:
            return Response({"error": "Trader not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_owner = trader.user == user
        is_verified_lender = hasattr(user, 'lender') and user.lender.is_verified
        if not (user.is_staff or is_owner or is_verified_lender):
            return Response({"error": "You do not have permission to view this score."}, status=status.HTTP_403_FORBIDDEN)

        breakdown = calculate_trust_score(trader)
        return Response(breakdown)

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            trader = Trader.objects.get(user=request.user)
        except Trader.DoesNotExist:
            return Response({"error": "No trader profile found for this user."}, status=status.HTTP_404_NOT_FOUND)

        breakdown = calculate_trust_score(trader)
        serializer = self.get_serializer(trader)
        data = serializer.data
        data['score_breakdown'] = breakdown
        return Response(data)

class LenderViewSet(viewsets.ModelViewSet):
    queryset = Lender.objects.all()
    serializer_class = LenderSerializer
    permission_classes = [permissions.IsAuthenticated]


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all()
        return Transaction.objects.filter(trader__user=user)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerTransaction()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        trader = Trader.objects.get(user=self.request.user)
        serializer.save(trader=trader)


class VouchViewSet(viewsets.ModelViewSet):
    serializer_class = VouchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Vouch.objects.all()
        return Vouch.objects.filter(Q(voucher__user=user) | Q(vouchee__user=user))

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerVouch()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        voucher = Trader.objects.get(user=self.request.user)
        vouchee = serializer.validated_data['vouchee']
        if voucher == vouchee:
            raise serializers.ValidationError("A trader cannot vouch for themselves.")
        serializer.save(voucher=voucher)

    @action(detail=False, methods=['get'])
    def my_network(self, request):
        try:
            trader = Trader.objects.get(user=request.user)
        except Trader.DoesNotExist:
            return Response({"error": "No trader profile found for this user."}, status=status.HTTP_404_NOT_FOUND)

        received = Vouch.objects.filter(vouchee=trader).select_related('voucher')
        given = Vouch.objects.filter(voucher=trader).select_related('vouchee')

        return Response({
            "vouches_received": VouchSerializer(received, many=True).data,
            "vouches_given": VouchSerializer(given, many=True).data,
        })

class LoanOutcomeViewSet(viewsets.ModelViewSet):
    serializer_class = LoanOutcomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return LoanOutcome.objects.all()
        if hasattr(user, 'lender'):
            return LoanOutcome.objects.filter(lender__user=user)
        if hasattr(user, 'trader'):
            return LoanOutcome.objects.filter(trader__user=user)
        return LoanOutcome.objects.none()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerLoanOutcome()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        try:
            lender = Lender.objects.get(user=self.request.user)
        except Lender.DoesNotExist:
            raise serializers.ValidationError("Only registered lenders can report loan outcomes.")
        if not lender.is_verified:
            raise serializers.ValidationError("Only verified lenders can report loan outcomes.")
        serializer.save(lender=lender)

class FraudFlagViewSet(viewsets.ModelViewSet):
    queryset = FraudFlag.objects.all()
    serializer_class = FraudFlagSerializer
    permission_classes = [permissions.IsAuthenticated]

