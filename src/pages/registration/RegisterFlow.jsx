import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RegistrationProvider } from '../../context/RegistrationContext'
import Step1PersonalInfo from './Step1PersonalInfo'
import Step2ContactInfo from './Step2ContactInfo'
import Step3DesignSelection from './Step3DesignSelection'
import Step4ReviewConfirm from './Step4ReviewConfirm'
import Step5Payment from './Step5Payment'

const stepMap = {
  1: Step1PersonalInfo,
  2: Step2ContactInfo,
  3: Step3DesignSelection,
  4: Step4ReviewConfirm,
  5: Step5Payment,
}

export default function RegisterFlow() {
  const [searchParams] = useSearchParams()

  const step = useMemo(() => {
    const raw = Number(searchParams.get('step') || 1)
    if (!Number.isFinite(raw)) return 1
    return Math.min(5, Math.max(1, Math.trunc(raw)))
  }, [searchParams])

  const StepComponent = stepMap[step] || Step1PersonalInfo

  return (
    <RegistrationProvider>
      <StepComponent />
    </RegistrationProvider>
  )
}

