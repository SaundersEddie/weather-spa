import { useMemo, useState } from 'react';
import {
  fetchForecast,
  geocodeZip,
  type Forecast,
  type GeoResult,
} from '../api/openMeteo';

type Props = {
  title: string;
  testId: string;
};

type Status = 'idle' | 'loading' | 'ready' | 'error';

function formatPlace(g: GeoResult) {
  const region = g.admin1 ? `, ${g.admin1}` : '';
  return `${g.name}${region}, ${g.country}`;
}

// Minimal, good-enough labels/icons (no extra files)
function codeLabel(code: number) {
  // Open-Meteo weather_code mapping (simplified buckets)
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunder';
  return `Code ${code}`;
}

function codeIcon(code: number) {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}

function toLocalHour(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric' });
}

function toLocalDow(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: 'short' });
}

export default function WeatherPanel({ title, testId }: Props) {
  const [zip, setZip] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);

  const [place, setPlace] = useState<string>('');
  const [forecast, setForecast] = useState<Forecast | null>(null);

  const disabled = status === 'loading';

  const next24 = useMemo(() => {
    const h = forecast?.hourly;
    if (!h?.time?.length) return [];
    // take first 24 hours from returned hourly arrays
    const n = Math.min(24, h.time.length);
    return Array.from({ length: n }, (_, i) => ({
      time: h.time[i],
      temp: h.temperature_2m?.[i],
      pop: h.precipitation_probability?.[i],
      code: h.weather_code?.[i],
    }));
  }, [forecast]);

  const next7 = useMemo(() => {
    const d = forecast?.daily;
    if (!d?.time?.length) return [];
    const n = Math.min(7, d.time.length);
    return Array.from({ length: n }, (_, i) => ({
      day: d.time[i],
      hi: d.temperature_2m_max?.[i],
      lo: d.temperature_2m_min?.[i],
      code: d.weather_code?.[i],
    }));
  }, [forecast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleaned = zip.trim();
    if (!/^\d{5}$/.test(cleaned)) {
      setStatus('error');
      setErr('Enter a 5-digit ZIP.');
      return;
    }

    try {
      setStatus('loading');
      const results = await geocodeZip(cleaned);

      if (!results.length) {
        setStatus('error');
        setErr('No results for that ZIP.');
        setForecast(null);
        setPlace('');
        return;
      }

      const best = results[0];
      setPlace(formatPlace(best));

      const fc = await fetchForecast(best.latitude, best.longitude);
      setForecast(fc);

      setStatus('ready');
    } catch (ex) {
      setStatus('error');
      setErr(
        ex instanceof Error ? ex.message : 'Something broke fetching weather.',
      );
    }
  }

  const cur = forecast?.current;

  return (
    <section className='panel' data-testid={testId}>
      <div className='panel-header p-3'>
        <div className='d-flex align-items-center justify-content-between'>
          <div>
            <div className='fw-semibold'>{title}</div>
            <div className='small muted'>
              {place || 'Enter a ZIP to load weather'}
            </div>
          </div>
          {status === 'loading' ? (
            <span className='badge text-bg-secondary'>Loading</span>
          ) : null}
        </div>

        <form className='mt-3' onSubmit={onSubmit}>
          <label htmlFor={`${testId}-zip`} className='form-label mb-1'>
            ZIP
          </label>
          <div className='input-group'>
            <input
              id={`${testId}-zip`}
              className='form-control'
              inputMode='numeric'
              placeholder='e.g. 10001'
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              disabled={disabled}
              aria-label='ZIP'
            />
            <button
              className='btn btn-outline-light'
              type='submit'
              disabled={disabled}
            >
              Get Weather
            </button>
          </div>
          {err ? <div className='text-warning small mt-2'>{err}</div> : null}
        </form>
      </div>

      <div className='p-3'>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='fw-semibold'>Now</div>
          {cur ? (
            <div className='small muted'>
              {new Date(cur.time).toLocaleString()}
            </div>
          ) : null}
        </div>

        {cur ? (
          <div className='mt-2 d-flex align-items-center justify-content-between'>
            <div>
              <div className='display-6 mb-0'>
                {Math.round(cur.temperature_2m)}°{' '}
                <span className='fs-6 muted'>
                  ({codeLabel(cur.weather_code)})
                </span>
              </div>
              <div className='muted small'>
                Feels {Math.round(cur.apparent_temperature)}° • Wind{' '}
                {Math.round(cur.wind_speed_10m)} mph
              </div>
            </div>
            <div style={{ fontSize: 44 }}>{codeIcon(cur.weather_code)}</div>
          </div>
        ) : (
          <div className='muted mt-2'>No data yet.</div>
        )}

        <hr className='border-opacity-25 my-3' />

        <div className='fw-semibold mb-2'>Next 24 Hours</div>
        {next24.length ? (
          <div className='hourly-row'>
            {next24.map((h, idx) => (
              <div className='hour-card' key={idx}>
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='small muted'>{toLocalHour(h.time)}</div>
                  <div>{codeIcon(h.code ?? 0)}</div>
                </div>
                <div className='fs-5 fw-semibold mt-1'>
                  {Math.round(h.temp ?? 0)}°
                </div>
                <div className='small muted'>
                  {h.pop != null ? `${Math.round(h.pop)}% precip` : '—'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='muted'>—</div>
        )}

        <div className='day-row pt-3 mt-3'>
          <div className='fw-semibold mb-2'>7-Day</div>
          {next7.length ? (
            <div className='d-grid gap-2'>
              {next7.map((d, idx) => (
                <div
                  key={idx}
                  className='d-flex align-items-center justify-content-between px-3 py-2'
                  style={{
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,.03)',
                  }}
                >
                  <div className='d-flex align-items-center gap-2'>
                    <div style={{ width: 42 }} className='fw-semibold'>
                      {toLocalDow(d.day)}
                    </div>
                    <div>{codeIcon(d.code ?? 0)}</div>
                    <div className='small muted'>{codeLabel(d.code ?? 0)}</div>
                  </div>
                  <div className='d-flex align-items-center gap-3'>
                    <div className='fw-semibold'>{Math.round(d.hi ?? 0)}°</div>
                    <div className='muted'>{Math.round(d.lo ?? 0)}°</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='muted'>—</div>
          )}
        </div>
      </div>
    </section>
  );
}
