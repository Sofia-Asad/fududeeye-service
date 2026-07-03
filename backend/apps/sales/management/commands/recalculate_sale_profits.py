"""
Management command: recalculate_sale_profits
============================================

Audits owner_payout_amount and company_profit for every Sale row using the
model-owned arithmetic from Sale.calculate_financials().

Run:

    python manage.py recalculate_sale_profits --dry-run

Exits non-zero if any row was (or would be) corrected, so CI can detect
accidental drift. Exits 0 when every row is already correct.

This command never writes corrections. Sale money fields are historical,
locked values; reviewed data repair must happen through an explicit migration
or maintenance script with business sign-off.
"""
from django.core.management.base import BaseCommand


def _expected(sale):
    """Return (expected_payout, expected_profit) using the Sale model's formula."""
    payout, profit, _payout_status = sale.calculate_financials(sale.item)
    return payout, profit


class Command(BaseCommand):
    help = (
        'Audit owner_payout_amount and company_profit '
        'on Sale rows whose stored values diverge from the source-of-truth formula.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Kept for backwards compatibility; this command is always audit-only.',
        )

    def handle(self, *args, **options):
        from apps.sales.models import Sale  # local import avoids circular at module load

        self.stdout.write(self.style.MIGRATE_HEADING(
            '\n=== recalculate_sale_profits  [AUDIT ONLY - no changes written] ==='
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

        self.stdout.write(self.style.WARNING(
            f'\n  AUDIT ONLY: {len(corrections)} row(s) require reviewed data repair. '
            'No changes were written.'
        ))
        raise SystemExit(1)   # non-zero: drift exists
