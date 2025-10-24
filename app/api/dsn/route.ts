import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

// Use Node.js runtime for XML parsing
export const runtime = 'nodejs';

// Maximum XML size to prevent DoS attacks (10MB)
const MAX_XML_SIZE = 10 * 1024 * 1024;

// Parse XML to JSON with proper structure
async function parseXMLToJSON(xml: string): Promise<any> {
  try {
    // Security: Validate XML size before parsing
    if (xml.length > MAX_XML_SIZE) {
      console.error(`XML too large: ${xml.length} bytes (max: ${MAX_XML_SIZE})`);
      throw new Error('XML too large');
    }

    // Security: Validate no external entity declarations (XXE prevention)
    if (xml.includes('<!ENTITY') || xml.includes('<!DOCTYPE')) {
      console.error('XML contains entity declarations, rejecting for security');
      throw new Error('External entities not allowed');
    }

    const result = await parseStringPromise(xml, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: false,
      // Security: Disable external entities and DTD processing
      xmlns: false,
      strict: true,
      // Prevent type coercion attacks
      parseNumbers: false,
      parseBooleans: false
    });

    if (!result.dsn) {
      return { stations: [], timestamp: Date.now() };
    }

    // Parse stations and dishes separately since they're siblings in XML
    const stationElements = result.dsn.station || [];
    const dishElements = result.dsn.dish || [];
    
    // Ensure arrays
    const stationsArray = Array.isArray(stationElements) ? stationElements : [stationElements];
    const dishesArray = Array.isArray(dishElements) ? dishElements : [dishElements];

    // Create station map
    const stations = new Map();
    let currentStation = null;

    // Process elements in order
    for (const element of result.dsn.$$) {
      if (element['#name'] === 'station') {
        // New station found
        const stationData = {
          name: element.$.name || '',
          friendlyName: element.$.friendlyName || '',
          timeUTC: parseInt(element.$.timeUTC || '0'),
          timeZoneOffset: parseInt(element.$.timeZoneOffset || '0'),
          dishes: []
        };
        stations.set(stationData.name, stationData);
        currentStation = stationData.name;
      } else if (element['#name'] === 'dish' && currentStation) {
        // Dish belongs to current station
        const station = stations.get(currentStation);
        if (station) {
          const dishInfo = {
            name: element.$.name || '',
            azimuthAngle: parseFloat(element.$.azimuthAngle || '0'),
            elevationAngle: parseFloat(element.$.elevationAngle || '0'),
            windSpeed: element.$.windSpeed || '',
            isMSPA: element.$.isMSPA === 'true',
            isArray: element.$.isArray === 'true',
            isDDOR: element.$.isDDOR === 'true',
            activity: element.$.activity || '',
            targets: [] as any[]
          };

          // Process signals and targets
          const targets = [];
          
          // Process target elements
          if (element.target) {
            const targetArray = Array.isArray(element.target) ? element.target : [element.target];
            for (const target of targetArray) {
              const targetInfo = {
                id: parseInt(target.$.id || '0'),
                name: target.$.name || '',
                spacecraft: [target.$.name || ''],
                uplegRange: parseInt(target.$.uplegRange || '0'),
                downlegRange: parseInt(target.$.downlegRange || '0'),
                rtlt: parseFloat(target.$.rtlt || '0')
              };
              targets.push(targetInfo);
            }
          }

          // Process downSignal
          if (element.downSignal) {
            const downSignals = Array.isArray(element.downSignal) ? element.downSignal : [element.downSignal];
            for (const signal of downSignals) {
              const spacecraft = signal.$.spacecraft || '';
              let target: any = targets.find(t => t.spacecraft.includes(spacecraft));
              if (!target) {
                target = {
                  id: parseInt(signal.$.spacecraftID || '0'),
                  name: spacecraft,
                  spacecraft: [spacecraft],
                  uplegRange: 0,
                  downlegRange: 0,
                  rtlt: 0
                };
                targets.push(target);
              }
              target.downSignal = {
                active: signal.$.active === 'true',
                signalType: signal.$.signalType || '',
                dataRate: parseFloat(signal.$.dataRate || '0'),
                frequency: parseFloat(signal.$.frequency || '0'),
                power: parseFloat(signal.$.power || '0'),
                band: signal.$.band || ''
              };
            }
          }

          // Process upSignal
          if (element.upSignal) {
            const upSignals = Array.isArray(element.upSignal) ? element.upSignal : [element.upSignal];
            for (const signal of upSignals) {
              const spacecraft = signal.$.spacecraft || '';
              let target: any = targets.find(t => t.spacecraft.includes(spacecraft));
              if (!target) {
                target = {
                  id: parseInt(signal.$.spacecraftID || '0'),
                  name: spacecraft,
                  spacecraft: [spacecraft],
                  uplegRange: 0,
                  downlegRange: 0,
                  rtlt: 0
                };
                targets.push(target);
              }
              target.upSignal = {
                active: signal.$.active === 'true',
                signalType: signal.$.signalType || '',
                dataRate: parseFloat(signal.$.dataRate || '0'),
                frequency: parseFloat(signal.$.frequency || '0'),
                power: parseFloat(signal.$.power || '0'),
                band: signal.$.band || ''
              };
            }
          }

          dishInfo.targets = targets;
          station.dishes.push(dishInfo);
        }
      }
    }

    return {
      stations: Array.from(stations.values()),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('XML parsing error:', error);
    
    // Fallback to simpler parsing
    try {
      const result = await parseStringPromise(xml, {
        explicitArray: true,
        ignoreAttrs: false,
        // Security: Same protections for fallback parser
        xmlns: false,
        strict: true,
        parseNumbers: false,
        parseBooleans: false
      });

      const stations: any[] = [];
      let currentStation = null;

      if (result.dsn && result.dsn.station) {
        for (const station of result.dsn.station) {
          currentStation = {
            name: station.$.name || '',
            friendlyName: station.$.friendlyName || '',
            timeUTC: parseInt(station.$.timeUTC || '0'),
            timeZoneOffset: parseInt(station.$.timeZoneOffset || '0'),
            dishes: []
          };
          stations.push(currentStation);
        }
      }

      if (result.dsn && result.dsn.dish && stations.length > 0) {
        let stationIndex = 0;
        for (const dish of result.dsn.dish) {
          // Check if this dish has a different station indicator
          if (dish.$.name && dish.$.name.startsWith('DSS')) {
            const dishNumber = parseInt(dish.$.name.replace('DSS', ''));
            if (dishNumber >= 10 && dishNumber <= 29) stationIndex = 0; // Goldstone
            else if (dishNumber >= 50 && dishNumber <= 69) stationIndex = 1; // Madrid
            else if (dishNumber >= 30 && dishNumber <= 49) stationIndex = 2; // Canberra
          }

          if (stations[stationIndex]) {
            const dishInfo = {
              name: dish.$.name || '',
              azimuthAngle: parseFloat(dish.$.azimuthAngle || '0'),
              elevationAngle: parseFloat(dish.$.elevationAngle || '0'),
              windSpeed: dish.$.windSpeed || '',
              activity: dish.$.activity || '',
              targets: [] as any[]
            };

            // Process targets and signals
            const targets = [];
            
            if (dish.target) {
              for (const target of dish.target) {
                targets.push({
                  name: target.$.name || '',
                  spacecraft: [target.$.name || '']
                });
              }
            }

            if (dish.downSignal) {
              for (const signal of dish.downSignal) {
                const spacecraft = signal.$.spacecraft || '';
                let target: any = targets.find(t => t.spacecraft.includes(spacecraft));
                if (!target) {
                  target = { name: spacecraft, spacecraft: [spacecraft] };
                  targets.push(target);
                }
                target.downSignal = {
                  active: signal.$.active === 'true',
                  dataRate: parseFloat(signal.$.dataRate || '0'),
                  power: parseFloat(signal.$.power || '0')
                };
              }
            }

            if (dish.upSignal) {
              for (const signal of dish.upSignal) {
                const spacecraft = signal.$.spacecraft || '';
                let target: any = targets.find(t => t.spacecraft.includes(spacecraft));
                if (!target) {
                  target = { name: spacecraft, spacecraft: [spacecraft] };
                  targets.push(target);
                }
                target.upSignal = {
                  active: signal.$.active === 'true',
                  dataRate: parseFloat(signal.$.dataRate || '0'),
                  power: parseFloat(signal.$.power || '0')
                };
              }
            }

            dishInfo.targets = targets;
            stations[stationIndex].dishes.push(dishInfo);
          }
        }
      }

      return {
        stations,
        timestamp: Date.now()
      };
    } catch (fallbackError) {
      console.error('Fallback parsing error:', fallbackError);
      return { stations: [], timestamp: Date.now() };
    }
  }
}

export async function GET() {
  try {
    const response = await fetch('https://eyes.nasa.gov/dsn/data/dsn.xml', {
      next: { revalidate: 10 }, // Cache for 10 seconds
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'Mozilla/5.0 (compatible; DeepSix/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Security: Validate XML size before parsing
    if (xmlText.length > MAX_XML_SIZE) {
      console.error(`DSN XML too large: ${xmlText.length} bytes`);
      throw new Error('XML response too large');
    }

    const jsonData = await parseXMLToJSON(xmlText);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('DSN API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch DSN data',
        stations: [],
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}