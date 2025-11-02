import React from 'react';
import classNames from 'classnames';
import {
  AmbientSoundscape,
  ClockPosition,
  ClockStyle,
  TimeFormat,
  TransitionEffect,
  useSettings,
  useUpdateSettings
} from '../../contexts/SettingsContext';
import './CustomizationPanel.css';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutGoogle?: () => void | Promise<void>;
}

const positions: ClockPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const styles: ClockStyle[] = ['digital', 'analog'];
const formats: TimeFormat[] = ['12h', '24h'];
const transitions: TransitionEffect[] = ['fade', 'pan', 'zoom', 'slide', 'kenburns'];
const soundscapes: AmbientSoundscape[] = ['aurora', 'focus', 'waves'];

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ isOpen, onClose, onLogoutGoogle }) => {
  const { settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const handleChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    updateSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={classNames('customization-panel', { 'customization-panel--open': isOpen })}>
      <div className="customization-panel__header">
        <h2>Customize Experience</h2>
        <button onClick={onClose} type="button">
          Close
        </button>
      </div>
      <div className="customization-panel__content">
        <section>
          <header>
            <h3>Clock</h3>
          </header>
          <label className="customization-panel__toggle">
            <input
              type="checkbox"
              checked={settings.clock.enabled}
              onChange={(event) => handleChange('clock', { ...settings.clock, enabled: event.target.checked })}
            />
            Show Clock
          </label>
          <div className="customization-panel__grid">
            <div>
              <span>Position</span>
              <div className="customization-panel__row">
                {positions.map((position) => (
                  <button
                    key={position}
                    type="button"
                    className={classNames({ active: settings.clock.position === position })}
                    onClick={() => handleChange('clock', { ...settings.clock, position })}
                  >
                    {position.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span>Style</span>
              <div className="customization-panel__row">
                {styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={classNames({ active: settings.clock.style === style })}
                    onClick={() => handleChange('clock', { ...settings.clock, style })}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span>Format</span>
              <div className="customization-panel__row">
                {formats.map((format) => (
                  <button
                    key={format}
                    type="button"
                    className={classNames({ active: settings.clock.format === format })}
                    onClick={() => handleChange('clock', { ...settings.clock, format })}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section>
          <header>
            <h3>Fonts & Display</h3>
          </header>
          <label>
            Font Family
            <select
              value={settings.font.family}
              onChange={(event) => handleChange('font', { ...settings.font, family: event.target.value as typeof settings.font.family })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="DM Sans">DM Sans</option>
            </select>
          </label>
          <label>
            Font Scale
            <input
              type="range"
              min={0.8}
              max={1.4}
              step={0.05}
              value={settings.font.scale}
              onChange={(event) => handleChange('font', { ...settings.font, scale: Number(event.target.value) })}
            />
          </label>
        </section>
        <section>
          <header>
            <h3>Transitions</h3>
          </header>
          <div className="customization-panel__row">
            {transitions.map((transition) => (
              <button
                key={transition}
                type="button"
                className={classNames({ active: settings.transitions.effect === transition })}
                onClick={() => handleChange('transitions', { ...settings.transitions, effect: transition })}
              >
                {transition}
              </button>
            ))}
          </div>
          <label>
            Interval ({settings.transitions.intervalSeconds}s)
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={settings.transitions.intervalSeconds}
              onChange={(event) =>
                handleChange('transitions', {
                  ...settings.transitions,
                  intervalSeconds: Number(event.target.value)
                })
              }
            />
          </label>
        </section>
        <section>
          <header>
            <h3>Visuals</h3>
          </header>
          <label>
            Brightness ({settings.visuals.brightness})
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={settings.visuals.brightness}
              onChange={(event) =>
                handleChange('visuals', { ...settings.visuals, brightness: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Contrast ({settings.visuals.contrast})
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={settings.visuals.contrast}
              onChange={(event) =>
                handleChange('visuals', { ...settings.visuals, contrast: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Overlay Opacity ({Math.round(settings.visuals.overlayOpacity * 100)}%)
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.visuals.overlayOpacity}
              onChange={(event) =>
                handleChange('visuals', {
                  ...settings.visuals,
                  overlayOpacity: Number(event.target.value)
                })
              }
            />
          </label>
        </section>
        <section>
          <header>
            <h3>Startup</h3>
          </header>
          <label className="customization-panel__toggle">
            <input
              type="checkbox"
              checked={settings.startup.autoStartSlideshow}
              onChange={(event) =>
                handleChange('startup', {
                  ...settings.startup,
                  autoStartSlideshow: event.target.checked
                })
              }
            />
            Auto-start slideshow when app launches
          </label>
        </section>
        <section>
          <header>
            <h3>Ambient Audio</h3>
          </header>
          <label className="customization-panel__toggle">
            <input
              type="checkbox"
              checked={settings.audio.enabled}
              onChange={(event) => handleChange('audio', { ...settings.audio, enabled: event.target.checked })}
            />
            Enable ambient music
          </label>
          <label>
            Soundscape
            <select
              value={settings.audio.soundscape}
              onChange={(event) =>
                handleChange('audio', {
                  ...settings.audio,
                  soundscape: event.target.value as AmbientSoundscape
                })
              }
            >
              {soundscapes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Volume ({Math.round(settings.audio.volume * 100)}%)
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.audio.volume}
              onChange={(event) => handleChange('audio', { ...settings.audio, volume: Number(event.target.value) })}
            />
          </label>
        </section>
        <section>
          <header>
            <h3>Integrations</h3>
          </header>
          <label>
            Google OAuth Client ID
            <input
              type="text"
              value={settings.integrations.googleClientId ?? ''}
              onChange={(event) =>
                handleChange('integrations', {
                  ...settings.integrations,
                  googleClientId: event.target.value
                })
              }
              placeholder="Paste your OAuth client ID"
            />
          </label>
          <p className="customization-panel__hint">
            Use the client ID from your Google Cloud console or define <code>VITE_GOOGLE_CLIENT_ID</code> in a
            <code>.env</code> file.
          </p>
        </section>
        <section>
          <header>
            <h3>Weather</h3>
          </header>
          <label className="customization-panel__toggle">
            <input
              type="checkbox"
              checked={settings.weather.enabled}
              onChange={(event) =>
                handleChange('weather', { ...settings.weather, enabled: event.target.checked })
              }
            />
            Show weather widget
          </label>
          <label className="customization-panel__toggle">
            <input
              type="checkbox"
              checked={settings.weather.useDeviceLocation}
              onChange={(event) =>
                handleChange('weather', {
                  ...settings.weather,
                  useDeviceLocation: event.target.checked
                })
              }
            />
            Use device location
          </label>
          <label>
            City (if not using device location)
            <input
              type="text"
              value={settings.weather.city ?? ''}
              onChange={(event) =>
                handleChange('weather', { ...settings.weather, city: event.target.value })
              }
            />
          </label>
          <label>
            OpenWeatherMap API Key
            <input
              type="text"
              value={settings.weather.apiKey ?? ''}
              onChange={(event) =>
                handleChange('weather', { ...settings.weather, apiKey: event.target.value })
              }
            />
          </label>
          <label>
            Units
            <select
              value={settings.weather.units}
              onChange={(event) =>
                handleChange('weather', { ...settings.weather, units: event.target.value as typeof settings.weather.units })
              }
            >
              <option value="metric">Metric (°C)</option>
              <option value="imperial">Imperial (°F)</option>
            </select>
          </label>
        </section>
        {onLogoutGoogle && (
          <section>
            <header>
              <h3>Account</h3>
            </header>
            <button
              type="button"
              className="customization-panel__logout"
              onClick={() => {
                void onLogoutGoogle();
              }}
            >
              Logout Google Photos
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default CustomizationPanel;
