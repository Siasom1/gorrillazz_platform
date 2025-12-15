"use client"

import { useEffect, useState } from "react"
import { PaymentIntent } from "./useGorrPayment"

export function useMerchantPayments(merchant: string | null) {
  const [payments, setPayments] = useState<PaymentIntent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchant) return

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/payments/merchant?merchant=${merchant}`)
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setPayments(json.payments || [])
      } catch (e: any) {
        setError(e.message ?? "Failed to load merchant payments")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [merchant])

  return { payments, loading, error }
}
