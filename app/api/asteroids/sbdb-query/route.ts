import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface SBDBQueryResponse {
  signature: {
    version: string;
    source: string;
  };
  count: number;
  fields: string[];
  data: any[][];
}

/**
 * GET /api/asteroids/sbdb-query
 * Advanced asteroid search using NASA SBDB Query API
 *
 * Allows filtering asteroids by various criteria including orbital parameters,
 * physical properties, and hazard classifications.
 *
 * Query parameters:
 * - kind: Object kind (a=asteroids, c=comets, n=numbered, u=unnumbered)
 * - neo: Filter Near-Earth Objects (true/false)
 * - pha: Filter Potentially Hazardous Asteroids (true/false)
 * - limit: Maximum results (default 100, max 1000)
 * - h-min / h-max: Absolute magnitude range
 * - diameter-min / diameter-max: Diameter range in km
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Always set kind to asteroids (required by API)
    queryParams.append('sb-kind', 'a');

    // NEO/PHA filter using sb-group
    const neo = searchParams.get('neo');
    const pha = searchParams.get('pha');

    if (pha === 'true') {
      // PHA is a subset of NEO, so use pha group
      queryParams.append('sb-group', 'pha');
    } else if (neo === 'true') {
      queryParams.append('sb-group', 'neo');
    }

    // Absolute magnitude range using sb-cdata
    // Format: {"AND":["H|LT|18"]} with pipe-delimited constraints
    const hMin = searchParams.get('h-min');
    const hMax = searchParams.get('h-max');

    if (hMin || hMax) {
      const constraints: string[] = [];

      if (hMin && hMax) {
        // Range constraint: H|RG|min|max
        constraints.push(`H|RG|${hMin}|${hMax}`);
      } else if (hMax) {
        // Less than constraint: H|LT|max
        constraints.push(`H|LT|${hMax}`);
      } else if (hMin) {
        // Greater than constraint: H|GT|min
        constraints.push(`H|GT|${hMin}`);
      }

      if (constraints.length > 0) {
        queryParams.append('sb-cdata', JSON.stringify({ AND: constraints }));
      }
    }

    // Limit
    const limit = searchParams.get('limit') || '100';
    queryParams.append('limit', limit);

    // Fields to return (using pdes for permanent designation identifier)
    queryParams.append('fields', 'pdes,full_name,H,diameter,neo,pha,class');

    const sbdbQueryUrl = `https://ssd-api.jpl.nasa.gov/sbdb_query.api?${queryParams.toString()}`;

    const fetchSBDBQueryData = async (): Promise<SBDBQueryResponse> => {
      const response = await fetch(sbdbQueryUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SBDB Query API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data as SBDBQueryResponse;
    };

    // Wrap in timeout (15 seconds for potentially large queries)
    const queryData = await withTimeout(fetchSBDBQueryData(), 15000);

    // Transform array data to objects
    const fieldNames = queryData.fields;
    const asteroids = queryData.data.map((row) => {
      // Map array values to field names
      const obj: Record<string, any> = {};
      fieldNames.forEach((field, index) => {
        obj[field] = row[index];
      });

      // Use pdes (primary designation) as the permanent identifier
      const designation = obj.pdes || '';
      const fullName = obj.full_name || designation;

      const isNEO = obj.neo === 'Y' || obj.neo === 'y';
      const isPHA = obj.pha === 'Y' || obj.pha === 'y';
      const absoluteMagnitude = obj.H ? parseFloat(obj.H) : null;
      const diameter = obj.diameter ? parseFloat(obj.diameter) : null;

      // Size category based on diameter or H
      let sizeCategory = 'Unknown';
      if (diameter !== null) {
        if (diameter < 0.1) sizeCategory = 'Very Small';
        else if (diameter < 1) sizeCategory = 'Small';
        else if (diameter < 10) sizeCategory = 'Medium';
        else if (diameter < 100) sizeCategory = 'Large';
        else sizeCategory = 'Very Large';
      } else if (absoluteMagnitude !== null) {
        if (absoluteMagnitude < 18) sizeCategory = 'Large';
        else if (absoluteMagnitude < 22) sizeCategory = 'Medium';
        else sizeCategory = 'Small';
      }

      // Hazard level
      const hazardLevel = isPHA ? 'Potentially Hazardous' :
                         isNEO ? 'Near-Earth Object' :
                         'Non-hazardous';

      return {
        designation,
        name: fullName,
        fullName: fullName,
        isNEO,
        isPHA,
        absoluteMagnitude,
        diameter,
        diameterUnit: 'km',
        orbitClass: obj.class || 'Unknown',
        sizeCategory,
        hazardLevel,
        // Raw data for additional fields
        raw: obj,
      };
    });

    // Calculate summary statistics
    const summary = {
      total: queryData.count,
      returned: asteroids.length,
      neo: asteroids.filter(a => a.isNEO).length,
      pha: asteroids.filter(a => a.isPHA).length,
      sizeDistribution: {
        veryLarge: asteroids.filter(a => a.sizeCategory === 'Very Large').length,
        large: asteroids.filter(a => a.sizeCategory === 'Large').length,
        medium: asteroids.filter(a => a.sizeCategory === 'Medium').length,
        small: asteroids.filter(a => a.sizeCategory === 'Small').length,
        verySmall: asteroids.filter(a => a.sizeCategory === 'Very Small').length,
      },
    };

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL Small-Body Database Query',
      timestamp: new Date().toISOString(),
      query: {
        neo: neo || 'any',
        pha: pha || 'any',
        limit: parseInt(limit),
      },
      summary,
      asteroids,
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request Timeout',
            message: 'SBDB Query API request timed out. Try reducing the result limit or refining your search.',
          },
          { status: 504 }
        );
      }

      if (error.message.includes('400')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Invalid query parameters. Please check your search criteria.',
          },
          { status: 400 }
        );
      }
    }

    return handleApiError(error, 'SBDB Query API');
  }
}
