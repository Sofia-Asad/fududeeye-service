from collections import defaultdict
from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.accounts.permissions import IsFinanceViewer
from apps.complaints.models import Complaint
from apps.core.models import AuditLog
from apps.core.serializers import serialize_audit_logs
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.finance.models import Expense
from apps.inventory.models import Item
from apps.sales.models import Refund, Sale


ZERO = Decimal('0.00')


def _money(value):
    return f"{(value or ZERO):.2f}"


def _date_range(request, date_field):
    start = parse_date(request.query_params.get('start') or '')
    end = parse_date(request.query_params.get('end') or '')
    filters = {}
    if start:
        filters[f'{date_field}__gte'] = start
    if end:
        filters[f'{date_field}__lte'] = end
    return filters


def _sale_queryset(request):
    sales = Sale.objects.select_related('item', 'item__category', 'buyer', 'handled_by').all()
    sales = sales.filter(**_date_range(request, 'sale_date'))
    if staff := request.query_params.get('staff'):
        sales = sales.filter(handled_by_id=staff)
    if category := request.query_params.get('category'):
        sales = sales.filter(item__category_id=category)
    if payment_method := request.query_params.get('payment_method'):
        sales = sales.filter(payment_method=payment_method)
    return sales


def _refund_total(filters=None):
    refunds = Refund.objects.all()
    if filters:
        refunds = refunds.filter(**filters)
    return refunds.aggregate(total=Sum('amount'))['total'] or ZERO


def _refund_queryset(request):
    refunds = Refund.objects.select_related('sale', 'sale__item', 'sale__item__category').all()
    refunds = refunds.filter(**_date_range(request, 'refund_date'))
    if staff := request.query_params.get('staff'):
        refunds = refunds.filter(sale__handled_by_id=staff)
    if category := request.query_params.get('category'):
        refunds = refunds.filter(sale__item__category_id=category)
    if payment_method := request.query_params.get('payment_method'):
        refunds = refunds.filter(refund_method=payment_method)
    return refunds


def _sale_total(queryset, field):
    return queryset.aggregate(total=Sum(field))['total'] or ZERO


def _sale_row(sale):
    return {
        'id': sale.pk,
        'item': sale.item.title,
        'buyer': sale.buyer.full_name,
        'quantity_sold': sale.quantity_sold,
        'sale_price': _money(sale.sale_price),
        'company_profit': _money(sale.company_profit),
        'sale_date': sale.sale_date.isoformat(),
        'payment_method': sale.payment_method,
        'handled_by': sale.handled_by.username,
    }


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def dashboard(request):
    today = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    def period(start):
        sales = Sale.objects.filter(sale_date__gte=start, sale_date__lte=today)
        refunds = Refund.objects.filter(refund_date__gte=start, refund_date__lte=today)
        return {
            'sales_count': sales.count(),
            'income': _money(_sale_total(sales, 'sale_price')),
            'profit': _money(_sale_total(sales, 'company_profit')),
            'refunds': _money(refunds.aggregate(total=Sum('amount'))['total'] or ZERO),
        }

    pending_payouts = Sale.objects.filter(payout_status=Sale.PayoutStatus.PENDING)
    recent_sales = (
        Sale.objects
        .select_related('item', 'buyer', 'handled_by')
        .order_by('-sale_date', '-created_at')[:5]
    )

    return Response({
        'counts': {
            'customers': Customer.objects.filter(is_active=True).count(),
            'active_items': Item.objects.filter(status=Item.Status.ACTIVE).count(),
            'open_demands': Demand.objects.filter(status=Demand.Status.OPEN).count(),
            'open_complaints': Complaint.objects.filter(status=Complaint.Status.OPEN).count(),
            'pending_payouts': pending_payouts.count(),
        },
        'today_sales_count': Sale.objects.filter(sale_date=today).count(),
        'today_profit': _money(_sale_total(Sale.objects.filter(sale_date=today), 'company_profit')),
        'today': period(today),
        'week': period(week_start),
        'month': period(month_start),
        'pending_payouts_total': _money(_sale_total(pending_payouts, 'owner_payout_amount')),
        'open_complaints': Complaint.objects.filter(status=Complaint.Status.OPEN).count(),
        'open_demands': Demand.objects.filter(status=Demand.Status.OPEN).count(),
        'recent_sales': [_sale_row(sale) for sale in recent_sales],
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def pending_payouts(request):
    sales = (
        Sale.objects
        .select_related('item', 'item__owner', 'buyer', 'handled_by')
        .filter(payout_status=Sale.PayoutStatus.PENDING)
        .order_by('item__owner__full_name', 'sale_date')
    )
    rows = []
    totals_by_owner = defaultdict(Decimal)
    for sale in sales:
        owner = sale.item.owner
        owner_key = owner.pk if owner else None
        totals_by_owner[owner_key] += sale.owner_payout_amount
        rows.append({
            'sale_id': sale.pk,
            'owner_id': owner.pk if owner else None,
            'owner': owner.full_name if owner else '',
            'item': sale.item.title,
            'sale_date': sale.sale_date.isoformat(),
            'amount': _money(sale.owner_payout_amount),
        })

    return Response({
        'count': len(rows),
        'total': _money(sum(totals_by_owner.values(), ZERO)),
        'results': rows,
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def sales_report(request):
    sales = _sale_queryset(request)
    refund_filters = _date_range(request, 'refund_date')
    refunds = _refund_total(refund_filters)
    gross_sales = _sale_total(sales, 'sale_price')
    profit = _sale_total(sales, 'company_profit') - refunds

    return Response({
        'count': sales.count(),
        'gross_sales': _money(gross_sales),
        'refunds': _money(refunds),
        'net_sales': _money(gross_sales - refunds),
        'profit': _money(profit),
        'results': [_sale_row(sale) for sale in sales.order_by('-sale_date', '-created_at')[:100]],
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def profit_report(request):
    sales = _sale_queryset(request)
    refunds = _refund_queryset(request)
    group_by = request.query_params.get('group_by', 'day')
    rows = defaultdict(lambda: {'sales': ZERO, 'profit': ZERO, 'count': 0})

    def group_key(date):
        if group_by == 'month':
            return date.strftime('%Y-%m')
        if group_by == 'week':
            week_start = date - timedelta(days=date.weekday())
            return week_start.isoformat()
        return date.isoformat()

    for sale in sales:
        key = group_key(sale.sale_date)
        rows[key]['sales'] += sale.sale_price
        rows[key]['profit'] += sale.company_profit
        rows[key]['count'] += 1

    for refund in refunds:
        key = group_key(refund.refund_date)
        rows[key]['profit'] -= refund.amount

    return Response({
        'group_by': group_by,
        'total_profit': _money(sum((row['profit'] for row in rows.values()), ZERO)),
        'results': [
            {
                'period': key,
                'sales': _money(value['sales']),
                'profit': _money(value['profit']),
                'count': value['count'],
            }
            for key, value in sorted(rows.items())
        ],
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def expense_report(request):
    expenses = Expense.objects.select_related('category').filter(**_date_range(request, 'expense_date'))
    if category := request.query_params.get('category'):
        expenses = expenses.filter(category_id=category)

    category_rows = (
        expenses
        .values('category_id', 'category__name')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('category__name')
    )

    return Response({
        'count': expenses.count(),
        'total': _money(expenses.aggregate(total=Sum('amount'))['total'] or ZERO),
        'by_category': [
            {
                'category_id': row['category_id'],
                'category': row['category__name'],
                'total': _money(row['total']),
                'count': row['count'],
            }
            for row in category_rows
        ],
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def demand_vs_supply(request):
    demands = Demand.objects.select_related('customer', 'category').filter(status=Demand.Status.OPEN)
    rows = []
    for demand in demands:
        matches = list(demand.suggest_matches()[:5])
        rows.append({
            'demand_id': demand.pk,
            'customer': demand.customer.full_name,
            'title': demand.title,
            'category': demand.category.name if demand.category else None,
            'match_count': demand.suggest_matches().count(),
            'matches': [
                {
                    'id': item.pk,
                    'title': item.title,
                    'listed_price': _money(item.listed_price),
                }
                for item in matches
            ],
        })
    return Response({'count': len(rows), 'results': rows})


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def top_requested(request):
    rows = (
        Demand.objects
        .values('category_id', 'category__name')
        .annotate(count=Count('id'))
        .order_by('-count', 'category__name')
    )
    return Response({
        'results': [
            {
                'category_id': row['category_id'],
                'category': row['category__name'] or 'Uncategorized',
                'count': row['count'],
            }
            for row in rows
        ],
    })


@api_view(['GET'])
@permission_classes([IsFinanceViewer])
def audit_log(request):
    logs = AuditLog.objects.select_related('user').all()
    if user := request.query_params.get('user'):
        logs = logs.filter(user_id=user)
    if model := request.query_params.get('model'):
        logs = logs.filter(model_name=model)
    if action := request.query_params.get('action'):
        logs = logs.filter(action=action)
    if start := parse_date(request.query_params.get('start') or ''):
        logs = logs.filter(timestamp__date__gte=start)
    if end := parse_date(request.query_params.get('end') or ''):
        logs = logs.filter(timestamp__date__lte=end)

    return Response({
        'count': logs.count(),
        'results': serialize_audit_logs(logs[:100]),
    })
