import { NextResponse } from 'next/server';
import { retryWithBackoff, FALLBACK_DATA } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface DishData {
  name?: string;
  dishNumber?: number;
  targetName?: string;
  dataRate?: number;
  frequency?: number;
  power?: number;
  signalType?: string;
}

interface DSNData {
  dishes?: DishData[];
  station?: string;
}

interface Connection {
  spacecraft: string;
  station: string;
  dish: string;
  dataRate: number;
  frequency: number;
  power: number;
  signalType: string;
  timestamp: string;
}

export async function GET() {
  try {
    // Fetch from NASA DSN Now API with retry logic
    const data = await retryWithBackoff(async () => {
      const response = await fetch('https://eyes.nasa.gov/dsn/data/dsn.json?r=' + Date.now(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; StellarNavigator/1.0)',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`DSN API returned ${response.status}`);
      }

      return await response.json();
    });

    // Parse the DSN data to extract active connections
    const connections: Connection[] = [];
    const dsnData = data as DSNData;

    if (dsnData.dishes) {
      dsnData.dishes.forEach((dish: DishData) => {
        if (dish.targetName && dish.targetName !== '' && dish.targetName !== 'none') {
          connections.push({
            spacecraft: dish.targetName,
            station: dsnData.station || 'DSN',
            dish: dish.name || `DSS-${dish.dishNumber}`,
            dataRate: dish.dataRate || 0,
            frequency: dish.frequency || 0,
            power: dish.power || -999,
            signalType: dish.signalType || 'telemetry',
            timestamp: new Date().toISOString(),
          });
        }
      });
    }

    // Alternative: Parse from dsn.xml format if JSON fails
    if (connections.length === 0) {
      try {
        const xmlText = await retryWithBackoff(async () => {
          const xmlResponse = await fetch(
            'https://eyes.nasa.gov/dsn/data/dsn.xml?r=' + Date.now(),
            {
              headers: {
                Accept: 'application/xml',
              },
              cache: 'no-store',
            }
          );

          if (!xmlResponse.ok) {
            throw new Error(`DSN XML API returned ${xmlResponse.status}`);
          }

          return await xmlResponse.text();
        });

        // Simple regex parsing for XML (server-side only)
        // Parse XML for signal data
        // const dishMatches = xmlText.matchAll(/<dish[^>]*name="([^"]*)"[^>]*>/g);
        // const targetMatches = xmlText.matchAll(/<target[^>]*name="([^"]*)"[^>]*>/g);
        // Edge Runtime compatible regex matching
        const regex =
          /<downSignal[^>]*dataRate="([^"]*)"[^>]*frequency="([^"]*)"[^>]*power="([^"]*)"[^>]*spacecraft="([^"]*)"[^>]*>/g;
        const signalMatchArray = [];
        let match;
        while ((match = regex.exec(xmlText)) !== null) {
          signalMatchArray.push(match);
        }
        for (const match of signalMatchArray) {
          if (match[4] && match[4] !== 'none') {
            connections.push({
              spacecraft: match[4],
              station: 'DSN',
              dish: 'DSS',
              dataRate: parseFloat(match[1]) || 0,
              frequency: parseFloat(match[2]) || 0,
              power: parseFloat(match[3]) || -999,
              signalType: 'downlink',
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (xmlError) {
        // Continue with empty connections, will use fallback data
      }
    }

    return NextResponse.json({
      connections,
      timestamp: new Date().toISOString(),
      source: 'NASA Deep Space Network',
      success: true,
    });
  } catch (error) {
    // Return fallback data when API fails
    const currentTime = new Date().toISOString();
    return NextResponse.json(
      {
        connections: [
          {
            spacecraft: 'VOYAGER 1',
            station: 'Goldstone',
            dish: 'DSS-14',
            dataRate: 160,
            frequency: 8420.432,
            power: -158.6,
            signalType: 'carrier',
            timestamp: currentTime,
          },
          {
            spacecraft: 'VOYAGER 2',
            station: 'Canberra',
            dish: 'DSS-43',
            dataRate: 160,
            frequency: 8420.432,
            power: -161.2,
            signalType: 'carrier',
            timestamp: currentTime,
          },
          {
            spacecraft: 'MARS2020',
            station: 'Madrid',
            dish: 'DSS-54',
            dataRate: 2000000,
            frequency: 8406.0,
            power: -115.3,
            signalType: 'telemetry',
            timestamp: currentTime,
          },
          {
            spacecraft: 'MSL',
            station: 'Goldstone',
            dish: 'DSS-24',
            dataRate: 2000000,
            frequency: 8401.5,
            power: -118.7,
            signalType: 'telemetry',
            timestamp: currentTime,
          },
          {
            spacecraft: 'PARKER SOLAR PROBE',
            station: 'Canberra',
            dish: 'DSS-35',
            dataRate: 65536,
            frequency: 8415.0,
            power: -135.2,
            signalType: 'ranging',
            timestamp: currentTime,
          },
          {
            spacecraft: 'NEW HORIZONS',
            station: 'Madrid',
            dish: 'DSS-63',
            dataRate: 1000,
            frequency: 8438.2,
            power: -152.8,
            signalType: 'ranging',
            timestamp: currentTime,
          },
        ],
        timestamp: currentTime,
        source: 'NASA Deep Space Network (fallback data)',
        message: FALLBACK_DATA.dsn.message,
      },
      { status: 503 }
    );
  }
}
