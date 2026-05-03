"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface CategoryCardProps {
  title: string
  description: string
  image: string
  href: string
  index: number
}

// The individual CategoryCard component remains the same as it's already generic.
function CategoryCard({ title, description, image, href, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl"
    >
      <Link href={href}>
        <div className="relative h-80 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <motion.h3 whileHover={{ x: 10 }} className="text-2xl font-serif font-bold mb-2">
              {title}
            </motion.h3>
            <p className="text-white/90 mb-4">{description}</p>
            <Button
              variant="secondary"
              className="w-fit bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface CategoryCardsProps {
  gender: "women" | "men"
}

export function CategoryCards({ gender }: CategoryCardsProps) {
  // --- MODIFICATION START ---
  // The data now contains separate image paths for each gender.
  const categories = [
    {
      title: "Silver Jewellery",
      description: "Elegant sterling silver pieces for every occasion",
      images: {
        women: "/silver-women-necklace.jpg",
        men: "/silver-bracelet-men.jpg", // Example image for men
      },
      href: `/collections/${gender}/silver-jewellery`,
    },
    {
      title: "Artificial Jewellery",
      description: "Trendy and affordable fashion jewelry",
      images: {
        women: "/artificial-women-earing.jpg",
        men: "/leather-bracelet-men.jpg", // Example image for men
      },
      href: `/collections/${gender}/artificial-jewellery`,
    },
  ]
  // --- MODIFICATION END ---

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {categories.map((category, index) => (
        <CategoryCard
          key={category.title}
          title={category.title}
          description={category.description}
          // The correct image is selected based on the gender prop
          image={category.images[gender]}
          href={category.href}
          index={index}
        />
      ))}
    </div>
  )
}