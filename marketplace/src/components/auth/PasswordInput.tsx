import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import Input, { type InputProps } from '@/components/ui/Input'

export type PasswordInputProps = Omit<InputProps, 'type' | 'endAdornment'>

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const toggleId = useId()

  return (
    <Input
      ref={ref}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          id={toggleId}
          onClick={() => setIsVisible(current => !current)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="grid h-8 w-8 place-items-center rounded text-ink-faint transition-colors hover:text-ink"
        >
          {isVisible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      }
      {...props}
    />
  )
})
PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
