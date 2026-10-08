"""
Custom User Model for Digital World Tour & Travels.
Supports Role-Based Access Control (CUSTOMER, ADMIN, STAFF) and Email Authentication.
"""

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    CUSTOMER = 'CUSTOMER', _('Customer')
    ADMIN = 'ADMIN', _('Admin')
    STAFF = 'STAFF', _('Staff')


class UserManager(BaseUserManager):
    """
    Custom manager for User model where email is the unique identifier for auth.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field is required.'))
        email = self.normalize_email(email).lower()
        extra_fields.setdefault('role', UserRole.CUSTOMER)
        extra_fields.setdefault('is_active', True)

        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User entity for Digital World Tour & Travels.
    """
    id = models.BigAutoField(primary_key=True)
    full_name = models.CharField(max_length=255, verbose_name=_('Full Name'))
    email = models.EmailField(max_length=255, unique=True, db_index=True, verbose_name=_('Email Address'))
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name=_('Phone Number'))
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        verbose_name=_('User Role')
    )
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_staff = models.BooleanField(default=False, verbose_name=_('Is Staff'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.role}"

    @property
    def is_customer(self):
        return self.role == UserRole.CUSTOMER

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    @property
    def is_staff_member(self):
        return self.role in [UserRole.STAFF, UserRole.ADMIN] or self.is_staff
