'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  image?: string;
}

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'breaking news':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'artemis':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'space station':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'general':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-300 h-full flex flex-col"
    >
      {/* Image Section */}
      {news.image && (
        <div className="relative h-48 bg-gray-800">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
              {news.category}
            </span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category Badge (if no image) */}
        {!news.image && (
          <div className="mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(news.category)}`}>
              {news.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 flex-shrink-0">
          {truncateText(news.title, 80)}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
          {truncateText(news.description, 150)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-400">{news.source}</span>
            <span>•</span>
            <time dateTime={news.pubDate}>
              {formatDate(news.pubDate)}
            </time>
          </div>
          
          <Link
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Read</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}