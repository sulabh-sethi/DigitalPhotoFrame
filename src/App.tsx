import React, { useEffect, useMemo, useRef, useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Slideshow from './components/Slideshow';
import TopBar from './components/layout/TopBar';
import CustomizationPanel from './components/customization/CustomizationPanel';
import GooglePhotosManager from './components/GooglePhotosManager';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useLocalFolderSource } from './hooks/useLocalFolderSource';
import { useGooglePhotos } from './hooks/useGooglePhotos';
import { PhotoItem, PhotoSource } from './utils/types';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
};

const AppShell: React.FC = () => {
  const { settings } = useSettings();
  const local = useLocalFolderSource();
  const google = useGooglePhotos();
  const [isCustomizationOpen, setCustomizationOpen] = useState(false);
  const [showGoogleManager, setShowGoogleManager] = useState(false);
  const [view, setView] = useState<'welcome' | 'slideshow'>('welcome');
  const [activePhotos, setActivePhotos] = useState<PhotoItem[]>([]);
  const [activeSource, setActiveSource] = useState<PhotoSource | undefined>();
  const autoStarted = useRef(false);

  useEffect(() => {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(settings.theme === 'dark' ? 'dark-theme' : 'light-theme');
  }, [settings.theme]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((error) =>
        console.warn('Service worker registration failed', error)
      );
    }
  }, []);

  useEffect(() => {
    if (view === 'slideshow' && activeSource?.type === 'local') {
      setActivePhotos(local.photos);
      setActiveSource(local.source);
    }
  }, [local.photos, local.source, view, activeSource?.type]);

  useEffect(() => {
    if (view === 'slideshow' && activeSource?.type === 'google') {
      setActivePhotos(google.photos);
      setActiveSource(google.source);
    }
  }, [google.photos, google.source, view, activeSource?.type]);

  useEffect(() => {
    if (!settings.startup.autoStartSlideshow || autoStarted.current) {
      return;
    }
    if (google.photos.length > 0) {
      setActivePhotos(google.photos);
      setActiveSource(google.source);
      setView('slideshow');
      autoStarted.current = true;
    } else if (local.photos.length > 0) {
      setActivePhotos(local.photos);
      setActiveSource(local.source);
      setView('slideshow');
      autoStarted.current = true;
    }
  }, [settings.startup.autoStartSlideshow, google.photos, google.source, local.photos, local.source]);

  const startLocalSlideshow = async () => {
    const selection = await local.selectFolder({ recursive: true });
    if (selection.photos.length > 0) {
      setActivePhotos(selection.photos);
      setActiveSource(selection.source);
      setView('slideshow');
    }
  };

  const startGoogleSlideshow = () => {
    if (google.photos.length > 0) {
      setActivePhotos(google.photos);
      setActiveSource(
        google.source ?? {
          type: 'google',
          displayName: google.account?.name ?? google.account?.email ?? 'Google Photos',
          lastSynced: new Date().toISOString()
        }
      );
      setView('slideshow');
      setShowGoogleManager(false);
    }
  };

  const exitSlideshow = () => {
    setView('welcome');
  };

  const showLocalError = local.error;

  const backgroundClass = useMemo(() => `app-shell app-shell--${settings.theme}`, [settings.theme]);

  return (
    <div className={backgroundClass}>
      <TopBar onCustomize={() => setCustomizationOpen(true)} />
      {view === 'welcome' ? (
        <div className="app-shell__content">
          <WelcomeScreen onSelectLocal={startLocalSlideshow} onConnectGoogle={() => setShowGoogleManager(true)} />
          {showLocalError && <div className="app-shell__toast">{showLocalError}</div>}
        </div>
      ) : (
        <Slideshow photos={activePhotos} source={activeSource} onExit={exitSlideshow} />
      )}
      <CustomizationPanel
        isOpen={isCustomizationOpen}
        onClose={() => setCustomizationOpen(false)}
        onLogoutGoogle={google.account ? google.logout : undefined}
      />
      {showGoogleManager && (
        <GooglePhotosManager google={google} onClose={() => setShowGoogleManager(false)} onStartSlideshow={startGoogleSlideshow} />
      )}
    </div>
  );
};

export default App;
