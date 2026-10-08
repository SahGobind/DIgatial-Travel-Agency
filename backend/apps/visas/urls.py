"""
URL configuration for Visa endpoints.
"""

from django.urls import path
from .views import (
    VisaApplicationListCreateView,
    VisaApplicationDetailView,
    VisaDocumentUploadView,
    VisaRequirementsView,
)

urlpatterns = [
    path('', VisaApplicationListCreateView.as_view(), name='visa-list-create'),
    path('<int:pk>/', VisaApplicationDetailView.as_view(), name='visa-detail'),
    path('<int:pk>/documents/', VisaDocumentUploadView.as_view(), name='visa-document-upload'),
    path('requirements/', VisaRequirementsView.as_view(), name='visa-requirements'),
]
