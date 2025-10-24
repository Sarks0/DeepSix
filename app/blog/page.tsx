import { Metadata } from 'next';
import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';

export const metadata: Metadata = {
  title: 'Blog | DeepSix',
  description: 'Deep space analysis, mission insights, and space exploration commentary from the DeepSix team.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-balance">
            Deep Space Analysis
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
            Mission insights, technical analysis, and space exploration commentary from the DeepSix team.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-gray-500 text-sm font-medium mr-2">Categories:</span>
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 rounded-md text-xs font-medium bg-gray-800/50 text-gray-400 border border-gray-700"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-12 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500">
              Check back soon for deep space analysis and mission insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
