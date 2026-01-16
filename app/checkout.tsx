"use client"

import PaymentCheckout from "@/components/checkout/payment-checkout"
import { useState } from "react"

export default function CheckoutPage() {
  const [merchantAddress] = useState("0x2f74af61214e89796c37966d4b674a5ae148aa82")

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Checkout Page</h1>
      <PaymentCheckout merchant={merchantAddress} token="GORR" />
      <PaymentCheckout merchant={merchantAddress} token="USDCc" />
    </div>
  )
}
