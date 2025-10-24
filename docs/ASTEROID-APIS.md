# NASA Asteroid APIs - Comprehensive Research

**Date:** October 24, 2025
**Branch:** `feature/asteroids-neows`
**Purpose:** Implementation of asteroid tracking features for DeepSix

---

## Overview

This document provides comprehensive research on available NASA asteroid tracking APIs for implementing a dedicated `/asteroids` page in DeepSix. The goal is to create a unique, engaging asteroid tracking experience that complements our existing mission tracking (Lucy, Psyche, OSIRIS-APEX).

---

## Available NASA APIs

### 1. Asteroids NeoWs API
**Status:** Primary implementation target
**Endpoint:** `https://api.nasa.gov/neo/rest/v1/`
**Authentication:** NASA API Key (already configured)

**Capabilities:**
- Browse overall asteroid dataset
- Get asteroids based on closest approach date to Earth
- Lookup specific asteroid by NASA JPL small body ID
- Filter by date range (start_date, end_date)

**Data Provided:**
- Asteroid name and designation
- Absolute magnitude
- Estimated diameter (min/max in km, meters, miles, feet)
- Close approach date and time
- Relative velocity (km/s, km/h, mph)
- Miss distance (astronomical, lunar, kilometers, miles)
- Orbiting body (usually Earth)
- `is_potentially_hazardous_asteroid` boolean flag

**Rate Limits:**
- Standard NASA API rate limit: 1,000 requests/hour
- Requires API key in query parameter or header

**Example Query:**
```
GET https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-10-24&end_date=2025-10-31&api_key=YOUR_KEY
```

**Use Cases for DeepSix:**
- "Close Approaches This Week" section
- Weekly asteroid feed on dashboard
- Search by specific date ranges

---

### 2. NASA Sentry API (Earth Impact Monitoring)
**Status:** HIGH PRIORITY - Unique differentiator
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sentry.api`
**Authentication:** None required (public API)

**System Overview:**
- Sentry-II system uses Impact Pseudo-Observation (IOBS) method
- Monitors ~1,900 Near-Earth Asteroids for potential Earth impacts
- Performs long-term analyses over the next 100 years
- Continuously updated as new observations are made

**Four Query Modes:**

#### Mode S - Summary Data (All Objects)
Returns summary data for all objects currently on Sentry monitoring list.
```
GET https://ssd-api.jpl.nasa.gov/sentry.api
```

#### Mode O - Specific Object Data
Returns detailed data for a specific asteroid being monitored.
```
GET https://ssd-api.jpl.nasa.gov/sentry.api?des=DESIGNATION
```

#### Mode V - Virtual Impactors
Returns data for all available Virtual Impactors (possible impact scenarios).

#### Mode R - Removed Objects
Returns data for objects that have been removed from Sentry monitoring (risk eliminated).

**Data Provided:**
- Object designation and name
- **Impact probability** (cumulative and per encounter)
- **Palermo Scale** rating (logarithmic hazard scale)
- **Torino Scale** (0-10 public communication scale)
- Potential impact dates (over next century)
- Impact energy estimates
- Orbital uncertainty information
- Number of observations used
- Last observation date

**Palermo Scale Interpretation:**
- < -2: Events of no consequence
- -2 to 0: Events meriting careful monitoring
- > 0: Events concerning (threatens disruption)

**Torino Scale Interpretation:**
- 0: No hazard (white)
- 1: Normal (green) - merits careful monitoring
- 2-4: Meriting attention by astronomers (yellow)
- 5-7: Threatening (orange)
- 8-10: Certain collision (red)

**Current Statistics (as of Feb 2025):**
- Total NEOs tracked: 37,000+
- Objects on Sentry risk table: ~1,900
- Most are rated Torino Scale 0 (no immediate threat)

**Use Cases for DeepSix:**
- "Impact Monitoring" section with highest probability objects
- Color-coded hazard visualization
- Historical tracking of objects removed from monitoring
- Educational content about impact assessment

**Example Response Data:**
```json
{
  "des": "99942",
  "fullname": "99942 Apophis (2004 MN4)",
  "ip": 2.7e-6,
  "ps_cum": -3.2,
  "ts_max": 0,
  "last_obs": "2021-03-07",
  "n_imp": 53
}
```

---

### 3. Small-Body Database (SBDB) API
**Status:** Phase 2 enhancement
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sbdb.api`
**Authentication:** None required

**Database Size:**
- 1+ million asteroids and comets
- Comprehensive orbital and physical data

**Data Provided:**
- Object identification and naming information
- Orbital elements and parameters
- Physical characteristics (size, albedo, rotation period)
- Discovery information
- Observation history
- Classification (asteroid type, comet type)

**Query Parameters:**
- `sstr` - Object designation or name
- `full-prec` - Full precision output
- `phys-par` - Include physical parameters
- `close-appr` - Include close approach data

**Example Query:**
```
GET https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=433&phys-par=true
```

**Use Cases for DeepSix:**
- Detailed asteroid profile pages
- Physical characteristics visualization
- Discovery information and history
- Link to related observations

---

### 4. Close Approach Data (CAD) API
**Status:** Phase 1/2 - NeoWs alternative
**Endpoint:** `https://ssd-api.jpl.nasa.gov/cad.api`
**Authentication:** None required

**Advantages over NeoWs:**
- Access to all asteroids and comets in SBDB
- Historical data (past close approaches)
- More filtering options
- Longer time range queries

**Query Parameters:**
- `date-min` / `date-max` - Date range (YYYY-MM-DD)
- `dist-min` / `dist-max` - Distance filter (AU or LD)
- `h-min` / `h-max` - Absolute magnitude filter
- `body` - Filter by approached body (Earth, Moon, etc.)
- `sort` - Sort by date, distance, etc.
- `fullname` - Return full object names

**Data Fields:**
- Object designation
- Close approach date/time
- Distance (AU, LD)
- Velocity (km/s)
- Absolute magnitude
- Estimated diameter

**Example Query:**
```
GET https://ssd-api.jpl.nasa.gov/cad.api?date-min=2025-10-01&date-max=2025-12-31&dist-max=0.05
```

**Use Cases for DeepSix:**
- Historical close approaches timeline
- Filter by specific distance thresholds
- Long-term approach predictions
- Statistical analysis of NEO activity

---

### 5. Fireball Data API
**Status:** HIGH PRIORITY - Unique feature
**Endpoint:** `https://ssd-api.jpl.nasa.gov/fireball.api`
**Authentication:** None required

**Data Source:**
- U.S. Government sensor network
- NOAA GOES satellite lightning mappers (GLM)
- Detects atmospheric entry events

**What is a Fireball:**
- Asteroid fragments entering Earth's atmosphere
- Bright enough to be detected by satellites
- Most are small (< 1 meter) and burn up completely
- Larger ones may produce meteorites

**Data Provided:**
- Event date and time
- Geographic coordinates (latitude, longitude)
- Altitude of peak brightness (km)
- Entry velocity (km/s)
- Impact energy (kilotons TNT equivalent)
- Approximate radiated energy
- Velocity components (vx, vy, vz)

**Important Notes:**
- Data NOT provided in real-time
- Not all fireballs are reported
- Only guaranteed fields: date, energy, impact-e
- Location/altitude may be missing for some events

**Query Parameters:**
- `date-min` / `date-max` - Filter by date range
- `energy-min` / `energy-max` - Filter by energy
- `limit` - Limit number of results
- `sort` - Sort order

**Example Query:**
```
GET https://ssd-api.jpl.nasa.gov/fireball.api?date-min=2025-01-01&limit=20
```

**Use Cases for DeepSix:**
- "Recent Impacts" section with map visualization
- Impact energy comparison (Hiroshima was ~15kt)
- Educational content about atmospheric entry
- Connect to asteroid defense missions
- Historical impact timeline

**Example Impactful Events:**
- Chelyabinsk meteor (2013): 500 kilotons
- Tunguska event (1908): 3-15 megatons (not in database)

---

### 6. SBDB Query API
**Status:** Phase 3 enhancement
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sbdb_query.api`
**Authentication:** None required

**Purpose:**
- Query multiple asteroids matching specific constraints
- Bulk data retrieval
- Statistical analysis

**Query Capabilities:**
- Filter by orbital parameters
- Filter by physical properties
- Filter by discovery date
- Complex constraint combinations

**Use Cases for DeepSix:**
- "Potentially Hazardous Asteroids" filtered list
- Statistical dashboard (NEO characteristics)
- Advanced search functionality

---

### 7. Scout System
**Status:** Research - Limited public API
**System:** Real-time newly discovered asteroid tracking
**Operated by:** NASA CNEOS at JPL

**Capabilities:**
- Monitors Near-Earth Object Confirmation Page (NEOCP)
- Automatic trajectory analysis
- Immediate hazard assessment
- Short-term predictions (days to weeks)

**Scout vs. Sentry:**
- Scout: Short-term (days/weeks), newly discovered objects
- Sentry: Long-term (decades), confirmed NEOs

**Recent Success:**
- Predicted asteroid 2024 BX1 impact 95 minutes in advance
- 8th time in history an Earth-bound asteroid was detected pre-impact

**API Access:**
- No official public API documented
- May require special access/authorization
- Data potentially available through NEOCP feeds

**Potential Implementation:**
- Monitor NEOCP page for new objects
- Display "Newly Discovered Asteroids Under Analysis"
- Show Scout trajectory confidence levels

---

### 8. NHATS API (Near-Earth Object Human Space Flight Accessible Targets Study)
**Status:** HIGH PRIORITY - Phase 1 enhancement
**Endpoint:** `https://ssd-api.jpl.nasa.gov/nhats.api`
**Authentication:** None required

**Purpose:**
NHATS identifies asteroids that are most easily accessible for future human space missions. It evaluates asteroids based on mission requirements like delta-v (fuel), duration, and launch opportunities.

**What NHATS Evaluates:**
- Mission delta-v requirements (km/s)
- Total mission duration (days)
- Stay time at asteroid (days)
- Launch window opportunities
- Return mission feasibility

**Query Parameters:**
- `des` - Specific asteroid designation
- `spk` - SPK-ID (unique identifier)
- `delta-v` - Maximum delta-v filter (km/s)
- `dur` - Maximum duration filter (days)
- `stay` - Minimum stay time (days)
- `launch` - Launch year constraints
- `plot` - Return plot data

**Data Provided:**
- Object designation and name
- Accessibility score
- Minimum delta-v required
- Minimum mission duration
- Optimal launch windows
- Estimated asteroid size
- Orbital parameters
- Mission complexity rating

**Accessibility Criteria:**
- Delta-v < 12 km/s (considered accessible)
- Mission duration < 400 days
- Asteroid size > 50 meters diameter
- Multiple launch opportunities

**Use Cases for DeepSix:**
- "Mission-Accessible Asteroids" section
- Educational content: "Which Asteroids Can Humans Visit?"
- Connection to Lucy, Psyche, OSIRIS-APEX missions
- Mission design visualization
- Answer "Why these asteroids?" for NASA missions

**Example Query:**
```
GET https://ssd-api.jpl.nasa.gov/nhats.api?delta-v=12&dur=400
```

**Why This Matters:**
- Shows practical asteroid mission planning
- Explains NASA's asteroid mission selection
- Connects tracking with exploration goals
- Educational value: mission design complexity

---

### 9. SB Mission Design API
**Status:** Phase 2 - Interactive feature
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sb_mission_design.api`
**Authentication:** None required

**Purpose:**
Small-body mission design tool that calculates trajectory parameters for potential asteroid missions.

**Capabilities:**
- Mission feasibility analysis
- Trajectory optimization
- Launch window calculations
- Delta-v budget estimation
- Mission duration predictions

**Query Parameters:**
- `target` - Target asteroid designation
- `launch-year` - Desired launch year
- `duration` - Mission duration constraint
- `type` - Mission type (flyby, rendezvous, sample-return)

**Use Cases for DeepSix:**
- Interactive "Design Your Asteroid Mission" tool
- Educational content about mission planning
- Show why some asteroids are mission targets
- Visualization of mission trajectories

**Educational Value:**
- Demonstrates orbital mechanics
- Shows mission complexity
- Explains NASA mission decisions

---

### 10. SB Radar API
**Status:** Phase 2 - Enhanced profiles
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sb_radar.api`
**Authentication:** None required

**Purpose:**
Provides radar astrometry data for asteroids that have been observed by planetary radar systems (Arecibo, Goldstone).

**What Radar Reveals:**
- Precise shape models
- Rotation rates
- Surface characteristics
- Binary asteroid detection
- Size refinements

**Data Provided:**
- Radar observations history
- Shape model data
- Rotation period
- Radar albedo
- Surface roughness
- Delay-Doppler imagery

**Query Parameters:**
- `des` - Object designation
- `spk` - SPK-ID

**Radar Facilities:**
- Goldstone (DSN) - Still operational
- Arecibo (collapsed 2020) - Historical data
- Green Bank Telescope - Receiving only

**Use Cases for DeepSix:**
- Enhanced asteroid profile pages
- 3D shape visualizations
- "Radar-Imaged Asteroids" gallery
- Physical characterization data
- Show which asteroids have detailed imaging

**Example Use:**
- Display radar shape models
- Show rotation animations
- Compare radar vs. optical observations
- Highlight asteroids with precise measurements

---

### 11. SB Observability API
**Status:** Phase 3 - Amateur astronomy feature
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sb_observability.api`
**Authentication:** None required

**Purpose:**
Determines when and where small bodies are observable from Earth, providing visibility windows for ground-based observations.

**Data Provided:**
- Visibility periods
- Apparent magnitude (brightness)
- Sky position (RA/Dec)
- Elongation from Sun
- Moon interference
- Best observation dates

**Query Parameters:**
- `des` - Object designation
- `date-start` - Start date
- `date-end` - End date
- `location` - Observer location (lat/long)
- `mag-limit` - Magnitude limit

**Use Cases for DeepSix:**
- "Observe These Asteroids Tonight" feature
- Amateur astronomer guide
- Link to tracking data
- Sky chart integration
- "Currently Observable NEOs" section

**Educational Value:**
- Encourages citizen science
- Shows asteroids are real, observable objects
- Connects public to asteroid tracking

---

### 12. Horizons Lookup Service
**Status:** Utility - May simplify existing implementation
**Endpoint:** `https://ssd-api.jpl.nasa.gov/horizons_lookup.api`
**Authentication:** None required

**Purpose:**
Lookup service to find valid object identifiers for use with Horizons API queries. Currently DeepSix uses full Horizons API.

**Capabilities:**
- Search by name or designation
- Get SPK-ID for Horizons queries
- Validate object identifiers
- Find alternate designations

**Query Parameters:**
- `sstr` - Search string (name or designation)
- `format` - Return format

**Use Cases for DeepSix:**
- Simplify Horizons API integration
- Validate asteroid names
- Support search functionality
- Handle alternate designations

**Potential Improvement:**
- Could simplify current spacecraft tracking implementation
- Better error handling for invalid names

---

### 13. JD Date/Time Converter API
**Status:** Utility - Astronomical date conversion
**Endpoint:** `https://ssd-api.jpl.nasa.gov/jd_cal.api`
**Authentication:** None required

**Purpose:**
Convert between Julian Day (JD) numbers and calendar dates. Julian Days are standard in astronomical calculations.

**Conversions Supported:**
- Calendar date to Julian Day
- Julian Day to calendar date
- Modified Julian Day (MJD)
- Time scale conversions (UT, TT, TDB)

**Query Parameters:**
- `jd` - Julian Day number
- `cd` - Calendar date
- `time-scale` - Time scale specification

**Use Cases for DeepSix:**
- Internal utility for date conversions
- Display astronomical dates properly
- Convert API timestamps
- Support user date inputs

**When Needed:**
- Some NASA APIs return JD dates
- Astronomical calculations
- Precise timing conversions

---

### 14. Periodic Orbits API
**Status:** Advanced - Specialized use
**Endpoint:** `https://ssd-api.jpl.nasa.gov/periodic_orbits.api`
**Authentication:** None required

**Purpose:**
Interactive interface to database of periodic orbits in the solar system, primarily for mission design and orbital mechanics research.

**Use Cases:**
- Advanced orbital mechanics
- Mission trajectory planning
- Lagrange point orbits
- Resonant orbits

**Priority:** Low for DeepSix (highly technical)

---

### 15. SB Identification API
**Status:** Specialized tool
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sb_ident.api`
**Authentication:** None required

**Purpose:**
Identifies small bodies within a specified field of view (FOV) at a specific time, useful for telescope planning and observation scheduling.

**Use Cases:**
- Telescope observation planning
- FOV analysis
- Avoiding asteroids in astronomical images

**Priority:** Low for DeepSix (specialized technical tool)

---

### 16. SB Satellites API
**Status:** Phase 3 - Interesting feature
**Endpoint:** `https://ssd-api.jpl.nasa.gov/sb_sats.api`
**Authentication:** None required

**Purpose:**
Provides data on small-body satellites (asteroid moons). Approximately 400+ binary/multiple asteroid systems are known.

**Data Provided:**
- Satellite orbital parameters
- Discovery information
- Physical properties
- System characteristics

**Fun Facts:**
- Many asteroids have moons
- Didymos (DART target) has moon Dimorphos
- Some asteroids are contact binaries

**Use Cases for DeepSix:**
- "Asteroids with Moons" section
- Connection to DART mission
- Enhanced asteroid profiles
- Show binary systems

**Educational Value:**
- Asteroids are complex systems
- Formation theories
- Mission targets often binary

---

## Updated API Priority List

### Tier 1 - Essential (Phase 1):
1. **NeoWs** - Close approaches
2. **Sentry** - Impact monitoring
3. **NHATS** - Mission-accessible asteroids ⭐ NEW

### Tier 2 - High Value (Phase 2):
4. **Fireball** - Real impacts
5. **CAD** - Historical approaches
6. **SB Radar** - Shape models
7. **SB Mission Design** - Interactive tool

### Tier 3 - Enhancement (Phase 3):
8. **SB Observability** - Amateur astronomy
9. **SBDB** - Detailed profiles
10. **SB Satellites** - Binary systems
11. **SBDB Query** - Advanced search

### Utilities:
- **Horizons Lookup** - ID validation
- **JD Converter** - Date utilities

### Specialized/Low Priority:
- **Scout** - If accessible
- **Periodic Orbits** - Advanced
- **SB Identification** - Technical

---

## Recommended Implementation Plan

### Phase 1: MVP (Week 1-2)

**Page Structure:**
```
/asteroids route

Sections:
1. Hero & Statistics
   - Live NEO count
   - Sentry objects monitored
   - NHATS accessible targets count
   - Data source badges

2. Sentry Impact Monitoring (PRIMARY FEATURE)
   - Table of monitored asteroids
   - Impact probability
   - Torino/Palermo scales
   - Visual hazard indicators
   - Filter: Torino > 0, Sort by probability

3. Mission-Accessible Asteroids (NEW - NHATS)
   - Asteroids humans could visit
   - Delta-v requirements
   - Mission duration estimates
   - Connection to Lucy/Psyche/OSIRIS-APEX
   - "Why NASA Goes to These Asteroids"

4. Close Approaches This Week
   - NeoWs API integration
   - Asteroid cards with details
   - Distance visualization

5. Our Asteroid Missions
   - Links to Lucy, Psyche, OSIRIS-APEX
```

**APIs to Implement:**
1. Sentry API (Mode S - all objects)
2. NHATS API (accessible targets) ⭐ NEW
3. NeoWs API (7-day feed)
4. Navigation integration

**Components to Create:**
- `/app/asteroids/page.tsx`
- `/app/api/asteroids/neows/route.ts`
- `/app/api/asteroids/sentry/route.ts`
- `/app/api/asteroids/nhats/route.ts` ⭐ NEW
- `/components/asteroids/NHATSList.tsx` ⭐ NEW
- `/components/asteroids/SentryMonitor.tsx`
- `/components/asteroids/CloseApproachCard.tsx`

### Phase 2: Enhanced Features (Week 3-4)

**New Sections:**
5. Recent Fireball Detections
   - Fireball API integration
   - Map visualization (lat/long)
   - Impact energy display
   - Entry velocity and altitude

6. Historical Close Approaches
   - CAD API integration
   - Timeline visualization
   - Distance trends

**Additional Components:**
- `/components/asteroids/FireballMap.tsx`
- `/components/asteroids/CloseApproachTimeline.tsx`

### Phase 3: Advanced Features (Future)

**Enhancements:**
7. Detailed Asteroid Profiles
   - SBDB API for individual asteroids
   - Physical characteristics
   - Orbital visualization

8. Advanced Filtering
   - SBDB Query API
   - Filter by size, type, hazard level
   - Custom date ranges

9. Scout Integration (if possible)
   - Newly discovered objects
   - Real-time trajectory updates

---

## Technical Considerations

### API Requirements
- **Authentication:** Only NeoWs requires NASA API key (already configured)
- **Rate Limits:**
  - NeoWs: 1,000 requests/hour
  - JPL APIs: 1 request at a time (no concurrent requests)
- **Response Format:** All return JSON
- **CORS:** All support browser requests

### Data Freshness
- Sentry: Updated continuously as observations come in
- NeoWs: Daily updates
- Fireball: Delayed reporting (not real-time)
- CAD: Real-time close approach calculations

### Caching Strategy
- Sentry data: Cache for 1 hour (changes slowly)
- NHATS data: Cache for 12 hours (stable mission accessibility)
- NeoWs close approaches: Cache for 4 hours
- Fireball data: Cache for 24 hours (historical)
- CAD queries: Cache for 6 hours
- SB Radar: Cache for 7 days (static shape models)

### Error Handling
- Implement fallback data for API failures
- Show "Data temporarily unavailable" messages
- Log errors for monitoring
- Graceful degradation (hide sections if API fails)

### Performance
- Use React Query for data fetching
- Implement pagination for large datasets
- Lazy load map visualizations
- Consider server-side rendering for initial data

---

## Unique Differentiators for DeepSix

### What Makes Our Implementation Special:

1. **Sentry Integration**
   - Most public sites don't show impact probabilities
   - Educational content about hazard scales
   - Real impact monitoring, not just tracking

2. **NHATS Mission Accessibility** ⭐ NEW
   - Shows which asteroids humans could actually visit
   - Delta-v and mission duration data
   - Explains NASA's mission target selection
   - Answers "Why these asteroids?" question
   - Unique feature not found on most tracking sites

3. **Fireball Tracking**
   - Actual impacts happening right now
   - Energy comparison to nuclear weapons
   - Map visualization of entry points

4. **Mission Connection**
   - Direct links to Lucy, Psyche, OSIRIS-APEX missions
   - Show why NASA sends missions to asteroids
   - Educational narrative connecting tracking to exploration

5. **Comprehensive View**
   - Past (fireballs), present (close approaches), future (Sentry risks)
   - Exploration (NHATS mission-accessible targets)
   - Multi-API integration for complete picture
   - Scientific accuracy with engaging design

6. **Real-Time Data**
   - Live NASA API integration
   - Not static lists or outdated databases
   - Data source attribution

---

## Content Strategy

### Educational Messaging

**Why Asteroids Matter:**
- 66 million years ago: Chicxulub impact (dinosaur extinction)
- 1908: Tunguska event (800 sq km flattened)
- 2013: Chelyabinsk meteor (1,500 injuries from shockwave)

**Planetary Defense:**
- NASA DART mission (successfully deflected asteroid)
- Continuous monitoring prevents surprise impacts
- Asteroid mining potential (Psyche mission)

**Scale Context:**
- 1 kiloton = 1,000 tons TNT
- Hiroshima: ~15 kilotons
- Chelyabinsk: ~500 kilotons
- Chicxulub: ~100 million megatons

### Call-to-Action
- "Learn more about our asteroid missions"
- "Track asteroids with NASA"
- "Understanding planetary defense"

---

## API Response Examples

### Sentry API Response (Mode S)
```json
{
  "signature": {
    "version": "2.0",
    "source": "NASA/JPL Sentry API"
  },
  "count": "1894",
  "data": [
    {
      "des": "99942",
      "fullname": "99942 Apophis (2004 MN4)",
      "ip": 2.7e-6,
      "ps_cum": -3.2,
      "ts_max": 0,
      "last_obs": "2021-03-07",
      "n_imp": 53,
      "h": 19.7
    }
  ]
}
```

### NeoWs Response (Feed)
```json
{
  "links": { "next": "...", "prev": "...", "self": "..." },
  "element_count": 15,
  "near_earth_objects": {
    "2025-10-24": [
      {
        "id": "2465633",
        "name": "465633 (2009 JR5)",
        "absolute_magnitude_h": 20.5,
        "estimated_diameter": {
          "kilometers": { "estimated_diameter_min": 0.2, "estimated_diameter_max": 0.4 }
        },
        "is_potentially_hazardous_asteroid": false,
        "close_approach_data": [{
          "close_approach_date": "2025-10-24",
          "relative_velocity": { "kilometers_per_second": "12.34" },
          "miss_distance": { "astronomical": "0.123", "lunar": "47.8" }
        }]
      }
    ]
  }
}
```

### Fireball API Response
```json
{
  "signature": { "version": "1.0" },
  "count": "20",
  "fields": ["date", "energy", "impact-e", "lat", "lon", "alt", "vel"],
  "data": [
    ["2025-01-15 12:34:00", "0.5", "0.3", "45.2", "-122.5", "35", "18.5"]
  ]
}
```

---

## Next Steps

1. **Create API Routes**
   - Set up Next.js API routes for each endpoint
   - Implement error handling and caching
   - Test with real NASA API keys

2. **Build Components**
   - Start with SentryMonitor component
   - Add CloseApproachCard
   - Implement data visualization

3. **Design Page Layout**
   - Responsive design matching existing DeepSix style
   - Dark theme with accent colors for hazard levels
   - Smooth animations with Framer Motion

4. **Testing**
   - Test API rate limits
   - Verify data accuracy
   - Cross-browser compatibility

5. **Documentation**
   - Update README with new features
   - Add API documentation
   - Create user guide for asteroid tracking

---

## Resources

### Official Documentation
- NASA Sentry: https://cneos.jpl.nasa.gov/sentry/
- Sentry API: https://ssd-api.jpl.nasa.gov/doc/sentry.html
- NeoWs API: https://api.nasa.gov/
- Fireball API: https://ssd-api.jpl.nasa.gov/doc/fireball.html
- CAD API: https://ssd-api.jpl.nasa.gov/doc/cad.html
- SBDB API: https://ssd-api.jpl.nasa.gov/doc/sbdb.html

### NASA Centers
- Center for Near Earth Object Studies (CNEOS): https://cneos.jpl.nasa.gov/
- Solar System Dynamics (SSD): https://ssd.jpl.nasa.gov/
- Minor Planet Center: https://www.minorplanetcenter.net/

### Additional Reading
- Palermo Scale: Technical impact hazard scale for asteroids
- Torino Scale: Public communication impact hazard scale
- Virtual Impactors: Possible future impact scenarios within orbital uncertainty
- IOBS Method: Impact pseudo-observation method used by Sentry-II

---

**Document Version:** 1.0
**Last Updated:** October 24, 2025
**Author:** DeepSix Development Team
**Status:** Ready for implementation
