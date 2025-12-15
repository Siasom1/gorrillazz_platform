import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import { tokenRegistry } from "@/lib/token-registry"

export async function POST(request: Request) {
  try {
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chainId, address } = await request.json()

    const success = tokenRegistry.approveToken(chainId, address)

    if (success) {
      return NextResponse.json({ success: true, message: "Token approved" })
    }

    return NextResponse.json({ error: "Token not found" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: "Approval failed" }, { status: 500 })
  }
}
