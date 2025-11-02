import React from 'react';
import { useThemeClass, useToggleTheme } from '../../contexts/SettingsContext';
import './TopBar.css';

interface TopBarProps {
  onCustomize: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onCustomize }) => {
  const theme = useThemeClass();
  const toggleTheme = useToggleTheme();

  return (
    <header className={`top-bar ${theme === 'dark' ? 'top-bar--dark' : 'top-bar--light'}`}>
      <button className="top-bar__action" onClick={onCustomize} aria-label="Open customization panel">
        ⚙️ Customize
      </button>
      <div className="top-bar__spacer" />
      <button className="top-bar__action" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
};

export default TopBar;
