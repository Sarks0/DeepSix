# DeepSix - Navigate the Deepest Frontiers

A real-time dashboard for tracking humanity's furthest reach into the cosmos. DeepSix provides live mission data, comprehensive tracking of NASA's deep space missions, and real-time Mars sol cycle monitoring.

**Note:** This is still a work in progress. I have other ideas to implement and will add them when I can. This is not a full-time project but more of a hobby, so there is more to come with the data that exists through NASA and other agencies.

## Features

- **Mars Sol Tracking**: Real-time Martian sol (day) tracking for active rovers with mission duration, Mars Local Solar Time, and seasonal information
- **Real-Time Mission Tracking**: Live data from NASA APIs for Mars rovers, Voyager probes, and other deep space missions
- **Mars Rover Photo Galleries**: Latest images from Perseverance and Curiosity with automatic rotation and caching
- **Communication Delay Calculator**: Real-time calculation of signal delays between Earth and spacecraft
- **Mission Status Dashboard**: Comprehensive mission details, achievements, and telemetry data
- **Offline Support**: Cached images and data available offline using IndexedDB

## Getting Started

### Prerequisites

- Node.js 20+
- NASA API Key (get one free at [api.nasa.gov](https://api.nasa.gov))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Sarks0/DeepSix.git
cd DeepSix
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local and add your NASA API key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Deployment

The project is optimized for deployment on Vercel:

```bash
npm run build
npm run start
```

Or deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sarks0/DeepSix)

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **IndexedDB** - Client-side data caching
- **NASA APIs** - Real mission data
- **Vercel** - Deployment platform

## Mission Coverage

### Active Missions
- Mars Perseverance Rover (Sol tracking enabled)
- Mars Curiosity Rover (Sol tracking enabled)
- Voyager 1 & 2
- Parker Solar Probe

### Historical Missions
- Mars InSight Lander
- Mars Opportunity Rover
- Mars Spirit Rover
- New Horizons

## Key Features in Detail

### Mars Sol Tracking
- Current sol (Martian day) for each rover
- Mission duration in both Earth days and sols
- Mars Local Solar Time (MLST)
- Seasonal information
- Sol progress indicators
- Milestone celebrations (100 sols, 1000 sols, etc.)

### Photo Gallery System
- Automatic photo rotation every 15 seconds
- Manual refresh capability
- Intelligent caching with IndexedDB
- Variety algorithm for diverse camera angles
- Full metadata display

### Communication Delays
- Real-time calculation for Mars
- Parker Solar Probe distance tracking
- New Horizons deep space communication
- Visual delay indicators

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0

## Acknowledgments

- NASA for providing public APIs and mission data
- The open-source community for the amazing tools and libraries

---

Built with passion for space exploration and the desire to bring the cosmos closer to everyone.