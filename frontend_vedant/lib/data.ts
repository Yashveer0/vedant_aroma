// src/lib/data.ts
import { Product } from '@/lib/types/product';

export const products: Product[] = [
  // --- Category: Vastu Correction Oils ---
  {
      name: "Pitra Dosh Nivaran Oil",
      slug: "pitra-dosh-nivaran-oil",
      description: "Apply at the Pitra Dosha positions in a House / Shop / Factory. Usually Pitra Dosha is present at the Center, Entrance or with some Ancestral Photo. This oil helps to control its negative effects and harmonize ancestral energies.",
      price: 300,
      sale_price: 250,
      images: [
          '/images/products/pitra-dosh-1.jpg', // Main Image
          '/images/products/pitra-dosh-2.jpg'  // Thumbnail or second view
      ],
      category: "Vastu Correction Oils",
      brand: "Vedant Aroma",
      gender: "Unisex",
      tags: ["vastu", "pitra dosh", "ancestral", "harmony", "remedy"],
      stock_quantity: 75,
      isActive: true,
      volume: 15,
      reviews: [
          {
              _id: "rev1",
              user: "user123",
              fullName: "Anjali Sharma",
              avatar: "/images/avatars/avatar-1.jpg",
              rating: 5,
              comment: "Felt a significant shift in the energy at home. The atmosphere feels much lighter and more positive now. Highly recommended.",
              createdAt: "2024-08-15T10:00:00Z",
              updatedAt: "2024-08-15T10:00:00Z",
          },
          {
              _id: "rev2",
              user: "user456",
              fullName: "Rohan Mehta",
              rating: 4,
              comment: "Good product with a very calming fragrance. Using it daily as per the instructions.",
              createdAt: "2024-08-15T10:00:00Z",
              updatedAt: "2024-08-15T10:00:00Z",
          }
      ],
      averageRating: 4.5,
      numReviews: 2,
      minQuantity: 1,
  },
  {
      name: "Negative Energy Protection (PY) Oil",
      slug: "negative-energy-protection-py-oil",
      description: "Apply at the PY Dosha positions in a House / Shop / Factory. Usually PY Dosha is confirmation of some Evil Spirit related energies present in or nearby premises. You need to scan the premises thoroughly to detect PY Dosha.",
      price: 299,
      sale_price: 249,
      images: [
          '/images/products/py-oil-1.jpg',
          '/images/products/py-oil-2.jpg'
      ],
      category: "Vastu Correction Oils",
      brand: "Vedant Aroma",
      gender: "Unisex",
      tags: ["vastu", "protection", "negative energy", "py dosha"],
      stock_quantity: 50,
      isActive: true,
      volume: 15,
      reviews: [
           {
              _id: "rev3",
              user: "user789",
              fullName: "Priya Singh",
              rating: 5,
              comment: "I feel much more secure and at peace after using this oil at my workplace entrance. The scent is very grounding.",
              createdAt: "2024-08-15T10:00:00Z",
              updatedAt: "2024-08-15T10:00:00Z",
          }
      ],
      averageRating: 5,
      numReviews: 1,
      minQuantity: 1,
  },

  // --- Category: Astrology Oils ---
  {
      name: "Planetary Harmony (Navagraha) Oil",
      slug: "planetary-harmony-navagraha-oil",
      description: "A sacred blend designed to balance the energies of the nine planets (Navagraha) in your astrological chart. Use during meditation or apply to pulse points to align with cosmic vibrations and reduce planetary malefics.",
      price: 350,
      images: [
          '/images/products/navagraha-oil-1.jpg'
      ],
      category: "Astrology Oils",
      brand: "Vedant Gurukul",
      gender: "Unisex",
      tags: ["astrology", "navagraha", "planets", "remedy", "meditation"],
      stock_quantity: 60,
      isActive: true,
      volume: 10,
      reviews: [],
      averageRating: 0,
      numReviews: 0,
      minQuantity: 1,
  },
   {
      name: "Saturn Soothing (Shani Shanti) Oil",
      slug: "saturn-soothing-shani-shanti-oil",
      description: "Pacify the effects of Planet Saturn (Shani) with this specially formulated blend. Ideal for use during Sade Sati or Shani Mahadasha to promote patience, discipline, and reduce obstacles.",
      price: 325,
      sale_price: 275,
      images: [
          '/images/products/shani-oil-1.jpg'
      ],
      category: "Astrology Oils",
      brand: "Vedant Gurukul",
      gender: "Unisex",
      tags: ["astrology", "shani", "saturn", "sade sati", "remedy"],
      stock_quantity: 40,
      isActive: true,
      volume: 10,
      reviews: [
           {
              _id: "rev4",
              user: "user101",
              fullName: "Vikram Kumar",
              rating: 5,
              comment: "A must-have for anyone going through a tough Saturn period. The aroma is very unique and helps in staying calm.",
              createdAt: "2024-08-15T10:00:00Z",
              updatedAt: "2024-08-15T10:00:00Z",
          }
      ],
      averageRating: 5,
      numReviews: 1,
      minQuantity: 1,
  },

  // --- Category: Yoga & Healing Oils ---
  {
      name: "Chakra Balancing Oil",
      slug: "chakra-balancing-oil",
      description: "A synergistic blend of essential oils to help align and balance your seven chakras. Perfect for use before yoga, meditation, or any energy healing practice to enhance focus and spiritual connection.",
      price: 450,
      images: [
          '/images/products/chakra-oil-1.jpg'
      ],
      category: "Yoga & Healing Oils",
      brand: "Vedant Healing",
      gender: "Unisex",
      tags: ["yoga", "healing", "chakra", "meditation", "spiritual"],
      stock_quantity: 80,
      isActive: true,
      volume: 20,
      reviews: [],
      averageRating: 0,
      numReviews: 0,
      minQuantity: 1,
  },
   {
      name: "Meditation Focus Roll-On",
      slug: "meditation-focus-roll-on",
      description: "Deepen your meditative state with this convenient roll-on. Formulated with sandalwood, frankincense, and vetiver to calm the mind, reduce distractions, and promote a state of deep tranquility.",
      price: 399,
      sale_price: 349,
      images: [
          '/images/products/meditation-rollon-1.jpg'
      ],
      category: "Yoga & Healing Oils",
      brand: "Vedant Healing",
      gender: "Unisex",
      tags: ["yoga", "meditation", "focus", "roll-on", "mindfulness"],
      stock_quantity: 0, // Out of stock example
      isActive: true,
      volume: 10,
      reviews: [],
      averageRating: 0,
      numReviews: 0,
      minQuantity: 1,
  },
];

// --- MOCK CART ITEMS ---
export const mockCartItems = [
  
];

// export const mockSubTotal = mockCartItems.reduce((acc, item) => acc + item.price, 0);

// --- MOCK WISHLIST ITEMS ---
export interface WishlistItem {
  
}

export const mockWishlistItems: WishlistItem[] = [
 
];
