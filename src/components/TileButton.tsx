import React from 'react';
import './TileButton.css';

interface TileButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const TileButton: React.FC<TileButtonProps> = ({ icon, title, description, onClick }) => {
  return (
    <button className="tile-button" onClick={onClick} tabIndex={0}>
      <div className="tile-button__icon">{icon}</div>
      <h3 className="tile-button__title">{title}</h3>
      <p className="tile-button__description">{description}</p>
    </button>
  );
};

export default TileButton;
