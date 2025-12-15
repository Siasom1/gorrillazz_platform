export interface PaymentProvider {
  id: string
  name: string
  type: "fiat" | "crypto"
  supportedCurrencies: string[]
  fees: {
    deposit: number // percentage
    withdrawal: number // percentage
  }
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: "revolut",
    name: "Revolut",
    type: "fiat",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    fees: {
      deposit: 0,
      withdrawal: 0.5,
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    type: "fiat",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    fees: {
      deposit: 2.9,
      withdrawal: 1.5,
    },
  },
  {
    id: "paypal",
    name: "PayPal",
    type: "fiat",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    fees: {
      deposit: 3.5,
      withdrawal: 2.0,
    },
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    type: "fiat",
    supportedCurrencies: ["USD", "EUR", "GBP"],
    fees: {
      deposit: 3.0,
      withdrawal: 2.5,
    },
  },
]

export interface PaymentTransaction {
  id: string
  userId: string
  provider: string
  type: "deposit" | "withdrawal"
  amount: number
  currency: string
  token: string
  status: "pending" | "processing" | "completed" | "failed" | "revoked"
  fee: number
  netAmount: number
  createdAt: Date
  completedAt?: Date
  revokedAt?: Date
  revokeReason?: string
}

export const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || process.env.ADMIN_WALLET_ADDRESS!

// Admin wallet is fee-free
export function calculateFee(
  provider: string,
  type: "deposit" | "withdrawal",
  amount: number,
  walletAddress?: string,
): number {
  if (walletAddress === ADMIN_WALLET_ADDRESS) {
    return 0
  }

  const providerData = PAYMENT_PROVIDERS.find((p) => p.id === provider)
  if (!providerData) return 0

  const feePercentage = type === "deposit" ? providerData.fees.deposit : providerData.fees.withdrawal
  return (amount * feePercentage) / 100
}

export function calculateNetAmount(
  provider: string,
  type: "deposit" | "withdrawal",
  amount: number,
  walletAddress?: string,
): { fee: number; netAmount: number } {
  const fee = calculateFee(provider, type, amount, walletAddress)
  const netAmount = type === "deposit" ? amount - fee : amount - fee

  return { fee, netAmount }
}
