from rest_framework.routers import SimpleRouter

from .views import DemandViewSet

router = SimpleRouter()
router.register(r'demands', DemandViewSet, basename='demand')

urlpatterns = router.urls
