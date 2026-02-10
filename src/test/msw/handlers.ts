import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://geocoding-api.open-meteo.com/v1/search', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') ?? '';

    // Basic “ZIP not found” case
    if (name === '00000') {
      return HttpResponse.json({ results: [] });
    }

    // Happy path: any other ZIP returns a single mock location
    return HttpResponse.json({
      results: [
        {
          id: 1,
          name: 'Mock City',
          latitude: 40.7128,
          longitude: -74.006,
          country: 'US',
          admin1: 'NY',
        },
      ],
    });
  }),

  http.get('https://api.open-meteo.com/v1/forecast', () => {
    return HttpResponse.json({
      timezone: 'America/New_York',
      current: {
        time: '2026-02-10T09:00',
        temperature_2m: 42.1,
        apparent_temperature: 39.5,
        weather_code: 2,
        wind_speed_10m: 10.2,
      },
      hourly: {
        time: Array.from(
          { length: 24 },
          (_, i) => `2026-02-10T${String(i).padStart(2, '0')}:00`,
        ),
        temperature_2m: Array.from({ length: 24 }, (_, i) => 40 + i * 0.2),
        precipitation_probability: Array.from({ length: 24 }, () => 10),
        weather_code: Array.from({ length: 24 }, () => 2),
      },
      daily: {
        time: Array.from(
          { length: 7 },
          (_, i) => `2026-02-${String(10 + i).padStart(2, '0')}`,
        ),
        temperature_2m_max: [45, 46, 44, 43, 41, 42, 40],
        temperature_2m_min: [32, 33, 31, 30, 28, 29, 27],
        weather_code: [2, 3, 1, 61, 2, 45, 0],
      },
    });
  }),
];
