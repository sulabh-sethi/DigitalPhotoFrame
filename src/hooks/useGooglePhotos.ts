import { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoItem, PhotoSource } from '../utils/types';
import {
  AlbumSummary,
  DeviceCodeResponse,
  TokenSuccessResponse,
  buildAlbumPhotoFeed,
  listAlbums,
  persistTokenResponse,
  pollForDeviceToken,
  requestDeviceCode
} from '../services/googlePhotos';
import {
  GoogleAccountProfile,
  StoredAlbumSelection,
  clearAlbumSelection,
  clearGoogleTokens,
  clearStoredAccountProfile,
  getStoredAccountProfile,
  getStoredAlbumSelection,
  storeAccountProfile,
  storeAlbumSelection
} from '../services/storage';

interface DeviceAuthState {
  code?: DeviceCodeResponse;
  phase: 'idle' | 'code' | 'polling' | 'ready' | 'error';
  error?: string | null;
}

export interface GooglePhotosState {
  account?: GoogleAccountProfile;
  albums: AlbumSummary[];
  selectedAlbumIds: string[];
  photos: PhotoItem[];
  source?: PhotoSource;
  loading: boolean;
  deviceAuth: DeviceAuthState;
}

async function fetchUserProfile(accessToken: string): Promise<GoogleAccountProfile> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Unable to fetch Google profile information.');
  }

  const data = await response.json();
  return {
    id: data.sub,
    email: data.email,
    name: data.name,
    photoUrl: data.picture
  };
}

export const useGooglePhotos = () => {
  const [state, setState] = useState<GooglePhotosState>({
    albums: [],
    selectedAlbumIds: [],
    photos: [],
    loading: false,
    deviceAuth: { phase: 'idle', error: null }
  });
  const pollingController = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const startDeviceAuth = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        deviceAuth: { phase: 'idle', error: null }
      }));
      const code = await requestDeviceCode();
      setState((prev) => ({
        ...prev,
        deviceAuth: { phase: 'code', code, error: null }
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        deviceAuth: { phase: 'error', error: (error as Error).message }
      }));
    }
  }, []);

  const abortPolling = useCallback(() => {
    pollingController.current?.abort();
    pollingController.current = null;
  }, []);

  const beginPolling = useCallback(async () => {
    const code = state.deviceAuth.code;
    if (!code) return;
    abortPolling();
    const controller = new AbortController();
    pollingController.current = controller;
    setState((prev) => ({
      ...prev,
      deviceAuth: { ...prev.deviceAuth, phase: 'polling', error: null }
    }));

    try {
      const tokenResponse = await pollForDeviceToken(code.device_code, controller.signal, code.interval ?? 5);
      await handleSuccessfulTokenExchange(tokenResponse);
      setState((prev) => ({
        ...prev,
        deviceAuth: { ...prev.deviceAuth, phase: 'ready', error: null }
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.warn('Polling failed', error);
      setState((prev) => ({
        ...prev,
        deviceAuth: { phase: 'error', error: (error as Error).message }
      }));
    }
  }, [abortPolling, state.deviceAuth.code]);

  const loadAlbumsForAccount = useCallback(async (accessToken: string) => {
    setLoading(true);
    try {
      const albums = await listAlbums(accessToken);
      setState((prev) => ({ ...prev, albums }));
    } catch (error) {
      console.warn('Unable to fetch albums', error);
      setState((prev) => ({ ...prev, deviceAuth: { phase: 'error', error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const handleSuccessfulTokenExchange = useCallback(
    async (tokenResponse: TokenSuccessResponse) => {
      const profile = await fetchUserProfile(tokenResponse.access_token);
      await persistTokenResponse(profile.id, tokenResponse);
      await storeAccountProfile(profile);
      setState((prev) => ({
        ...prev,
        account: profile,
        source: {
          type: 'google',
          displayName: profile.name ?? profile.email ?? 'Google Photos',
          lastSynced: new Date().toISOString()
        }
      }));
      await loadAlbumsForAccount(tokenResponse.access_token);
    },
    [loadAlbumsForAccount]
  );

  const selectAlbums = useCallback(async (albumIds: string[]) => {
    if (!state.account) return;
    const selection: StoredAlbumSelection = {
      accountId: state.account.id,
      albumIds
    };
    await storeAlbumSelection(selection);
    setState((prev) => ({ ...prev, selectedAlbumIds: albumIds }));
    await syncSelectedAlbums(selection);
  }, [state.account]);

  const syncSelectedAlbums = useCallback(async (selection?: StoredAlbumSelection) => {
    const effectiveSelection = selection ?? (await getStoredAlbumSelection());
    if (!effectiveSelection?.albumIds?.length) {
      return;
    }
    setLoading(true);
    try {
      const photos = await buildAlbumPhotoFeed(effectiveSelection.accountId, effectiveSelection.albumIds);
      setState((prev) => ({
        ...prev,
        photos,
        source: {
          type: 'google',
          displayName: prev.account?.name ?? prev.account?.email ?? 'Google Photos',
          lastSynced: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.warn('Unable to refresh Google album photos', error);
      setState((prev) => ({ ...prev, deviceAuth: { phase: 'error', error: (error as Error).message } }));
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const logout = useCallback(async () => {
    abortPolling();
    const accountId = state.account?.id;
    if (accountId) {
      await clearGoogleTokens(accountId);
    }
    await clearStoredAccountProfile();
    await clearAlbumSelection();
    setState({
      albums: [],
      selectedAlbumIds: [],
      photos: [],
      loading: false,
      deviceAuth: { phase: 'idle', error: null },
      source: undefined,
      account: undefined
    });
  }, [abortPolling, state.account?.id]);

  useEffect(() => {
    const bootstrap = async () => {
      const profile = await getStoredAccountProfile();
      const selection = await getStoredAlbumSelection();
      if (profile) {
        setState((prev) => ({
          ...prev,
          account: profile,
          source: {
            type: 'google',
            displayName: profile.name ?? profile.email ?? 'Google Photos',
            lastSynced: prev.source?.lastSynced
          }
        }));
      }
      if (selection?.albumIds?.length) {
        setState((prev) => ({ ...prev, selectedAlbumIds: selection.albumIds }));
        await syncSelectedAlbums(selection);
      }
    };
    bootstrap().catch((error) => console.warn('Google Photos bootstrap failed', error));
  }, [syncSelectedAlbums]);

  return {
    ...state,
    startDeviceAuth,
    beginPolling,
    abortPolling,
    selectAlbums,
    syncSelectedAlbums,
    logout
  };
};

export type GooglePhotosHook = ReturnType<typeof useGooglePhotos>;
