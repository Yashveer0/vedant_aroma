"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { testimonials } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-[#D09D13]" >
          Our Recent Work
        </h2>
        <p className="text-lg text-[#BCBCBC]">Top Influencers Choice</p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Curved Image Container */}
            <div
              className="relative h-80 md:h-96 overflow-hidden mx-8"
              style={{
                clipPath: "ellipse(80% 100% at 50% 0%)",
                boxShadow: "0 20px 40px var(--theme-shadow)",
              }}
            >
              <Image
                src={testimonials[currentIndex].image || "/placeholder.svg"}
                alt={`Wedding gallery ${currentIndex + 1}`}
                fill
                className="object-cover"
              />
            </div>

            {/* Testimonial Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mt-8 px-4"
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-4 max-w-2xl mx-auto italic">"{testimonials[currentIndex].text}"</p>
              <p className="font-semibold text-[#D09D13]" >
                {testimonials[currentIndex].name}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={prevTestimonial}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={nextTestimonial}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "w-8" : "opacity-50"}`}
              style={{
                backgroundColor: index === currentIndex ? "var(--theme-primary)" : "var(--theme-primary)",
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
