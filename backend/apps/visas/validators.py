"""
Validators for Visa Documents (file types, mime types, file size limits).
"""

import os
from rest_framework.exceptions import ValidationError

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_visa_document_file(file_obj):
    """
    Validate that an uploaded document is an allowed type (PDF, JPG, JPEG, PNG)
    and does not exceed the maximum allowed size (5MB).
    """
    # 1. Validate File Size
    if file_obj.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"File size exceeds maximum allowed limit of 5MB (Received {file_obj.size / (1024 * 1024):.2f}MB)."
        )

    # 2. Validate File Extension
    ext = os.path.splitext(file_obj.name)[1].lower().lstrip('.')
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"Invalid file extension '{ext}'. Only PDF, JPG, JPEG, and PNG files are allowed."
        )

    # 3. Validate Content Type if provided
    content_type = getattr(file_obj, 'content_type', '').lower()
    if content_type and content_type not in ALLOWED_MIME_TYPES and 'octet-stream' not in content_type:
        raise ValidationError(
            f"Invalid file format '{content_type}'. Allowed types: PDF, JPG, JPEG, PNG."
        )

    return file_obj
