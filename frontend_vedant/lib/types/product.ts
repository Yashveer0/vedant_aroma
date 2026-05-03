// src/types/product.ts (Updated for Simpler Price Model)
export interface Variant {
  id?: string; // Sub-documents get their own ID
  name: string; // e.g., "10 ml", "30 ml", "Standard Size"
  sku: string;  // Stock Keeping Unit for this specific variant
  price: number; // Price for this specific variant
  sale_price?: number; // Optional sale price for this variant
  stock_quantity: number; // Stock for this specific variant
  duration_in_days: number;
  volume?: number; // The volume, if applicable
  weight:number;
  length:number;
  breadth:number;
  height: number;
}

export interface Review {
  _id: string;
  user: string; // The user's ID
  fullName: string;
  avatar?: string;
  rating: number;
  comment: string;
  images?: File[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  price: number;
  sale_price?: number;
  images: string[];
  video?: string;
  category: string;
  sub_category?: string;
  brand: string;
  gender: 'Men' | 'Women' | 'Unisex';
  variants?: Variant[]; 
  tags: string[];
  stock_quantity: number;
  isActive: boolean;
  volume?: number; // Volume in ml for oils
  reviews: Review[];
  averageRating: number;
  numReviews: number;
  minQuantity: number;

  weight:number;
  length:number;
  breadth:number;
  height: number;

  userInputInstructions: string;
  createdAt: string;
  updatedAt: string;
}
