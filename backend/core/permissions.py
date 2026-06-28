from rest_framework import permissions


class IsOwnerTrader(permissions.BasePermission):
    """Allows access only to the trader who owns the object, or staff."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user
    
class IsOwnerTransaction(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.trader.user == request.user


class IsOwnerVouch(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.voucher.user == request.user


class IsOwnerLoanOutcome(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.lender.user == request.user