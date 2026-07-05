import { MessageSquare, ShieldCheck, Sparkles, Tag } from 'lucide-react'

/**
 * Abstract, brand-colored illustration for the split auth layout. Built
 * entirely from shapes and icons so it never depends on an external image.
 */
export default function AuthIllustration() {
  return (
    <div className="relative mx-auto grid h-72 w-full max-w-sm place-items-center" aria-hidden="true">
      <span className="absolute h-56 w-56 rounded-full bg-gold/20 blur-2xl" />
      <span className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10 blur-xl" />

      <div className="relative w-full rounded-lg border border-white/15 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-ink">
            <ShieldCheck size={20} />
          </span>
          <div className="min-w-0">
            <span className="block h-2.5 w-24 rounded-full bg-white/30" />
            <span className="mt-1.5 block h-2 w-16 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="mt-5 grid gap-2.5">
          <span className="block h-2 w-full rounded-full bg-white/15" />
          <span className="block h-2 w-4/5 rounded-full bg-white/15" />
        </div>
      </div>

      <span className="absolute -right-2 top-2 grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-white/10 text-gold shadow-md backdrop-blur-sm">
        <Tag size={22} />
      </span>
      <span className="absolute -left-4 bottom-6 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white shadow-md backdrop-blur-sm">
        <MessageSquare size={18} />
      </span>
      <span className="absolute bottom-0 right-8 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-gold shadow-md backdrop-blur-sm">
        <Sparkles size={16} />
      </span>
    </div>
  )
}
