import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface CADResponse {
  signature: {
    version: string;
    source: string;
  };
  count: string;
  fields: string[];
  data: (string | number)[][];
}

interface SBDBResponse {
  object?: {
    fullname?: string;
    des?: string;
  };
  phys_par?: Array<{
    name: string;
    value: string;
  }>;
}

interface ObservationWindow {
  startDate: string;
  endDate: string;
  peakDate: string;
  peakMagnitude: number;
  peakDistance: number;
  visibility: 'naked-eye' | 'binoculars' | 'small-telescope' | 'large-telescope' | 'professional';
  visibilityDescription: string;
  recommendedEquipment: string;
  observabilityRating: number;
}

/**
 * GET /api/asteroids/observation-opportunities
 * Calculates observation opportunities based on close approaches and magnitude
 *
 * Query Parameters:
 * - des: Object designation (required)
 *
 * Returns observation windows and visibility information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const des = searchParams.get('des');
    if (!des) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Parameter',
          message: 'The "des" parameter is required (object designation)',
        },
        { status: 400 }
      );
    }

    // Fetch close approach data and SBDB data in parallel
    const cadUrl = `https://ssd-api.jpl.nasa.gov/cad.api?des=${encodeURIComponent(des)}&date-min=2025-01-01&date-max=2035-12-31&dist-max=0.5&sort=date`;
    const sbdbUrl = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(des)}&phys-par=true`;

    const fetchData = async () => {
      const [cadResponse, sbdbResponse] = await Promise.all([
        fetch(cadUrl, { headers: { 'User-Agent': 'DeepSix-Asteroid-Tracker' } }),
        fetch(sbdbUrl, { headers: { 'User-Agent': 'DeepSix-Asteroid-Tracker' } }),
      ]);

      if (!cadResponse.ok) {
        throw new Error(`CAD API returned ${cadResponse.status}`);
      }
      if (!sbdbResponse.ok) {
        throw new Error(`SBDB API returned ${sbdbResponse.status}`);
      }

      const cadData = await cadResponse.json() as CADResponse;
      const sbdbData = await sbdbResponse.json() as SBDBResponse;

      return { cadData, sbdbData };
    };

    const { cadData, sbdbData } = await withTimeout(fetchData(), 15000);

    // Get absolute magnitude from SBDB data
    const physPar = sbdbData.phys_par || [];
    const hParam = physPar.find(p => p.name === 'H');
    const absoluteMagnitude = hParam ? parseFloat(hParam.value) : null;

    if (!absoluteMagnitude) {
      return NextResponse.json({
        success: true,
        dataSource: 'NASA JPL APIs (CAD + SBDB)',
        timestamp: new Date().toISOString(),
        hasOpportunities: false,
        message: 'Absolute magnitude data not available for visibility calculations.',
        designation: des,
      });
    }

    // Parse close approach data
    const fieldIndices: { [key: string]: number } = {};
    cadData.fields.forEach((field, index) => {
      fieldIndices[field] = index;
    });

    const windows: ObservationWindow[] = [];

    for (const record of cadData.data) {
      const dateStr = record[fieldIndices['cd']] as string;
      const distAU = parseFloat(record[fieldIndices['dist']] as string);
      const hRecord = record[fieldIndices['h']] ? parseFloat(record[fieldIndices['h']] as string) : absoluteMagnitude;

      // Calculate apparent magnitude using the formula:
      // m = H + 5*log10(delta*r) - 2.5*log10(phi(alpha))
      // Simplified: assuming phase angle ~0 for close approaches, phi ≈ 1
      // m ≈ H + 5*log10(delta*r)
      // Where delta = distance to Earth, r = distance to Sun (assume ~1 AU for NEOs)
      const r = 1.0; // Approximate distance to Sun in AU
      const apparentMagnitude = hRecord + 5 * Math.log10(distAU * r);

      // Determine visibility category and equipment
      let visibility: ObservationWindow['visibility'];
      let visibilityDescription: string;
      let recommendedEquipment: string;
      let observabilityRating: number;

      if (apparentMagnitude < 6) {
        visibility = 'naked-eye';
        visibilityDescription = 'Visible to the naked eye under dark skies';
        recommendedEquipment = 'None required - visible without equipment';
        observabilityRating = 10;
      } else if (apparentMagnitude < 10) {
        visibility = 'binoculars';
        visibilityDescription = 'Easily visible with binoculars or small telescope';
        recommendedEquipment = 'Binoculars (7x50 or larger) or small telescope';
        observabilityRating = 8;
      } else if (apparentMagnitude < 14) {
        visibility = 'small-telescope';
        visibilityDescription = 'Visible with amateur telescope';
        recommendedEquipment = 'Telescope (4-8 inch aperture)';
        observabilityRating = 6;
      } else if (apparentMagnitude < 18) {
        visibility = 'large-telescope';
        visibilityDescription = 'Requires large amateur telescope';
        recommendedEquipment = 'Large telescope (10+ inch aperture), dark skies';
        observabilityRating = 4;
      } else {
        visibility = 'professional';
        visibilityDescription = 'Only visible with professional equipment';
        recommendedEquipment = 'Professional observatory equipment required';
        observabilityRating = 2;
      }

      // Create observation window (assume ±2 weeks around peak)
      const peakDate = new Date(dateStr);
      const startDate = new Date(peakDate);
      startDate.setDate(startDate.getDate() - 14);
      const endDate = new Date(peakDate);
      endDate.setDate(endDate.getDate() + 14);

      windows.push({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        peakDate: dateStr,
        peakMagnitude: apparentMagnitude,
        peakDistance: distAU,
        visibility,
        visibilityDescription,
        recommendedEquipment,
        observabilityRating,
      });
    }

    // Sort by observability rating (best opportunities first)
    windows.sort((a, b) => b.observabilityRating - a.observabilityRating);

    // Find best opportunity
    const bestOpportunity = windows.length > 0 ? windows[0] : null;

    // Current visibility status
    const now = new Date();
    const currentWindow = windows.find(w => {
      const start = new Date(w.startDate);
      const end = new Date(w.endDate);
      return now >= start && now <= end;
    });

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL APIs (CAD + SBDB)',
      timestamp: new Date().toISOString(),
      hasOpportunities: windows.length > 0,
      designation: des,
      fullName: sbdbData.object?.fullname || des,
      absoluteMagnitude,
      currentStatus: currentWindow ? {
        visible: true,
        magnitude: currentWindow.peakMagnitude,
        visibility: currentWindow.visibility,
        description: currentWindow.visibilityDescription,
        equipment: currentWindow.recommendedEquipment,
      } : {
        visible: false,
        message: 'Not currently in favorable position for observation',
      },
      bestOpportunity: bestOpportunity ? {
        date: bestOpportunity.peakDate,
        magnitude: bestOpportunity.peakMagnitude,
        visibility: bestOpportunity.visibility,
        description: bestOpportunity.visibilityDescription,
        equipment: bestOpportunity.recommendedEquipment,
        rating: bestOpportunity.observabilityRating,
      } : null,
      windows: windows.slice(0, 5), // Return top 5 opportunities
      total: windows.length,
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Observation API request timed out. Please try again later.',
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Observation Opportunities API');
  }
}
