"use client"

import { useState } from "react"
import { useWallet } from "@/lib/wallet-context"
import GlassCard from "@/components/glass/glass-card"
import GlassButton from "@/components/glass/glass-button"
import QRCode from "react-qr-code"

interface PaymentCheckoutProps {
  merchant: string
  token?: "GORR" | "USDCc"
}

export default function PaymentCheckout({ merchant, token = "GORR" }: PaymentCheckoutProps) {
  const { sendGORR, sendUSDC, refreshBalance, gorrBalance, usdcBalance } = useWallet()
  const [amount, setAmount] = useState<string>("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    try {
      let hash: string
      if (token === "GORR") {
        hash = await sendGORR(merchant, amount)
      } else {
        hash = await sendUSDC(merchant, amount)
      }
      setTxHash(hash)
      await refreshBalance()
    } catch (err) {
      console.error(err)
      alert("Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold">Checkout Payment</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 p-2 rounded-xl bg-white/10 border border-white/20"
        />
        <select
          value={token}
          onChange={(e) => setAmount("") && undefined}
          className="p-2 rounded-xl bg-white/10 border border-white/20"
        >
          <option value="GORR">GORR</option>
          <option value="USDCc">USDCc</option>
        </select>
        <GlassButton onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Pay"}
        </GlassButton>
      </div>

      {txHash && (
        <div className="pt-2">
          <p className="text-sm text-muted-foreground">Transaction submitted:</p>
          <p className="text-xs truncate">{txHash}</p>
          <div className="mt-2">
            <QRCode value={txHash} size={128} />
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Balances: GORR {Number(gorrBalance)/1e18} | USDCc {Number(usdcBalance)/1e6}
      </div>
    </GlassCard>
  )
}
