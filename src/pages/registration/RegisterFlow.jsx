import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RegistrationProvider } from '../../context/RegistrationContext'
import Step1PersonalInfo from './Step1PersonalInfo'
import Step2ContactInfo from './Step2ContactInfo'
import Step3DesignSelection from './Step3DesignSelection'
import Step4ReviewConfirm from './Step4ReviewConfirm'
import Step5Payment from './Step5Payment'
import useSEO from '../../hooks/useSEO'

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [step])

  useSEO({
    title: `Register for Workshop - Step ${step}`,
    description: 'Complete your Rug Circle workshop registration in a guided multi-step flow.',
    canonical: '/register',
    robots: 'noindex, nofollow',
  })

  return (
    <RegistrationProvider>
      <StepComponent />
    </RegistrationProvider>
  )
}
