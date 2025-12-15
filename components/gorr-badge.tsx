"use client"

import { motion } from "framer-motion"

export default function GorrBadge() {
  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Animated border ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Inner circle */}
        <div className="absolute inset-1 rounded-full bg-black flex items-center justify-center">
          <div className="glass-strong rounded-full w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">GORR</span>
          </div>
        </div>

        {/* Rotating text */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.8)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
          </defs>
          <text className="text-[6px] fill-white/60 font-mono uppercase tracking-wider">
            <textPath href="#circle" startOffset="0%">
              NATIVE STABLECOIN • MULTI-CHAIN • NATIVE STABLECOIN • MULTI-CHAIN •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}
