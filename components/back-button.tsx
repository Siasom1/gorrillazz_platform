"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-24 left-6 z-40 glass rounded-full p-3 hover:bg-white/10 transition-all group"
    >
      <ArrowLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
    </motion.button>
  )
}
