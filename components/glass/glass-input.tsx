"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const variants = {
  default: "glass border border-white/10 bg-white/[0.05] focus:ring-2 focus:ring-primary/40",
  primary: "glass border border-primary/30 bg-primary/10 focus:ring-2 focus:ring-primary/50",
  accent: "glass border border-accent/30 bg-accent/10 focus:ring-2 focus:ring-accent/50",
}

export default function GlassInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  variant = "default",
  className,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {label && <label className="block text-sm text-muted-foreground mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 outline-none",
          variants[variant],
          className,
        )}
        {...props}
      />
    </motion.div>
  )
}
