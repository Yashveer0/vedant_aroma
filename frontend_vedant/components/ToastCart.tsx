"use client"

import { CheckCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

interface ToastCartProps {
  productName: string
  productImage?: string
  onClose: () => void
}

export function ToastCart({ productName, productImage, onClose }: ToastCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="fixed bottom-4 right-4 z-50 max-w-sm"
    >
      <div
        className="rounded-2xl p-4 border shadow-lg backdrop-blur-sm"
        style={{
          backgroundColor: "var(--theme-card)",
          borderColor: "var(--theme-border)",
          boxShadow: "0 10px 30px var(--theme-shadow)",
        }}
      >
        <div className="flex items-start space-x-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Added to cart</p>
            <p className="text-sm text-gray-600 truncate">{productName}</p>
            <div className="flex space-x-2 mt-2">
              <Link href="/cart">
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  View Cart
                </Button>
              </Link>
              <Button size="sm" variant="ghost" className="text-xs" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
