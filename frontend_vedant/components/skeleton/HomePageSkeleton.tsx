"use client"
import React from 'react';

// A reusable helper component for product card skeletons
const SkeletonCard = () => (
    <div className="space-y-3">
        <div className="aspect-[3/4] w-full bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
);

const SkeletonCategoryItem = () => (
    <div className="flex-shrink-0">
        <div className="flex flex-col items-center w-32 md:w-40 text-center">
            {/* Skeleton for the circular image */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full animate-pulse"></div>
            {/* Skeleton for the category name */}
            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
    </div>
);

const CategoryScrollerSkeleton = () => {
    return (
        <section className="py-12 md:py-16 bg-gray-50/50 overflow-hidden">
            <div className="container mx-auto">
                {/* Skeleton for the main title */}
                <div className="h-8 md:h-10 bg-gray-200 rounded w-1/2 md:w-1/3 mx-auto mb-12 animate-pulse"></div>
                
                <div className="relative">
                    {/* Container for skeleton items */}
                    <div className="flex items-start space-x-4 lg:space-x-8 overflow-x-hidden pb-4 px-4 lg:px-14">
                        {/* Render 6 placeholder items to match the real component */}
                        {[...Array(6)].map((_, index) => (
                            <SkeletonCategoryItem key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// The main skeleton component for the entire homepage
const HomePageSkeleton = () => {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <CategoryScrollerSkeleton />
            {/* Hero Section Skeleton */}
            <section className="relative w-full h-[65vh] md:h-[90vh] bg-gray-200 rounded-lg animate-pulse overflow-hidden">
    {/* This div mimics the main slider image area */}
    <div className="w-full h-full bg-gray-200"></div>

    {/* Skeleton for Text Content */}
            <div className="absolute top-0 left-0 z-10 flex flex-col items-start justify-center h-full px-6 md:px-16 lg:px-24">
                <div className="w-32 h-8 bg-gray-300 rounded-md mb-6"></div>
                <div className="w-3/4 md:w-1/2 h-12 bg-gray-300 rounded-md mb-6"></div>
                <div className="w-full max-w-xl space-y-3 mb-8">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="w-48 h-16 bg-gray-300 rounded-full"></div>
            </div>

            {/* Skeleton for Navigation Arrows */}
            <div className="absolute z-20 top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-8">
                <div className="w-14 h-14 bg-gray-300/50 rounded-full"></div>
                <div className="w-14 h-14 bg-gray-300/50 rounded-full"></div>
            </div>

            {/* Skeleton for Navigation Dots */}
            <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="w-12 h-3 bg-gray-300 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300/50 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300/50 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300/50 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300/50 rounded-full"></div>
            </div>
        </section>

            {/* Section Skeletons (Title + Grid) */}
            {[...Array(3)].map((_, i) => (
                <section key={i} className="my-12 md:my-20">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-12 animate-pulse"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[...Array(4)].map((_, j) => (
                            <SkeletonCard key={j} />
                        ))}
                    </div>
                </section>
            ))}

            {/* Limited Time Offer Skeleton */}
            <section className="my-12 md:my-20 bg-gray-200 rounded-2xl h-[400px] animate-pulse"></section>

            {/* Style Your Space Skeleton */}
            <section className="my-12 md:my-16">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-12 animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                    {[...Array(6)].map((_, j) => (
                        <div key={j} className="flex flex-col items-center gap-4">
                            <div className="aspect-square w-full bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section Skeleton */}
            <section className="my-12 md:my-16 bg-gray-100 rounded-2xl p-8 md:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 animate-pulse">
                    {[...Array(4)].map((_, j) => (
                        <div key={j} className="text-center space-y-4">
                            <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section Skeleton */}
            <section className="my-12 md:my-20 bg-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="grid md:grid-cols-2 items-center min-h-[500px]">
                    <div className="p-8 md:p-12 h-full bg-gray-100"></div>
                    <div className="h-80 md:h-full w-full bg-gray-200"></div>
                </div>
            </section>
        </main>
    );
};

export default HomePageSkeleton;