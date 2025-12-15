"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { subscribeGorrWs } from "@/lib/blockchain/gorrillazz-ws"

export type GorrPaymentStatus =
  | "idle"
  | "creating_intent"
  | "waiting_for_tx"
  | "tx_sent"
  | "confirmed"
  | "error"

export interface PaymentIntent {
  ID: number
  Merchant: string
  Payer: string
  Amount: string   // big.Int als string
  Token: string
  Timestamp: number
  Expiry: number
  Paid: boolean
  Refunded: boolean
  Status: string
  TxHash?: string
  BlockNumber?: number
  PaidAt?: number
}

export type SendTxFn = (params: {
  from: string
  to: string
  amountWei: string
  data: string
}) => Promise<string> // returns txHash

interface UseGorrPaymentProps {
  merchant: string
  amountWei: string
  token: "GORR" | "USDCc"
  fromAddress: string
  sendTx: SendTxFn
}

export function useGorrPayment({
  merchant,
  amountWei,
  token,
  fromAddress,
  sendTx,
}: UseGorrPaymentProps) {
  const [intent, setIntent] = useState<PaymentIntent | null>(null)
  const [status, setStatus] = useState<GorrPaymentStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Helper om de "GORR_PAY:<id>" data payload te maken
  const paymentData = useMemo(() => {
    if (!intent) return null
    return `GORR_PAY:${intent.ID}`
  }, [intent])

  // Stap 1: intent maken
  const createIntent = useCallback(async () => {
    try {
      setError(null)
      setStatus("creating_intent")

      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant,
          amount: amountWei,
          token,
        }),
      })

      const json = await res.json()
      if (json.error) {
        throw new Error(json.error)
      }

      const { intent: createdIntent } = json
      setIntent(createdIntent)
      setStatus("waiting_for_tx")

      return createdIntent as PaymentIntent
    } catch (e: any) {
      setError(e.message ?? "Failed to create intent")
      setStatus("error")
      return null
    }
  }, [merchant, amountWei, token])

  // Stap 2: tx versturen (delegated naar sendTx)
  const sendPaymentTx = useCallback(async () => {
    if (!intent) {
      const newIntent = await createIntent()
      if (!newIntent) return null
    }

    if (!intent && !paymentData) return null

    try {
      setStatus("waiting_for_tx")
      setError(null)

      const data = paymentData!
      const hash = await sendTx({
        from: fromAddress,
        to: merchant,
        amountWei,
        data,
      })

      setTxHash(hash)
      setStatus("tx_sent")
      return hash
    } catch (e: any) {
      setError(e.message ?? "Failed to send payment tx")
      setStatus("error")
      return null
    }
  }, [intent, createIntent, sendTx, fromAddress, merchant, amountWei, paymentData])

  // Stap 3: WebSocket → luister op payment_updated
  useEffect(() => {
    if (!intent) return

    const unsubscribe = subscribeGorrWs((msg) => {
      if (msg?.type !== "payment_updated") return
      const data = msg.data
      if (!data) return
      if (Number(data.id) !== Number(intent.ID)) return

      if (data.status === "paid") {
        setStatus("confirmed")
        // optioneel: intent opnieuw ophalen
        fetch(`/api/payments/status?id=${intent.ID}`)
          .then((r) => r.json())
          .then((j) => {
            if (j.intent) {
              setIntent(j.intent)
            }
          })
      }
    })

    return () => unsubscribe()
  }, [intent])

  return {
    status,
    error,
    intent,
    txHash,
    paymentData, // string "GORR_PAY:<id>"
    createIntent,
    sendPaymentTx,
  }
}
