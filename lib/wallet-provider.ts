// lib/wallet-provider.ts
import { GorrRPC } from "./rpc"

export const gorrChain = {
  chainId: 9999,
  name: "Gorrillazz",
  rpcUrl: "http://localhost:9000",
  wsUrl: "ws://localhost:9000/ws",
}

export const rpc = new GorrRPC(gorrChain.rpcUrl)
