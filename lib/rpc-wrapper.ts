// lib/rpc-wrapper.ts

const RPC_URL = "http://localhost:9000"

export async function rpcCall(method: string, params: any[] = [], opts: { timeout?: number } = {}) {
  const body = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  }

  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.timeout
      ? AbortSignal.timeout(opts.timeout)
      : undefined,
  })

  const j = await r.json()
  if (j.error) throw new Error(j.error.message || j.error)
  return j.result
}

export const rpc = {
  generate: () => rpcCall("account_generate"),
  balanceGORR: (a: string) => rpcCall("balance_gorr", [a]),
  balanceUSDC: (a: string) => rpcCall("balance_usdc", [a]),
  txGORR: (from: string, to: string, amount: bigint) =>
    rpcCall("tx_send_gorr", [from, to, amount.toString()]),
  txUSDC: (from: string, to: string, amount: bigint) =>
    rpcCall("tx_send_usdc", [from, to, amount.toString()]),

  // payments merchant
  createInvoice: (merchant: string, amount: bigint, asset: string, meta?: any) =>
    rpcCall("payment_create", [merchant, amount.toString(), asset, meta || {}]),

  checkInvoice: (invoiceId: string) =>
    rpcCall("payment_status", [invoiceId]),
}
