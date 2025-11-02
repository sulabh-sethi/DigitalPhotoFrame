import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import './AmbientMusicPlayer.css';

const SOUNDSCAPE_FREQUENCIES: Record<string, number[]> = {
  aurora: [174, 261, 329],
  focus: [432, 512, 648],
  waves: [110, 146, 196]
};

const AmbientMusicPlayer: React.FC = () => {
  const {
    settings: { audio }
  } = useSettings();
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const stop = () => {
    oscillatorsRef.current.forEach((osc) => osc.stop());
    oscillatorsRef.current = [];
    gainRef.current?.disconnect();
    gainRef.current = null;
  };

  const start = async () => {
    if (!audio.enabled) return;
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    if (context.state === 'suspended') {
      setNeedsInteraction(true);
      return;
    }

    stop();

    const gain = context.createGain();
    gain.gain.value = audio.volume;
    gain.connect(context.destination);
    gainRef.current = gain;

    const frequencies = SOUNDSCAPE_FREQUENCIES[audio.soundscape] ?? SOUNDSCAPE_FREQUENCIES.aurora;
    frequencies.forEach((freq, index) => {
      const osc = context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const individualGain = context.createGain();
      individualGain.gain.value = audio.volume / frequencies.length / (index + 1);
      osc.connect(individualGain);
      individualGain.connect(gain);
      osc.start();
      oscillatorsRef.current.push(osc);
    });
  };

  useEffect(() => {
    if (audio.enabled) {
      void start();
    } else {
      stop();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.enabled, audio.soundscape, audio.volume]);

  const handleInteraction = async () => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    await contextRef.current.resume();
    setNeedsInteraction(false);
    await start();
  };

  if (!audio.enabled) {
    return null;
  }

  return (
    <div className="ambient-player">
      <span>Ambient {audio.soundscape}</span>
      {needsInteraction && (
        <button type="button" onClick={handleInteraction}>
          Tap to start
        </button>
      )}
    </div>
  );
};

export default AmbientMusicPlayer;
