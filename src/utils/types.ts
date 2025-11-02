export type PhotoSourceType = 'local' | 'google';

export interface PhotoItem {
  id: string;
  title?: string;
  description?: string;
  url: string;
  blurHash?: string;
  takenAt?: string;
  location?: string;
}

export interface PhotoSource {
  type: PhotoSourceType;
  displayName: string;
  lastSynced?: string;
}
