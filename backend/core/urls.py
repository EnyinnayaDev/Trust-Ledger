from rest_framework.routers import DefaultRouter
from .views import (
    TraderViewSet, LenderViewSet, TransactionViewSet,
    VouchViewSet, LoanOutcomeViewSet, FraudFlagViewSet
)

router = DefaultRouter()
router.register(r'traders', TraderViewSet, basename='trader')
router.register(r'lenders', LenderViewSet, basename='lender')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'vouches', VouchViewSet, basename='vouch')
router.register(r'loan-outcomes', LoanOutcomeViewSet, basename='loan-outcome')
router.register(r'fraud-flags', FraudFlagViewSet, basename='fraud-flag')

urlpatterns = router.urls