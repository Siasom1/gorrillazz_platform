"use client"

import type React from "react"
import { motion } from "framer-motion"

export default function GlassPage({
  children,
  isActive = false,
}: {
  children: React.ReactNode
  isActive?: boolean
}) {
  return (
    <motion.div
      className="relative z-10 w-full min-h-screen px-4 md:px-8 py-10 flex flex-col items-center justify-center glass-strong rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        background: isActive ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)",
        transition: "background 0.3s ease, transform 0.3s ease",
      }}
      animate={{ scale: isActive ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
