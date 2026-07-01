"""
Management command: recalculate_sale_profits
============================================

Recalculates owner_payout_amount and company_profit for every Sale row
using the same arithmetic as Sale._compute_and_persist().

Run AUDIT first (no changes written):

    python manage.py recalculate_sale_profits --dry-run

Then apply after reviewing the output:

    python manage.py recalculate_sale_profits

Exits non-zero if any row was (or would be) corrected, so CI can detect
accidental drift. Exits 0 when every row is already correct.
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction


ZERO = Decimal('0.00')


def _expected(sale):
    """Return (expected_payout, expected_profit) for a Sale, mirroring _compute_and_persist."""
    item = sale.item
    if item.owner_type == 'CONSIGNMENT':
        payout = item.owner_asking_price * sale.quantity_sold
        profit = sale.sale_price - payout
    else:  # COMPANY
        payout = ZERO
        profit = sale.sale_price - (item.cost_price * sale.quantity_sold)
    return payout, profit


class Command(BaseCommand):
    help = (
        'Audit and (optionally) repair owner_payout_amount and company_profit '
        'on Sale rows whose stored values diverge from the source-of-truth formula.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Print what would change without writing anything to the database.',
        )

    def handle(self, *args, **options):
        from apps.sales.models import Sale  # local import avoids circular at module load

        dry_run = options['dry_run']
        mode_label = 'DRY-RUN (no changes written)' if dry_run else 'APPLY'

        self.stdout.write(self.style.MIGRATE_HEADING(
            f'\n=== recalculate_sale_profits  [{mode_label}] ==='
        ))

        sales = (
            Sale.objects
            .select_related('item')
            .order_by('pk')
        )

        corrections = []

        for sale in sales:
            exp_payout, exp_profit = _expected(sale)

            payout_wrong = sale.owner_payout_amount != exp_payout
            profit_wrong = sale.company_profit != exp_profit

            if payout_wrong or profit_wrong:
                corrections.append({
                    'pk': sale.pk,
                    'sale': sale,
                    'stored_payout': sale.owner_payout_amount,
                    'stored_profit': sale.company_profit,
                    'exp_payout': exp_payout,
                    'exp_profit': exp_profit,
                    'payout_wrong': payout_wrong,
                    'profit_wrong': profit_wrong,
                })

        # ── report ─────────────────────────────────────────────────────────────
        if not corrections:
            self.stdout.write(self.style.SUCCESS(
                f'  Checked {sales.count()} row(s) -- all values correct. Nothing to do.'
            ))
            return

        self.stdout.write(
            f'\n  Found {len(corrections)} row(s) with incorrect values:\n'
        )

        header = f"  {'Sale #':<8} {'owner_payout stored':>20} {'-> correct':>12}    "  \
                 f"{'company_profit stored':>22} {'-> correct':>12}"
        self.stdout.write(header)
        self.stdout.write('  ' + '-' * (len(header) - 2))

        for c in corrections:
            payout_arrow = (
                f"{c['stored_payout']:>20} -> {c['exp_payout']:<12}"
                if c['payout_wrong']
                else f"{'(ok)':>20}   {'':12}"
            )
            profit_arrow = (
                f"{c['stored_profit']:>22} -> {c['exp_profit']:<12}"
                if c['profit_wrong']
                else f"{'(ok)':>22}   {'':12}"
            )
            flag = self.style.ERROR('WRONG') if (c['payout_wrong'] or c['profit_wrong']) else ''
            self.stdout.write(
                f"  #{c['pk']:<7} {payout_arrow}    {profit_arrow}  {flag}"
            )

        # ── apply ──────────────────────────────────────────────────────────────
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f'\n  DRY-RUN: {len(corrections)} row(s) would be corrected. '
                'Re-run without --dry-run to apply.'
            ))
            # Exit with code 1 to make drift detectable in scripts / CI
            raise SystemExit(1)

        self.stdout.write('')
        with transaction.atomic():
            for c in corrections:
                Sale.objects.filter(pk=c['pk']).update(
                    owner_payout_amount=c['exp_payout'],
                    company_profit=c['exp_profit'],
                )
                self.stdout.write(
                    f"  Corrected Sale #{c['pk']}: "
                    f"payout {c['stored_payout']} -> {c['exp_payout']}, "
                    f"profit {c['stored_profit']} -> {c['exp_profit']}"
                )

        self.stdout.write(self.style.SUCCESS(
            f'\n  Applied {len(corrections)} correction(s) inside a single transaction.'
        ))
        raise SystemExit(1)   # non-zero: rows were corrected (drift existed)
