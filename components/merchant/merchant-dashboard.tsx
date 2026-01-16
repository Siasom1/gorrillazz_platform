"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/lib/wallet-context"
import { fetchMerchantPayments, createPaymentIntent } from "@/lib/merchant-api"
import GlassCard from "@/components/glass/glass-card"
import GlassButton from "@/components/glass/glass-button"

export default function MerchantDashboard() {
  const { address, lastPaymentUpdate } = useWallet()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadPayments = async () => {
    if (!address) return
    setLoading(true)
    try {
      const data = await fetchMerchantPayments(address)
      setPayments(data.payments || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPayments() }, [address])
  useEffect(() => {
    if (!lastPaymentUpdate) return
    setPayments(prev => {
      const idx = prev.findIndex(p => p.txHash === lastPaymentUpdate.txHash)
      if (idx > -1) {
        const updated = [...prev]
        updated[idx] = lastPaymentUpdate
        return updated
      }
      return [lastPaymentUpdate, ...prev]
    })
  }, [lastPaymentUpdate])

  const createInvoice = async (amount: string, token: "GORR" | "USDCc") => {
    if (!address) return
    try {
      await createPaymentIntent(address, amount, token)
      await loadPayments()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Create Payment Invoice</h2>
        <div className="flex gap-2">
          <input type="number" placeholder="Amount" className="flex-1 p-2 rounded-xl bg-white/10 border border-white/20" id="amount" />
          <select id="token" className="p-2 rounded-xl bg-white/10 border border-white/20">
            <option value="GORR">GORR</option>
            <option value="USDCc">USDCc</option>
          </select>
          <GlassButton onClick={() => {
            const amountInput = (document.getElementById("amount") as HTMLInputElement).value
            const tokenInput = (document.getElementById("token") as HTMLSelectElement).value as "GORR" | "USDCc"
            createInvoice(amountInput, tokenInput)
          }}>Create</GlassButton>
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Payments</h2>
        {payments.length === 0 && <p className="text-muted-foreground">No payments yet</p>}
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.txHash} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
              <div>
                <p className="text-sm font-medium">Invoice: {p.invoiceId}</p>
                <p className="text-xs text-muted-foreground">Customer: {p.payer}</p>
                <p className="text-xs text-muted-foreground">Token: {p.token}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{p.amount} {p.token}</p>
                <p className={`text-xs ${p.status === "paid" ? "text-accent" : "text-destructive"}`}>
                  {p.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
