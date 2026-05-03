"use client";

import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchPublishedBlogs, Blog } from '@/lib/redux/slices/blogSlice';
import { staggerContainer, fadeInUp } from '@/lib/motion/motionVariants';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  title: string;
  subtitle?: string;
  className?: string;
  filterParams: {
    limit?: number;
    category?: string;
    tags?: string;
  };
  // Optional prop for a "View All" link
  viewAllLink?: string;
}

// Blog Card Component for horizontal scrolling
const BlogScrollCard = ({ blog }: { blog: Blog }) => {
  const postDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white/70 shadow-lg border border-white/30 backdrop-blur-sm transition-all duration-500 h-[450px] flex flex-col hover:shadow-2xl hover:-translate-y-2 w-80">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <span className="absolute top-3 left-3 bg-gradient-to-r from-[var(--brand-green)] to-[var(--brand-orange)] text-white px-2 py-1 rounded-full text-xs font-semibold">
            {blog.category}
          </span>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-brand-dark group-hover:text-[var(--brand-green)] transition-colors duration-300 mb-2 leading-tight line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-gray-600 text-sm flex-grow mb-3 line-clamp-3">
            {blog.excerpt}
          </p>
          <div className="border-t border-gray-200 pt-3 mt-auto text-xs text-gray-500 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-[var(--brand-orange)]" />
              <span className="truncate">{blog.author?.fullName || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--brand-blue)]" />
              <span>{postDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Skeleton Card for Loading State
const BlogSkeletonCard = () => (
  <div className="flex-shrink-0 w-80 space-y-4 p-4 bg-white/50 rounded-2xl shadow-md">
    <div className="h-48 w-full rounded-xl bg-gray-200/60 animate-pulse" />
    <div className="space-y-3">
      <div className="h-3 w-1/4 rounded bg-gray-200/60 animate-pulse" />
      <div className="h-5 w-full rounded bg-gray-200/60 animate-pulse" />
      <div className="h-4 w-full rounded bg-gray-200/60 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-gray-200/60 animate-pulse" />
    </div>
  </div>
);

export function BlogSection({ title, subtitle, filterParams, className, viewAllLink }: BlogSectionProps) {
  const dispatch = useDispatch<AppDispatch>();

  const sectionKey = useMemo(() => {
    const key = Object.entries(filterParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('_');
    return `blog_section_${key}`;
  }, [filterParams]);

  // Use the existing blog state structure
  const { posts: blogs, loading, error } = useSelector((state: RootState) => state.blog);

  // Filter blogs based on filterParams if needed
  const filteredBlogs = useMemo(() => {
    let filtered = blogs;
    
    if (filterParams.category) {
      filtered = filtered.filter(blog => 
        blog.category?.toLowerCase().includes(filterParams.category!.toLowerCase())
      );
    }
    
    if (filterParams.tags) {
      filtered = filtered.filter(blog =>
        blog.tags?.some(tag => 
          tag.toLowerCase().includes(filterParams.tags!.toLowerCase())
        )
      );
    }

    const limit = filterParams.limit || 8;
    return filtered.slice(0, limit);
  }, [blogs, filterParams]);

  useEffect(() => {
    // Fetch blogs if not already loaded
    if (blogs.length === 0 && !loading) {
      dispatch(fetchPublishedBlogs({}));
    }
  }, [dispatch, blogs.length, loading]);

  const handleRetry = useCallback(() => {
    dispatch(fetchPublishedBlogs({}));
  }, [dispatch]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogSkeletonCard key={`skeleton-${sectionKey}-${index}`} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">Unable to load blog posts</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (filteredBlogs.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No blog posts found</p>
            <p className="text-gray-400 text-sm mt-2">
              We couldn't find any blog posts matching your criteria.
            </p>
          </div>
        </div>
      );
    }

    // Create multiple copies of blogs for seamless loop
    const duplicatedBlogs = [...filteredBlogs, ...filteredBlogs, ...filteredBlogs];

    return (
      <div className="overflow-hidden">
        <div className="flex gap-6 animate-scroll-infinite hover:pause">
          {duplicatedBlogs.map((blog, index) => (
            <div 
              key={`blog-${sectionKey}-${blog._id}-${index}`} 
              className="flex-shrink-0"
            >
              <BlogScrollCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className={`relative container mx-auto px-6 py-12 md:py-16 bg-gradient-to-br from-orange-50/40 via-white/20 to-green-50/40 rounded-3xl overflow-hidden ${className}`}>
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <Image
          src="/6292.jpg"
          alt="vedantaroma Background"
          width={500}
          height={500}
          className="opacity-5"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-blue-800 to-green-600">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-blue-800 font-medium max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Horizontal scrolling container */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mb-8"
        >
          {renderContent()}
        </motion.div>

        {/* View All button */}
        {viewAllLink && filteredBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <Link href={viewAllLink}>
              <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-[var(--brand-green)] to-[var(--brand-orange)] text-white px-8 py-3 rounded-full font-bold text-base hover:shadow-xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300">
                View All {title}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}