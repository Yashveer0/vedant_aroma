"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import YouTube from "react-youtube";
import { PlayCircle, PauseCircle, Loader2, AlertCircle, VideoOff } from "lucide-react";

// --- Redux Imports ---
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchAllReels } from "@/lib/redux/slices/reelSlice";

// --- Helper Function: To extract Video ID from URL ---
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

export function VedicReels() {
    const dispatch = useDispatch<AppDispatch>();
    // --- Connect to Redux Store ---
    const { reels, status, error } = useSelector((state: RootState) => state.reels);
    
    const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);

    // --- Fetch data from the backend when the component mounts ---
    useEffect(() => {
        dispatch(fetchAllReels());
    }, [dispatch]);

    const youtubeOptions = {
      height: "225",
      width: "400",
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
    };
  
    // --- Duplicate reels from state for a seamless, infinite loop ---
    const duplicatedReels = useMemo(() => {
        return reels.length > 0 ? [...reels, ...reels] : [];
    }, [reels]);

    // --- Conditional Rendering based on fetch status ---
    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[225px] text-gray-500">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="mt-4 text-lg">Loading Reels...</p>
                </div>
            );
        }

        if (status === 'failed') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[225px] text-red-600">
                    <AlertCircle className="h-10 w-10" />
                    <p className="mt-4 text-lg font-semibold">Failed to load reels</p>
                    <p className="text-sm">{error}</p>
                </div>
            );
        }

        if (reels.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[225px] text-gray-500">
                    <VideoOff className="h-10 w-10" />
                    <p className="mt-4 text-lg">No promotional reels found.</p>
                </div>
            );
        }

        // --- Success State: Render the scrolling container ---
        return (
            <div className="group w-full overflow-hidden">
              <div className="flex animate-scroll space-x-8 group-hover:pause">
                {duplicatedReels.map((reel, index) => {
                  const videoId = getVideoIdFromUrl(reel.youtubeLink || '');
                  const uniqueKey = `${reel._id}-${index}`; // Use reel ID for a stable key
      
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
                            alt={`Promotional reel for ${reel.productName}`}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x225.png?text=Thumbnail+Not+Available'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-100">
                            <PlayCircle className="h-16 w-16 text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                            <p className="text-lg font-semibold text-white">
                              {reel.title}
                            </p>
                             <p className="text-sm text-gray-200">
                              Featured Product: {reel.productName}
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
            Experience the Essence of Our Creations
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Watch how our authentic aroma blends bring harmony and wellness into your life.
          </p>
        </div>
        
        <div className="mt-12">
            {renderContent()}
        </div>
      </section>
    );
}