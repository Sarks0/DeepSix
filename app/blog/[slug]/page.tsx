import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | DeepSix',
    };
  }

  return {
    title: `${post.title} | DeepSix Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get category color
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Breadcrumb Navigation - Full Width */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <nav className="mb-12">
          <ol className="flex items-center gap-2 text-sm font-mono">
            <li>
              <Link
                href="/"
                className="text-gray-500 hover:text-blue-400 transition-colors"
              >
                ~
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li>
              <Link
                href="/blog"
                className="text-gray-500 hover:text-blue-400 transition-colors"
              >
                blog
              </Link>
            </li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-400">{slug}</li>
          </ol>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pb-16">
        {/* Article Header */}
        <header className="mb-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span
              className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${getCategoryColor(
                post.category
              )}`}
            >
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-400 leading-relaxed mb-8 border-l-4 border-blue-500/30 pl-6 py-2">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-mono border-t border-b border-gray-800 py-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-gray-400">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600"
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
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-invert max-w-none

            /* Headings */
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-20
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-800
            prose-h2:bg-gradient-to-r prose-h2:from-blue-400 prose-h2:to-purple-500 prose-h2:bg-clip-text prose-h2:text-transparent
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-gray-200
            prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3 prose-h4:text-gray-300

            /* Paragraphs */
            prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-base

            /* Links */
            prose-a:text-blue-400 prose-a:no-underline prose-a:font-medium prose-a:transition-colors
            hover:prose-a:text-blue-300 hover:prose-a:underline hover:prose-a:decoration-blue-400/50

            /* Strong */
            prose-strong:text-white prose-strong:font-semibold

            /* Code */
            prose-code:text-purple-400 prose-code:bg-gray-900/70 prose-code:px-2 prose-code:py-1
            prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:font-normal
            prose-code:before:content-none prose-code:after:content-none prose-code:border prose-code:border-gray-800

            /* Pre/Code Blocks */
            prose-pre:bg-gray-950/50 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl
            prose-pre:p-6 prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:shadow-xl
            prose-pre:shadow-blue-500/5 prose-pre:backdrop-blur-sm

            /* Blockquotes */
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50
            prose-blockquote:bg-gray-900/30 prose-blockquote:py-4 prose-blockquote:px-6
            prose-blockquote:my-8 prose-blockquote:text-gray-400 prose-blockquote:not-italic
            prose-blockquote:rounded-r-lg prose-blockquote:font-normal

            /* Lists */
            prose-ul:my-6 prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-2 prose-li:leading-relaxed prose-li:text-gray-300
            prose-li:marker:text-blue-400

            /* Images */
            prose-img:rounded-lg prose-img:border prose-img:border-gray-800
            prose-img:my-8 prose-img:shadow-2xl prose-img:shadow-blue-500/10

            /* Horizontal Rules */
            prose-hr:border-gray-800 prose-hr:my-12 prose-hr:border-t-2

            /* Tables */
            prose-table:border-collapse prose-table:w-full prose-table:my-8
            prose-thead:border-b-2 prose-thead:border-gray-700
            prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-300 prose-th:bg-gray-900/50
            prose-td:px-4 prose-td:py-3 prose-td:text-gray-400 prose-td:border-t prose-td:border-gray-800
            prose-tr:transition-colors hover:prose-tr:bg-gray-900/30"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-mono text-sm group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            cd ../blog
          </Link>
        </footer>
      </article>
    </div>
  );
}
