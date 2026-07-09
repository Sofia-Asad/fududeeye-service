import { Globe, Lock } from 'lucide-react'

import { SegmentedControl } from '@/components/FormSection'
import PermissionGate from '@/components/PermissionGate'

type CreatableStatus = 'DRAFT' | 'ACTIVE'

/**
 * Honest two-option status choice (Draft / Active) — matches the real
 * validated schema. RESERVED/SOLD/etc. are lifecycle states the Sales
 * workflow sets automatically and are intentionally not selectable here.
 */
export default function VisibilityFields({ status, onChange }: { status: CreatableStatus; onChange: (value: CreatableStatus) => void }) {
  return (
    <PermissionGate
      minRole="MANAGER"
      fallback={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
          <Lock size={16} />
          Sales staff submit as Draft — a Manager or Admin can publish it.
        </div>
      )}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <SegmentedControl
          value={status}
          onChange={value => onChange(value)}
          options={[
            { value: 'DRAFT', label: 'Save as Draft' },
            { value: 'ACTIVE', label: 'Publish Now' },
          ]}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: status === 'ACTIVE' ? 'var(--success)' : 'var(--muted)' }}>
          {status === 'ACTIVE' ? <Globe size={15} /> : <Lock size={15} />}
          {status === 'ACTIVE' ? 'Will be visible on the public marketplace immediately' : 'Kept private until you publish it'}
        </div>
      </div>
    </PermissionGate>
  )
}
