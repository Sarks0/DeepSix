'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { GallerySkeleton } from '@/components/ui/loading-skeleton';

interface InSightPhoto {
  id: string;
  title: string;
  description: string;
  date_created: string;
  keywords?: string[];
  center?: string;
  photographer?: string;
  location?: string;
  image_url: string;
  thumbnail_url: string;
  nasa_id: string;
  media_type: string;
  assets: {
    preview?: string;
    small?: string;
    medium?: string;
    large?: string;
    original?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: {
    photos: InSightPhoto[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
  message?: string;
}

export function InSightPhotoGallery() {
  const [photos, setPhotos] = useState<InSightPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<InSightPhoto | null>(null);

  useEffect(() => {
    fetchInSightPhotos();
  }, []);

  const fetchInSightPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/insight-photos?limit=20');
      const data: ApiResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch InSight photos');
      }

      setPhotos(data.data.photos);
    } catch (err) {
      console.error('Error fetching InSight photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
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
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-400 mb-4">Error loading InSight photos</p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchInSightPhotos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-400 mb-2">No InSight photos found</p>
          <p className="text-gray-500 text-sm mb-6">
            We couldn&apos;t find any InSight mission photos at the moment.
          </p>
          <button
            onClick={fetchInSightPhotos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={photo.thumbnail_url}
                alt={photo.title}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                unoptimized // NASA images are external
                onError={(e) => {
                  // Fallback to main image URL if thumbnail fails
                  const target = e.target as HTMLImageElement;
                  if (target.src !== photo.image_url) {
                    target.src = photo.image_url;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-semibold text-white line-clamp-2">{photo.title}</p>
                  {photo.date_created && (
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(photo.date_created).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
                src={
                  selectedPhoto.assets.large ||
                  selectedPhoto.assets.original ||
                  selectedPhoto.image_url
                }
                alt={selectedPhoto.title}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg"
                unoptimized // NASA images are external
                priority // Priority loading for lightbox
                onError={(e) => {
                  // Fallback hierarchy for lightbox images
                  const target = e.target as HTMLImageElement;
                  const fallbacks = [
                    selectedPhoto.assets.medium,
                    selectedPhoto.assets.small,
                    selectedPhoto.image_url,
                    selectedPhoto.thumbnail_url,
                  ].filter(Boolean);

                  const currentIndex = fallbacks.indexOf(target.src);
                  if (currentIndex < fallbacks.length - 1) {
                    target.src = fallbacks[currentIndex + 1]!;
                  }
                }}
              />

              <div className="mt-4 bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{selectedPhoto.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{selectedPhoto.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {selectedPhoto.date_created && (
                    <span>Date: {new Date(selectedPhoto.date_created).toLocaleDateString()}</span>
                  )}
                  {selectedPhoto.photographer && (
                    <span>Photographer: {selectedPhoto.photographer}</span>
                  )}
                  {selectedPhoto.center && <span>Center: {selectedPhoto.center}</span>}
                  {selectedPhoto.location && <span>Location: {selectedPhoto.location}</span>}
                </div>
                {selectedPhoto.keywords && selectedPhoto.keywords.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.keywords.slice(0, 8).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
