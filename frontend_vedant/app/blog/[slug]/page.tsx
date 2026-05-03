// app/blog/[slug]/page.tsx

"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchBlogBySlug, clearSelectedPost } from '@/lib/redux/slices/blogSlice';

// --- UI & Animation Components ---
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/motion/motionVariants';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, ArrowLeft, RefreshCw } from 'lucide-react';

// === Skeleton Loader for Detail Page ===
const BlogDetailSkeleton = () => (
  <div className="animate-pulse">
    {/* Hero Skeleton */}
    <div className="relative h-[50vh] bg-gray-200/50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-6 w-32 mx-auto rounded bg-gray-300/50" />
        <Skeleton className="h-12 w-96 mx-auto rounded bg-gray-300/50" />
        <Skeleton className="h-10 w-64 mx-auto rounded bg-gray-300/50" />
      </div>
    </div>
    {/* Content Skeleton */}
    <div className="container mx-auto px-6 max-w-4xl -mt-16 relative z-10">
      <div className="bg-white/70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded bg-gray-200/50" />
          <Skeleton className="h-4 w-full rounded bg-gray-200/50" />
          <Skeleton className="h-4 w-5/6 rounded bg-gray-200/50" />
          <br />
          <Skeleton className="h-6 w-1/3 rounded bg-gray-200/50" />
          <Skeleton className="h-4 w-full rounded bg-gray-200/50" />
          <Skeleton className="h-4 w-full rounded bg-gray-200/50" />
        </div>
      </div>
    </div>
  </div>
);

// === Main Blog Detail Page Component ===
export default function BlogDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const slug = params.slug as string;

  const { selectedPost, postDetailsLoading, postDetailsError } = useSelector(
    (state: RootState) => state.blog
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogBySlug(slug));
    }

    // Cleanup function: Jab component unmount ho, to selected post ko clear kar dein
    // Isse agle post par jaane par purana data flash nahi hoga
    return () => {
      dispatch(clearSelectedPost());
    };
  }, [dispatch, slug]);

  if (postDetailsLoading) {
    return <BlogDetailSkeleton />;
  }

  if (postDetailsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-red-50">
        <h2 className="text-2xl font-bold text-red-700">Failed to Load Blog Post</h2>
        <p className="mt-2 text-red-600">{postDetailsError}</p>
        <Button onClick={() => dispatch(fetchBlogBySlug(slug))} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!selectedPost) {
    return null; // Ya "Post not found" message dikha sakte hain
  }

  const postDate = new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="overflow-hidden bg-gradient-to-br from-green-100 via-white to-blue-200">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* === Hero Section with Featured Image === */}
        <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src={selectedPost.featuredImage}
              alt={selectedPost.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 text-center px-4 space-y-4">
            <motion.div variants={fadeInUp}>
              <span className="bg-gradient-to-r from-[var(--brand-green)] to-[var(--brand-orange)] text-white px-4 py-2 rounded-full text-sm font-semibold">
                {selectedPost.category}
              </span>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                {selectedPost.title}
              </h1>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-gray-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--brand-orange)]" />
                <span>{selectedPost.author.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--brand-blue)]" />
                <span>{postDate}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === Blog Content Section === */}
        <section className="container mx-auto px-6 max-w-4xl -mt-16 md:-mt-24 relative z-10 pb-20">
          <motion.div >
            <div className="bg-white/80 backdrop-blur-lg p-6 md:p-12 rounded-2xl shadow-xl border border-white/40">
              {/* 'prose-styles' class se content ko style kiya jayega */}
              <div
                className="prose-styles"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              {/* Tags Section */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-brand-dark flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-gray-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-12">
              <Link href="/blogs">
                <Button variant="outline" size="lg" className="rounded-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to All Articles
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </motion.div>
    </main>
  );
}