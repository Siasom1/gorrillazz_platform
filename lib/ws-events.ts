// lib/ws-events.ts

export type PaymentEvent =
  | { event: "payment_created"; invoiceId: string; merchant: string }
  | { event: "payment_confirmed"; invoiceId: string; txHash: string; amount: string; asset: string }
  | { event: "tx_confirmed"; hash: string; to: string; from: string; amount: string; asset: string }

export function parseWSEvent(data: string): PaymentEvent | null {
  try {
    const j = JSON.parse(data)
    if (!j.event) return null
    return j
  } catch {
    return null
  }
}
