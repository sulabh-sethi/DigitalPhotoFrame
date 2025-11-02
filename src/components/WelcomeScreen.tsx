import React from 'react';
import TileButton from './TileButton';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onSelectLocal: () => void;
  onConnectGoogle: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectLocal, onConnectGoogle }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-screen__hero">
        <h1>Digital FotoFrame</h1>
        <p>Bring your memories to life with an ambient TV photo frame.</p>
      </div>
      <div className="welcome-screen__tiles">
        <TileButton
          icon="📁"
          title="Select Folder"
          description="Browse USB or local storage to choose photo folders."
          onClick={onSelectLocal}
        />
        <TileButton
          icon="🔗"
          title="Connect Google Photos"
          description="Link your Google account via QR code and sync albums."
          onClick={onConnectGoogle}
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
