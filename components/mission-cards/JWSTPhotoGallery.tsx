'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';
import { imageCache } from '@/lib/services/image-cache';

interface JWSTPhoto {
  id: string;
  title: string;
  description: string;
  img_src: string;
  date: string;
  keywords: string[];
  center: string;
}

interface JWSTPhotoGalleryProps {
  limit?: number;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function JWSTPhotoGallery({
  limit = 12,
  autoRotate = true,
  rotateInterval = 120000, // 2 minutes
}: JWSTPhotoGalleryProps) {
  const [photos, setPhotos] = useState<JWSTPhoto[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<JWSTPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<JWSTPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const loadCachedPhotos = useCallback(async () => {
    // For now, just return false to skip cached loading
    // TODO: Implement JWST-specific caching when needed
    return false;
  }, []);

  const cachePhotos = useCallback(async (photosToCache: JWSTPhoto[]) => {
    // For now, skip caching to keep it simple
    // TODO: Implement JWST-specific caching when needed
    console.log(`Skipping cache of ${photosToCache.length} JWST photos`);
  }, []);

  const fetchLatestPhotos = useCallback(async (forceRefresh = false) => {
    // Prevent too frequent fetches (minimum 1 hour between fetches)
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
      // Fetch latest photos from our API endpoint
      const response = await fetch(`/api/jwst-photos?latest=true&limit=${limit * 3}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch photos (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.photos || data.photos.length === 0) {
        throw new Error('No James Webb Space Telescope images found');
      }

      setPhotos(data.photos);
      lastFetchTime.current = now;

      // Cache new photos in the background
      cachePhotos(data.photos.slice(0, limit));

      console.log(`Fetched ${data.photos.length} JWST photos`);

    } catch (err) {
      console.error('Error fetching JWST photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load James Webb photos');
      
      // Fall back to cached photos if available and we haven't loaded any yet
      if (photos.length === 0) {
        const hasCached = await loadCachedPhotos();
        if (hasCached) {
          setError(null); // Clear error if we have cached data
        }
      }
    } finally {
      setLoading(false);
    }
  }, [limit, loadCachedPhotos, cachePhotos, photos.length, isOnline]);

  const updateDisplayedPhotos = useCallback(() => {
    if (photos.length === 0) return;

    const startIdx = currentPage * limit;
    const endIdx = startIdx + limit;
    setDisplayedPhotos(photos.slice(startIdx, endIdx));
  }, [photos, currentPage, limit]);

  const rotatePhotos = useCallback(() => {
    if (photos.length <= limit) return;

    setCurrentPage(prev => {
      const maxPages = Math.ceil(photos.length / limit);
      return (prev + 1) % maxPages;
    });
  }, [photos.length, limit]);

  // Setup auto-rotation
  useEffect(() => {
    if (!autoRotate || photos.length <= limit) return;

    rotationTimerRef.current = setInterval(rotatePhotos, rotateInterval);

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [autoRotate, rotatePhotos, rotateInterval, photos.length, limit]);

  // Update displayed photos when photos or currentPage changes
  useEffect(() => {
    updateDisplayedPhotos();
  }, [updateDisplayedPhotos]);

  // Initial fetch
  useEffect(() => {
    fetchLatestPhotos();
  }, [fetchLatestPhotos]);

  // Handle photo selection
  const handlePhotoClick = (photo: JWSTPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const handleRefresh = () => {
    fetchLatestPhotos(true);
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
        <p className="text-gray-400 text-center">No JWST photos available</p>
      </div>
    );
  }

  const totalPages = Math.ceil(photos.length / limit);
  const mostRecentDate = photos[0]?.date || 'Unknown';

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer relative bg-gray-800 rounded-lg overflow-hidden aspect-square"
              onClick={() => handlePhotoClick(photo)}
            >
              <Image
                src={photo.img_src}
                alt={photo.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.title}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {new Date(photo.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={selectedPhoto.img_src}
                  alt={selectedPhoto.title}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{selectedPhoto.title}</h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {selectedPhoto.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPhoto.keywords.slice(0, 8).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  Captured: {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}