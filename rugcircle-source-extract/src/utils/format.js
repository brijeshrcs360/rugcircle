/**
 * Formats a number as Indian Rupee currency string.
 * e.g. 67500 → "₹67,500"
 */
export function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

/**
 * Calculates GST at 18% and returns subtotal, gst, total, advance.
 */
export function calculatePricing(pricePerUnit, quantity = 1) {
  const subtotal = pricePerUnit * quantity
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst
  const advance = Math.round(total * 0.5)
  return { subtotal, gst, total, advance }
}
