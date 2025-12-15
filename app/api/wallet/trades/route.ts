import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get("wallet")

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
  }

  try {
    // Mock trade history
    const trades = [
      {
        id: "1",
        type: "buy",
        token: "GORR",
        amount: "1000",
        price: 1.0,
        total: 1000,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "completed",
      },
      {
        id: "2",
        type: "sell",
        token: "ETH",
        amount: "0.5",
        price: 3245.67,
        total: 1622.84,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: "completed",
      },
      {
        id: "3",
        type: "buy",
        token: "SOL",
        amount: "10",
        price: 98.76,
        total: 987.6,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
      },
    ]

    return NextResponse.json({ trades, count: trades.length })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 })
  }
}
