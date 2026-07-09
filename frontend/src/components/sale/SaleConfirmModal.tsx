import Modal from '@/components/Modal'
import ReviewSummary from '@/components/wizard/ReviewSummary'

export interface SaleConfirmDetails {
  itemTitle: string
  buyerName: string
  quantity: number
  total: string
  companyProfit: string
  ownerPayout: string
  paymentMethodLabel: string
  date: string
}

export default function SaleConfirmModal({
  open,
  onClose,
  onConfirm,
  isPending,
  details,
  showFinance,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  details: SaleConfirmDetails
  showFinance: boolean
}) {
  const rows = [
    { label: 'Item', value: details.itemTitle },
    { label: 'Buyer', value: details.buyerName },
    { label: 'Quantity', value: String(details.quantity) },
    { label: 'Total', value: details.total },
    ...(showFinance ? [
      { label: 'Company profit', value: details.companyProfit },
      { label: 'Owner payout', value: details.ownerPayout },
    ] : []),
    { label: 'Payment method', value: details.paymentMethodLabel },
    { label: 'Date', value: details.date },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm this sale"
      description="Double-check the details below — this will record the sale and update inventory."
      footer={(
        <>
          <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isPending} className="wizard-gold-button" style={{ opacity: isPending ? .7 : 1 }}>
            {isPending ? 'Saving...' : 'Confirm Sale'}
          </button>
        </>
      )}
    >
      <ReviewSummary rows={rows} />
    </Modal>
  )
}
