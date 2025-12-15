"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const variants = {
  default: "bg-white/[0.08] text-foreground border border-white/10 hover:bg-white/[0.15]",
  primary: "bg-primary/30 text-primary-foreground border border-primary/40 hover:bg-primary/40",
  accent: "bg-accent/30 text-accent-foreground border border-accent/40 hover:bg-accent/40",
  danger: "bg-destructive/30 text-destructive-foreground border border-destructive/40 hover:bg-destructive/40",
  transparent: "bg-transparent text-foreground border border-white/10 hover:bg-white/[0.08]",
}

const sizes = {
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-5 py-3 text-base rounded-xl",
  lg: "px-7 py-4 text-lg rounded-2xl",
}

export default function GlassButton({
  children,
  onClick,
  className,
  variant = "default",
  size = "md",
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "glass font-medium transition-all duration-300 flex items-center justify-center backdrop-blur-md select-none",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
