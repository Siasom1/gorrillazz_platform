"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-white/[0.05] border border-white/10 backdrop-blur-md hover:bg-white/[0.08]",
  primary: "bg-primary/20 border border-primary/30 backdrop-blur-md hover:bg-primary/30",
  accent: "bg-accent/20 border border-accent/30 backdrop-blur-md hover:bg-accent/30",
  transparent: "bg-transparent border border-white/10 backdrop-blur-md hover:bg-white/[0.05]",
}

export default function GlassCard({ children, className, variant = "default", hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { scale: 1.02 } : {}}
      className={cn("rounded-2xl p-6 transition-all duration-300", variants[variant], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
