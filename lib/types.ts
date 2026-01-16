// lib/types.ts
export type ChainInfo = {
  chainId: number
  name: string
  rpcUrl: string
  wsUrl: string
  currency: "GORR" | "USDCc"
}

export type WalletType = "injected" | "walletconnect" | "none"

export type PaymentToken = "GORR" | "USDCc"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "escrowed"
  | "released"
  | "refunded"
  | "failed"

export type PaymentIntent = {
  id: bigint
  merchant: string
  payer?: string
  amount: bigint
  token: PaymentToken
  status: PaymentStatus
  timestamp: number
}

export type WalletBalances = {
  gorr: bigint
  usdc: bigint
}
