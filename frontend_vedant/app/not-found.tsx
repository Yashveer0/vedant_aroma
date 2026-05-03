"use client"

import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="text-8xl font-serif font-bold text-orange-500 mb-4"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl font-serif font-bold text-gray-900 mb-4"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-600 mb-8"
        >
          The jewelry piece you're looking for seems to have been misplaced. Let's help you find something beautiful
          instead.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl">
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Button>
          </Link>
          <Link href="/collections/women">
            <Button
              variant="outline"
              className="flex items-center space-x-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl bg-transparent"
            >
              <Search className="h-4 w-4" />
              <span>Browse Collection</span>
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
