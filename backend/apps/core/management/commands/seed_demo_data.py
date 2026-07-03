from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.complaints.models import Complaint
from apps.core.models import AuditLog
from apps.customers.models import Customer
from apps.demands.models import Demand
from apps.finance.models import Expense, ExpenseCategory
from apps.inventory.models import Category, Item
from apps.sales.models import Refund, Sale


DEMO_PASSWORD = 'demo12345'


class Command(BaseCommand):
    help = 'Seed the development database with realistic Fududeeye CRM demo data.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default=DEMO_PASSWORD,
            help=f'Password assigned to newly-created demo users. Default: {DEMO_PASSWORD}',
        )
        parser.add_argument(
            '--reset-passwords',
            action='store_true',
            help='Also reset existing demo user passwords to --password.',
        )

    def handle(self, *args, **options):
        self.password = options['password']
        self.reset_passwords = options['reset_passwords']
        self.created = 0
        self.updated = 0
        self.skipped = 0

        today = timezone.localdate()

        users = self.seed_users()
        customers = self.seed_customers()
        categories = self.seed_categories()
        expense_categories = self.seed_expense_categories()
        items = self.seed_items(categories, customers)
        sales = self.seed_sales(items, customers, users, today)
        self.seed_demands(categories, customers, items)
        self.seed_complaints(customers, sales, users)
        self.seed_expenses(expense_categories, users, today)
        self.seed_audit_events(users, today)

        self.stdout.write(self.style.SUCCESS('\nDemo data ready.'))
        self.stdout.write(f'  Created: {self.created}')
        self.stdout.write(f'  Updated: {self.updated}')
        self.stdout.write(f'  Skipped: {self.skipped}')
        self.stdout.write('')
        self.stdout.write('Demo logins:')
        self.stdout.write(f'  demo_admin / {self.password}')
        self.stdout.write(f'  demo_manager / {self.password}')
        self.stdout.write(f'  demo_sales / {self.password}')

    def mark_created(self):
        self.created += 1

    def mark_updated(self):
        self.updated += 1

    def mark_skipped(self):
        self.skipped += 1

    def apply_updates(self, obj, fields, clean=False):
        changed = False
        for field, value in fields.items():
            if getattr(obj, field) != value:
                setattr(obj, field, value)
                changed = True

        if not changed:
            self.mark_skipped()
            return False

        if clean:
            obj.full_clean()
        obj.save()
        self.mark_updated()
        return True

    def seed_users(self):
        User = get_user_model()
        specs = [
            {
                'username': 'demo_admin',
                'role': User.Role.ADMIN,
                'first_name': 'Axmed',
                'last_name': 'Aweys',
                'email': 'admin@fududeeye.local',
                'phone': '+252611110000',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'username': 'demo_manager',
                'role': User.Role.MANAGER,
                'first_name': 'Maryan',
                'last_name': 'Faarax',
                'email': 'manager@fududeeye.local',
                'phone': '+252612221111',
                'is_staff': True,
                'is_superuser': False,
            },
            {
                'username': 'demo_sales',
                'role': User.Role.SALES,
                'first_name': 'Hodan',
                'last_name': 'Maxamuud',
                'email': 'sales@fududeeye.local',
                'phone': '+252613332222',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'username': 'demo_sales_two',
                'role': User.Role.SALES,
                'first_name': 'Yuusuf',
                'last_name': 'Cali',
                'email': 'sales2@fududeeye.local',
                'phone': '+252614443333',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'username': 'demo_inactive',
                'role': User.Role.SALES,
                'first_name': 'Cabdi',
                'last_name': 'Nuur',
                'email': 'inactive@fududeeye.local',
                'phone': '+252615554444',
                'is_staff': False,
                'is_superuser': False,
                'is_active_staff': False,
            },
        ]

        users = {}
        for spec in specs:
            defaults = {
                'first_name': spec['first_name'],
                'last_name': spec['last_name'],
                'email': spec['email'],
                'phone': spec['phone'],
                'role': spec['role'],
                'is_staff': spec['is_staff'],
                'is_superuser': spec['is_superuser'],
                'is_active_staff': spec.get('is_active_staff', True),
                'is_active': True,
            }
            user = User.objects.filter(username=spec['username']).first()
            if user is None:
                user = User.objects.create_user(
                    username=spec['username'],
                    password=self.password,
                    **defaults,
                )
                self.mark_created()
            else:
                changed = False
                for field, value in defaults.items():
                    if getattr(user, field) != value:
                        setattr(user, field, value)
                        changed = True
                if self.reset_passwords:
                    user.set_password(self.password)
                    changed = True
                if changed:
                    user.save()
                    self.mark_updated()
                else:
                    self.mark_skipped()
            users[spec['username']] = user
        return users

    def seed_customers(self):
        specs = [
            {
                'full_name': 'Axmed Aweys',
                'phone': '+252 61 111 0000',
                'alternate_phone': '+252 65 111 0000',
                'email': 'axmed@example.com',
                'address': 'Galkayo, Garsoor',
                'notes': 'Consignment seller and repeat electronics buyer.',
            },
            {
                'full_name': 'Hodan Maxamuud',
                'phone': '+252 61 333 2222',
                'alternate_phone': '',
                'email': 'hodan@example.com',
                'address': 'Galkayo, Israac',
                'notes': 'Looking for laptops and office furniture.',
            },
            {
                'full_name': 'Maryan Faarax',
                'phone': '+252 61 222 1111',
                'alternate_phone': '+252 90 222 1111',
                'email': 'maryan@example.com',
                'address': 'Galkayo, Wadajir',
                'notes': 'Vehicle owner; prefers EVC Plus payouts.',
            },
            {
                'full_name': 'Yuusuf Cali',
                'phone': '+252 61 444 3333',
                'alternate_phone': '',
                'email': 'yuusuf@example.com',
                'address': 'Galkayo, Horumar',
                'notes': 'Business buyer for office equipment.',
            },
            {
                'full_name': 'Cabdiraxmaan Nuur',
                'phone': '+252 61 555 4444',
                'alternate_phone': '',
                'email': 'cabdiraxmaan@example.com',
                'address': 'Galkayo, New Galkayo',
                'notes': 'Real estate lead.',
            },
            {
                'full_name': 'Sahra Warsame',
                'phone': '+252 61 666 5555',
                'alternate_phone': '',
                'email': 'sahra@example.com',
                'address': 'Galkayo, Baraxley',
                'notes': 'Inactive historical customer.',
                'is_active': False,
            },
        ]

        customers = {}
        for spec in specs:
            customer = Customer.objects.filter(phone=spec['phone']).first()
            defaults = {
                'full_name': spec['full_name'],
                'alternate_phone': spec['alternate_phone'],
                'email': spec['email'],
                'address': spec['address'],
                'notes': spec['notes'],
                'is_active': spec.get('is_active', True),
            }
            if customer is None:
                customer = Customer.objects.create(phone=spec['phone'], **defaults)
                self.mark_created()
            else:
                self.apply_updates(customer, defaults)
            customers[spec['full_name']] = customer
        return customers

    def seed_categories(self):
        def category(name, kind, parent=None):
            obj, created = Category.objects.get_or_create(
                name=name,
                parent=parent,
                defaults={'kind': kind},
            )
            if created:
                self.mark_created()
            elif obj.kind != kind:
                obj.kind = kind
                obj.save(update_fields=['kind'])
                self.mark_updated()
            else:
                self.mark_skipped()
            return obj

        electronics = category('Electronics', Category.Kind.ELECTRONICS)
        vehicles = category('Vehicles', Category.Kind.VEHICLE)
        furniture = category('Furniture', Category.Kind.FURNITURE)
        real_estate = category('Real Estate', Category.Kind.REAL_ESTATE)
        generic = category('General Goods', Category.Kind.GENERIC)

        return {
            'electronics': electronics,
            'laptops': category('Laptops', Category.Kind.ELECTRONICS, electronics),
            'phones': category('Phones', Category.Kind.ELECTRONICS, electronics),
            'vehicles': vehicles,
            'cars': category('Cars', Category.Kind.VEHICLE, vehicles),
            'furniture': furniture,
            'office_chairs': category('Office Chairs', Category.Kind.FURNITURE, furniture),
            'real_estate': real_estate,
            'apartments': category('Apartments', Category.Kind.REAL_ESTATE, real_estate),
            'generic': generic,
        }

    def seed_expense_categories(self):
        specs = [
            ('Rent', 'Shop and office rent.'),
            ('Utilities', 'Power, internet, water, and generator fuel.'),
            ('Transport', 'Fuel and delivery costs.'),
            ('Marketing', 'Ads and marketplace promotion.'),
            ('Repairs', 'Shop and item repair costs.'),
            ('Salaries', 'Staff salaries and advances.'),
        ]
        rows = {}
        for name, description in specs:
            category, created = ExpenseCategory.objects.get_or_create(
                name=name,
                defaults={'description': description, 'is_active': True},
            )
            if created:
                self.mark_created()
            else:
                self.apply_updates(category, {
                    'description': description,
                    'is_active': True,
                })
            rows[name] = category
        return rows

    def seed_items(self, categories, customers):
        def item(title, **fields):
            existing = Item.objects.filter(title=title).first()
            if existing:
                self.mark_skipped()
                return existing
            obj = Item(title=title, **fields)
            obj.full_clean()
            obj.save()
            self.mark_created()
            return obj

        return {
            'consignment_laptop': item(
                'HP EliteBook 840 G8',
                description='Clean business laptop, 16 GB RAM, 512 GB SSD.',
                category=categories['laptops'],
                owner_type=Item.OwnerType.CONSIGNMENT,
                owner=customers['Axmed Aweys'],
                owner_asking_price=Decimal('500.00'),
                listed_price=Decimal('620.00'),
                quantity=3,
                condition=Item.Condition.USED,
                location='Showroom shelf A1',
                status=Item.Status.ACTIVE,
                attributes={'brand': 'HP', 'model': 'EliteBook 840 G8', 'ram_gb': 16},
            ),
            'company_phone': item(
                'Samsung Galaxy S23',
                description='Company-owned phone, boxed with charger.',
                category=categories['phones'],
                owner_type=Item.OwnerType.COMPANY,
                cost_price=Decimal('500.00'),
                listed_price=Decimal('680.00'),
                quantity=4,
                condition=Item.Condition.USED,
                location='Glass cabinet',
                status=Item.Status.ACTIVE,
                attributes={'brand': 'Samsung', 'model': 'Galaxy S23', 'storage_gb': 256},
            ),
            'company_laptop': item(
                'Dell Latitude 7420',
                description='Company-owned laptop ready for quick sale.',
                category=categories['laptops'],
                owner_type=Item.OwnerType.COMPANY,
                cost_price=Decimal('340.00'),
                listed_price=Decimal('430.00'),
                quantity=2,
                condition=Item.Condition.REFURBISHED,
                location='Showroom shelf A2',
                status=Item.Status.ACTIVE,
                attributes={'brand': 'Dell', 'model': 'Latitude 7420', 'ram_gb': 16},
            ),
            'chairs': item(
                'Office chairs set',
                description='Six matching office chairs from the same owner.',
                category=categories['office_chairs'],
                owner_type=Item.OwnerType.CONSIGNMENT,
                owner=customers['Yuusuf Cali'],
                owner_asking_price=Decimal('35.00'),
                listed_price=Decimal('55.00'),
                quantity=6,
                condition=Item.Condition.USED,
                location='Warehouse row C',
                status=Item.Status.ACTIVE,
                attributes={'pieces': 6, 'material': 'mesh'},
            ),
            'toyota': item(
                'Toyota Vitz 2016',
                description='Imported compact car, automatic transmission.',
                category=categories['cars'],
                owner_type=Item.OwnerType.CONSIGNMENT,
                owner=customers['Maryan Faarax'],
                owner_asking_price=Decimal('7200.00'),
                listed_price=Decimal('7800.00'),
                quantity=1,
                condition=Item.Condition.USED,
                location='Vehicle yard',
                status=Item.Status.ACTIVE,
                attributes={'make': 'Toyota', 'model': 'Vitz', 'year': 2016, 'mileage_km': 82000},
            ),
            'apartment': item(
                'Two-bedroom apartment',
                description='Apartment listing near central Galkayo.',
                category=categories['apartments'],
                owner_type=Item.OwnerType.CONSIGNMENT,
                owner=customers['Cabdiraxmaan Nuur'],
                owner_asking_price=Decimal('28000.00'),
                listed_price=Decimal('30500.00'),
                quantity=1,
                condition=Item.Condition.USED,
                location='Galkayo central',
                status=Item.Status.RESERVED,
                attributes={'bedrooms': 2, 'bathrooms': 1, 'sqm': 86},
            ),
            'draft_generator': item(
                'Diesel generator draft listing',
                description='Draft listing waiting for manager review.',
                category=categories['generic'],
                owner_type=Item.OwnerType.COMPANY,
                cost_price=Decimal('700.00'),
                listed_price=Decimal('920.00'),
                quantity=1,
                condition=Item.Condition.USED,
                location='Back room',
                status=Item.Status.DRAFT,
                attributes={'power_kva': 5},
            ),
            'withdrawn_sofa': item(
                'Withdrawn sofa set',
                description='Owner pulled this listing after intake.',
                category=categories['furniture'],
                owner_type=Item.OwnerType.CONSIGNMENT,
                owner=customers['Sahra Warsame'],
                owner_asking_price=Decimal('180.00'),
                listed_price=Decimal('250.00'),
                quantity=1,
                condition=Item.Condition.USED,
                location='Warehouse row B',
                status=Item.Status.WITHDRAWN,
                attributes={'pieces': 4},
            ),
        }

    def seed_sales(self, items, customers, users, today):
        sales = {}

        sales['laptop_pending'] = self.create_sale_once(
            marker='DEMO:S001',
            item=items['consignment_laptop'],
            buyer=customers['Hodan Maxamuud'],
            quantity=1,
            sale_price=Decimal('620.00'),
            sale_date=today,
            payment_method=Sale.PaymentMethod.CASH,
            handled_by=users['demo_sales'],
            description='Consignment laptop sale with pending owner payout.',
        )
        sales['chairs_paid'] = self.create_sale_once(
            marker='DEMO:S002',
            item=items['chairs'],
            buyer=customers['Maryan Faarax'],
            quantity=2,
            sale_price=Decimal('110.00'),
            sale_date=today - timedelta(days=1),
            payment_method=Sale.PaymentMethod.EVC_PLUS,
            handled_by=users['demo_sales_two'],
            description='Partial multi-unit consignment sale, paid out.',
            payout_paid=True,
            payout_method=Sale.PaymentMethod.EVC_PLUS,
            payout_date=today,
            payout_user=users['demo_manager'],
        )
        sales['phone_company'] = self.create_sale_once(
            marker='DEMO:S003',
            item=items['company_phone'],
            buyer=customers['Yuusuf Cali'],
            quantity=1,
            sale_price=Decimal('680.00'),
            sale_date=today - timedelta(days=2),
            payment_method=Sale.PaymentMethod.ZAAD,
            handled_by=users['demo_manager'],
            description='Company-owned phone sale, no owner payout.',
        )
        sales['toyota_pending'] = self.create_sale_once(
            marker='DEMO:S004',
            item=items['toyota'],
            buyer=customers['Cabdiraxmaan Nuur'],
            quantity=1,
            sale_price=Decimal('7600.00'),
            sale_date=today - timedelta(days=5),
            payment_method=Sale.PaymentMethod.BANK_TRANSFER,
            handled_by=users['demo_manager'],
            description='Vehicle consignment sale with large pending payout.',
        )
        sales['refunded_laptop'] = self.create_sale_once(
            marker='DEMO:S005',
            item=items['company_laptop'],
            buyer=customers['Axmed Aweys'],
            quantity=1,
            sale_price=Decimal('430.00'),
            sale_date=today - timedelta(days=9),
            payment_method=Sale.PaymentMethod.CASH,
            handled_by=users['demo_sales'],
            description='Company laptop sale with partial refund.',
            refund={
                'amount': Decimal('80.00'),
                'reason': Refund.Reason.DEFECTIVE,
                'reason_detail': 'Battery health lower than expected.',
                'refund_date': today - timedelta(days=7),
                'item_returned': False,
                'refund_method': Sale.PaymentMethod.CASH,
                'handled_by': users['demo_manager'],
                'notes': 'DEMO:S005 goodwill refund',
            },
            final_item_status=Item.Status.REFUNDED,
        )

        return sales

    def create_sale_once(
        self,
        marker,
        item,
        buyer,
        quantity,
        sale_price,
        sale_date,
        payment_method,
        handled_by,
        description,
        payout_paid=False,
        payout_method='',
        payout_date=None,
        payout_user=None,
        refund=None,
        final_item_status=None,
    ):
        existing = Sale.objects.filter(notes__contains=marker).first()
        if existing:
            self.mark_skipped()
            return existing

        if item.quantity_available < quantity:
            self.stdout.write(self.style.WARNING(
                f'Skipping {marker}: {item.title} only has {item.quantity_available} available.'
            ))
            self.mark_skipped()
            return None

        sale = Sale.objects.create(
            item=item,
            buyer=buyer,
            quantity_sold=quantity,
            sale_price=sale_price,
            sale_date=sale_date,
            payment_method=payment_method,
            handled_by=handled_by,
            notes=f'{marker} {description}',
        )
        self.mark_created()

        if payout_paid and sale.payout_status == Sale.PayoutStatus.PENDING:
            sale.payout_status = Sale.PayoutStatus.PAID
            sale.payout_method = payout_method
            sale.payout_date = payout_date
            sale.payout_handled_by = payout_user
            sale.save(update_fields=['payout_status', 'payout_method', 'payout_date', 'payout_handled_by'])
            self.mark_updated()

        if refund and not Refund.objects.filter(notes__contains=marker).exists():
            Refund.objects.create(sale=sale, **refund)
            self.mark_created()

        if final_item_status:
            item.refresh_from_db()
            item.status = final_item_status
            item.save(update_fields=['status'])
            self.mark_updated()

        return sale

    def seed_demands(self, categories, customers, items):
        specs = [
            {
                'customer': customers['Hodan Maxamuud'],
                'title': 'Laptop under $500',
                'description': 'Needs a reliable laptop for office work.',
                'category': categories['laptops'],
                'target_price_min': Decimal('300.00'),
                'target_price_max': Decimal('500.00'),
                'status': Demand.Status.OPEN,
                'matched_item': None,
                'notes': 'Should suggest Dell Latitude 7420.',
            },
            {
                'customer': customers['Yuusuf Cali'],
                'title': 'Apartment near central Galkayo',
                'description': 'Looking for a small apartment.',
                'category': categories['apartments'],
                'target_price_min': Decimal('25000.00'),
                'target_price_max': Decimal('32000.00'),
                'status': Demand.Status.MATCHED,
                'matched_item': items['apartment'],
                'notes': 'Customer is reviewing the reserved apartment.',
            },
            {
                'customer': customers['Maryan Faarax'],
                'title': 'Six office chairs',
                'description': 'Wanted matching office chairs for a new office.',
                'category': categories['office_chairs'],
                'target_price_min': Decimal('200.00'),
                'target_price_max': Decimal('400.00'),
                'status': Demand.Status.FULFILLED,
                'matched_item': items['chairs'],
                'notes': 'Partially fulfilled from chair consignment.',
            },
            {
                'customer': customers['Cabdiraxmaan Nuur'],
                'title': 'Truck for construction work',
                'description': 'Customer dropped the request after buying elsewhere.',
                'category': categories['vehicles'],
                'target_price_min': Decimal('10000.00'),
                'target_price_max': Decimal('18000.00'),
                'status': Demand.Status.DROPPED,
                'matched_item': None,
                'notes': 'Keep for historical demand reporting.',
            },
        ]

        for spec in specs:
            demand = Demand.objects.filter(customer=spec['customer'], title=spec['title']).first()
            fields = {k: v for k, v in spec.items() if k not in ('customer', 'title')}
            if demand is None:
                Demand.objects.create(customer=spec['customer'], title=spec['title'], **fields)
                self.mark_created()
            else:
                self.apply_updates(demand, fields, clean=True)

    def seed_complaints(self, customers, sales, users):
        specs = [
            {
                'customer': customers['Hodan Maxamuud'],
                'related_sale': sales.get('laptop_pending'),
                'subject': 'Battery drains quickly',
                'description': 'Customer reports that laptop battery drains faster than expected.',
                'status': Complaint.Status.OPEN,
                'priority': Complaint.Priority.HIGH,
                'assigned_to': users['demo_sales'],
                'resolution_notes': '',
            },
            {
                'customer': customers['Yuusuf Cali'],
                'related_sale': sales.get('phone_company'),
                'subject': 'Phone charger missing',
                'description': 'Box was missing the original charger.',
                'status': Complaint.Status.IN_PROGRESS,
                'priority': Complaint.Priority.URGENT,
                'assigned_to': users['demo_manager'],
                'resolution_notes': 'Sourcing replacement charger.',
            },
            {
                'customer': customers['Maryan Faarax'],
                'related_sale': sales.get('chairs_paid'),
                'subject': 'Chair delivery delayed',
                'description': 'Delivery was delayed by one day.',
                'status': Complaint.Status.RESOLVED,
                'priority': Complaint.Priority.MEDIUM,
                'assigned_to': users['demo_sales_two'],
                'resolution_notes': 'Delivery completed and customer confirmed.',
            },
            {
                'customer': customers['Axmed Aweys'],
                'related_sale': sales.get('refunded_laptop'),
                'subject': 'Refund follow-up',
                'description': 'Closed after partial refund was issued.',
                'status': Complaint.Status.CLOSED,
                'priority': Complaint.Priority.LOW,
                'assigned_to': users['demo_manager'],
                'resolution_notes': 'Refund recorded and ticket closed.',
            },
        ]

        for spec in specs:
            complaint = Complaint.objects.filter(customer=spec['customer'], subject=spec['subject']).first()
            fields = {k: v for k, v in spec.items() if k not in ('customer', 'subject')}
            if complaint is None:
                Complaint.objects.create(customer=spec['customer'], subject=spec['subject'], **fields)
                self.mark_created()
            else:
                self.apply_updates(complaint, fields)

    def seed_expenses(self, expense_categories, users, today):
        specs = [
            ('Rent', Decimal('450.00'), today.replace(day=1), Expense.PaymentMethod.BANK_TRANSFER, 'Shop rent for this month', 'Monthly fixed cost.'),
            ('Utilities', Decimal('120.00'), today - timedelta(days=2), Expense.PaymentMethod.CASH, 'Generator diesel', 'Power backup fuel.'),
            ('Transport', Decimal('35.00'), today - timedelta(days=4), Expense.PaymentMethod.CASH, 'Vehicle delivery fuel', 'Customer delivery trip.'),
            ('Marketing', Decimal('40.00'), today - timedelta(days=6), Expense.PaymentMethod.EVC_PLUS, 'Facebook marketplace ads', 'Promoted electronics listings.'),
            ('Repairs', Decimal('60.00'), today - timedelta(days=9), Expense.PaymentMethod.ZAAD, 'Shelf repair', 'Showroom shelf maintenance.'),
            ('Salaries', Decimal('200.00'), today - timedelta(days=11), Expense.PaymentMethod.EVC_PLUS, 'Staff advance', 'Advance for sales staff.'),
        ]

        for category_name, amount, expense_date, method, description, notes in specs:
            expense = Expense.objects.filter(
                category=expense_categories[category_name],
                expense_date=expense_date,
                description=description,
            ).first()
            fields = {
                'amount': amount,
                'payment_method': method,
                'notes': notes,
            }
            if expense is None:
                Expense.objects.create(
                    category=expense_categories[category_name],
                    expense_date=expense_date,
                    description=description,
                    **fields,
                )
                self.mark_created()
            else:
                self.apply_updates(expense, fields)

    def seed_audit_events(self, users, today):
        specs = [
            {
                'user': users['demo_admin'],
                'action': AuditLog.Action.CUSTOM,
                'model_name': 'DemoScenario',
                'object_id': 'inventory-review',
                'object_repr': 'Manager reviewed demo inventory',
                'changes': {'scenario': 'inventory-review', 'date': today.isoformat()},
                'ip_address': '127.0.0.1',
            },
            {
                'user': users['demo_manager'],
                'action': AuditLog.Action.LOGIN,
                'model_name': 'User',
                'object_id': str(users['demo_manager'].pk),
                'object_repr': str(users['demo_manager']),
                'changes': {},
                'ip_address': '127.0.0.1',
            },
            {
                'user': users['demo_sales'],
                'action': AuditLog.Action.CUSTOM,
                'model_name': 'DemoScenario',
                'object_id': 'sales-workflow',
                'object_repr': 'Sales workflow demo event',
                'changes': {'workflow': 'sale-created', 'payment_method': Sale.PaymentMethod.CASH},
                'ip_address': '127.0.0.1',
            },
        ]

        for spec in specs:
            exists = AuditLog.objects.filter(
                action=spec['action'],
                model_name=spec['model_name'],
                object_id=spec['object_id'],
            ).exists()
            if exists:
                self.mark_skipped()
            else:
                AuditLog.objects.create(
                    user=spec['user'],
                    action=spec['action'],
                    model_name=spec['model_name'],
                    object_id=spec['object_id'],
                    object_repr=spec['object_repr'],
                    changes=spec['changes'],
                    ip_address=spec['ip_address'],
                )
                self.mark_created()
