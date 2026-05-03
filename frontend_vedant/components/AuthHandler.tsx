"use client"

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { selectIsAuthenticated } from '@/lib/redux/slices/authSlice';
import { addToCart, fetchCart } from '@/lib/redux/slices/cartSlice';
import { addToWishlist, fetchWishlist } from '@/lib/redux/slices/wishlistSlice';

interface LocalCartItem {
  productId: string;
  sku_variant?: string;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  attributes?: Record<string, string>;
  selectedVariant?: any;
}

interface LocalWishlistItem {
  _id: string;
}

export const AuthHandler = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const hasMerged = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasMerged.current) {
      
      const mergeData = async () => {
         ("User logged in. Starting local data merge...");

        // Cart sync is now handled in the login page to prevent conflicts
        // const localCart = localStorage.getItem("vedantgurukularoma-cart");
        // if (localCart) {
        //   const cartItems: LocalCartItem[] = JSON.parse(localCart);
        //   if (cartItems.length > 0) {
        //      (`Merging ${cartItems.length} items to database cart...`);
        //     await Promise.all(
        //       cartItems.map(item => 
        //         dispatch(addToCart({ 
        //           productId: item.productId, 
        //           sku_variant: item.sku_variant || 'default',
        //           quantity: item.quantity 
        //         }))
        //       )
        //     );
        //     localStorage.removeItem("vedantgurukularoma-cart");
        //      ("Local cart cleared.");
        //   }
        // }

        // Wishlist sync is now handled in the login page to prevent conflicts
        // const localWishlist = localStorage.getItem("vedantgurukularoma-wishlist");
        // if (localWishlist) {
        //   const wishlistItems: LocalWishlistItem[] = JSON.parse(localWishlist);
        //   if (wishlistItems.length > 0) {
        //      (`Merging ${wishlistItems.length} items to database wishlist...`);
        //     await Promise.all(
        //       wishlistItems.map(item => 
        //         dispatch(addToWishlist(item._id))
        //       )
        //     );
        //     localStorage.removeItem("vedantgurukularoma-wishlist");
        //      ("Local wishlist cleared.");
        //   }
        // }
        
         ("Re-fetching wishlist from server...");
        // Wishlist is fetched in login page after merge
        dispatch(fetchWishlist());
        
        hasMerged.current = true;
      };

      mergeData();
    }
    
    if (!isAuthenticated) {
      hasMerged.current = false;
    }

  }, [isAuthenticated, dispatch]);

  return null;
};