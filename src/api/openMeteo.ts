export type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
  postcodes?: string[];
};

export async function geocodeZip(zip: string) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', zip);
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  url.searchParams.set('countryCode', 'US');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  return (data?.results ?? []) as GeoResult[];
}

export type Forecast = {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability?: number[];
    weather_code: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
  timezone?: string;
};

// export async function fetchForecast(lat: number, lon: number) {
export async function fetchForecast(
  lat: number,
  lon: number,
  unit: 'C' | 'F' = 'C',
) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('timezone', 'auto');

  if (unit === 'F') {
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'mph');
  }

  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
  );

  url.searchParams.set(
    'hourly',
    ['temperature_2m', 'precipitation_probability', 'weather_code'].join(','),
  );

  url.searchParams.set(
    'daily',
    ['temperature_2m_max', 'temperature_2m_min', 'weather_code'].join(','),
  );

  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast fetch failed');
  return (await res.json()) as Forecast;
}
