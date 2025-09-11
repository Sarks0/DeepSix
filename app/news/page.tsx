'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsSkeleton } from '@/components/ui/loading-skeleton';

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

interface NewsResponse {
  news: NewsItem[];
  total: number;
  categories: string[];
  metadata: {
    sources: string[];
    fetched_at: string;
    feeds_count: number;
    cache_duration: string;
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [metadata, setMetadata] = useState<NewsResponse['metadata'] | null>(null);

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

  const fetchNews = useCallback(async (category: string = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '50'
      });
      
      if (category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`/api/news?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch news (${response.status})`);
      }

      const data: NewsResponse = await response.json();
      
      setNews(data.news);
      setCategories(data.categories);
      setMetadata(data.metadata);
      
      console.log(`Fetched ${data.news.length} news items from ${data.metadata.feeds_count} feeds`);

    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchNews(category);
  };

  const handleRefresh = () => {
    fetchNews(selectedCategory);
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  if (loading && news.length === 0) {
    return (
      <div className=\"container mx-auto px-4 py-8 max-w-6xl\">
        <NewsSkeleton />
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8 max-w-6xl\">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className=\"mb-8\"
      >
        <h1 className=\"text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent\">
          Space News
        </h1>
        <p className=\"text-xl text-gray-400 mb-6\">
          Latest updates from NASA and space exploration missions
        </p>

        {/* Status Bar */}
        <div className=\"flex flex-wrap justify-between items-center gap-4 mb-6\">
          <div className=\"flex items-center gap-4 text-sm text-gray-400\">
            <span>Showing {filteredNews.length} articles</span>
            {metadata && (
              <span>Updated: {new Date(metadata.fetched_at).toLocaleTimeString()}</span>
            )}
            {!isOnline && (
              <span className=\"text-yellow-400\">📡 Offline - Using cached news</span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className=\"px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm transition-colors disabled:opacity-50\"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Category Filters */}
        <div className=\"flex flex-wrap gap-2 mb-6\">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${\n              selectedCategory === 'all'\n                ? 'bg-blue-500 text-white'\n                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'\n            }`}
          >
            All News
          </button>
          {categories.map((category) => (\n            <button\n              key={category}\n              onClick={() => handleCategoryChange(category)}\n              className={`px-4 py-2 rounded-lg text-sm transition-colors ${\n                selectedCategory === category\n                  ? 'bg-blue-500 text-white'\n                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'\n              }`}\n            >\n              {category}\n            </button>\n          ))}\n        </div>\n      </motion.div>\n\n      {/* Error State */}\n      {error && news.length === 0 && (\n        <motion.div \n          initial={{ opacity: 0 }} \n          animate={{ opacity: 1 }}\n          className=\"rounded-xl bg-red-900/10 border border-red-500/20 p-6 text-center\"\n        >\n          <p className=\"text-red-400 mb-4\">Error loading news: {error}</p>\n          <button\n            onClick={handleRefresh}\n            className=\"px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg\"\n          >\n            Try Again\n          </button>\n        </motion.div>\n      )}\n\n      {/* News Grid */}\n      {filteredNews.length > 0 && (\n        <motion.div \n          initial={{ opacity: 0 }}\n          animate={{ opacity: 1 }}\n          className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\"\n        >\n          <AnimatePresence mode=\"wait\">\n            {filteredNews.map((item, index) => (\n              <motion.div\n                key={item.id}\n                initial={{ opacity: 0, y: 20 }}\n                animate={{ opacity: 1, y: 0 }}\n                transition={{ duration: 0.3, delay: index * 0.05 }}\n              >\n                <NewsCard news={item} />\n              </motion.div>\n            ))}\n          </AnimatePresence>\n        </motion.div>\n      )}\n\n      {/* Empty State */}\n      {filteredNews.length === 0 && !loading && !error && (\n        <motion.div \n          initial={{ opacity: 0 }} \n          animate={{ opacity: 1 }}\n          className=\"text-center py-12\"\n        >\n          <p className=\"text-gray-400 text-lg mb-4\">No news articles found</p>\n          <p className=\"text-gray-500 text-sm mb-6\">\n            Try selecting a different category or refreshing the page\n          </p>\n          <button\n            onClick={handleRefresh}\n            className=\"px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors\"\n          >\n            Refresh News\n          </button>\n        </motion.div>\n      )}\n\n      {/* Loading More Indicator */}\n      {loading && news.length > 0 && (\n        <motion.div \n          initial={{ opacity: 0 }}\n          animate={{ opacity: 1 }}\n          className=\"text-center py-8\"\n        >\n          <div className=\"inline-flex items-center gap-2 text-gray-400\">\n            <div className=\"w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin\" />\n            <span>Loading more news...</span>\n          </div>\n        </motion.div>\n      )}\n\n      {/* Footer Info */}\n      {metadata && (\n        <motion.div \n          initial={{ opacity: 0 }}\n          animate={{ opacity: 1 }}\n          className=\"mt-12 p-4 bg-gray-900/50 rounded-lg border border-gray-800\"\n        >\n          <p className=\"text-gray-400 text-sm text-center\">\n            News aggregated from {metadata.sources.join(', ')} • \n            Cache duration: {metadata.cache_duration} • \n            Sources: {metadata.feeds_count} RSS feeds\n          </p>\n        </motion.div>\n      )}\n    </div>\n  );\n}"