"use client"
import { motion } from "framer-motion"
export const FestiveTitle = ({ title, subtitle, className }: { title: string; subtitle: string; className?: string }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`relative text-center ${className}`}
      >
        {/* Left Decorative Element */}
        <motion.div
          initial={{ opacity: 0, x: -40, scale: 0.5 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute left-0 -top-2 hidden md:block"
          style={{ color: "#E11D48" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M50 10 C72.1 10 90 27.9 90 50 C90 72.1 72.1 90 50 90 C27.9 90 10 72.1 10 50 C10 27.9 27.9 10 50 10 Z" fill="currentColor" opacity="0.1"/>
            <path d="M50 25 C36.2 25 25 36.2 25 50 C25 63.8 36.2 75 50 75 C63.8 75 75 63.8 75 50 C75 36.2 63.8 25 50 25 Z" fill="currentColor" opacity="0.2"/>
          </svg>
        </motion.div>
        
        {/* Right Decorative Element */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.5 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute right-0 -top-2 hidden md:block"
          style={{ color: "#F59E0B" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z M50 10 C72.1 10 90 27.9 90 50 C90 72.1 72.1 90 50 90 C27.9 90 10 72.1 10 50 C10 27.9 27.9 10 50 10 Z" fill="currentColor" opacity="0.1"/>
            <path d="M50 25 C36.2 25 25 36.2 25 50 C25 63.8 36.2 75 50 75 C63.8 75 75 63.8 75 50 C75 36.2 63.8 25 50 25 Z" fill="currentColor" opacity="0.2"/>
          </svg>
        </motion.div>
  
        <motion.h2
          animate={{
            textShadow: ["0 0 4px #FBBF24", "0 0 12px #FBBF24", "0 0 4px #FBBF24"],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl md:text-5xl font-serif font-bold mb-3"
          style={{ color: "#C2410C" }}
        >
          {title}
        </motion.h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">{subtitle}</p>
      </motion.div>
    )
  }