// lib/gorr/types.ts

export type HexString = `0x${string}`

export type PaymentStatus = "pending" | "paid" | "expired" | "refunded" | "settled"

export interface GorrBalancesHex {
  GORR: HexString
  USDCc: HexString
}

export interface GorrBalancesParsed {
  GORR: bigint
  USDCc: bigint
}

export interface PaymentIntent {
  ID: number
  Merchant: string
  Payer: string
  Amount: string          // stringified big.Int (wei)
  Token: string           // "GORR" | "USDCc"
  Timestamp: number       // unix seconds
  Expiry: number          // unix seconds
  Paid: boolean
  Refunded: boolean
  Status: PaymentStatus
  TxHash?: string
  BlockNumber?: number
  PaidAt?: number
}

export interface PaymentIntentWithID {
  id: number
  intent: PaymentIntent
}

export interface JsonRpcRequest {
  jsonrpc: "2.0"
  method: string
  params: any[]
  id: number | string
}

export interface JsonRpcResponse<T = any> {
  jsonrpc: "2.0"
  result?: T
  error?: {
    code?: number
    message: string
    data?: any
  }
  id: number | string | null
}

export interface PaymentUpdatedEvent {
  id: number
  status: PaymentStatus
  txHash: string
  payer: string
  merchant: string
  amount: string
  block: number
  timestamp: number
}

export interface WSMessage<T = any> {
  type: string
  data: T
}
