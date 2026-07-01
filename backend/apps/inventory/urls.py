from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ItemViewSet

router = SimpleRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = router.urls
