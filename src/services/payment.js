/**
 * Opens Razorpay checkout.
 * Falls back to demo mode if the Razorpay SDK isn't loaded.
 *
 * @param {object} options
 * @param {number}   options.amount       - Amount in paise (rupees × 100)
 * @param {string}   options.description  - Order description
 * @param {object}   options.prefill      - { name, email, contact }
 * @param {object}   options.notes        - Extra metadata
 * @param {function} options.onSuccess    - Called with razorpay_payment_id on success
 * @param {function} options.onDismiss    - Called when modal is dismissed
 */
export function openRazorpayCheckout({ amount, description, prefill, notes, onSuccess, onDismiss }) {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_XXXXXXXXXXXX',
    amount,
    currency: 'INR',
    name: 'Rug Circle',
    description,
    image: '/logo.png',
    handler: (response) => onSuccess?.(response.razorpay_payment_id),
    prefill,
    notes,
    theme: { color: '#E1802D' },
    modal: { ondismiss: onDismiss },
  }

  if (typeof window.Razorpay !== 'undefined') {
    const rzp = new window.Razorpay(options)
    rzp.open()
  } else {
    // Demo mode — simulate a successful payment after 1.5 s
    setTimeout(() => {
      onSuccess?.('demo_' + Date.now())
    }, 1500)
  }
}
