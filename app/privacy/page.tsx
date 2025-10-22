'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  const dataCollection = [
    {
      category: 'Technical Data',
      items: [
        'IP address (for rate limiting)',
        'Browser type and version',
        'Device type and screen size',
        'Page views and navigation patterns',
      ],
      purpose: 'To prevent abuse, optimize performance, and improve user experience',
    },
    {
      category: 'IndexedDB Storage',
      items: [
        'Mars rover photos',
        'Mission data cache',
        'User preferences (if set)',
      ],
      purpose: 'To enable offline functionality and reduce API calls to NASA servers',
    },
    {
      category: 'Analytics Data',
      items: [
        'Page load times',
        'User interactions',
        'Error reports',
      ],
      purpose: 'To monitor application performance and identify issues',
    },
  ];

  const yourRights = [
    {
      title: 'Access Your Data',
      description: 'All data stored locally (IndexedDB) can be viewed using browser developer tools.',
    },
    {
      title: 'Delete Your Data',
      description: 'Clear your browser cache and IndexedDB storage to remove all local data.',
    },
    {
      title: 'Opt-Out of Analytics',
      description: 'Use browser extensions or privacy settings to block analytics scripts.',
    },
    {
      title: 'Request Information',
      description: 'Contact us for questions about data handling practices.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-400">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Introduction */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DeepSix (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you
          use our NASA mission tracking dashboard.
        </p>
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <p className="text-blue-200">
            <strong>Quick Summary:</strong> We collect minimal data, store most information locally
            on your device, and do not sell or share your personal information with third parties.
          </p>
        </div>
      </motion.section>

      {/* Data We Collect */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>
        <div className="space-y-6">
          {dataCollection.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-gray-800"
            >
              <h3 className="text-xl font-semibold text-blue-400 mb-3">{category.category}</h3>
              <ul className="space-y-2 mb-4">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start">
                    <span className="text-green-400 mr-3">•</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400">
                <strong>Purpose:</strong> {category.purpose}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How We Use Data */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
        <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">1.</span>
              <div>
                <span className="font-semibold text-white">Rate Limiting Protection</span>
                <p className="text-gray-400 text-sm mt-1">
                  We use your IP address to prevent abuse and ensure fair access to our service.
                  Rate limits are enforced at 100 requests per minute for general endpoints and
                  30 requests per minute for data-intensive endpoints.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">2.</span>
              <div>
                <span className="font-semibold text-white">Performance Optimization</span>
                <p className="text-gray-400 text-sm mt-1">
                  We analyze page load times and user interactions to identify performance
                  bottlenecks and improve the application.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">3.</span>
              <div>
                <span className="font-semibold text-white">Offline Functionality</span>
                <p className="text-gray-400 text-sm mt-1">
                  Photos and mission data are stored in your browser&apos;s IndexedDB to enable
                  offline access. This data never leaves your device.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-3 mt-1">4.</span>
              <div>
                <span className="font-semibold text-white">Error Monitoring</span>
                <p className="text-gray-400 text-sm mt-1">
                  We collect error reports to identify and fix bugs, ensuring a reliable experience.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </motion.section>

      {/* Local Storage */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Local Data Storage</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DeepSix uses browser-based storage technologies to enhance your experience:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800">
            <h3 className="font-semibold text-blue-400 mb-2">IndexedDB</h3>
            <p className="text-sm text-gray-400 mb-2">
              Stores Mars rover photos (up to 200+ images) and mission data for offline access.
            </p>
            <p className="text-xs text-gray-500">
              Data retention: 24 hours (automatically cleaned)
            </p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800">
            <h3 className="font-semibold text-blue-400 mb-2">LocalStorage</h3>
            <p className="text-sm text-gray-400 mb-2">
              Stores user preferences and cached mission metadata.
            </p>
            <p className="text-xs text-gray-500">
              Data retention: Until manually cleared
            </p>
          </div>
        </div>
        <div className="mt-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <p className="text-yellow-200 text-sm">
            <strong>Note:</strong> All local storage data remains on your device and is never
            transmitted to our servers or third parties.
          </p>
        </div>
      </motion.section>

      {/* Third-Party Services */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DeepSix integrates with the following third-party services:
        </p>
        <div className="space-y-4">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800">
            <h3 className="font-semibold text-white mb-2">NASA APIs</h3>
            <p className="text-sm text-gray-400 mb-2">
              We fetch data from NASA&apos;s public APIs including Mars Rover Photos, Deep Space
              Network, and JPL Horizons. NASA may log requests according to their own privacy policy.
            </p>
            <a
              href="https://www.nasa.gov/about/highlights/HP_Privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              NASA Privacy Policy →
            </a>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800">
            <h3 className="font-semibold text-white mb-2">Vercel Analytics</h3>
            <p className="text-sm text-gray-400 mb-2">
              We use Vercel Analytics for performance monitoring. Vercel collects anonymized
              page view data and performance metrics.
            </p>
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Vercel Privacy Policy →
            </a>
          </div>
        </div>
      </motion.section>

      {/* Data Security */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Data Security</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We implement industry-standard security measures to protect your information:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">✓</span>
              <h3 className="font-semibold text-white">HTTPS Encryption</h3>
            </div>
            <p className="text-sm text-gray-400">
              All data transmission is encrypted using TLS/SSL
            </p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">✓</span>
              <h3 className="font-semibold text-white">Security Headers</h3>
            </div>
            <p className="text-sm text-gray-400">
              CSP, HSTS, X-Frame-Options, and other protective headers
            </p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">✓</span>
              <h3 className="font-semibold text-white">Rate Limiting</h3>
            </div>
            <p className="text-sm text-gray-400">
              Automated protection against abuse and DDoS attacks
            </p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">✓</span>
              <h3 className="font-semibold text-white">API Key Protection</h3>
            </div>
            <p className="text-sm text-gray-400">
              Server-side API key storage with validation and monitoring
            </p>
          </div>
        </div>
      </motion.section>

      {/* Your Rights */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Your Privacy Rights</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {yourRights.map((right, index) => (
            <motion.div
              key={right.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800"
            >
              <h3 className="font-semibold text-blue-400 mb-2">{right.title}</h3>
              <p className="text-sm text-gray-400">{right.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Cookies */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DeepSix uses minimal tracking technologies:
        </p>
        <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-6">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-gray-400 mr-3">•</span>
              <div>
                <span className="text-white">Essential cookies for rate limiting and security</span>
                <p className="text-sm text-gray-500 mt-1">(Required for functionality)</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-3">•</span>
              <div>
                <span className="text-white">Analytics cookies from Vercel</span>
                <p className="text-sm text-gray-500 mt-1">(Can be blocked using browser settings)</p>
              </div>
            </li>
          </ul>
          <p className="text-sm text-gray-400 mt-4">
            We do not use advertising cookies or third-party tracking pixels.
          </p>
        </div>
      </motion.section>

      {/* Children's Privacy */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Children&apos;s Privacy</h2>
        <p className="text-gray-300 leading-relaxed">
          DeepSix is designed for general audiences and does not knowingly collect personal
          information from children under 13. The service can be used by educational institutions
          and students under appropriate supervision. No personal information is required to
          access or use DeepSix.
        </p>
      </motion.section>

      {/* Changes to Policy */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may update this Privacy Policy periodically to reflect changes in our practices or
          legal requirements. The &quot;Last Updated&quot; date at the top of this page indicates
          when the policy was last revised.
        </p>
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
          <p className="text-blue-200 text-sm">
            Significant changes will be communicated through our GitHub repository or a notice
            on the website.
          </p>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          If you have questions or concerns about this Privacy Policy or our data practices,
          please contact us:
        </p>
        <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Sarks0/DeepSix/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Report Privacy Concern
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Project Repository:
            <a
              href="https://github.com/Sarks0/DeepSix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-1 underline"
            >
              github.com/Sarks0/DeepSix
            </a>
          </p>
        </div>
      </motion.section>

      {/* Footer Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center py-8 border-t border-gray-800"
      >
        <p className="text-gray-400 mb-4">Learn more about DeepSix</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/about"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors text-sm"
          >
            About Us
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
