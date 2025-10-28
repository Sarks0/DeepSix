import { Metadata } from 'next';
import { InterstellarObjectTracker } from '@/components/interstellar/InterstellarObjectTracker';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Interstellar Visitors - Tracking Objects from Beyond | DeepSix',
  description: 'Real-time tracking of interstellar objects passing through our Solar System. Monitor 3I/ATLAS, 2I/Borisov, and 1I/\'Oumuamua with live data from NASA JPL Horizons.',
};

// Revalidate this page every 24 hours to get updated information
export const revalidate = 86400; // 24 hours in seconds

export default function InterstellarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black px-4 md:px-6 lg:px-8 py-12">
      <div className="w-full mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Interstellar <span className="text-purple-400">Visitors</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Tracking objects from beyond our Solar System as they pass through on their cosmic journey
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center px-4 py-2 bg-green-900/20 border border-green-700/50 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-gray-300">Active Visitor</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              <span className="text-gray-300">NASA Observations</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-gray-300">3 Confirmed Objects</span>
            </div>
          </div>
        </div>

        {/* Beginner Guide */}
        <div className="mb-12 p-6 bg-purple-900/10 border border-purple-800/30 rounded-lg">
          <h3 className="text-lg font-bold text-purple-300 mb-3">What Are Interstellar Objects?</h3>
          <p className="text-sm text-purple-200/80 mb-4">
            Interstellar objects are celestial bodies that originated from beyond our Solar System.
            They travel through interstellar space and occasionally pass through our cosmic neighborhood on hyperbolic trajectories,
            meaning they will never return.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-200/80">
            <div>
              <p className="font-semibold mb-1 text-purple-400">Origin</p>
              <p>These objects come from other star systems, providing a unique opportunity to study material from beyond our Solar System.</p>
            </div>
            <div>
              <p className="font-semibold mb-1 text-purple-400">Trajectory</p>
              <p>They follow hyperbolic orbits (eccentricity &gt; 1.0), entering our Solar System once and then leaving forever.</p>
            </div>
            <div>
              <p className="font-semibold mb-1 text-purple-400">Rarity</p>
              <p>Only 3 confirmed interstellar objects have been detected in human history, making each one incredibly special.</p>
            </div>
          </div>
        </div>

        {/* Current Active Visitor */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Current Visitor: 3I/ATLAS</h2>
            <p className="text-gray-400">
              Live tracking data from NASA JPL Horizons System
            </p>
          </div>
          <InterstellarObjectTracker objectId="3I" />
        </section>

        {/* Historical Interstellar Visitors */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Historical Visitors</h2>
            <p className="text-gray-400">
              Previous interstellar objects detected passing through our Solar System
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2I/Borisov */}
            <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/20 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">2I/Borisov</h3>
                  <p className="text-purple-300">C/2019 Q4</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/50">
                  Historical
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2">Interstellar Comet</span>
                </div>
                <div>
                  <span className="text-gray-400">Discovered:</span>
                  <span className="text-white ml-2">August 2019</span>
                </div>
                <div>
                  <span className="text-gray-400">Significance:</span>
                  <span className="text-white ml-2">First confirmed interstellar comet</span>
                </div>
                <div>
                  <span className="text-gray-400">Closest Approach:</span>
                  <span className="text-white ml-2">December 2019 (2.0 AU from Sun)</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800/30 rounded text-xs text-purple-200/80">
                2I/Borisov was the first interstellar comet ever confirmed. Observations revealed it had a composition
                similar to comets from our own Solar System, providing insights into planet formation in other star systems.
              </div>
            </div>

            {/* 1I/'Oumuamua */}
            <div className="bg-gradient-to-br from-gray-900/50 to-red-900/20 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">1I/&apos;Oumuamua</h3>
                  <p className="text-red-300">A/2017 U1</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/50">
                  Historical
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2">Interstellar Object</span>
                </div>
                <div>
                  <span className="text-gray-400">Discovered:</span>
                  <span className="text-white ml-2">October 2017</span>
                </div>
                <div>
                  <span className="text-gray-400">Significance:</span>
                  <span className="text-white ml-2">First confirmed interstellar object</span>
                </div>
                <div>
                  <span className="text-gray-400">Closest Approach:</span>
                  <span className="text-white ml-2">September 2017 (0.25 AU from Sun)</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded text-xs text-red-200/80">
                &apos;Oumuamua (Hawaiian for &quot;scout&quot; or &quot;messenger&quot;) was the first interstellar object
                ever detected. Its unusual elongated shape and unexplained acceleration sparked intense scientific debate
                and captured global attention.
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-purple-400 text-sm font-medium">
              Compare All Interstellar Visitors (Coming Soon)
            </div>
          </div>
        </section>

        {/* NASA Observation Campaign */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg border border-blue-800/50 p-8">
            <h2 className="text-3xl font-bold text-white mb-4">NASA Observation Campaign</h2>
            <p className="text-gray-300 mb-6">
              NASA coordinates observations of interstellar visitors using multiple space telescopes and planetary missions
              to gather as much data as possible during their brief passage through our Solar System.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Hubble</div>
                <div className="text-xs text-gray-400">Space Telescope</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">JWST</div>
                <div className="text-xs text-gray-400">James Webb</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Parker</div>
                <div className="text-xs text-gray-400">Solar Probe</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">Mars</div>
                <div className="text-xs text-gray-400">Rovers & Orbiters</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <h4 className="font-bold text-blue-300 mb-2">Space Telescopes</h4>
                <p className="text-blue-200/80">
                  Hubble and JWST capture high-resolution imagery and spectroscopy to analyze composition and structure.
                </p>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <h4 className="font-bold text-blue-300 mb-2">Planetary Missions</h4>
                <p className="text-blue-200/80">
                  Mars rovers and orbiters provide unique observation angles from different points in the Solar System.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Missions Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg border border-purple-800/50 p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Related DeepSix Missions</h2>
            <p className="text-gray-300 mb-6">
              Explore other deep space missions and small body tracking features on DeepSix
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Asteroids */}
              <Link
                href="/asteroids"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <h3 className="text-xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300">Asteroid Tracking</h3>
                <p className="text-sm text-gray-400 mb-3">Near-Earth asteroids and planetary defense monitoring</p>
                <div className="text-xs text-gray-500">
                  Monitor close approaches, impact risks, and mission-accessible targets
                </div>
              </Link>

              {/* Missions */}
              <Link
                href="/missions"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">Active Missions</h3>
                <p className="text-sm text-gray-400 mb-3">NASA spacecraft exploring the Solar System</p>
                <div className="text-xs text-gray-500">
                  Track real-time positions of Voyager, New Horizons, and more
                </div>
              </Link>

              {/* Deep Space Network */}
              <Link
                href="/dsn"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <h3 className="text-xl font-bold text-blue-400 mb-2 group-hover:text-blue-300">Deep Space Network</h3>
                <p className="text-sm text-gray-400 mb-3">Live communications with deep space missions</p>
                <div className="text-xs text-gray-500">
                  Monitor real-time antenna connections and data rates
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Educational Context */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/50 backdrop-blur-sm rounded-lg border border-purple-800/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Interstellar Objects Matter</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-purple-300 mb-2">Scientific Significance</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>First opportunity to study material from other star systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Insights into planet formation beyond our Solar System</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Comparison with our own Solar System&apos;s composition</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Understanding galactic material exchange processes</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-purple-300 mb-2">Observation Challenges</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Brief observation window as objects pass through quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Extremely faint and difficult to detect from Earth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Requires coordination of multiple telescopes and missions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>One-time opportunity - they never return</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg text-sm text-purple-200/80">
              <p className="font-bold mb-2">Future Detection</p>
              <p>
                As telescope technology improves, astronomers expect to detect more interstellar visitors.
                The upcoming Vera C. Rubin Observatory is predicted to discover one interstellar object per year once operational.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
