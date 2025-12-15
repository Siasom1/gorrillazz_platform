// lib/gorr/client.ts

import type { JsonRpcResponse } from "./types"

export interface GorrClientConfig {
  rpcUrl?: string
  restUrl?: string
}

export class GorrClient {
  readonly rpcUrl: string
  readonly restUrl: string

  constructor(config: GorrClientConfig = {}) {
    const defaultRpc = process.env.NEXT_PUBLIC_GORR_RPC || "http://localhost:9000"
    const defaultRest = process.env.NEXT_PUBLIC_GORR_REST || defaultRpc

    this.rpcUrl = config.rpcUrl || defaultRpc
    this.restUrl = config.restUrl || defaultRest
  }

  // ---- JSON-RPC ----
  async jsonRpcCall<T = any>(method: string, params: any[] = [], id: number | string = 1): Promise<T> {
    const body = {
      jsonrpc: "2.0",
      method,
      params,
      id,
    }

    const res = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`JSON-RPC HTTP error ${res.status}: ${text}`)
    }

    const json = (await res.json()) as JsonRpcResponse<T>

    if (json.error) {
      throw new Error(json.error.message || "JSON-RPC error")
    }

    if (typeof json.result === "undefined") {
      throw new Error("JSON-RPC: missing result")
    }

    return json.result
  }

  // ---- REST helper ----
  async get<T = any>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path, this.restUrl)

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (typeof v !== "undefined" && v !== null) {
          url.searchParams.set(k, String(v))
        }
      }
    }

    const res = await fetch(url.toString(), { method: "GET" })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`REST HTTP error ${res.status}: ${text}`)
    }

    return (await res.json()) as T
  }
}

// Singleton instance voor gemak
let singleton: GorrClient | null = null

export function getGorrClient(): GorrClient {
  if (!singleton) {
    singleton = new GorrClient()
  }
  return singleton
}
