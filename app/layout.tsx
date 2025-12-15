import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WalletProvider } from "@/lib/wallet-context"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gorrillazz - Multi-Chain Token Creation Platform",
  description:
    "Create and deploy tokens across Solana, Ethereum, BNB, and Gorrillazz network. Powered by GORR stablecoin.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.className} antialiased`}>
        <WalletProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
