from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsVerifiedCompany(BasePermission):

    def has_permission(self, request, view):

        # Anyone can view job listings
        if request.method in SAFE_METHODS:
            return True

        # User must be logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # User must be a verified company
        try:
            return (
                request.user.profile.role == 'company'
                and request.user.company_profile.is_verified
            )
        except Exception:
            return False