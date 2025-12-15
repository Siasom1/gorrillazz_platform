// lib/gorr/payments.ts

import { getGorrClient } from "./client"
import type {
  PaymentIntent,
  PaymentIntentWithID,
  PaymentStatus,
  PaymentUpdatedEvent,
} from "./types"

export async function createPaymentIntent(
  merchant: string,
  amountWei: string,
  token: "GORR" | "USDCc",
): Promise<PaymentIntentWithID> {
  const client = getGorrClient()
  // JSON-RPC:
  // gorr_createPaymentIntent(merchant, amount, token)
  const result = await client.jsonRpcCall<PaymentIntentWithID>("gorr_createPaymentIntent", [
    merchant,
    amountWei,
    token,
  ])

  return result
}

export async function getPaymentIntent(id: number): Promise<PaymentIntent> {
  const client = getGorrClient()
  const result = await client.jsonRpcCall<PaymentIntent>("gorr_getPaymentIntent", [id])
  return result
}

export async function listMerchantPayments(merchant: string): Promise<PaymentIntent[]> {
  const client = getGorrClient()

  const res = await client.get<{
    success: boolean
    payments: PaymentIntent[]
    error?: string
  }>("/payments/merchant", { merchant })

  if (!res.success) {
    throw new Error(res.error || "Failed to fetch merchant payments")
  }

  return res.payments || []
}

// Type for WS events – wordt gebruikt door websocket.ts
export type PaymentUpdatedWS = PaymentUpdatedEvent & {
  status: PaymentStatus
}
