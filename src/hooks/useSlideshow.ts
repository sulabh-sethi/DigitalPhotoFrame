import { useEffect, useMemo, useRef, useState } from 'react';
import { PhotoItem } from '../utils/types';
import { TransitionEffect } from '../contexts/SettingsContext';

export interface SlideshowControls {
  currentIndex: number;
  currentPhoto?: PhotoItem;
  nextPhoto?: PhotoItem;
  goNext: () => void;
  goPrevious: () => void;
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
}

export interface SlideshowOptions {
  intervalSeconds: number;
  effect?: TransitionEffect;
  preloadCount?: number;
}

export const useSlideshow = (
  photos: PhotoItem[],
  { intervalSeconds, preloadCount = 2, effect }: SlideshowOptions
): SlideshowControls => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<number>();
  const previousUrls = useRef<string[]>([]);

  useEffect(() => {
    setIndex(0);
  }, [photos, effect]);

  useEffect(() => {
    if (!isPlaying || photos.length === 0) return;
    timerRef.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, intervalSeconds * 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [photos, intervalSeconds, isPlaying]);

  useEffect(() => {
    if (photos.length === 0) return;
    const preloadTargets = [];
    for (let i = 1; i <= preloadCount; i += 1) {
      preloadTargets.push(photos[(index + i) % photos.length]);
    }
    const createdUrls: string[] = [];
    preloadTargets.forEach((photo) => {
      if (!photo) return;
      const image = new Image();
      image.src = photo.url;
      previousUrls.current.push(image.src);
      createdUrls.push(image.src);
    });
    return () => {
      createdUrls.forEach((url) => {
        const idx = previousUrls.current.indexOf(url);
        if (idx !== -1) previousUrls.current.splice(idx, 1);
      });
    };
  }, [index, photos, preloadCount]);

  const goNext = () => {
    if (photos.length === 0) return;
    setIndex((current) => (current + 1) % photos.length);
  };

  const goPrevious = () => {
    if (photos.length === 0) return;
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  };

  const pause = () => setIsPlaying(false);
  const play = () => setIsPlaying(true);

  const currentPhoto = useMemo(() => photos[index], [photos, index]);
  const nextPhoto = useMemo(() => photos[(index + 1) % photos.length], [photos, index]);

  return {
    currentIndex: index,
    currentPhoto,
    nextPhoto,
    goNext,
    goPrevious,
    isPlaying,
    pause,
    play
  };
};
