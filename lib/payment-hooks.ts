// lib/payment-hooks.ts

"use client"

import { useEffect, useState, useCallback } from "react"
import { rpc } from "./rpc-wrapper"
import { parseWSEvent, PaymentEvent } from "./ws-events"
import { toast } from "sonner"

const WS_URL = "ws://localhost:9000/ws"

export function usePayments(merchantAddress: string | null) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [wsReady, setWsReady] = useState(false)

  const createInvoice = useCallback(
    async (amount: bigint, asset: "GORR" | "USDC", meta?: any) => {
      if (!merchantAddress) throw new Error("No merchant address set")
      const inv = await rpc.createInvoice(merchantAddress, amount, asset, meta)
      setInvoices(prev => [...prev, inv])
      toast("Invoice created")
      return inv
    },
    [merchantAddress],
  )

  const checkInvoice = useCallback(async (invoiceId: string) => {
    const st = await rpc.checkInvoice(invoiceId)
    return st
  }, [])

  useEffect(() => {
    const ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      setWsReady(true)
    }

    ws.onmessage = m => {
      const ev: PaymentEvent | null = parseWSEvent(m.data)
      if (!ev) return
      if (ev.event === "payment_confirmed") {
        toast.success("Payment confirmed")
        setInvoices(prev =>
          prev.map(x => (x.id === ev.invoiceId ? { ...x, status: "confirmed", tx: ev.txHash } : x)),
        )
      }
    }
  }, [])

  return {
    wsReady,
    invoices,
    createInvoice,
    checkInvoice,
  }
}
