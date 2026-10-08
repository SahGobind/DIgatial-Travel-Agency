"""
Reusable DRF permission classes for Digital World Tour & Travels API.
Includes Role-Based Access Control (RBAC) permissions.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCustomer(BasePermission):
    """
    Allows access only to authenticated users with the CUSTOMER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'CUSTOMER'
        )


class IsAdmin(BasePermission):
    """
    Allows access only to authenticated users with the ADMIN role or superusers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_superuser)
        )


class IsStaffUser(BasePermission):
    """
    Allows access to authenticated users with the STAFF role, ADMIN role, or is_staff flag.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) in ['STAFF', 'ADMIN'] or request.user.is_staff)
        )


class IsAdminOrStaff(BasePermission):
    """
    Allows access to Admin or Staff members.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) in ['STAFF', 'ADMIN'] or request.user.is_staff or request.user.is_superuser)
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Allows view/read access (GET, HEAD, OPTIONS) to users/public,
    while write, add, edit, and delete operations (POST, PUT, PATCH, DELETE)
    are strictly restricted to Admin users only.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_superuser or request.user.is_staff)
        )


class IsAdminUserOrReadOnly(BasePermission):
    """
    Strict Admin RBAC:
    - Admin: Full Access (Read, View, Write, Add, Edit, Delete)
    - Authenticated Users: View / Read Only
    - Anonymous: Denied
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_superuser or request.user.is_staff)


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission allowing owners to view/read, but administrative edits/deletions only to Admins.
    """
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if bool(request.user.is_staff or getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_superuser):
            return True
        
        # Regular users can only perform read/view on their own records
        if request.method in SAFE_METHODS:
            user_field = getattr(obj, 'user', None) or getattr(obj, 'customer', None)
            return bool(user_field and user_field == request.user)
        return False


class PublicReadOnly(BasePermission):
    """
    Read-only permission for public access (e.g. destinations, package listings).
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
