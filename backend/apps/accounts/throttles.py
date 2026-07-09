from rest_framework.throttling import AnonRateThrottle


class PasswordResetRequestThrottle(AnonRateThrottle):
    """Rate-limits the "send me a reset link" step by IP — this is the step
    that sends an email and could reveal registered addresses if hammered,
    so it stays tight. Rate set by PASSWORD_RESET_THROTTLE_RATE."""

    scope = 'password_reset_request'


class PasswordResetConfirmThrottle(AnonRateThrottle):
    """Rate-limits the "set new password" step separately from the request
    step — a legitimate user retyping a mistyped password a few times
    shouldn't burn through the same tight budget that guards email sending.
    Rate set by PASSWORD_RESET_CONFIRM_THROTTLE_RATE."""

    scope = 'password_reset_confirm'
