import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_password_reset_email(user, reset_url):
    """Best-effort send — callers must not let a broken SMTP config leak
    into the API response (that would tell an attacker the email lookup
    branch taken), so failures are logged and swallowed here."""
    context = {
        'first_name': user.first_name or user.username,
        'reset_url': reset_url,
        'expiry_hours': max(settings.PASSWORD_RESET_TIMEOUT // 3600, 1),
    }
    subject = 'Reset your Fududeeye CRM password'
    text_body = render_to_string('accounts/emails/password_reset.txt', context)
    html_body = render_to_string('accounts/emails/password_reset.html', context)

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    message.attach_alternative(html_body, 'text/html')

    try:
        message.send(fail_silently=False)
        return True
    except Exception:
        logger.exception('Failed to send password reset email to user id=%s', user.pk)
        return False
