import { PhotoItem } from '../utils/types';
import { GoogleAuthTokens, getGoogleTokens, setGoogleTokens } from './storage';

const DEVICE_CODE_ENDPOINT = 'https://oauth2.googleapis.com/device/code';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const PHOTOS_BASE_URL = 'https://photoslibrary.googleapis.com/v1';

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
  message?: string;
}

export interface TokenSuccessResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface AlbumSummary {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount?: string;
  coverPhotoBaseUrl?: string;
}

export interface MediaItemResponse {
  id: string;
  baseUrl: string;
  filename: string;
  description?: string;
  mediaMetadata?: {
    creationTime?: string;
    width?: string;
    height?: string;
  };
}

interface GoogleApiError {
  error: { code: number; message: string };
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

export const isGoogleAuthConfigured = Boolean(CLIENT_ID);

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: { message: response.statusText } }))) as GoogleApiError;
    throw new Error(error.error?.message ?? 'Google Photos request failed');
  }
  return response.json() as Promise<T>;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  if (!CLIENT_ID) {
    throw new Error(
      'Google Photos linking requires configuring VITE_GOOGLE_CLIENT_ID. Add your OAuth client id to the environment variables.'
    );
  }

  const response = await fetch(DEVICE_CODE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPES
    })
  });

  return handleResponse<DeviceCodeResponse>(response);
}

export async function pollForDeviceToken(
  deviceCode: string,
  signal: AbortSignal,
  intervalSeconds = 5
): Promise<TokenSuccessResponse> {
  if (!CLIENT_ID) {
    throw new Error(
      'Google Photos linking requires configuring VITE_GOOGLE_CLIENT_ID. Add your OAuth client id to the environment variables.'
    );
  }

  while (!signal.aborted) {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET ?? '',
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    if (response.status === 200) {
      return handleResponse<TokenSuccessResponse>(response);
    }

    if (response.status === 400) {
      const payload = await response.json();
      if (payload.error === 'authorization_pending') {
        await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
        continue;
      }
      throw new Error(payload.error_description ?? payload.error ?? 'Device authorization failed');
    }

    throw new Error('Unexpected response while polling for Google token');
  }

  throw new Error('Device authorization cancelled');
}

export async function refreshAccessToken(accountId: string): Promise<GoogleAuthTokens | undefined> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return undefined;
  }
  const existing = await getGoogleTokens(accountId);
  if (!existing?.refreshToken) return undefined;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: existing.refreshToken
    })
  });

  if (!response.ok) {
    console.warn('Unable to refresh Google token');
    return undefined;
  }

  const data = (await response.json()) as TokenSuccessResponse;
  const tokens: GoogleAuthTokens = {
    accessToken: data.access_token,
    refreshToken: existing.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000
  };
  await setGoogleTokens(accountId, tokens);
  return tokens;
}

export async function listAlbums(accessToken: string): Promise<AlbumSummary[]> {
  const response = await fetch(`${PHOTOS_BASE_URL}/albums?pageSize=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await handleResponse<{ albums?: AlbumSummary[] }>(response);
  return data.albums ?? [];
}

export async function listMediaItemsForAlbum(
  accessToken: string,
  albumId: string,
  pageSize = 100
): Promise<MediaItemResponse[]> {
  const media: MediaItemResponse[] = [];
  let pageToken: string | undefined;

  do {
    const response = await fetch(`${PHOTOS_BASE_URL}/mediaItems:search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        albumId,
        pageSize,
        pageToken
      })
    });

    const data = await handleResponse<{ mediaItems?: MediaItemResponse[]; nextPageToken?: string }>(response);
    if (data.mediaItems) {
      media.push(...data.mediaItems);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return media;
}

export function mapMediaItemsToPhotos(items: MediaItemResponse[]): PhotoItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.filename,
    description: item.description,
    url: `${item.baseUrl}=w3840-h2160`,
    takenAt: item.mediaMetadata?.creationTime
  }));
}

export async function ensureValidToken(
  accountId: string,
  tokens: GoogleAuthTokens
): Promise<GoogleAuthTokens> {
  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens;
  }
  const refreshed = await refreshAccessToken(accountId);
  if (!refreshed) {
    return tokens;
  }
  return refreshed;
}

export async function persistTokenResponse(accountId: string, response: TokenSuccessResponse) {
  const tokens: GoogleAuthTokens = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000
  };
  await setGoogleTokens(accountId, tokens);
}

export async function buildAlbumPhotoFeed(
  accountId: string,
  albumIds: string[]
): Promise<PhotoItem[]> {
  const tokens = await getGoogleTokens(accountId);
  if (!tokens) {
    throw new Error('No stored credentials for Google account.');
  }
  const validToken = await ensureValidToken(accountId, tokens);

  const items: PhotoItem[] = [];
  for (const albumId of albumIds) {
    const mediaItems = await listMediaItemsForAlbum(validToken.accessToken, albumId);
    items.push(...mapMediaItemsToPhotos(mediaItems));
  }

  items.sort((a, b) => {
    if (!a.takenAt || !b.takenAt) return 0;
    return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime();
  });

  return items;
}
