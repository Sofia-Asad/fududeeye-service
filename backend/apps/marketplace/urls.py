from rest_framework.routers import SimpleRouter

from .views import InquiryViewSet, PublicCategoryViewSet, PublicItemViewSet

router = SimpleRouter()
router.register(r'public/categories', PublicCategoryViewSet, basename='public-category')
router.register(r'public/items', PublicItemViewSet, basename='public-item')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = router.urls
