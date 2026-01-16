// lib/usePayment.ts
import { rpc } from "./wallet-provider"
import { PaymentIntent, PaymentToken } from "./types"

export function usePayment() {
  async function createPayment(
    merchant: string,
    amount: bigint,
    token: PaymentToken
  ) {
    return await rpc.createPayment(merchant, amount, token)
  }

  async function getPayment(id: bigint): Promise<PaymentIntent> {
    return await rpc.getPayment(id)
  }

  async function releasePayment(id: bigint) {
    return await rpc.release(id)
  }

  async function refundPayment(id: bigint) {
    return await rpc.refund(id)
  }

  return {
    createPayment,
    getPayment,
    releasePayment,
    refundPayment,
  }
}
