import { useRef, useState } from 'react'
import { ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteItemImage, uploadItemImage } from '@/api/inventory'
import EmptyState from '@/components/EmptyState'
import { errorMessage } from '@/lib/errors'
import { notifyError, notifySuccess } from '@/lib/toast'
import type { ItemImage } from '@/types/inventory'

export default function ItemImageManager({
  itemId,
  images,
  canEdit,
}: {
  itemId: number
  images: ItemImage[]
  canEdit: boolean
}) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['item', itemId] })
    void queryClient.invalidateQueries({ queryKey: ['items'] })
  }

  const upload = useMutation({
    mutationFn: (file: File) => uploadItemImage(itemId, file),
    onSuccess: () => {
      invalidate()
      notifySuccess('Photo added')
    },
    onError: (error: unknown) => notifyError(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (imageId: number) => deleteItemImage(itemId, imageId),
    onMutate: (imageId: number) => setPendingDeleteId(imageId),
    onSuccess: () => {
      invalidate()
      notifySuccess('Photo removed')
    },
    onError: (error: unknown) => notifyError(errorMessage(error)),
    onSettled: () => setPendingDeleteId(null),
  })

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    Array.from(fileList).forEach(file => upload.mutate(file))
  }

  return (
    <section className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Photos</h2>
        {canEdit && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="secondary-button"
            style={{ opacity: upload.isPending ? .7 : 1 }}
          >
            <Plus size={15} />
            {upload.isPending ? 'Uploading...' : 'Add Photos'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={event => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {images.map(image => (
            <div key={image.id} style={{ position: 'relative' }}>
              <img
                src={image.image}
                alt=""
                style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }}
              />
              {image.is_primary && (
                <span
                  style={{
                    position: 'absolute', left: 6, top: 6, padding: '2px 8px', borderRadius: 999,
                    background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700,
                  }}
                >
                  Primary
                </span>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remove this photo?')) remove.mutate(image.id)
                  }}
                  disabled={remove.isPending && pendingDeleteId === image.id}
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute', right: 6, top: 6, width: 26, height: 26, borderRadius: 999,
                    border: 'none', background: 'rgba(0,0,0,.55)', color: '#fff',
                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ImageIcon size={18} />}
          title="No images uploaded."
          subtitle={canEdit ? 'Add photos so buyers can see this item on the marketplace.' : undefined}
        />
      )}
    </section>
  )
}
