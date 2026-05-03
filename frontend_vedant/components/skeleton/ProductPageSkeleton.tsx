import React from 'react';

const ProductDetailsSkeleton = () => {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
                {/* --- LEFT: SKELETON MEDIA GALLERY --- */}
                <div className="flex flex-col-reverse md:flex-row gap-4">
                    <div className="flex md:flex-col gap-3">
                        {[...Array(4)].map((_, idx) => (
                            <div key={idx} className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        ))}
                    </div>
                    <div className="relative aspect-[3/4] w-full bg-gray-200 rounded-xl"></div>
                </div>

                {/* --- RIGHT: SKELETON PRODUCT DETAILS & ACTIONS --- */}
                <div className="space-y-6">
                    {/* Brand & Title */}
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-9 bg-gray-300 rounded w-full"></div>
                    <div className="h-9 bg-gray-300 rounded w-4/5"></div>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded w-1/4"></div>
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/5"></div>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/5"></div>
                        <div className="flex flex-wrap gap-2">
                            <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 h-12 bg-gray-300 rounded-full"></div>
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                    </div>
                    
                    {/* Accordion */}
                    <div className="space-y-4 pt-4">
                        <div className="h-14 bg-gray-200 rounded-lg w-full"></div>
                        <div className="h-14 bg-gray-200 rounded-lg w-full"></div>
                        <div className="h-14 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetailsSkeleton;