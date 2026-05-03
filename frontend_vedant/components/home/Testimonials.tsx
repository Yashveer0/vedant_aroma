"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import YouTube from "react-youtube";
import { PlayCircle, PauseCircle, Loader2, AlertCircle, MessageSquareOff } from "lucide-react";

// --- Redux Imports ---
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchAllTestimonials } from "@/lib/redux/slices/testimonialSlice";

// --- Helper Function to Extract Video ID from URL ---
const getVideoIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    }
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
  return videoId;
};

export function Testimonials() {
  const dispatch = useDispatch<AppDispatch>();
  // --- Connect to the Redux Store ---
  const { testimonials, status, error } = useSelector((state: RootState) => state.testimonials);

  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);

  // --- Fetch data from the backend when the component mounts ---
  useEffect(() => {
    dispatch(fetchAllTestimonials());
  }, [dispatch]);

  const youtubeOptions = {
    height: "225",
    width: "400",
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  // --- Duplicate testimonials from state for a seamless, infinite loop ---
  const duplicatedTestimonials = useMemo(() => {
    return testimonials.length > 0 ? [...testimonials, ...testimonials] : [];
  }, [testimonials]);

  // --- Conditional Rendering based on fetch status ---
  const renderContent = () => {
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[225px] text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="mt-4 text-lg">Loading Testimonials...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[225px] text-red-600">
                <AlertCircle className="h-10 w-10" />
                <p className="mt-4 text-lg font-semibold">Failed to load testimonials</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (testimonials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[225px] text-gray-500">
                <MessageSquareOff className="h-10 w-10" />
                <p className="mt-4 text-lg">No testimonials found yet.</p>
            </div>
        );
    }
    
    // --- Success State: Render the scrolling container ---
    return (
      <div className="group w-full overflow-hidden">
        <div className="flex animate-scroll space-x-8 group-hover:pause">
          {duplicatedTestimonials.map((testimonial, index) => {
            const videoId = getVideoIdFromUrl(testimonial.youtubeLink || '');
            const uniqueKey = `${testimonial._id}-${index}`; // Use testimonial ID for a stable key

            if (!videoId) {
                return null; // Skip rendering if URL is invalid or missing
            }
            
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const isPlaying = activeVideoKey === uniqueKey;

            return (
              <div
                key={uniqueKey}
                className="relative flex-shrink-0 w-[400px] h-[225px] cursor-pointer overflow-hidden rounded-lg bg-black shadow-lg"
                onClick={() => setActiveVideoKey(isPlaying ? null : uniqueKey)}
              >
                {isPlaying ? (
                  <>
                    <YouTube videoId={videoId} opts={youtubeOptions} className="h-full w-full" />
                    <div className="absolute top-2 right-2 z-10 rounded-full bg-black bg-opacity-50 p-2 transition-opacity hover:opacity-75">
                      <PauseCircle className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={`Testimonial from ${testimonial.name} for ${testimonial.productName}`}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x225.png?text=Thumbnail+Not+Available'; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-100">
                      <PlayCircle className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                      <p className="text-lg font-semibold text-white">
                        {testimonial.name}
                      </p>
                       <p className="text-sm text-gray-200">
                        Product Used: {testimonial.productName}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          What Our Customers Are Saying
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Real stories from real people who love our products.
        </p>
      </div>
      
      <div className="mt-12">
        {renderContent()}
      </div>
    </section>
  );
}