import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// Use Node.js runtime for XML parsing
export const runtime = 'nodejs';

// Parse XML to JSON
async function parseXMLToJSON(xml: string): Promise<any> {
  try {
    const result = await parseStringPromise(xml, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: false
    });

    if (!result.dsn || !result.dsn.station) {
      return { stations: [], timestamp: Date.now() };
    }

    // Ensure stations is always an array
    const stationData = Array.isArray(result.dsn.station) 
      ? result.dsn.station 
      : [result.dsn.station];

    const stations = stationData.map((station: any) => {
      const stationInfo = {
        name: station.$.name || '',
        friendlyName: station.$.friendlyname || '',
        timeUTC: parseInt(station.$.timeUTC || '0'),
        timeZoneOffset: parseInt(station.$.timeZoneOffset || '0'),
        dishes: [] as any[]
      };

      // Process dishes
      if (station.dish) {
        const dishes = Array.isArray(station.dish) ? station.dish : [station.dish];
        
        stationInfo.dishes = dishes.map((dish: any) => {
          const dishInfo: any = {
            name: dish.$.name || '',
            azimuthAngle: parseFloat(dish.$.azimuthAngle || '0'),
            elevationAngle: parseFloat(dish.$.elevationAngle || '0'),
            windSpeed: parseFloat(dish.$.windSpeed || '0'),
            isMSPA: dish.$.isMSPA === 'true',
            isArray: dish.$.isArray === 'true',
            isDDOR: dish.$.isDDOR === 'true',
            created: dish.$.created || '',
            updated: dish.$.updated || '',
            targets: []
          };

          // Process targets
          if (dish.target || dish.downSignal || dish.upSignal) {
            const target: any = {
              id: 0,
              name: '',
              spacecraft: []
            };

            // Handle target info
            if (dish.target) {
              const targetData = Array.isArray(dish.target) ? dish.target[0] : dish.target;
              target.id = parseInt(targetData.$.id || '0');
              target.name = targetData.$.name || '';
              
              // Handle spacecraft
              if (targetData.spacecraft) {
                const spacecraftData = Array.isArray(targetData.spacecraft) 
                  ? targetData.spacecraft 
                  : [targetData.spacecraft];
                
                target.spacecraft = spacecraftData
                  .map((sc: any) => sc.$.name || sc._ || '')
                  .filter((name: string) => name);
              }
            }

            // Handle downSignal
            if (dish.downSignal) {
              const downSignalData = Array.isArray(dish.downSignal) 
                ? dish.downSignal[0] 
                : dish.downSignal;
              
              target.downSignal = {
                signalType: downSignalData.$.signalType || '',
                dataRate: parseFloat(downSignalData.$.dataRate || '0'),
                frequency: parseFloat(downSignalData.$.frequency || '0'),
                power: parseFloat(downSignalData.$.power || '0'),
                spacecraftId: parseInt(downSignalData.$.spacecraftId || '0')
              };
            }

            // Handle upSignal
            if (dish.upSignal) {
              const upSignalData = Array.isArray(dish.upSignal) 
                ? dish.upSignal[0] 
                : dish.upSignal;
              
              target.upSignal = {
                signalType: upSignalData.$.signalType || '',
                dataRate: parseFloat(upSignalData.$.dataRate || '0'),
                frequency: parseFloat(upSignalData.$.frequency || '0'),
                power: parseFloat(upSignalData.$.power || '0')
              };
            }

            if (target.spacecraft.length > 0 || target.downSignal || target.upSignal) {
              dishInfo.targets.push(target);
            }
          }

          return dishInfo;
        });
      }

      return stationInfo;
    });

    return {
      stations,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return { stations: [], timestamp: Date.now() };
  }
}

export async function GET() {
  try {
    // Fetch the DSN XML data
    const response = await fetch('https://eyes.nasa.gov/dsn/data/dsn.xml', {
      next: { revalidate: 5 } // Cache for 5 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch DSN data: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const jsonData = await parseXMLToJSON(xmlText);

    return NextResponse.json(jsonData, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching DSN data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DSN data' },
      { status: 500 }
    );
  }
}