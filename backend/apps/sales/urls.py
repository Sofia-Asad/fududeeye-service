from rest_framework.routers import SimpleRouter
from .views import SaleViewSet, RefundViewSet

router = SimpleRouter()
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'refunds', RefundViewSet, basename='refund')

urlpatterns = router.urls
