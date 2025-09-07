# DeepSix - Navigate the Deepest Frontiers

A real-time dashboard for tracking humanity's furthest reach into the cosmos. DeepSix provides live mission data, 3D visualization, and comprehensive tracking of NASA's deep space missions.

Note: This is still a work in progress. I have other ideas to implement and will add them when I can. This is not a full-time project but more of a hobby, so there is more to come with the data that exists through NASA and other agencies.

## Features

- **Real-Time Mission Tracking**: Live data from NASA APIs for Mars rovers, Voyager probes, and other deep space missions
- **3D Solar System Visualization**: Interactive Three.js-powered view of spacecraft positions
- **Mars Rover Photo Galleries**: Latest images from Perseverance and Curiosity with automatic rotation
- **Deep Space Network Monitoring**: Real-time communication status with spacecraft
- **Mission Status Dashboard**: Comprehensive mission details, achievements, and telemetry data

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (optional, for containerized deployment)
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

### Docker Deployment

Build and run with Docker:

```bash
docker build -t deepsix .
docker run -d -p 3000:3000 --env-file .env.local deepsix
```

Or use Docker Compose:

```bash
docker-compose up -d
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Three.js/React Three Fiber** - 3D visualization
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Animations
- **NASA APIs** - Real mission data

## Mission Coverage

- Mars Perseverance Rover
- Mars Curiosity Rover
- Mars InSight Lander (Historical)
- Voyager 1 & 2
- Parker Solar Probe
- New Horizons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache 2.0

## Acknowledgments

- NASA for providing public APIs and mission data
- The open-source community for the amazing tools and libraries

---

Built with passion for space exploration and the desire to bring the cosmos closer to everyone.
