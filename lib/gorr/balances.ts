// lib/gorr/balances.ts

import { getGorrClient } from "./client"
import type { GorrBalancesHex, GorrBalancesParsed, HexString } from "./types"

function parseHexToBigInt(hex: HexString): bigint {
  if (!hex.startsWith("0x")) throw new Error(`invalid hex: ${hex}`)
  return BigInt(hex)
}

export async function getGorrBalancesHex(address: string): Promise<GorrBalancesHex> {
  const client = getGorrClient()
  // JSON-RPC method die je al in je node hebt:
  // gorr_getBalances(address) → { GORR: "0x..", USDCc: "0x.." }
  return client.jsonRpcCall<GorrBalancesHex>("gorr_getBalances", [address])
}

export async function getGorrBalancesParsed(address: string): Promise<GorrBalancesParsed> {
  const hex = await getGorrBalancesHex(address)
  return {
    GORR: parseHexToBigInt(hex.GORR),
    USDCc: parseHexToBigInt(hex.USDCc),
  }
}
