"use client";

import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { Star, User, Trash2, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "./ui/input";

import { AppDispatch, RootState } from "@/lib/redux/store";
import { createProductReview, deleteProductReview } from "@/lib/redux/slices/productSlice";
import { selectIsAuthenticated, selectCurrentUser } from "@/lib/redux/slices/authSlice"; 
import { Product, Review } from "@/lib/types/product";


const StarRating = ({ rating, onRatingChange, readonly = false, size = 16 }: { rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean, size?: number }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly} onClick={() => !readonly && onRatingChange && onRatingChange(star)} onMouseEnter={() => !readonly && setHoverRating(star)} onMouseLeave={() => !readonly && setHoverRating(0)} className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
          <Star size={size} className={`${ star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300' } transition-colors`} />
        </button>
      ))}
    </div>
  );
};



interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [reviewRating, setReviewRating] = useState(0);

  const [reviewComment, setReviewComment] = useState(""); 
  
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const MAX_REVIEW_IMAGES = 3;

  const userHasReviewed = useMemo(() => {
    if (!product?.reviews || !currentUser) return false;
    return product.reviews.some((review: Review) => review.user === currentUser._id);
  }, [product?.reviews, currentUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + reviewImages.length > MAX_REVIEW_IMAGES) {
        toast({ title: `You can upload a maximum of ${MAX_REVIEW_IMAGES} images.`, variant: "destructive" });
        return;
      }
      setReviewImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewComment.trim()) {
      toast({ title: "Review incomplete", description: "Please provide a rating and a comment.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(createProductReview({ 
        productId: product._id, 
        rating: reviewRating, 
        comment: reviewComment,
        images: reviewImages
      })).unwrap();
      
      setReviewRating(0);
      setReviewComment("");
      setReviewImages([]);
      setImagePreviews([]);
      setShowReviewForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
        dispatch(deleteProductReview({ productId: product._id, reviewId }));
    }
  };

  return (
    <motion.section id="reviews" className="mt-16 max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Customer Reviews</h2>
          {isAuthenticated && !userHasReviewed && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)} variant="outline">Write a Review</Button>
          )}
        </div>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{product.averageRating?.toFixed(1)}</div>
              <StarRating rating={product.averageRating || 0} readonly size={20} />
              <div className="text-sm text-gray-600 mt-1">Based on {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}</div>
            </div>
          </div>
        )}
        
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-6 border rounded-lg bg-gray-50 space-y-4">
            <h3 className="text-xl font-semibold">Write Your Review</h3>
            <div><Label className="font-semibold mb-2 block">Your Rating *</Label><StarRating rating={reviewRating} onRatingChange={setReviewRating} size={24} /></div>
            <div><Label htmlFor="review-comment" className="font-semibold">Your Comment *</Label>
                {/* This Textarea now correctly uses setReviewComment */}
                <Textarea id="review-comment" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required placeholder="Tell us what you think..." className="mt-2" />
            </div>
            <div>
              <Label htmlFor="review-images">Add Photos (optional)</Label>
              <Input id="review-images" type="file" accept="image/*" multiple onChange={handleImageChange} disabled={reviewImages.length >= MAX_REVIEW_IMAGES} className="mt-2" />
              {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                      {imagePreviews.map((src, index) => (
                          <div key={src} className="relative"><Image src={src} alt={`preview ${index}`} width={80} height={80} className="object-cover rounded-md" /><button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><XCircle size={16} /></button></div>
                      ))}
                  </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}><Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isSubmitting && 'hidden'}`} />Submit Review</Button>
              <Button onClick={() => setShowReviewForm(false)} variant="outline">Cancel</Button>
            </div>
          </form>
        )}

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review: Review) => (
              <div key={review._id} className="border-t border-gray-200 pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12"><AvatarImage src={review.avatar} /><AvatarFallback><User size={24} /></AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">{review.fullName}</h4>
                      {currentUser && review.user === currentUser._id && (<Button onClick={() => handleDeleteReview(review._id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 size={16} /></Button>)}
                    </div>
                    <div className="flex items-center gap-2"><StarRating rating={review.rating} readonly /><span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span></div>
                    <p className="text-gray-700 leading-relaxed mt-2">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {review.images.map((imgUrl, index) => (<Image key={index} src={imgUrl} alt={`Review image ${index + 1}`} width={100} height={100} className="object-cover rounded-lg border cursor-pointer" />))}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4"><Star size={48} className="mx-auto" /></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your thoughts!</p>
            {isAuthenticated && !userHasReviewed && !showReviewForm && (<Button onClick={() => setShowReviewForm(true)}>Write First Review</Button>)}
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center py-8 border-t mt-8"><p className="text-gray-600 mb-4">Want to share your experience?</p><Link href="/login"><Button>Log In to Write a Review</Button></Link></div>
        )}
         {isAuthenticated && userHasReviewed && !showReviewForm && (
          <div className="text-center py-8 border-t mt-8"><p className="text-green-700 font-semibold p-4 bg-green-50 rounded-md border border-green-200">Thank you for your feedback!</p></div>
        )}
      </div>
    </motion.section>
  );
}