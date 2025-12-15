import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { tokenRegistry } from "@/lib/token-registry"

export async function GET() {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingTokens = tokenRegistry.getPendingVerifications()

    return NextResponse.json({ tokens: pendingTokens })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pending tokens" }, { status: 500 })
  }
}
