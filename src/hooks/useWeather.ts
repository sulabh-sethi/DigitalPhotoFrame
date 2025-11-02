import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { WeatherConditions, fetchWeatherByCity, fetchWeatherByCoords } from '../services/weather';

interface WeatherState {
  loading: boolean;
  error?: string | null;
  weather?: WeatherConditions;
}

export const useWeather = () => {
  const {
    settings: { weather }
  } = useSettings();
  const [state, setState] = useState<WeatherState>({ loading: false, error: null });

  const apiKey = weather.apiKey ?? import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  const refresh = useCallback(async () => {
    if (!weather.enabled) {
      setState({ loading: false, error: null, weather: undefined });
      return;
    }
    if (!apiKey) {
      setState({ loading: false, error: 'OpenWeatherMap API key is not configured.' });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      let result: WeatherConditions | undefined;
      if (weather.useDeviceLocation && 'geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 7000
          });
        });
        result = await fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude,
          weather.units,
          apiKey
        );
      } else if (weather.city) {
        result = await fetchWeatherByCity(weather.city, weather.units, apiKey);
      }

      if (!result) {
        throw new Error('Weather location is not configured.');
      }

      setState({ loading: false, weather: result, error: null });
    } catch (error) {
      setState({ loading: false, error: (error as Error).message, weather: undefined });
    }
  }, [weather.enabled, weather.useDeviceLocation, weather.city, weather.units, apiKey]);

  useEffect(() => {
    refresh();
    const interval = weather.refreshMinutes * 60 * 1000;
    const id = window.setInterval(refresh, interval);
    return () => window.clearInterval(id);
  }, [refresh, weather.refreshMinutes]);

  return { ...state, refresh };
};
