import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


def validate_password_strength(value, user=None):
    """Runs the project's configured AUTH_PASSWORD_VALIDATORS plus the explicit
    complexity rules the self-service reset form advertises to users."""
    errors = []

    if len(value) < 8:
        errors.append('Password must be at least 8 characters long.')
    if not re.search(r'[A-Z]', value):
        errors.append('Password must contain at least one uppercase letter.')
    if not re.search(r'[a-z]', value):
        errors.append('Password must contain at least one lowercase letter.')
    if not re.search(r'\d', value):
        errors.append('Password must contain at least one number.')

    try:
        validate_password(value, user=user)
    except DjangoValidationError as exc:
        errors.extend(exc.messages)

    if errors:
        raise serializers.ValidationError(errors)

    return value
