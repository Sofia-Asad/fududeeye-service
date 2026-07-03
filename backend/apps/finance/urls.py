from rest_framework.routers import SimpleRouter

from .views import ExpenseCategoryViewSet, ExpenseViewSet

router = SimpleRouter()
router.register(r'expense-categories', ExpenseCategoryViewSet, basename='expense-category')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = router.urls
