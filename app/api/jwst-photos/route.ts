import { NextRequest, NextResponse } from 'next/server';

interface JWSTPhoto {
  id: string;
  title: string;
  description: string;
  img_src: string;
  date: string;
  keywords: string[];
  center: string;
}

// Curated collection of JWST science images from ESA Webb CDN - all images verified accessible
const JWST_SCIENCE_IMAGES: JWSTPhoto[] = [
  {
    id: 'carina-nebula-2022',
    title: 'Carina Nebula - Cosmic Cliffs',
    description: 'This landscape of "mountains" and "valleys" speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2205a.jpg',
    date: '2022-07-12T00:00:00Z',
    keywords: ['Carina Nebula', 'Star Formation', 'NGC 3324', 'Cosmic Cliffs', 'Infrared'],
    center: 'NASA/ESA'
  },
  {
    id: 'southern-ring-nebula-2022',
    title: 'Southern Ring Nebula',
    description: 'The bright star at the center of NGC 3132, while prominent when viewed with Webb\'s Near-Infrared Camera (NIRCam), plays a supporting role in sculpting the surrounding nebula.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2207a.jpg',
    date: '2022-07-12T00:00:00Z',
    keywords: ['Southern Ring Nebula', 'NGC 3132', 'Planetary Nebula', 'NIRCam', 'White Dwarf'],
    center: 'NASA/ESA'
  },
  {
    id: 'stephans-quintet-2022',
    title: 'Stephan\'s Quintet',
    description: 'Stephan\'s Quintet, a visual grouping of five galaxies, is best known for being prominently featured in the holiday classic film, "It\'s a Wonderful Life."',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2208a.jpg',
    date: '2022-07-12T00:00:00Z',
    keywords: ['Stephans Quintet', 'Galaxy Group', 'Interacting Galaxies', 'NGC 7317', 'NGC 7318'],
    center: 'NASA/ESA'
  },
  {
    id: 'pillars-of-creation-2022',
    title: 'Pillars of Creation',
    description: 'Webb\'s new view of the Pillars of Creation, which were first made famous by the Hubble Space Telescope in 1995, will help researchers revise their models of star formation.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/pillarsofcreation_composite.jpg',
    date: '2022-10-19T00:00:00Z',
    keywords: ['Pillars of Creation', 'Eagle Nebula', 'M16', 'Star Formation', 'Stellar Nursery'],
    center: 'NASA/ESA'
  },
  {
    id: 'carina-nebula-jets-2022',
    title: 'Carina Nebula Jets',
    description: 'These powerful jets and outflows from young stars in the Carina Nebula are captured in unprecedented detail by Webb\'s instruments, revealing the complex physics of star formation.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/carinanebula3.jpg',
    date: '2022-07-12T00:00:00Z',
    keywords: ['Carina Nebula', 'Stellar Jets', 'Outflows', 'Star Formation', 'Young Stars'],
    center: 'NASA/ESA'
  },
  {
    id: 'jupiter-auroras-2022',
    title: 'Jupiter\'s Auroras',
    description: 'This image of Jupiter from Webb\'s Near Infrared Camera (NIRCam) shows stunning details of the majestic planet in infrared light, including its spectacular auroras.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/jupiter-auroras1.jpg',
    date: '2022-08-22T00:00:00Z',
    keywords: ['Jupiter', 'Auroras', 'Great Red Spot', 'Moons', 'Solar System'],
    center: 'NASA/ESA'
  },
  {
    id: 'most-distant-galaxy-2023',
    title: 'Most Distant Galaxy (JADES)',
    description: 'One of the most distant galaxies ever observed, captured by the JWST Advanced Deep Extragalactic Survey (JADES), showing the universe as it was in its earliest epochs.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/jades4.jpg',
    date: '2023-11-14T00:00:00Z',
    keywords: ['JADES', 'Distant Galaxy', 'Early Universe', 'Cosmology', 'Deep Field'],
    center: 'NASA/ESA'
  },
  {
    id: 'cartwheel-galaxy-2022',
    title: 'Cartwheel Galaxy',
    description: 'This galaxy formed as the result of a high-speed collision that occurred about 400 million years ago. The Cartwheel is composed of two rings, a bright inner ring and a colorful outer ring.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2211a.jpg',
    date: '2022-08-02T00:00:00Z',
    keywords: ['Cartwheel Galaxy', 'Ring Galaxy', 'Collision', 'Star Formation', 'ESO 350-40'],
    center: 'NASA/ESA'
  },
  {
    id: 'tarantula-nebula-2022',
    title: 'Tarantula Nebula',
    description: 'At only 161,000 light-years away in the Large Magellanic Cloud galaxy, the Tarantula Nebula is the largest and brightest star-forming region in the Local Group.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2212a.jpg',
    date: '2022-09-06T00:00:00Z',
    keywords: ['Tarantula Nebula', 'NGC 2070', 'Star Formation', 'Large Magellanic Cloud', 'Local Group'],
    center: 'NASA/ESA'
  },
  {
    id: 'neptune-2022',
    title: 'Neptune and its Rings',
    description: 'Webb\'s Near-Infrared Camera (NIRCam) image of Neptune shows the planet\'s rings in full glory. Neptune has fascinated researchers since its discovery in 1846.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2210a.jpg',
    date: '2022-09-21T00:00:00Z',
    keywords: ['Neptune', 'Rings', 'Ice Giant', 'Solar System', 'Triton'],
    center: 'NASA/ESA'
  },
  {
    id: 'phantom-galaxy-2023',
    title: 'Phantom Galaxy (M74)',
    description: 'The Phantom Galaxy is around 32 million light-years away from Earth in the constellation Pisces, and lies almost face-on to Earth.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2214a.jpg',
    date: '2023-01-30T00:00:00Z',
    keywords: ['Phantom Galaxy', 'M74', 'Spiral Galaxy', 'Pisces', 'Grand Design'],
    center: 'NASA/ESA'
  },
  {
    id: 'wolf-rayet-star-2023',
    title: 'Wolf-Rayet Star WR 124',
    description: 'The rare Wolf-Rayet star WR 124 is one of the most luminous, massive, and briefly-detectable stars known. This particular star is 15,000 light-years away in the constellation Sagittarius.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2308a.jpg',
    date: '2023-03-14T00:00:00Z',
    keywords: ['Wolf-Rayet Star', 'WR 124', 'Stellar Evolution', 'Sagittarius', 'Massive Star'],
    center: 'NASA/ESA'
  },
  {
    id: 'rho-ophiuchi-2023',
    title: 'Rho Ophiuchi Cloud Complex',
    description: 'Webb\'s image of the Rho Ophiuchi cloud complex is the telescope\'s closest star-forming region to us. This cosmic nursery is home to approximately 50 young stars.',
    img_src: 'https://cdn.esawebb.org/archives/images/screen/weic2316a.jpg',
    date: '2023-07-12T00:00:00Z',
    keywords: ['Rho Ophiuchi', 'Star Formation', 'Young Stars', 'Stellar Nursery', 'Brown Dwarfs'],
    center: 'NASA/ESA'
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const latest = searchParams.get('latest') === 'true';
    
    // Use our curated collection of high-quality JWST science images
    let photos = [...JWST_SCIENCE_IMAGES];
    
    if (latest) {
      // Sort by date (most recent first) for latest images
      photos = photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      // Shuffle for variety on regular requests
      photos = shuffleArray(photos);
    }

    // Limit the results
    const limitedPhotos = photos.slice(0, Math.min(limit, photos.length));

    return NextResponse.json({
      photos: limitedPhotos,
      total: limitedPhotos.length,
      metadata: {
        source: 'Curated JWST Science Images',
        query_limit: limit,
        total_available: JWST_SCIENCE_IMAGES.length,
        collection_type: latest ? 'latest_first' : 'randomized'
      }
    });

  } catch (error) {
    console.error('Error fetching JWST photos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch James Webb Space Telescope images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}