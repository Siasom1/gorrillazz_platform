// components/PaymentButtons.tsx

"use client"

import React, { useState } from "react"
import { usePayments } from "@/lib/payment-hooks"
import { useWallet } from "@/lib/wallet-context"
import { toast } from "sonner"

export function PaymentButtons({ merchant }: { merchant: string }) {
  const { createInvoice } = usePayments(merchant)
  const { sendGORR, sendUSDC } = useWallet()

  const [loading, setLoading] = useState(false)

  const pay = async (asset: "GORR" | "USDC") => {
    setLoading(true)
    const inv = await createInvoice(1_000_000_000_000_000_000n, asset) // 1 unit
    toast("Invoice created " + inv.id)

    // auto pay demo
    setTimeout(async () => {
      if (asset === "GORR") await sendGORR(merchant, 1_000_000_000_000_000_000n)
      if (asset === "USDC") await sendUSDC(merchant, 1_000_000_000_000_000_000n)
      toast.success("Payment sent")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex gap-3">
      <button disabled={loading} onClick={() => pay("GORR")} className="btn">
        Pay GORR
      </button>
      <button disabled={loading} onClick={() => pay("USDC")} className="btn">
        Pay USDC
      </button>
    </div>
  )
}
