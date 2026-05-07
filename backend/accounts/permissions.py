from rest_framework.permissions import BasePermission

class IsRole(BasePermission):
    message = "You do not have the required role."

    def has_permission(self, request, view):
        required_role = getattr(view, 'required_role', None)
        if required_role is None:
            return True
        return request.user.is_authenticated and request.user.role == required_role
