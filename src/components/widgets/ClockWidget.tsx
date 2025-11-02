import React, { useEffect, useState } from 'react';
import { ClockPosition, ClockStyle, TimeFormat, useSettings } from '../../contexts/SettingsContext';
import './ClockWidget.css';

interface ClockState {
  now: Date;
}

const positionToClass: Record<ClockPosition, string> = {
  'top-left': 'clock-widget--top-left',
  'top-right': 'clock-widget--top-right',
  'bottom-left': 'clock-widget--bottom-left',
  'bottom-right': 'clock-widget--bottom-right'
};

function formatTime(date: Date, format: TimeFormat) {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h'
  };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

const ClockWidget: React.FC = () => {
  const {
    settings: { clock }
  } = useSettings();
  const [state, setState] = useState<ClockState>({ now: new Date() });

  useEffect(() => {
    const id = window.setInterval(() => setState({ now: new Date() }), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!clock.enabled) {
    return null;
  }

  const className = `clock-widget ${positionToClass[clock.position]}`;

  const digitalContent = (
    <div className="clock-widget__digital">
      <span className="clock-widget__time">{formatTime(state.now, clock.format)}</span>
      <span className="clock-widget__date">
        {new Intl.DateTimeFormat(undefined, {
          weekday: 'short',
          month: 'short',
          day: '2-digit'
        }).format(state.now)}
      </span>
    </div>
  );

  return (
    <div className={className}>
      {clock.style === 'analog' ? <AnalogClock date={state.now} /> : digitalContent}
    </div>
  );
};

const AnalogClock: React.FC<{ date: Date }> = ({ date }) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() % 12 + minutes / 60;

  return (
    <div className="analog-clock" role="img" aria-label="Clock">
      <div className="analog-clock__hand analog-clock__hand--hour" style={{ transform: `rotate(${hours * 30}deg)` }} />
      <div className="analog-clock__hand analog-clock__hand--minute" style={{ transform: `rotate(${minutes * 6}deg)` }} />
      <div className="analog-clock__hand analog-clock__hand--second" style={{ transform: `rotate(${seconds * 6}deg)` }} />
      <div className="analog-clock__center" />
    </div>
  );
};

export default ClockWidget;
