'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';

interface RoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

interface RoverPhotoGalleryProps {
  rover?: 'perseverance' | 'curiosity' | 'opportunity' | 'spirit';
  limit?: number;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function RoverPhotoGallery({
  rover = 'perseverance',
  limit = 12,
  autoRotate = true,
  rotateInterval = 30000, // 30 seconds
}: RoverPhotoGalleryProps) {
  const [photos, setPhotos] = useState<RoverPhoto[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<RoverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchLatestPhotos();

    // Cleanup timer on unmount
    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [rover]);

  useEffect(() => {
    // Set up auto-rotation if enabled
    if (autoRotate && photos.length > limit) {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }

      rotationTimerRef.current = setInterval(() => {
        rotatePhotos();
      }, rotateInterval);

      return () => {
        if (rotationTimerRef.current) {
          clearInterval(rotationTimerRef.current);
        }
      };
    }
  }, [photos, autoRotate, rotateInterval, limit]);

  useEffect(() => {
    // Update displayed photos when photos or page changes
    if (photos.length > 0) {
      const startIdx = currentPage * limit;
      const endIdx = startIdx + limit;
      setDisplayedPhotos(photos.slice(startIdx, endIdx));
    }
  }, [photos, currentPage, limit]);

  const rotatePhotos = () => {
    setCurrentPage((prev) => {
      const totalPages = Math.ceil(photos.length / limit);
      return (prev + 1) % totalPages;
    });
  };

  const fetchLatestPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use server-side API route to avoid CORS and handle API key
      const response = await fetch(`/api/mars-photos/${rover}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch photos (${response.status})`);
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        setPhotos(data.photos);
        setCurrentPage(0);
      } else {
        // Fallback to demo photos if no recent photos available
        console.warn(`No recent photos for ${rover}, fetching older photos...`);
        const fallbackResponse = await fetch(`/api/mars-photos/${rover}?sol=1000`);
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.photos && fallbackData.photos.length > 0) {
          setPhotos(fallbackData.photos);
          setCurrentPage(0);
        } else {
          setPhotos([]);
        }
      }
    } catch (err) {
      console.error('Error fetching rover photos:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <GallerySkeleton count={8} columns={4} aspectRatio="square" shimmer={true} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error loading photos: {error}</p>
        <button
          onClick={fetchLatestPhotos}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No recent photos available</p>
      </div>
    );
  }

  const totalPages = Math.ceil(photos.length / limit);
  const showPagination = totalPages > 1;

  return (
    <>
      {/* Rotation indicator and controls */}
      {showPagination && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Showing photos {currentPage * limit + 1}-
              {Math.min((currentPage + 1) * limit, photos.length)} of {photos.length}
            </span>
            {autoRotate && (
              <span className="text-xs text-blue-400 animate-pulse">
                Auto-rotating every {rotateInterval / 1000}s
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {displayedPhotos.map((photo, index) => (
            <motion.div
              key={`${currentPage}-${photo.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
                <Image
                  src={photo.img_src}
                  alt={`Mars ${photo.camera.full_name}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  unoptimized // NASA images are external
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-semibold text-white">{photo.camera.full_name}</p>
                    <p className="text-xs text-gray-300">
                      Sol {photo.sol} • {photo.earth_date}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <Image
                src={selectedPhoto.img_src}
                alt={`Mars ${selectedPhoto.camera.full_name}`}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg"
                unoptimized // NASA images are external
                priority // Priority loading for lightbox
              />

              <div className="mt-4 bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedPhoto.rover.name} - {selectedPhoto.camera.full_name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Sol:</span>
                    <span className="ml-2">{selectedPhoto.sol}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Earth Date:</span>
                    <span className="ml-2">{selectedPhoto.earth_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Camera:</span>
                    <span className="ml-2">{selectedPhoto.camera.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2 text-green-400">{selectedPhoto.rover.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
