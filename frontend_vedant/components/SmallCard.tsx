// components/SmallCard.tsx (Updated)

"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types/product"; // Use your updated type
import { Badge } from "./ui/badge";

interface SmallCardProps {
    product: Product;
}

export function SmallCard({ product }: SmallCardProps) {
    if (!product) return null;

    // --- NEW PRICE LOGIC ---
    const sellingPrice = product.sale_price ?? product.price;
    const originalPrice = product.price;
    const hasSale = product.sale_price && product.sale_price < originalPrice;
    const discount = hasSale ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

    return (
        <div className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {hasSale && (
                        <Badge variant="destructive-outline" className="absolute top-2 left-2">{discount}% OFF</Badge>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-sm truncate text-gray-800">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-lg font-bold text-black">₹{sellingPrice.toLocaleString()}</p>
                        {hasSale && (
                            <p className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}