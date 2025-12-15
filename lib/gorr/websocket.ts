// lib/gorr/websocket.ts

import type { PaymentUpdatedEvent, WSMessage } from "./types"

export interface PaymentWSOptions {
  wsUrl?: string // bv. ws://localhost:9001/ws
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: Event) => void
  onPaymentUpdated?: (event: PaymentUpdatedEvent) => void
}

export function connectPaymentWebSocket(opts: PaymentWSOptions = {}): WebSocket {
  const url = opts.wsUrl || process.env.NEXT_PUBLIC_GORR_WS || "ws://localhost:9001/ws"

  const ws = new WebSocket(url)

  ws.onopen = () => {
    console.log("[GorrWS] connected", url)
    opts.onOpen?.()
  }

  ws.onclose = () => {
    console.log("[GorrWS] disconnected", url)
    opts.onClose?.()
  }

  ws.onerror = (e) => {
    console.warn("[GorrWS] error", e)
    opts.onError?.(e)
  }

  ws.onmessage = (msg) => {
    try {
      const packet = JSON.parse(msg.data as string) as WSMessage

      if (packet.type === "payment_updated") {
        opts.onPaymentUpdated?.(packet.data as PaymentUpdatedEvent)
      }
    } catch (err) {
      console.warn("[GorrWS] parse error", err)
    }
  }

  return ws
}
