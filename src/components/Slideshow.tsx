import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TransitionEffect, useSettings } from '../contexts/SettingsContext';
import { useSlideshow } from '../hooks/useSlideshow';
import { PhotoItem, PhotoSource } from '../utils/types';
import ClockWidget from './widgets/ClockWidget';
import WeatherWidget from './widgets/WeatherWidget';
import AmbientMusicPlayer from './widgets/AmbientMusicPlayer';
import './Slideshow.css';

interface SlideshowProps {
  photos: PhotoItem[];
  source?: PhotoSource;
  onExit: () => void;
}

type TransitionVariant = {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
};

const transitionVariants: Record<TransitionEffect, TransitionVariant> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { x: '5%', opacity: 0 },
    animate: { x: '0%', opacity: 1 },
    exit: { x: '-5%', opacity: 0 }
  },
  pan: {
    initial: { x: '-3%', y: '3%', opacity: 0 },
    animate: { x: '0%', y: '0%', opacity: 1 },
    exit: { x: '3%', y: '-3%', opacity: 0 }
  },
  zoom: {
    initial: { scale: 1.08, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.12, opacity: 0 }
  },
  kenburns: {
    initial: { scale: 1.05, opacity: 0, x: '-2%' },
    animate: { scale: 1.15, opacity: 1, x: '0%' },
    exit: { scale: 1.2, opacity: 0, x: '2%' }
  }
};

const safeModeVariants: Partial<Record<TransitionEffect, TransitionVariant>> = {
  fade: transitionVariants.fade,
  zoom: {
    initial: { scale: 1.02, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.03, opacity: 0 }
  }
};

const resolveSafeEffect = (effect: TransitionEffect): TransitionEffect => {
  if (effect === 'zoom') {
    return 'zoom';
  }
  return 'fade';
};

const SAFE_MODE_MIN_INTERVAL_SECONDS = 12;

const Slideshow: React.FC<SlideshowProps> = ({ photos, source, onExit }) => {
  const {
    settings: { transitions, visuals, font }
  } = useSettings();
  const safeModeActive = transitions.ambientSafeMode;
  const effectiveEffect = safeModeActive ? resolveSafeEffect(transitions.effect) : transitions.effect;
  const effectiveIntervalSeconds = safeModeActive
    ? Math.max(transitions.intervalSeconds, SAFE_MODE_MIN_INTERVAL_SECONDS)
    : transitions.intervalSeconds;
  const preloadCount = safeModeActive ? 1 : 2;

  const slideshow = useSlideshow(photos, {
    intervalSeconds: effectiveIntervalSeconds,
    effect: effectiveEffect,
    preloadCount
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        slideshow.goNext();
      } else if (event.key === 'ArrowLeft') {
        slideshow.goPrevious();
      } else if (event.key === ' ') {
        if (slideshow.isPlaying) {
          slideshow.pause();
        } else {
          slideshow.play();
        }
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        onExit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExit, slideshow]);

  if (!slideshow.currentPhoto) {
    return (
      <div className="slideshow__empty">
        <p>No photos available. Please add a source.</p>
        <button onClick={onExit}>Back</button>
      </div>
    );
  }

  const variant = (safeModeActive ? safeModeVariants[effectiveEffect] : transitionVariants[effectiveEffect])
    ?? transitionVariants.fade;
  const transitionDuration = safeModeActive ? 0.9 : 1.5;

  return (
    <div className="slideshow" style={{ fontFamily: font.family, fontSize: `${font.scale}em` }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={slideshow.currentPhoto.id}
          className="slideshow__image"
          src={slideshow.currentPhoto.url}
          alt={slideshow.currentPhoto.description ?? slideshow.currentPhoto.title ?? 'Photo'}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          style={{
            filter: `brightness(${visuals.brightness}) contrast(${visuals.contrast})`,
            transformOrigin: 'center'
          }}
        />
      </AnimatePresence>
      {safeModeActive && (
        <div className="slideshow__indicator" role="status" aria-live="polite">
          <strong>Ambient Safe Mode</strong>
          <span>Motion reduced to protect your display</span>
        </div>
      )}
      <div className="slideshow__overlay" style={{ background: `rgba(0, 0, 0, ${visuals.overlayOpacity})` }}>
        <div className="slideshow__meta">
          {source && (
            <span>
              {source.displayName}
              {source.lastSynced && (
                <small>Last synced {new Date(source.lastSynced).toLocaleTimeString()}</small>
              )}
            </span>
          )}
          {slideshow.currentPhoto.takenAt && (
            <span>
              Captured {new Date(slideshow.currentPhoto.takenAt).toLocaleString(undefined, {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })}
            </span>
          )}
        </div>
        <div className="slideshow__controls">
          <button onClick={slideshow.goPrevious} aria-label="Previous photo">
            ◀
          </button>
          <button onClick={slideshow.isPlaying ? slideshow.pause : slideshow.play} aria-label="Play or pause slideshow">
            {slideshow.isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={slideshow.goNext} aria-label="Next photo">
            ▶
          </button>
          <button onClick={onExit} aria-label="Back to source selection">
            ✕ Exit
          </button>
        </div>
      </div>
      <ClockWidget />
      <WeatherWidget />
      <AmbientMusicPlayer />
    </div>
  );
};

export default Slideshow;
