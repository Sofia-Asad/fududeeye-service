from rest_framework.routers import SimpleRouter

from .views import ComplaintViewSet

router = SimpleRouter()
router.register(r'complaints', ComplaintViewSet, basename='complaint')

urlpatterns = router.urls
