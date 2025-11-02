import { del, get, set } from 'idb-keyval';

export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface StoredAlbumSelection {
  accountId: string;
  albumIds: string[];
}

export interface GoogleAccountProfile {
  id: string;
  email?: string;
  name?: string;
  photoUrl?: string;
}

const GOOGLE_TOKEN_KEY_PREFIX = 'digital-fotoframe::google-token::';
const GOOGLE_ALBUM_SELECTION_KEY = 'digital-fotoframe::google-albums';
const GOOGLE_ACCOUNT_PROFILE_KEY = 'digital-fotoframe::google-account-profile';

export async function setGoogleTokens(accountId: string, tokens: GoogleAuthTokens) {
  await set(`${GOOGLE_TOKEN_KEY_PREFIX}${accountId}`, tokens);
}

export async function getGoogleTokens(accountId: string): Promise<GoogleAuthTokens | undefined> {
  return get(`${GOOGLE_TOKEN_KEY_PREFIX}${accountId}`);
}

export async function clearGoogleTokens(accountId: string) {
  await del(`${GOOGLE_TOKEN_KEY_PREFIX}${accountId}`);
}

export async function storeAlbumSelection(selection: StoredAlbumSelection) {
  await set(GOOGLE_ALBUM_SELECTION_KEY, selection);
}

export async function getStoredAlbumSelection(): Promise<StoredAlbumSelection | undefined> {
  return get(GOOGLE_ALBUM_SELECTION_KEY);
}

export async function clearAlbumSelection() {
  await del(GOOGLE_ALBUM_SELECTION_KEY);
}

export async function storeAccountProfile(profile: GoogleAccountProfile) {
  await set(GOOGLE_ACCOUNT_PROFILE_KEY, profile);
}

export async function getStoredAccountProfile(): Promise<GoogleAccountProfile | undefined> {
  return get(GOOGLE_ACCOUNT_PROFILE_KEY);
}

export async function clearStoredAccountProfile() {
  await del(GOOGLE_ACCOUNT_PROFILE_KEY);
}
