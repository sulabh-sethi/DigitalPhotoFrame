import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ClockPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ClockStyle = 'digital' | 'analog';
export type TimeFormat = '12h' | '24h';
export type TransitionEffect = 'fade' | 'pan' | 'zoom' | 'slide' | 'kenburns';
export type WeatherUnits = 'metric' | 'imperial';
export type AmbientSoundscape = 'aurora' | 'focus' | 'waves';

export interface IntegrationSettings {
  googleClientId?: string;
}

export interface ClockSettings {
  enabled: boolean;
  position: ClockPosition;
  style: ClockStyle;
  format: TimeFormat;
}

export interface FontSettings {
  family: 'Inter' | 'Roboto' | 'DM Sans';
  scale: number;
}

export interface TransitionSettings {
  effect: TransitionEffect;
  intervalSeconds: number;
}

export interface VisualSettings {
  brightness: number;
  contrast: number;
  overlayOpacity: number;
}

export interface StartupSettings {
  autoStartSlideshow: boolean;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number;
  soundscape: AmbientSoundscape;
}

export interface WeatherSettings {
  enabled: boolean;
  useDeviceLocation: boolean;
  city?: string;
  apiKey?: string;
  units: WeatherUnits;
  refreshMinutes: number;
}

export interface SettingsState {
  theme: ThemeMode;
  clock: ClockSettings;
  font: FontSettings;
  transitions: TransitionSettings;
  visuals: VisualSettings;
  startup: StartupSettings;
  audio: AudioSettings;
  weather: WeatherSettings;
  integrations: IntegrationSettings;
}

export interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (updater: (prev: SettingsState) => SettingsState) => void;
  reset: () => void;
}

const STORAGE_KEY = 'digital-fotoframe::settings';

const defaultSettings: SettingsState = {
  theme: 'dark',
  clock: {
    enabled: true,
    position: 'top-right',
    style: 'digital',
    format: '24h'
  },
  font: {
    family: 'Inter',
    scale: 1
  },
  transitions: {
    effect: 'fade',
    intervalSeconds: 8
  },
  visuals: {
    brightness: 1,
    contrast: 1,
    overlayOpacity: 0.65
  },
  startup: {
    autoStartSlideshow: true
  },
  audio: {
    enabled: false,
    volume: 0.4,
    soundscape: 'aurora'
  },
  weather: {
    enabled: true,
    useDeviceLocation: true,
    city: undefined,
    apiKey: undefined,
    units: 'metric',
    refreshMinutes: 15
  },
  integrations: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
  }
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed } as SettingsState;
    } catch (error) {
      console.warn('Unable to load stored settings', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Unable to persist settings', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updater: (prev: SettingsState) => SettingsState) => {
    setSettings((prev) => updater(prev));
  }, []);

  const reset = useCallback(() => setSettings(defaultSettings), []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings,
      reset
    }),
    [settings, updateSettings, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside a SettingsProvider');
  }
  return context;
};

export const useThemeClass = (): ThemeMode => {
  const {
    settings: { theme }
  } = useSettings();
  return theme;
};

export const useToggleTheme = () => {
  const { updateSettings } = useSettings();
  return useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, [updateSettings]);
};

export const useUpdateSettings = () => useSettings().updateSettings;
