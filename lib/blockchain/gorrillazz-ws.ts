// lib/blockchain/gorrillazz-ws.ts
// Simple singleton WebSocket client for payment events

let socket: WebSocket | null = null
let listeners: Set<(msg: any) => void> = new Set()

const WS_URL =
  process.env.NEXT_PUBLIC_GORR_WS_URL || "ws://localhost:9001/ws"

export function connectGorrWs() {
  if (typeof window === "undefined") return null
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket
  }

  socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    console.info("[GORR-WS] Connected to", WS_URL)
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      listeners.forEach((cb) => cb(data))
    } catch (e) {
      console.warn("[GORR-WS] Failed to parse message", e)
    }
  }

  socket.onclose = () => {
    console.warn("[GORR-WS] Closed. Reconnecting in 2s...")
    setTimeout(() => {
      socket = null
      connectGorrWs()
    }, 2000)
  }

  socket.onerror = (err) => {
    console.error("[GORR-WS] Error:", err)
  }

  return socket
}

export function subscribeGorrWs(cb: (msg: any) => void) {
  listeners.add(cb)
  connectGorrWs()

  return () => {
    listeners.delete(cb)
  }
}
