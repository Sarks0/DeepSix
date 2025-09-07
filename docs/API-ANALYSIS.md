# NASA API Analysis for Stellar Navigator

## Available APIs ✅

### 1. **Mars Rover Photos API** ✅

- **Status**: Fully Available
- **Endpoints**:
  - `/rovers/{rover}/photos`
  - `/rovers/{rover}/latest_photos`
  - `/manifests/{rover}`
- **Data**: Photos from Perseverance, Curiosity, Opportunity, Spirit
- **Use Case**: Perfect for Mars mission tracking and latest photos

### 2. **InSight Weather API** ⚠️

- **Status**: Limited/Deprecated
- **Issues**: InSight lander ceased operations in Dec 2022
- **Alternative**: Use historical data or Mars rover environmental data

### 3. **EPIC Earth Imagery** ✅

- **Status**: Available
- **Data**: Earth images from DSCOVR satellite
- **Use Case**: Beautiful Earth imagery for context

### 4. **APOD (Astronomy Picture of the Day)** ✅

- **Status**: Available
- **Use Case**: Daily space imagery for engagement

## Missing Critical Data ❌

### Deep Space Mission Tracking

NASA's public APIs **DO NOT** provide:

- ❌ Voyager 1 & 2 real-time positions
- ❌ Parker Solar Probe telemetry
- ❌ New Horizons tracking data
- ❌ Real-time spacecraft distances from Earth
- ❌ Communication delay calculations
- ❌ Deep Space Network status

## Solution: JPL Horizons API 🚀

### What It Provides

- ✅ Ephemeris data for ALL spacecraft
- ✅ Position vectors (X, Y, Z coordinates)
- ✅ Velocity and acceleration data
- ✅ Distance from Earth/Sun
- ✅ Historical and predicted positions

### Spacecraft IDs

```
Voyager 1: -31
Voyager 2: -32
New Horizons: -98
Parker Solar Probe: -96
```

### Access Methods

1. **REST API**: `https://ssd.jpl.nasa.gov/api/horizons.api`
2. **Python Libraries**: astroquery.jplhorizons, callhorizons
3. **Direct telnet**: horizons.jpl.nasa.gov:6775

## Implementation Strategy

### Phase 1: Hybrid Approach

1. **Mars Data**: Use NASA Mars Rover API (real photos, manifest)
2. **Spacecraft Positions**: Use JPL Horizons API
3. **Communication Delays**: Calculate from JPL distance data
4. **Mission Status**: Combine NASA news feeds + static data

### Phase 2: Data Pipeline

```javascript
// Example: Fetch Voyager 1 position
const voyagerPosition = await fetch(
  'https://ssd.jpl.nasa.gov/api/horizons.api?' +
    'format=json&COMMAND=-31&OBJ_DATA=YES&' +
    'START_TIME=2024-01-01&STOP_TIME=2024-01-02'
);

// Calculate communication delay
const distanceKm = parseFloat(data.distance_from_earth);
const lightSpeedKmPerSec = 299792;
const delaySeconds = distanceKm / lightSpeedKmPerSec;
```

### Phase 3: Caching Strategy

- Mars photos: 30 min cache
- Spacecraft positions: 1 hour cache (they don't change quickly)
- Communication delays: Calculate client-side from cached positions

## Alternative Data Sources

1. **NASA RSS Feeds**: Mission updates and news
2. **Space-Track.org**: Satellite tracking data
3. **ESA APIs**: European missions data
4. **Static JSON**: Pre-calculated orbital mechanics

## Recommendations

### Must Have

1. ✅ Implement JPL Horizons integration immediately
2. ✅ Build communication delay calculator
3. ✅ Use Mars Rover API for Mars missions

### Nice to Have

1. Consider NASA Image Library for mission media
2. Add APOD for daily engagement
3. Integrate news feeds for updates

### Development Priority

1. **Week 1**: JPL Horizons integration
2. **Week 2**: Mars Rover API + photos
3. **Week 3**: Communication delay calculator
4. **Week 4**: Real-time updates via polling

## Conclusion

While NASA's public APIs don't provide deep space tracking data, the JPL Horizons API fills this gap perfectly. Combined with Mars Rover APIs, we can deliver all planned features for the Stellar Navigator dashboard.
