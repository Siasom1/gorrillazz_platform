// lib/rpc.ts
import { WalletBalances } from "./types"

export class GorrRPC {
  rpcUrl: string
  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl
  }

  async request(method: string, params: any[] = []) {
    const r = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    })
    const j = await r.json()
    if (j.error) throw new Error(j.error.message)
    return j.result
  }

  async getBalance(addr: string): Promise<WalletBalances> {
    const b = await this.request("eth_getBalance", [addr, "latest"])
    const u = await this.request("gorr_getUSDCcBalance", [addr])
    return {
      gorr: BigInt(b),
      usdc: BigInt(u),
    }
  }

  async sendGORR(raw: string) {
    return await this.request("eth_sendRawTransaction", [raw])
  }

  async sendUSDC(raw: string) {
    return await this.request("gorr_sendUSDCcTransaction", [raw])
  }

  async getPayment(id: bigint) {
    return await this.request("gorr_getPaymentIntent", [id.toString()])
  }

  async createPayment(merchant: string, amount: bigint, token: string) {
    return await this.request("gorr_createPaymentIntent", [
      merchant,
      amount.toString(),
      token,
    ])
  }

  async pay(id: bigint, raw: string) {
    return await this.request("gorr_payIntent", [id.toString(), raw])
  }

  async release(id: bigint) {
    return await this.request("gorr_releaseIntent", [id.toString()])
  }

  async refund(id: bigint) {
    return await this.request("gorr_refundIntent", [id.toString()])
  }
}
