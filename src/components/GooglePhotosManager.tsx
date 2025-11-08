import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { isGoogleAuthConfigured } from '../services/googlePhotos';
import { GooglePhotosHook } from '../hooks/useGooglePhotos';
import './GooglePhotosManager.css';

interface GooglePhotosManagerProps {
  google: GooglePhotosHook;
  onClose: () => void;
  onStartSlideshow: () => void;
}

const GooglePhotosManager: React.FC<GooglePhotosManagerProps> = ({ google, onClose, onStartSlideshow }) => {
  const [selected, setSelected] = useState<string[]>(google.selectedAlbumIds);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const deviceCode = google.deviceAuth.code;
  const googleAuthAvailable = isGoogleAuthConfigured;

  useEffect(() => {
    setSelected(google.selectedAlbumIds);
  }, [google.selectedAlbumIds]);

  useEffect(() => {
    if (!deviceCode?.verification_url) {
      setQrDataUrl('');
      return;
    }
    const url = `${deviceCode.verification_url}?user_code=${deviceCode.user_code}`;
    QRCode.toDataURL(url, { width: 260, margin: 1 }).then(setQrDataUrl).catch(console.error);
  }, [deviceCode?.verification_url, deviceCode?.user_code]);

  const toggleAlbum = (albumId: string) => {
    setSelected((prev) =>
      prev.includes(albumId) ? prev.filter((id) => id !== albumId) : [...prev, albumId]
    );
  };

  const hasAccount = Boolean(google.account);

  const canStartSlideshow = google.photos.length > 0;

  return (
    <div className="google-manager">
      <div className="google-manager__header">
        <h2>Google Photos</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="google-manager__content">
        {!hasAccount && googleAuthAvailable && (
          <div className="google-manager__auth">
            <p>Link your Google account by scanning the QR code or visiting the URL below.</p>
            {deviceCode ? (
              <div className="google-manager__code">
                {qrDataUrl && <img src={qrDataUrl} alt="Google login QR" />}
                <div>
                  <strong>{deviceCode.user_code}</strong>
                  <span>{deviceCode.verification_url}</span>
                </div>
                <div className="google-manager__actions">
                  <button onClick={google.beginPolling}>Begin Linking</button>
                  <button onClick={google.startDeviceAuth}>Refresh Code</button>
                </div>
              </div>
            ) : (
              <button onClick={google.startDeviceAuth}>Generate QR Code</button>
            )}
            {google.deviceAuth.error && (
              <p className="google-manager__error">{google.deviceAuth.error}</p>
            )}
          </div>
        )}

        {!hasAccount && !googleAuthAvailable && (
          <div className="google-manager__auth google-manager__auth--disabled">
            <p>
              Google Photos linking is disabled because no OAuth client id is configured. Update your environment with{' '}
              <code>VITE_GOOGLE_CLIENT_ID</code>{' '}
              as described in the README, then reload the app to enable Google account pairing.
            </p>
          </div>
        )}

        {hasAccount && (
          <div className="google-manager__albums">
            <header>
              <div>
                <h3>{google.account?.name ?? google.account?.email}</h3>
                <span>{google.albums.length} albums available</span>
              </div>
              <div className="google-manager__album-actions">
                <button onClick={() => google.syncSelectedAlbums()}>Sync now</button>
                <button onClick={google.logout}>Logout</button>
              </div>
            </header>
            <div className="google-manager__album-list">
              {google.albums.map((album) => (
                <label key={album.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(album.id)}
                    onChange={() => toggleAlbum(album.id)}
                  />
                  <span>
                    {album.title}
                    {album.mediaItemsCount && <small>{album.mediaItemsCount} items</small>}
                  </span>
                </label>
              ))}
            </div>
            <div className="google-manager__album-footer">
              <button
                onClick={() => google.selectAlbums(selected)}
                disabled={selected.length === 0 || google.loading}
              >
                Save selection
              </button>
              <button onClick={onStartSlideshow} disabled={!canStartSlideshow}>
                Start slideshow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GooglePhotosManager;
