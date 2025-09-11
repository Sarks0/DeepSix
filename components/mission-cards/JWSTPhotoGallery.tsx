'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';

interface JWSTPhoto {
  href: string;
  data: {
    title: string;
    description: string;
    date_created: string;
    keywords: string[];
    media_type: string;
    nasa_id: string;
    center: string;
  }[];
  links?: {
    href: string;
    rel: string;
    render?: string;
  }[];
}

interface ProcessedJWSTPhoto {
  id: string;
  title: string;
  description: string;
  img_src: string;
  date: string;
  keywords: string[];
}

interface JWSTPhotoGalleryProps {
  limit?: number;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function JWSTPhotoGallery({
  limit = 12,
  autoRotate = true,
  rotateInterval = 180000, // 3 minutes (JWST images are more complex)
}: JWSTPhotoGalleryProps) {
  const [photos, setPhotos] = useState<ProcessedJWSTPhoto[]>([]);
  const [displayedPhotos, setDisplayedPhotos] = useState<ProcessedJWSTPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProcessedJWSTPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);

  const processJWSTPhotos = useCallback((rawPhotos: JWSTPhoto[]): ProcessedJWSTPhoto[] => {
    return rawPhotos
      .filter(item => 
        item.links && 
        item.links.length > 0 && 
        item.data[0]?.media_type === 'image' &&
        item.data[0]?.title?.toLowerCase().includes('webb')
      )
      .map(item => ({
        id: item.data[0].nasa_id,
        title: item.data[0].title,
        description: item.data[0].description || 'James Webb Space Telescope observation',
        img_src: item.links?.[0]?.href || '',
        date: item.data[0].date_created,
        keywords: item.data[0].keywords || []
      }))
      .filter(photo => photo.img_src) // Only include photos with valid image sources
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by newest first
  }, []);

  const fetchJWSTPhotos = useCallback(async (forceRefresh = false) => {
    // Prevent too frequent fetches (minimum 2 hours between fetches)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime.current < 2 * 60 * 60 * 1000) {
      console.log('Skipping JWST fetch - too soon since last fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search for James Webb Space Telescope images
      const searchParams = new URLSearchParams({
        q: 'James Webb Space Telescope',
        media_type: 'image',
        year_start: '2022', // JWST started operations in 2022
        page_size: '100'
      });

      const response = await fetch(`https://images-api.nasa.gov/search?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch JWST photos (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.collection?.items) {
        throw new Error('No photos found in NASA API response');
      }

      const processedPhotos = processJWSTPhotos(data.collection.items);
      
      if (processedPhotos.length === 0) {
        throw new Error('No James Webb Space Telescope images found');
      }

      // Take the most recent photos
      const latestPhotos = processedPhotos.slice(0, limit * 3); // Get more than needed for rotation
      
      setPhotos(latestPhotos);
      lastFetchTime.current = now;

      console.log(`Fetched ${latestPhotos.length} JWST photos`);

    } catch (err) {
      console.error('Error fetching JWST photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load James Webb photos');
    } finally {
      setLoading(false);
    }
  }, [limit, processJWSTPhotos]);

  const updateDisplayedPhotos = useCallback(() => {
    if (photos.length === 0) return;

    const startIdx = currentPage * limit;
    const endIdx = startIdx + limit;
    const pagePhotos = photos.slice(startIdx, endIdx);
    
    // If we don't have enough photos for a full page, cycle back to beginning
    if (pagePhotos.length < limit && photos.length >= limit) {
      const remaining = limit - pagePhotos.length;
      const additionalPhotos = photos.slice(0, remaining);
      setDisplayedPhotos([...pagePhotos, ...additionalPhotos]);
    } else {
      setDisplayedPhotos(pagePhotos);
    }
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
    fetchJWSTPhotos();
  }, [fetchJWSTPhotos]);

  // Handle photo selection
  const handlePhotoClick = (photo: ProcessedJWSTPhoto) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (loading && photos.length === 0) {
    return <GallerySkeleton />;
  }

  if (error && photos.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Unable to Load Images</h3>
          <p className="text-sm text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchJWSTPhotos(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Pagination Dots */}
      {photos.length > limit && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.ceil(photos.length / limit) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPage ? 'bg-blue-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

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