import { Toaster } from 'sonner'

/** Mounts the app-wide toast surface, styled to match the marketplace design tokens. */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          fontFamily: 'Jost, system-ui, sans-serif',
          borderRadius: 12,
        },
      }}
    />
  )
}
