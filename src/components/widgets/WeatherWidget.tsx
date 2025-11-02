import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useWeather } from '../../hooks/useWeather';
import './WeatherWidget.css';

const WeatherWidget: React.FC = () => {
  const {
    settings: { weather }
  } = useSettings();
  const { weather: conditions, error, loading } = useWeather();

  if (!weather.enabled) {
    return null;
  }

  return (
    <div className="weather-widget" aria-live="polite">
      {loading && <span className="weather-widget__status">Updating weather…</span>}
      {error && <span className="weather-widget__status weather-widget__status--error">{error}</span>}
      {conditions && !error && (
        <div className="weather-widget__content">
          <img
            alt={conditions.description}
            src={`https://openweathermap.org/img/wn/${conditions.icon}@2x.png`}
          />
          <div className="weather-widget__details">
            <span className="weather-widget__temp">{Math.round(conditions.temperature)}°</span>
            <span className="weather-widget__meta">
              {conditions.city}, {conditions.country}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
