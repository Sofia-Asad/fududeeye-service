from django.urls import path

from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='reports-dashboard'),
    path('pending-payouts/', views.pending_payouts, name='reports-pending-payouts'),
    path('sales/', views.sales_report, name='reports-sales'),
    path('profit/', views.profit_report, name='reports-profit'),
    path('expenses/', views.expense_report, name='reports-expenses'),
    path('demand-vs-supply/', views.demand_vs_supply, name='reports-demand-vs-supply'),
    path('top-requested/', views.top_requested, name='reports-top-requested'),
    path('audit-log/', views.audit_log, name='reports-audit-log'),
]
