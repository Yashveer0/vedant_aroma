"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/data" // Ensure this path is correct

interface ReelCardProps {
  product: Product
  reelVideo: string
}

function ReelCard({ product, reelVideo }: ReelCardProps) {
  const hasDiscount = product.priceDiscounted < product.priceOriginal;

  return (
    <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <Link href={`/collections/women/${product.slug}`} className="block h-full w-full">
        {/* Video Player */}
        <video
          src={reelVideo}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        >
          Your browser does not support the video tag.
        </video>

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Text Details on Hover */}
        <div className="absolute bottom-0 left-0 w-full p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="truncate font-bold" style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>
            {product.name}
          </h3>
          <div className="flex items-baseline space-x-1.5 text-sm">
            {hasDiscount ? (
              <>
                <span className="font-semibold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}>
                  ₹{product.priceDiscounted.toLocaleString()}
                </span>
                <span className="text-xs line-through opacity-70">
                  ₹{product.priceOriginal.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                ₹{product.priceOriginal.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ReelCard