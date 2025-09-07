// NASA Deep Space Network Now API
// Real-time data about which spacecraft are communicating with Earth

export interface DSNDish {
  name: string;
  azimuthAngle: number;
  elevationAngle: number;
  windSpeed: number;
  isMSPA: boolean;
  isArray: boolean;
  isDDOR: boolean;
  created: string;
  updated: string;
}

export interface DSNTarget {
  id: number;
  name: string;
  downSignal: DSNSignal[];
  upSignal: DSNSignal[];
}

export interface DSNSignal {
  id: number;
  signalType: string;
  dataRate: number;
  frequency: number;
  power: number;
  spacecraft: string;
  spacecraftId: number;
}

export interface DSNStation {
  name: string;
  friendlyName: string;
  timeUTC: number;
  timeZoneOffset: number;
  dishes: DSNDish[];
}

export async function fetchDSNNow() {
  try {
    // NASA's Deep Space Network Now API (no auth required)
    const response = await fetch('https://eyes.nasa.gov/dsn/data/dsn.xml?r=' + Date.now(), {
      cache: 'no-store',
      headers: {
        Accept: 'application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`DSN API error: ${response.status}`);
    }

    const text = await response.text();

    // Parse XML response (DSN returns XML not JSON)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    // Extract station data
    const stations: DSNStation[] = [];
    const stationNodes = xmlDoc.querySelectorAll('station');

    stationNodes.forEach((station) => {
      const dishes: DSNDish[] = [];
      const dishNodes = station.querySelectorAll('dish');

      dishNodes.forEach((dish) => {
        const targets: DSNTarget[] = [];
        const targetNodes = dish.querySelectorAll('target');

        targetNodes.forEach((target) => {
          const downSignals: DSNSignal[] = [];
          const upSignals: DSNSignal[] = [];

          const downNodes = target.querySelectorAll('downSignal');
          downNodes.forEach((signal) => {
            downSignals.push({
              id: parseInt(signal.getAttribute('id') || '0'),
              signalType: signal.getAttribute('signalType') || '',
              dataRate: parseFloat(signal.getAttribute('dataRate') || '0'),
              frequency: parseFloat(signal.getAttribute('frequency') || '0'),
              power: parseFloat(signal.getAttribute('power') || '0'),
              spacecraft: signal.getAttribute('spacecraft') || '',
              spacecraftId: parseInt(signal.getAttribute('spacecraftId') || '0'),
            });
          });

          const upNodes = target.querySelectorAll('upSignal');
          upNodes.forEach((signal) => {
            upSignals.push({
              id: parseInt(signal.getAttribute('id') || '0'),
              signalType: signal.getAttribute('signalType') || '',
              dataRate: parseFloat(signal.getAttribute('dataRate') || '0'),
              frequency: parseFloat(signal.getAttribute('frequency') || '0'),
              power: parseFloat(signal.getAttribute('power') || '0'),
              spacecraft: signal.getAttribute('spacecraft') || '',
              spacecraftId: parseInt(signal.getAttribute('spacecraftId') || '0'),
            });
          });

          targets.push({
            id: parseInt(target.getAttribute('id') || '0'),
            name: target.getAttribute('name') || 'Unknown',
            downSignal: downSignals,
            upSignal: upSignals,
          });
        });

        dishes.push({
          name: dish.getAttribute('name') || '',
          azimuthAngle: parseFloat(dish.getAttribute('azimuthAngle') || '0'),
          elevationAngle: parseFloat(dish.getAttribute('elevationAngle') || '0'),
          windSpeed: parseFloat(dish.getAttribute('windSpeed') || '0'),
          isMSPA: dish.getAttribute('isMSPA') === 'true',
          isArray: dish.getAttribute('isArray') === 'true',
          isDDOR: dish.getAttribute('isDDOR') === 'true',
          created: dish.getAttribute('created') || '',
          updated: dish.getAttribute('updated') || '',
        });
      });

      stations.push({
        name: station.getAttribute('name') || '',
        friendlyName: station.getAttribute('friendlyName') || '',
        timeUTC: parseInt(station.getAttribute('timeUTC') || '0'),
        timeZoneOffset: parseInt(station.getAttribute('timeZoneOffset') || '0'),
        dishes,
      });
    });

    return { stations, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to fetch DSN data:', error);
    return null;
  }
}
