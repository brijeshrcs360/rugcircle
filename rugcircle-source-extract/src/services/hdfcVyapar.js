import QRCode from 'qrcode'

/**
 * HDFC Vyapar Dummy Service
 * Mock implementation for QR generation, polling, and payment verification
 * Replace API_KEY, MERCHANT_ID, etc. with real credentials when integrating
 */

const HDFC_CONFIG = {
  API_KEY: import.meta.env.VITE_HDFC_VYAPAR_API_KEY || 'hdfc_demo_key_2026',
  MERCHANT_ID: import.meta.env.VITE_HDFC_VYAPAR_MERCHANT_ID || 'HDFC_DEMO_MERCHANT',
  MERCHANT_UPI: import.meta.env.VITE_HDFC_VYAPAR_MERCHANT_UPI || 'rugcircle.demo@hdfcbank',
  API_BASE_URL: import.meta.env.VITE_HDFC_VYAPAR_API_BASE_URL || 'https://api.hdfcbank.com/vyapar/sandbox',
  POLL_INTERVAL_MS: 5000,
  QR_EXPIRY_MINUTES: 3,
}

export async function generatePaymentQR(amount, registrationCode) {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const orderId = `order_${Date.now()}`
  const paymentSessionId = `session_${Math.random().toString(36).slice(2, 14)}`
  const hdfcRefId = `HDFC${Date.now()}${Math.random().toString(36).substring(2, 11).toUpperCase()}`
  const upiString = generateUPIString(amount, registrationCode)
  const qrCodeData = await generateScannableQR(upiString)
  const expiresAt = new Date(Date.now() + HDFC_CONFIG.QR_EXPIRY_MINUTES * 60000).toISOString()

  return {
    success: true,
    provider: 'hdfc_smartgateway_simulator',
    environment: 'sandbox',
    order_id: orderId,
    payment_session_id: paymentSessionId,
    qr_code: qrCodeData,
    upi_string: upiString,
    hdfc_reference_id: hdfcRefId,
    merchant_upi: HDFC_CONFIG.MERCHANT_UPI,
    amount,
    currency: 'INR',
    registration_code: registrationCode,
    expires_at: expiresAt,
    order_status: 'PENDING',
    payment_status: 'PENDING',
    gateway_response: {
      code: 'SG_SIM_200',
      message: 'Simulator order created',
    },
    created_at: new Date().toISOString(),
  }
}

export async function pollPaymentStatus(hdfcRefId, registrationCode) {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const isPaymentSimulated = localStorage.getItem(`payment_demo_${registrationCode}`)

  if (isPaymentSimulated === 'confirmed') {
    return {
      success: true,
      status: 'paid',
      order_status: 'PAID',
      payment_status: 'SUCCESS',
      hdfc_reference_id: hdfcRefId,
      transaction_id: `TXN${Date.now()}`,
      amount: null,
      paid_at: new Date().toISOString(),
      payment_method: 'UPI',
      upi_from: 'customer@upi',
      webhook_event: 'PAYMENT_SUCCESS',
    }
  }

  if (isPaymentSimulated === 'failed') {
    return {
      success: false,
      status: 'failed',
      order_status: 'FAILED',
      payment_status: 'FAILED',
      error_code: 'PAYMENT_FAILED',
      error_message: 'Payment was declined. Please try again.',
      hdfc_reference_id: hdfcRefId,
      webhook_event: 'PAYMENT_FAILED',
    }
  }

  return {
    success: true,
    status: 'pending',
    order_status: 'PENDING',
    payment_status: 'PENDING',
    hdfc_reference_id: hdfcRefId,
    message: 'Waiting for payment confirmation...',
  }
}

export async function verifyPaymentWithHDFC(hdfcRefId, transactionId) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    verified: true,
    hdfc_reference_id: hdfcRefId,
    transaction_id: transactionId,
    status: 'confirmed',
    verified_at: new Date().toISOString(),
  }
}

async function generateScannableQR(upiString) {
  return QRCode.toDataURL(upiString, {
    width: 280,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })
}

function generateUPIString(amount, registrationCode) {
  const params = new URLSearchParams({
    pa: HDFC_CONFIG.MERCHANT_UPI,
    pn: 'Rug Circle Workshops',
    am: amount.toString(),
    tn: `Workshop - ${registrationCode}`,
    tr: registrationCode,
  })

  return `upi://pay?${params.toString()}`
}

export function simulateWebhookPayment(registrationCode) {
  localStorage.setItem(`payment_demo_${registrationCode}`, 'confirmed')
}

export function simulateFailedPayment(registrationCode) {
  localStorage.setItem(`payment_demo_${registrationCode}`, 'failed')
}

export function clearPaymentSimulation(registrationCode) {
  localStorage.removeItem(`payment_demo_${registrationCode}`)
}

export { HDFC_CONFIG }
