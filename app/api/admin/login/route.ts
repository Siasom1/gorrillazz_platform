import { NextResponse } from "next/server"
import { loginAdmin } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const success = await loginAdmin(username, password)

    if (success) {
      return NextResponse.json({ success: true, message: "Login successful" })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
