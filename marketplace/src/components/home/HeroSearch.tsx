import { useState, type FormEvent } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { useCategoriesQuery } from '@/features/listings/queries'

/** Hero search: keyword + category + location, navigating to the listings page. */
export default function HeroSearch() {
  const navigate = useNavigate()
  const categories = useCategoriesQuery()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  const categoryOptions = (categories.data ?? []).map(item => ({ value: String(item.id), label: item.name }))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    const combinedKeyword = [keyword.trim(), location.trim()].filter(Boolean).join(' ')
    if (combinedKeyword) params.set('q', combinedKeyword)
    if (category) params.set('category', category)
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
    >
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink">Keyword</span>
        <span className="relative">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="What are you looking for?"
            className="h-11 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30"
          />
        </span>
      </label>

      <Select
        label="Category"
        placeholder="All categories"
        options={categoryOptions}
        value={category}
        onChange={event => setCategory(event.target.value)}
      />

      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-ink">Location</span>
        <span className="relative">
          <MapPin size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={location}
            onChange={event => setLocation(event.target.value)}
            placeholder="City"
            className="h-11 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30"
          />
        </span>
      </label>

      <Button type="submit" size="lg" className="md:w-auto">
        <Search size={16} />
        Search
      </Button>
    </form>
  )
}
