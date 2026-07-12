from rest_framework.routers import DefaultRouter
from .views import (
    TraderViewSet, LenderViewSet, TransactionViewSet,
    VouchViewSet, LoanOutcomeViewSet, FraudFlagViewSet,
    AdminTraderViewSet, AdminLenderViewSet
)

router = DefaultRouter()
router.register(r'traders', TraderViewSet, basename='trader')
router.register(r'lenders', LenderViewSet)
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'vouches', VouchViewSet, basename='vouch')
router.register(r'loan-outcomes', LoanOutcomeViewSet, basename='loanoutcome')
router.register(r'fraud-flags', FraudFlagViewSet)
router.register(r'admin/traders', AdminTraderViewSet, basename='admin-trader')
router.register(r'admin/lenders', AdminLenderViewSet, basename='admin-lender')

urlpatterns = router.urls