"use server"

import { cookies } from "next/headers"

// Admin credentials (in production, use environment variables and proper hashing)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gorr_admin_2024"

export interface AdminSession {
  username: string
  isAuthenticated: boolean
  loginTime: string
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    const session: AdminSession = {
      username,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    }

    cookieStore.set("admin_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return true
  }

  return false
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")

  if (!sessionCookie) return null

  try {
    const session: AdminSession = JSON.parse(sessionCookie.value)
    return session.isAuthenticated ? session : null
  } catch {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession()
  return session?.isAuthenticated ?? false
}
