"use client"
const ProductCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl aspect-[3/4]"></div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
      </div>
    </div>
  );
  
  const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
        {[...Array(count)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  };
  
  export default ProductGridSkeleton;