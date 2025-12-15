import { NextResponse } from "next/server"
import { logoutAdmin } from "@/lib/admin-auth"

export async function POST() {
  try {
    await logoutAdmin()
    return NextResponse.json({ success: true, message: "Logout successful" })
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
