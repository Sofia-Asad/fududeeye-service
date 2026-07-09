import { Fragment } from 'react'
import { Check } from 'lucide-react'

export interface WizardStep {
  key: string
  label: string
  description: string
}

/** Horizontal progress stepper for multi-step forms — done steps turn gold, the active step is highlighted, later steps stay gray. */
export default function Stepper({ steps, currentIndex }: { steps: WizardStep[]; currentIndex: number }) {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'upcoming'
        return (
          <Fragment key={step.key}>
            <div className="stepper-step" data-state={state}>
              <span className="stepper-dot">{state === 'done' ? <Check size={16} /> : index + 1}</span>
              <span className="stepper-text">
                <strong>{step.label}</strong>
                <span>{step.description}</span>
              </span>
            </div>
            {index < steps.length - 1 && <span className="stepper-line" data-state={state === 'done' ? 'done' : 'upcoming'} />}
          </Fragment>
        )
      })}
    </div>
  )
}
