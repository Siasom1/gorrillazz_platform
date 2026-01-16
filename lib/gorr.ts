import { ethers } from "ethers"
import type { PaymentUpdatedEvent } from "./gorr"

let ws: WebSocket | null = null

export function connectPaymentWebSocket(opts: { onPaymentUpdated: (evt: PaymentUpdatedEvent) => void }) {
  ws = new WebSocket("ws://localhost:9000/ws/payments")
  ws.onmessage = (msg) => {
    const evt: PaymentUpdatedEvent = JSON.parse(msg.data)
    opts.onPaymentUpdated(evt)
  }
  return {
    close: () => ws?.close()
  }
}

export async function sendNativeGORR(wallet: ethers.Wallet, recipient: string, amount: string) {
  // simplified: create tx object and send via RPC
  const value = ethers.utils.parseUnits(amount, 18)
  const tx = {
    to: recipient,
    value,
    data: "0x"
  }
  // here call RPC: eth_sendTransaction
  return tx.toString()
}

export async function sendUSDCc(wallet: ethers.Wallet, recipient: string, amount: string) {
  const value = ethers.BigNumber.from(amount)
  const tx = {
    to: recipient,
    value,
    data: "0x"
  }
  return tx.toString()
}

// Parse balances from node
export async function getGorrBalancesParsed(address: string) {
  // fetch balances from RPC / backend
  return {
    GORR: BigInt(1000000000000000000),
    USDCc: BigInt(500000000),
  }
}

export type PaymentUpdatedEvent = {
  txHash: string
  payer: string
  merchant: string
  amount: string
  token: "GORR" | "USDCc"
  status: "pending" | "paid" | "refunded" | "settled"
  timestamp: number
  invoiceId?: string
}
