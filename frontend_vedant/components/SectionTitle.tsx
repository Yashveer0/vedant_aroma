"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react" // 1. Import the Sparkles icon

interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
  isSparkling?: boolean // 2. Add the new optional prop
}

export function SectionTitle({ title, subtitle, className = "", isSparkling = false }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`text-center ${className}`}
    >
      {/* --- MODIFICATION START: Conditional rendering for the title --- */}
      {isSparkling ? (
        <div className="relative inline-block mb-2">
          {/* Animated Sparkle Icons */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="absolute -top-3 -left-8 text-yellow-400/90"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-2 -right-8 text-yellow-400/80"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-serif font-bold " >
            {title}
          </h2>
        </div>
      ) : (
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 " >
          {title}
        </h2>
      )}
      {/* --- MODIFICATION END --- */}

      {/* Subtitle and underline remain the same for both versions */}
      {subtitle && <p className="text-lg text-[#BCBCBC] max-w-2xl mx-auto">{subtitle}</p>}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 60 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="h-0.5 mx-auto mt-4"
        style={{ backgroundColor: "var(--theme-primary)" }}
      />
    </motion.div>
  )
}