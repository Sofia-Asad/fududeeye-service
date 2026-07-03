from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({"service": "Fududeeye CRM API", "version": "v1"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api_root, name='api-root'),
    path('api/v1/', include('apps.accounts.urls')),
    path('api/v1/customers/', include('apps.customers.urls')),
    path('api/v1/', include('apps.inventory.urls')),
    path('api/v1/', include('apps.sales.urls')),
    path('api/v1/', include('apps.demands.urls')),
    path('api/v1/', include('apps.complaints.urls')),
    path('api/v1/', include('apps.finance.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
