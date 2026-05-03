"use client"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Product, Variant } from "@/lib/types/product"

// Wishlist items include product and selected variant information
interface WishlistItem {
  product: Product;
  selectedVariant?: Variant;
  sku_variant?: string; // For unique identification
}

interface WishlistContextType {
  items: WishlistItem[]
  addToWishlist: (product: Product, selectedVariant?: Variant) => void
  removeFromWishlist: (productId: string, skuVariant?: string) => void
  isAddedToWishlist: (productId: string, skuVariant?: string) => boolean
  clearWishlist: () => void
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    // Load saved wishlist from localStorage on initial render
    const savedWishlist = localStorage.getItem("vedantgurukularoma-wishlist")
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Failed to parse wishlist from localStorage:', error);
        setItems([]);
      }
    }
  }, [])

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes
    localStorage.setItem("vedantgurukularoma-wishlist", JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: Product, selectedVariant?: Variant) => {
    // Validate product ID
    if (!product._id) {
      console.error('Cannot add product without ID to wishlist');
      return;
    }

    setItems((prev) => {
      const skuVariant = selectedVariant?.sku || 'default';
      
      // Prevent adding duplicate items
      const existingItem = prev.find((item) => 
        item.product._id === product._id && item.sku_variant === skuVariant
      )
      if (existingItem) {
        return prev;
      }
      
      // Create a snapshot of the product
      const productSnapshot = {
        ...product,
        stock_quantity: selectedVariant 
          ? selectedVariant.stock_quantity 
          : (product.stock_quantity || 0)
      };
      
      // Create a snapshot of the variant
      const variantSnapshot = selectedVariant ? {
        ...selectedVariant,
        stock_quantity: selectedVariant.stock_quantity || 0
      } : undefined;
      
      return [...prev, {
        product: productSnapshot,
        selectedVariant: variantSnapshot,
        sku_variant: skuVariant
      }]
    })
  }

  const removeFromWishlist = (productId: string, skuVariant?: string) => {
    setItems((prev) => prev.filter((item) => {
      if (skuVariant) {
        return !(item.product._id === productId && item.sku_variant === skuVariant);
      }
      return item.product._id !== productId;
    }))
  }

  const isAddedToWishlist = (productId: string, skuVariant?: string) => {
    return items.some((item) => {
      if (skuVariant) {
        return item.product._id === productId && item.sku_variant === skuVariant;
      }
      return item.product._id === productId;
    })
  }

  const clearWishlist = () => {
    setItems([])
  }

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isAddedToWishlist,
        clearWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}