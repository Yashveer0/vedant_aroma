"use client"
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import type { Product, Variant } from "@/lib/types/product"
import { resolveMediaUrl } from "@/lib/media"

export interface LocalCartItem {
  productId: string;
  sku_variant?: string;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  type?: string;
  attributes?: Record<string, string>;
  selectedVariant?: Variant;
  userInputInstructions?: string;
}

interface CartContextType {
  items: LocalCartItem[];
  addToCart: (product: Product, variant?: Variant, quantity?: number) => void;
  removeFromCart: (productId: string, sku_variant?: string) => void;
  updateQuantity: (productId: string, sku_variant: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("vedantgurukularoma-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vedantgurukularoma-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, variant?: Variant, quantity = 1) => {
    // Validate product ID
    if (!product._id) {
      console.error('Cannot add product without ID to cart');
      return;
    }

    const productId = product._id; // Type-safe: we know it's defined here

    setItems((prev) => {
      const existingItem = prev.find((item) => 
        variant 
          ? item.sku_variant === variant.sku 
          : item.productId === productId && !item.sku_variant
      );
      
      if (existingItem) {
        return prev.map((item) => 
          variant 
            ? (item.sku_variant === variant.sku ? { ...item, quantity: item.quantity + quantity } : item)
            : (item.productId === productId && !item.sku_variant ? { ...item, quantity: item.quantity + quantity } : item)
        );
      }
      
      // Create a new local cart item with proper type safety
      const newItem: LocalCartItem = {
        productId: productId,
        sku_variant: variant?.sku,
        quantity,
        name: product.name,
        slug: product.slug,
        image: resolveMediaUrl(product.images?.[0]), // Variants don't have images, use product images
        price: variant ? (variant.sale_price || variant.price) : (product.sale_price || product.price),
        attributes: variant ? {
          name: variant.name,
        } : undefined,
        selectedVariant: variant,
        type: product.type,
        userInputInstructions: product.userInputInstructions
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string, sku_variant?: string) => {
    setItems((prev) => prev.filter((item) => 
      sku_variant 
        ? item.sku_variant !== sku_variant 
        : item.productId !== productId || item.sku_variant !== undefined
    ));
  };

  const updateQuantity = (productId: string, sku_variant: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sku_variant);
      return;
    }
    setItems((prev) => prev.map((item) => 
      sku_variant 
        ? (item.sku_variant === sku_variant ? { ...item, quantity } : item)
        : (item.productId === productId && !item.sku_variant ? { ...item, quantity } : item)
    ));
  };

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
}
