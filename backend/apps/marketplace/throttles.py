from rest_framework.throttling import AnonRateThrottle


class InquiryCreateThrottle(AnonRateThrottle):
    """Rate-limits anonymous lead submissions by IP — the public contact form
    is the main website-to-CRM workflow, so it needs basic spam protection
    without blocking a genuine visitor asking about several listings.
    Rate set by INQUIRY_CREATE_THROTTLE_RATE."""

    scope = 'inquiry_create'
