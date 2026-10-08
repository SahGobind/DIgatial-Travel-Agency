"""
Service layer for Visa Application processing, document handling, and country requirements.
"""

from .models import VisaApplication, VisaDocument


class VisaService:
    @staticmethod
    def get_user_queryset(user):
        """
        Return visa applications scoped to user permissions:
        - Admin and Staff see all applications.
        - Customers see only their own applications.
        """
        if not user or not user.is_authenticated:
            return VisaApplication.objects.none()

        if getattr(user, 'role', None) in ['ADMIN', 'STAFF'] or user.is_staff or user.is_superuser:
            return VisaApplication.objects.all().select_related('customer').prefetch_related('documents')

        return VisaApplication.objects.filter(customer=user).select_related('customer').prefetch_related('documents')

    @staticmethod
    def create_visa_application(user, validated_data):
        """
        Create and submit a new visa application.
        """
        country = validated_data.get('country', 'UAE')
        visa_type = validated_data.get('visa_type', 'TOURIST')
        req = VisaService.get_visa_requirements(country, visa_type)

        validated_data['government_fee_npr'] = req['governmentFeeNpr']
        return VisaApplication.objects.create(customer=user, **validated_data)

    @staticmethod
    def attach_document(application, file_obj, document_type='PASSPORT'):
        """
        Save and attach a verified document file to a visa application.
        """
        return VisaDocument.objects.create(
            application=application,
            document_type=document_type,
            file=file_obj,
            file_name=file_obj.name,
            file_size=file_obj.size,
            mime_type=getattr(file_obj, 'content_type', '')
        )

    @staticmethod
    def get_visa_requirements(country, category='TOURIST'):
        """
        Return checklist of required documents and official government fees in NPR.
        """
        norm_country = str(country).strip().upper()
        norm_cat = str(category).strip().lower()

        checklist = [
            "Original Passport with minimum 6 months validity",
            "Passport size photographs (35x45mm, white background)",
            "Citizenship Certificate copy (front and back)",
            "Proof of Financial Solvency / Bank Statement (Last 6 Months)",
            "Cover Letter / Purpose of Visit Statement"
        ]

        if 'work' in norm_cat:
            checklist.extend(["Verified Job Offer Letter / Employment Contract", "Medical Fitness Certificate"])
        elif 'student' in norm_cat:
            checklist.extend(["University Admission Confirmation / I-20 / CAS", "Academic Transcripts & Certificates"])
        elif 'business' in norm_cat:
            checklist.extend(["Invitation Letter from Host Company", "Company Registration & Tax Clearance Documents"])

        fees_map = {
            "UAE": 16500,
            "DUBAI": 16500,
            "QATAR": 14500,
            "SAUDI ARABIA": 18000,
            "SAUDI": 18000,
            "MALAYSIA": 12500,
            "KUWAIT": 15000,
            "OMAN": 14000,
            "BAHRAIN": 15500,
            "JAPAN": 22000,
            "SCHENGEN": 25000,
            "UK": 28000,
            "USA": 30000,
        }

        fee = fees_map.get(norm_country, 15000)
        if 'work' in norm_cat:
            fee = int(fee * 1.3)
        elif 'business' in norm_cat:
            fee = int(fee * 1.5)

        return {
            "country": country,
            "category": category,
            "estimatedProcessingDays": "3-7 Business Days",
            "governmentFeeNpr": fee,
            "requiredDocuments": checklist
        }
