# Asteroid Detail Page Enhancement Plan

**Date:** October 27, 2025
**Status:** Planning
**Goal:** Automatically populate asteroid detail pages with comprehensive data from NASA APIs

---

## Current Implementation Status

### ✅ Already Implemented:

1. **Basic Information**
   - Designation, full name, orbit class
   - Spectral type, hazard classification
   - Size category estimation

2. **Physical Properties**
   - Absolute magnitude
   - Diameter and dimensions
   - Albedo (reflectivity)
   - Rotation period
   - Density
   - Spectral type descriptions

3. **Orbital Elements**
   - Eccentricity, semi-major axis
   - Inclination, perihelion
   - All Keplerian orbital elements
   - Orbital period

4. **Discovery & Observation History**
   - First observation date
   - Last observation date
   - Data arc (observation span)
   - MOID (Minimum Orbit Intersection Distance)
   - Orbit uncertainty rating

5. **Radar Observations** (when available)
   - Observation count
   - Latest observation date
   - Station information
   - Measurement types

---

## 🚀 Proposed Automatic Enhancements

### 1. Close Approach Data (HIGH PRIORITY)

**API:** NASA Close Approach Data (CAD) API
- **Endpoint:** `https://ssd-api.jpl.nasa.gov/cad.api`
- **Automation:** Query automatically with asteroid designation

**Data Available:**
- Future close approaches to Earth
- Historical close approaches
- Approach date and time
- Miss distance (AU and lunar distances)
- Relative velocity
- Uncertainty window
- Absolute magnitude at approach

**Example for Apophis (99942):**
```json
{
  "date": "2029-Apr-13 21:46",
  "distance": "0.000254 AU" (~38,000 km - inside geostationary orbit!),
  "velocity": "7.42 km/s",
  "uncertainty": "< 1 minute"
}
```

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 📅 Upcoming Close Approaches                        │
├─────────────────────────────────────────────────────┤
│ April 13, 2029                                      │
│ Distance: 38,000 km (0.10 LD) ⚠️ EXTREMELY CLOSE  │
│ Velocity: 7.42 km/s                                 │
│ Visible to naked eye from Earth                    │
└─────────────────────────────────────────────────────┘
```

### 2. Impact Risk Assessment (MEDIUM PRIORITY)

**API:** NASA Sentry API (already integrated for main page)
- **Endpoint:** `https://ssd-api.jpl.nasa.gov/sentry.api`
- **Automation:** Check if asteroid is in Sentry database

**Data Available:**
- Impact probability
- Potential impact dates
- Palermo Scale (technical risk)
- Torino Scale (public communication)
- Number of potential impacts
- Cumulative impact probability

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Impact Risk Assessment                          │
├─────────────────────────────────────────────────────┤
│ Status: Monitored by NASA Sentry System            │
│ Impact Probability: 1 in 45,000 (over next 100yr) │
│ Torino Scale: 0 (No Hazard)                        │
│ Palermo Scale: -2.56 (Low concern)                 │
│                                                     │
│ Next Potential Impact: 2068-04-12                  │
└─────────────────────────────────────────────────────┘
```

### 3. Mission Accessibility Data (MEDIUM PRIORITY)

**API:** NHATS API (already integrated for main page)
- **Endpoint:** `https://ssd-api.jpl.nasa.gov/nhats.api`
- **Automation:** Check if asteroid is mission-accessible

**Data Available:**
- Minimum delta-V requirement
- Optimal launch windows
- Mission duration
- Stay time at target
- C3 energy requirement
- Trajectory type

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 🎯 Mission Accessibility                            │
├─────────────────────────────────────────────────────┤
│ Status: Accessible for human missions              │
│ Minimum ΔV: 6.2 km/s                               │
│ Mission Duration: ~180 days round-trip             │
│ Next Launch Window: 2028-2029                      │
│ Stay Time: Up to 8 days possible                   │
│                                                     │
│ [View Mission Design Tool →]                       │
└─────────────────────────────────────────────────────┘
```

### 4. Alternative Designations (LOW PRIORITY)

**API:** SBDB API (already have access)
- **Data Source:** `object.alt_des` field in SBDB response

**Data Available:**
- Provisional designations
- IAU numbers
- Survey designations
- Packed designations
- Old designations

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Alternative Designations                         │
├─────────────────────────────────────────────────────┤
│ Primary: 99942 Apophis                             │
│ Provisional: 2004 MN4                              │
│ Previous: None                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Size Comparison Visualization (LOW PRIORITY)

**Implementation:** Client-side calculation from diameter
- **Data Source:** Already have diameter from SBDB

**Visualization:**
- Compare to familiar objects (football field, city, etc.)
- Visual size indicator
- Scale comparison with other asteroids

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 📏 Size Comparison                                  │
├─────────────────────────────────────────────────────┤
│ Apophis: 340 meters                                │
│                                                     │
│ [█████] 340m Apophis                               │
│ [█] 100m Football field                            │
│ [████████████] 900m Eiffel Tower height            │
│                                                     │
│ Similar size to: 3.5 football fields              │
└─────────────────────────────────────────────────────┘
```

### 6. Observation Opportunities (MEDIUM PRIORITY)

**API:** Combination of CAD API + SBDB magnitude data
- **Automation:** Calculate visibility based on close approach and magnitude

**Data Available:**
- Best observation dates
- Predicted magnitude
- Required telescope size
- Observability rating

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 🔭 Observation Opportunities                        │
├─────────────────────────────────────────────────────┤
│ Currently: Not visible (too faint)                 │
│ Magnitude: ~20.5 (requires large telescope)        │
│                                                     │
│ Best Viewing:                                       │
│ • April 2029: Magnitude 3.3 (naked eye!)          │
│ • Peak brightness: Visible from urban areas        │
│                                                     │
│ Next favorable opposition: March 2027              │
└─────────────────────────────────────────────────────┘
```

### 7. Discovery Information (LOW PRIORITY)

**API:** SBDB API extended query
- **Data Source:** Discovery circumstances in SBDB

**Data Available:**
- Discovery date
- Discoverer names
- Discovery location/survey
- Discovery magnitude
- Discovery circumstances

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 🔍 Discovery                                        │
├─────────────────────────────────────────────────────┤
│ Discovered: June 19, 2004                          │
│ Discoverers: Roy Tucker, David Tholen, Fabrizio    │
│              Bernardi                               │
│ Location: Kitt Peak Observatory, Arizona           │
│ Survey: Kitt Peak National Observatory Survey      │
│ Discovery Magnitude: 15.7                          │
└─────────────────────────────────────────────────────┘
```

### 8. Related Objects & Family (LOW PRIORITY)

**Implementation:** Query SBDB for objects with similar orbital elements
- **Automation:** Find asteroids with similar a, e, i values

**Data Available:**
- Asteroid families
- Similar orbit objects
- Dynamical group membership

**UI Section:**
```
┌─────────────────────────────────────────────────────┐
│ 👥 Related Objects                                  │
├─────────────────────────────────────────────────────┤
│ Dynamical Group: Aten family                       │
│ Similar Orbits: 2016 NF23, 2010 RF12              │
│                                                     │
│ [View Similar Asteroids →]                         │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### Phase 1: Critical Data (Week 1)
**Goal:** Add most valuable, high-impact sections

- [ ] **Close Approach Data**
  - Create `/api/asteroids/close-approach/route.ts`
  - Query CAD API with designation
  - Parse and display upcoming approaches
  - Highlight extremely close approaches (< 0.05 AU)

- [ ] **Impact Risk Assessment**
  - Reuse existing Sentry API integration
  - Check if asteroid is in Sentry database
  - Display risk metrics with context
  - Show "No Risk" vs "Monitored" status

### Phase 2: Mission Planning (Week 2)
**Goal:** Add mission-relevant data

- [ ] **Mission Accessibility**
  - Reuse existing NHATS API integration
  - Check if asteroid is accessible
  - Display mission parameters
  - Link to Mission Design Tool

- [ ] **Observation Opportunities**
  - Calculate from close approach + magnitude
  - Determine visibility windows
  - Suggest telescope requirements

### Phase 3: Additional Context (Week 3)
**Goal:** Complete the picture

- [ ] **Alternative Designations**
  - Extract from SBDB response
  - Display all known names
  - Show historical designations

- [ ] **Discovery Information**
  - Query extended SBDB data
  - Display discovery circumstances
  - Credit discoverers

### Phase 4: Polish & Visualizations (Week 4)
**Goal:** Enhance user experience

- [ ] **Size Comparison**
  - Client-side visualization
  - Compare to familiar objects
  - Interactive scale slider

- [ ] **Related Objects**
  - Find orbital family members
  - Link to similar asteroids
  - Show dynamical relationships

---

## API Integration Details

### 1. Close Approach Data API

**Endpoint:** `GET https://ssd-api.jpl.nasa.gov/cad.api`

**Query Parameters:**
- `des` - Asteroid designation
- `date-min` - Start date (YYYY-MM-DD)
- `date-max` - End date (YYYY-MM-DD)
- `dist-max` - Maximum distance filter (AU)
- `sort` - Sort by date

**Example Request:**
```bash
curl "https://ssd-api.jpl.nasa.gov/cad.api?des=99942&date-min=2025-01-01&date-max=2050-12-31"
```

**Response Fields:**
- `des` - Designation
- `cd` - Close approach date
- `dist` - Nominal distance (AU)
- `dist_min` - Minimum distance (3-sigma)
- `dist_max` - Maximum distance (3-sigma)
- `v_rel` - Relative velocity (km/s)
- `h` - Absolute magnitude

**Implementation:**
```typescript
// app/api/asteroids/close-approach/route.ts
export async function GET(request: NextRequest) {
  const des = searchParams.get('des');
  const dateMin = searchParams.get('date-min') || new Date().toISOString().split('T')[0];
  const dateMax = searchParams.get('date-max') || '2050-12-31';

  const cadUrl = `https://ssd-api.jpl.nasa.gov/cad.api?des=${des}&date-min=${dateMin}&date-max=${dateMax}&dist-max=0.2`;

  // Fetch and parse...
  // Convert AU to lunar distances (1 AU = 389 LD)
  // Highlight approaches < 0.05 AU as "very close"
  // Sort by date
}
```

### 2. Sentry API Integration

**Endpoint:** `GET https://ssd-api.jpl.nasa.gov/sentry.api`

**Query Parameters:**
- `des` - Specific object designation
- `removed` - Include removed objects (1/0)

**Example Request:**
```bash
curl "https://ssd-api.jpl.nasa.gov/sentry.api?des=99942"
```

**Response Fields:**
- `ip` - Impact probability
- `ps_cum` - Cumulative Palermo Scale
- `ts_max` - Maximum Torino Scale
- `n_imp` - Number of potential impacts
- `last_obs` - Date of last observation

**Implementation:**
```typescript
// Reuse existing Sentry API, add single-object query
// app/api/asteroids/sentry-check/route.ts
export async function GET(request: NextRequest) {
  const des = searchParams.get('des');
  const sentryUrl = `https://ssd-api.jpl.nasa.gov/sentry.api?des=${des}`;

  // Check if object exists in Sentry database
  // Return risk assessment or "not monitored" status
}
```

### 3. NHATS API Integration

**Endpoint:** `GET https://ssd-api.jpl.nasa.gov/nhats.api`

**Query Parameters:**
- `des` - Specific object designation
- `spk` - SPK-ID

**Example Request:**
```bash
curl "https://ssd-api.jpl.nasa.gov/nhats.api?des=101955"
```

**Response Fields:**
- `min_dv` - Minimum delta-V (km/s)
- `dur` - Mission duration (days)
- `stay` - Maximum stay time (days)
- `launch` - Launch date

**Implementation:**
```typescript
// Reuse existing NHATS API, add single-object query
// app/api/asteroids/nhats-check/route.ts
export async function GET(request: NextRequest) {
  const des = searchParams.get('des');
  const nhatsUrl = `https://ssd-api.jpl.nasa.gov/nhats.api?des=${des}`;

  // Check if object is mission-accessible
  // Return accessibility metrics or "not accessible" status
}
```

---

## Data Loading Strategy

### Optimization Approach

**Problem:** Loading too many APIs sequentially will be slow

**Solution:** Parallel + Progressive Loading

```typescript
// In asteroid detail page component
useEffect(() => {
  // Load critical data first (already have SBDB)
  const loadPrimaryData = async () => {
    const [sbdb, radar] = await Promise.all([
      fetch(`/api/asteroids/sbdb?sstr=${id}`),
      fetch(`/api/asteroids/radar?des=${id}`)
    ]);
    // Display immediately
  };

  // Load secondary data in parallel (don't block rendering)
  const loadSecondaryData = async () => {
    const [closeApproach, sentry, nhats] = await Promise.all([
      fetch(`/api/asteroids/close-approach?des=${id}`),
      fetch(`/api/asteroids/sentry-check?des=${id}`),
      fetch(`/api/asteroids/nhats-check?des=${id}`)
    ]);
    // Update sections as they load
  };

  loadPrimaryData();
  loadSecondaryData(); // Non-blocking
}, [id]);
```

**Benefits:**
- Core data shows immediately
- Enhanced data loads progressively
- Each section appears when ready
- No "all or nothing" loading

### Caching Strategy

**API Response Caching:**
- Close approach data: 24 hours (rarely changes)
- Sentry data: 6 hours (updates periodically)
- NHATS data: 24 hours (stable)
- SBDB data: 7 days (rarely changes)

**Implementation:**
```typescript
export const runtime = 'edge';
export const revalidate = 86400; // 24 hours for most data
```

---

## User Experience Considerations

### Loading States

**Per-Section Skeletons:**
```typescript
{loading ? (
  <SkeletonLoader height={200} />
) : closeApproachData ? (
  <CloseApproachSection data={closeApproachData} />
) : null}
```

### Empty States

**Graceful Degradation:**
```typescript
{!closeApproachData && (
  <div className="text-gray-400 text-center py-8">
    No close approaches within the next 25 years
  </div>
)}
```

### Error Handling

**Non-Blocking Errors:**
- If one API fails, others still display
- Show error message only for that section
- Retry button for failed sections

---

## Estimated Effort

### Time Requirements:

**Phase 1 (Critical Data):** 8-12 hours
- Close Approach API route: 3 hours
- Close Approach component: 2 hours
- Sentry check integration: 2 hours
- Impact Risk component: 2 hours
- Testing: 2 hours

**Phase 2 (Mission Planning):** 6-8 hours
- NHATS check integration: 2 hours
- Mission Accessibility component: 2 hours
- Observation opportunities calc: 2 hours
- Testing: 2 hours

**Phase 3 (Additional Context):** 4-6 hours
- Alternative designations: 1 hour
- Discovery information: 2 hours
- Related objects: 2 hours
- Testing: 1 hour

**Phase 4 (Polish):** 6-8 hours
- Size comparison visual: 3 hours
- Animations and transitions: 2 hours
- Mobile optimization: 2 hours
- Final testing: 1 hour

**Total Estimated Time:** 24-34 hours of development

---

## Success Metrics

### Goals:

1. **Comprehensive Coverage**
   - 90%+ of asteroids have close approach data
   - All PHAs show impact risk assessment
   - All NEOs show mission accessibility status

2. **Performance**
   - Initial page load < 2 seconds
   - All sections loaded < 5 seconds
   - Smooth progressive loading

3. **User Engagement**
   - Increase time on asteroid detail pages
   - Higher exploration of related features
   - More use of mission design tool

---

## Priority Ranking

### Must-Have (Tier 1):
1. ✅ **Close Approach Data** - Critical for user interest
2. ✅ **Impact Risk Assessment** - Essential for PHAs
3. ✅ **Mission Accessibility** - Core feature alignment

### Should-Have (Tier 2):
4. **Observation Opportunities** - Amateur astronomer value
5. **Alternative Designations** - Research utility
6. **Discovery Information** - Historical context

### Nice-to-Have (Tier 3):
7. **Size Comparison** - Visual engagement
8. **Related Objects** - Exploration depth

---

## Technical Notes

### API Limits & Rate Limiting

**NASA APIs:**
- No authentication required
- No explicit rate limits documented
- Respectful use recommended (cache aggressively)
- 1-2 requests per asteroid page load acceptable

### Error Scenarios

**Handling Missing Data:**
1. Object not found in API → Show "No data available"
2. API timeout → Show retry option
3. API rate limit → Queue and retry
4. Invalid response → Log error, hide section

### Mobile Optimization

**Responsive Sections:**
- Stack cards vertically on mobile
- Reduce data density on small screens
- Collapsible sections by default
- Lazy load below-the-fold content

---

## Next Steps

1. **User Approval** - Get sign-off on priority and scope
2. **Start Phase 1** - Implement close approach data
3. **Iterate** - Add sections progressively
4. **Test** - Verify with variety of asteroids
5. **Deploy** - Roll out enhancements

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Planning - Awaiting user approval to proceed
