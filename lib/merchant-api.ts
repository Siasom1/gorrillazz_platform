import { WalletType } from "./wallet-context"

// Mock / real backend API call to fetch merchant payments
export async function fetchMerchantPayments(merchantAddress: string) {
  // In productie: fetch from node RPC or backend DB
  const res = await fetch(`/api/merchant/payments?address=${merchantAddress}`)
  if (!res.ok) throw new Error("Failed to fetch merchant payments")
  return res.json()
}

// Create new payment intent
export async function createPaymentIntent(merchant: string, amount: string, token: "GORR" | "USDCc") {
  const res = await fetch(`/api/merchant/payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant, amount, token }),
  })
  if (!res.ok) throw new Error("Failed to create payment intent")
  return res.json()
}

// Mark payment as settled (optional, admin only)
export async function settlePayment(invoiceId: string) {
  const res = await fetch(`/api/merchant/payment-settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoiceId }),
  })
  if (!res.ok) throw new Error("Failed to settle payment")
  return res.json()
}
