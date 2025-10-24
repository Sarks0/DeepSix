'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get category color based on category name
  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('analysis') || categoryLower.includes('deep space')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else if (categoryLower.includes('mission') || categoryLower.includes('exploration')) {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    } else if (categoryLower.includes('technology') || categoryLower.includes('engineering')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    } else if (categoryLower.includes('news') || categoryLower.includes('update')) {
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    } else {
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="h-full bg-gray-800/50 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium uppercase border ${getCategoryColor(
                post.category
              )}`}
            >
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
            {post.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-4">
              <span className="font-mono">{formatDate(post.date)}</span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {post.readTime}
              </span>
            </div>
            <span className="text-gray-400">{post.author}</span>
          </div>

          {/* Hover Arrow Indicator */}
          <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read more
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
