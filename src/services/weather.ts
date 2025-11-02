import { WeatherUnits } from '../contexts/SettingsContext';

export interface WeatherConditions {
  temperature: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  updatedAt: number;
}

interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    query.set(key, String(value));
  });
  return query.toString();
}

async function handleWeatherResponse(response: Response): Promise<WeatherConditions> {
  if (!response.ok) {
    throw new Error('Unable to retrieve weather information');
  }
  const data = (await response.json()) as OpenWeatherResponse;
  const weather = data.weather[0];
  return {
    temperature: data.main.temp,
    description: weather?.description ?? 'Unknown',
    icon: weather?.icon ?? '01d',
    city: data.name,
    country: data.sys?.country ?? '',
    updatedAt: Date.now()
  };
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  units: WeatherUnits,
  apiKey: string
): Promise<WeatherConditions> {
  const response = await fetch(
    `${WEATHER_ENDPOINT}?${buildQuery({ lat, lon, units, appid: apiKey })}`
  );
  return handleWeatherResponse(response);
}

export async function fetchWeatherByCity(
  city: string,
  units: WeatherUnits,
  apiKey: string
): Promise<WeatherConditions> {
  const response = await fetch(
    `${WEATHER_ENDPOINT}?${buildQuery({ q: city, units, appid: apiKey })}`
  );
  return handleWeatherResponse(response);
}
