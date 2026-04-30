import { createContext, useContext, useState, useEffect } from 'react'

const RegistrationContext = createContext()

export const RegistrationProvider = ({ children }) => {
  const [registration, setRegistration] = useState(() => {
    const saved = localStorage.getItem('registration_draft')
    return saved ? JSON.parse(saved) : getInitialRegistration()
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('registration_draft', JSON.stringify(registration))
  }, [registration])

  const updateStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 5) {
      setCurrentStep(stepNumber)
      setErrors({})
    }
  }

  const updateRegistration = (updates) => {
    setRegistration((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    }))
  }

  const updatePersonalInfo = (data) => {
    updateRegistration({
      personal_info: {
        ...registration.personal_info,
        ...data,
      },
    })
  }

  const updateContactInfo = (data) => {
    updateRegistration({
      contact_info: {
        ...registration.contact_info,
        ...data,
      },
    })
  }

  const updateSelectedDesign = (designId, designName) => {
    updateRegistration({
      selected_design_id: designId,
      selected_design_name: designName,
    })
  }

  const updatePaymentInfo = (paymentPercent) => {
    updateRegistration({
      payment_percent: paymentPercent,
    })
  }

  const startPayment = async (campaignSlug, amount) => {
    setLoading(true)
    try {
      // Dummy payment initiation
      const registrationCode = generateRegistrationCode()
      updateRegistration({
        registration_code: registrationCode,
        campaign_slug: campaignSlug,
        payment_amount: amount,
        payment_status: 'initiated',
        payment_initiated_at: new Date().toISOString(),
      })
      return registrationCode
    } finally {
      setLoading(false)
    }
  }

  const setPaymentStatus = (status, reference_id = null) => {
    updateRegistration({
      payment_status: status,
      hdfc_reference_id: reference_id,
      payment_completed_at: status === 'paid' ? new Date().toISOString() : null,
    })
  }

  const clearRegistration = () => {
    localStorage.removeItem('registration_draft')
    setRegistration(getInitialRegistration())
    setCurrentStep(1)
    setErrors({})
  }

  const value = {
    registration,
    currentStep,
    errors,
    loading,
    updateStep,
    updateRegistration,
    updatePersonalInfo,
    updateContactInfo,
    updateSelectedDesign,
    updatePaymentInfo,
    startPayment,
    setPaymentStatus,
    setErrors,
    setLoading,
    clearRegistration,
  }

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
}

export const useRegistration = () => {
  const context = useContext(RegistrationContext)
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider')
  }
  return context
}

function getInitialRegistration() {
  return {
    personal_info: {
      first_name: '',
      last_name: '',
    },
    contact_info: {
      email: '',
      mobile: '',
      company: '',
      address: '',
    },
    selected_design_id: null,
    selected_design_name: '',
    payment_percent: 50,
    payment_amount: 0,
    payment_status: 'draft',
    registration_code: null,
    hdfc_reference_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function generateRegistrationCode() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RUG${timestamp}${random}`
}
