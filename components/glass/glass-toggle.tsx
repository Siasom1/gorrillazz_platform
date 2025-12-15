"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-white/[0.08] border-white/10",
  primary: "bg-primary/30 border-primary/40",
  accent: "bg-accent/30 border-accent/40",
}

export default function GlassToggle({ enabled, onToggle, label, variant = "default", className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}

      <motion.button
        onClick={() => onToggle(!enabled)}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-14 h-8 rounded-full glass flex items-center border transition-all duration-300",
          variants[variant],
          enabled && "bg-primary/40 border-primary/50",
        )}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all",
            enabled && "left-7 bg-accent shadow-[0_0_10px_rgba(0,150,255,0.6)]",
          )}
        />
      </motion.button>
    </div>
  )
}
