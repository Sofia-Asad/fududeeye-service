from rest_framework.routers import SimpleRouter
from .views import CustomerViewSet

router = SimpleRouter()
router.register(r'', CustomerViewSet, basename='customer')

urlpatterns = router.urls
