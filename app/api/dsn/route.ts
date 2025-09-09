import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Parse XML to JSON
function parseXMLToJSON(xml: string): any {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  
  const stations: any[] = [];
  
  // Get all station nodes
  const stationNodes = doc.querySelectorAll('station');
  
  stationNodes.forEach(stationNode => {
    const station: any = {
      name: stationNode.getAttribute('name') || '',
      friendlyName: stationNode.getAttribute('friendlyname') || '',
      timeUTC: parseInt(stationNode.getAttribute('timeUTC') || '0'),
      timeZoneOffset: parseInt(stationNode.getAttribute('timeZoneOffset') || '0'),
      dishes: []
    };
    
    // Get all dish nodes for this station
    const dishNodes = stationNode.querySelectorAll('dish');
    
    dishNodes.forEach(dishNode => {
      const dish: any = {
        name: dishNode.getAttribute('name') || '',
        azimuthAngle: parseFloat(dishNode.getAttribute('azimuthAngle') || '0'),
        elevationAngle: parseFloat(dishNode.getAttribute('elevationAngle') || '0'),
        windSpeed: parseFloat(dishNode.getAttribute('windSpeed') || '0'),
        isMSPA: dishNode.getAttribute('isMSPA') === 'true',
        isArray: dishNode.getAttribute('isArray') === 'true',
        isDDOR: dishNode.getAttribute('isDDOR') === 'true',
        created: dishNode.getAttribute('created') || '',
        updated: dishNode.getAttribute('updated') || '',
        targets: []
      };
      
      // Get target nodes
      const downSignalNode = dishNode.querySelector('downSignal');
      const upSignalNode = dishNode.querySelector('upSignal');
      const targetNode = dishNode.querySelector('target');
      
      if (targetNode || downSignalNode || upSignalNode) {
        const target: any = {
          id: targetNode ? parseInt(targetNode.getAttribute('id') || '0') : 0,
          name: targetNode ? targetNode.getAttribute('name') || '' : '',
          spacecraft: []
        };
        
        // Parse spacecraft
        if (targetNode) {
          const spacecraftNodes = targetNode.querySelectorAll('spacecraft');
          spacecraftNodes.forEach(scNode => {
            const scName = scNode.getAttribute('name');
            if (scName) {
              target.spacecraft.push(scName);
            }
          });
        }
        
        // Parse down signal
        if (downSignalNode) {
          target.downSignal = {
            signalType: downSignalNode.getAttribute('signalType') || '',
            dataRate: parseFloat(downSignalNode.getAttribute('dataRate') || '0'),
            frequency: parseFloat(downSignalNode.getAttribute('frequency') || '0'),
            power: parseFloat(downSignalNode.getAttribute('power') || '0'),
            spacecraftId: parseInt(downSignalNode.getAttribute('spacecraftId') || '0')
          };
        }
        
        // Parse up signal
        if (upSignalNode) {
          target.upSignal = {
            signalType: upSignalNode.getAttribute('signalType') || '',
            dataRate: parseFloat(upSignalNode.getAttribute('dataRate') || '0'),
            frequency: parseFloat(upSignalNode.getAttribute('frequency') || '0'),
            power: parseFloat(upSignalNode.getAttribute('power') || '0')
          };
        }
        
        if (target.spacecraft.length > 0 || target.downSignal || target.upSignal) {
          dish.targets.push(target);
        }
      }
      
      station.dishes.push(dish);
    });
    
    stations.push(station);
  });
  
  return {
    stations,
    timestamp: Date.now()
  };
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
    const jsonData = parseXMLToJSON(xmlText);

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