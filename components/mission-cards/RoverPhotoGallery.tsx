'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';
import { imageCache } from '@/lib/services/image-cache';

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
  rotateInterval = 120000, // 2 minutes
}: RoverPhotoGalleryProps) {
  const [photos, setPhotos] = useState<RoverPhoto[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<RoverPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<RoverPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedPhotos = useCallback(async () => {
    try {
      const cachedImages = await imageCache.getCachedImagesByRover(rover, 200);
      if (cachedImages.length > 0) {
        const cachedPhotos = cachedImages.map(img => {
          // Reconstruct photo object from cached data
          const metadata = img.metadata || {};
          return {
            id: parseInt(img.id.split('-')[1] || '0'),
            sol: img.sol || metadata.sol || 0,
            camera: metadata?.camera || { 
              id: 0, 
              name: 'Unknown', 
              rover_id: 0, 
              full_name: 'Unknown Camera' 
            },
            img_src: img.url,
            earth_date: img.earthDate,
            rover: {
              id: 0,
              name: rover,
              landing_date: '',
              launch_date: '',
              status: 'active'
            }
          } as RoverPhoto;
        });
        
        setPhotos(cachedPhotos);
        setCurrentPage(0);
        console.log(`Loaded ${cachedPhotos.length} cached photos for ${rover}`);
        return true;
      }
    } catch (error) {
      console.error('Error loading cached photos:', error);
    }
    return false;
  }, [rover]);

  const cachePhotos = useCallback(async (photosToCache: RoverPhoto[]) => {
    for (const photo of photosToCache) {
      const cacheId = `${rover}-${photo.id}`;
      await imageCache.cacheImage(cacheId, photo.img_src, {
        earthDate: photo.earth_date,
        sol: photo.sol,
        rover: rover,
        camera: photo.camera,
        metadata: photo
      });
    }
    console.log(`Cached ${photosToCache.length} photos for ${rover}`);
  }, [rover]);

  const fetchLatestPhotos = useCallback(async (forceRefresh = false) => {
    // Prevent too frequent fetches (minimum 1 hour between fetches for better caching)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < 60 * 60 * 1000) {
      console.log('Skipping fetch - too soon since last fetch');
      return;
    }

    setLoading(true);
    setError(null);

    // Load cached photos first for instant display
    if (!forceRefresh) {
      const hasCached = await loadCachedPhotos();
      if (hasCached && !isOnline) {
        setLoading(false);
        return; // Use cached data when offline
      }
    }

    try {
      // Fetch latest photos from API with extended range
      // Add cache-busting to prevent stale 404 responses
      const response = await fetch(`/api/mars-photos/${rover}?latest=true&limit=200`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses
        let errorMessage = `Failed to fetch photos (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response wasn't JSON, use status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse response data with better error handling
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - expected JSON');
      }

      const data = await response.json();

      if (data.photos && data.photos.length > 0) {
        setPhotos(data.photos);
        setCurrentPage(0);
        lastFetchTime.current = now;
        
        // Cache the new photos in the background
        await cachePhotos(data.photos);
        
        // Show metadata info if available
        if (data.metadata?.rover_info) {
          console.log(`${rover} rover info:`, data.metadata.rover_info);
        }
      } else {
        // No new photos, keep using cached ones if available
        const hasCached = await loadCachedPhotos();
        if (!hasCached) {
          setPhotos([]);
          setError('No photos available');
        }
      }
    } catch (err) {
      console.error('Error fetching rover photos:', err);
      
      // Try to use cached photos on error
      const hasCached = await loadCachedPhotos();
      if (!hasCached) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } else {
        // Show warning that we're using cached data
        console.warn('Using cached photos due to fetch error');
      }
    } finally {
      setLoading(false);
    }
  }, [rover, isOnline, loadCachedPhotos, cachePhotos]);

  useEffect(() => {
    fetchLatestPhotos();

    // Set up periodic refresh (every 6 hours when online for better caching)
    const refreshInterval = setInterval(() => {
      if (isOnline) {
        fetchLatestPhotos(true); // Force refresh
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [rover, fetchLatestPhotos]);

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

  const handleRefresh = () => {
    fetchLatestPhotos(true); // Force refresh
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => {
      const totalPages = Math.ceil(photos.length / limit);
      return prev === 0 ? totalPages - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentPage((prev) => {
      const totalPages = Math.ceil(photos.length / limit);
      return (prev + 1) % totalPages;
    });
  };

  if (loading && photos.length === 0) {
    return <GallerySkeleton />;
  }

  if (error && photos.length === 0) {
    return (
      <div className="rounded-xl bg-red-900/10 border border-red-500/20 p-6">
        <p className="text-red-400 text-center">Error loading photos: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg mx-auto block"
        >
          Retry
        </button>
      </div>
    );
  }

  if (displayedPhotos.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-8">
        <p className="text-gray-400 text-center">No photos available for this rover</p>
      </div>
    );
  }

  const totalPages = Math.ceil(photos.length / limit);
  const mostRecentDate = photos[0]?.earth_date || 'Unknown';

  return (
    <div className="space-y-4">
      {/* Gallery Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          <span>Showing {displayedPhotos.length} of {photos.length} photos</span>
          {mostRecentDate && (
            <span className="ml-4">Latest: {new Date(mostRecentDate).toLocaleDateString()}</span>
          )}
          {!isOnline && (
            <span className="ml-4 text-yellow-400">📡 Offline - Using cached photos</span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="p-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPage ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="p-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {displayedPhotos.map((photo, index) => (
            <motion.div
              key={`${photo.id}-${currentPage}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-800/50 cursor-pointer group"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={photo.img_src}
                alt={`Mars ${rover} - Sol ${photo.sol}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs text-white">Sol {photo.sol}</p>
                  <p className="text-xs text-gray-300">{photo.camera.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.img_src}
                alt={`Mars ${rover} - Sol ${selectedPhoto.sol}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-lg font-semibold text-white">
                  {rover.charAt(0).toUpperCase() + rover.slice(1)} Rover - Sol {selectedPhoto.sol}
                </h3>
                <p className="text-sm text-gray-300">
                  Camera: {selectedPhoto.camera.full_name}
                </p>
                <p className="text-sm text-gray-300">
                  Earth Date: {new Date(selectedPhoto.earth_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}