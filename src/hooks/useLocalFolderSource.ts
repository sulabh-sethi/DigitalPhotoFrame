import { useCallback, useRef, useState } from 'react';
import { PhotoItem, PhotoSource } from '../utils/types';

const SUPPORTED_FILE_REGEX = /\.(jpe?g|png|gif|bmp|webp)$/i;

export interface LocalFolderSelectionOptions {
  recursive: boolean;
}

export interface LocalFolderState {
  photos: PhotoItem[];
  source?: PhotoSource;
  loading: boolean;
  error?: string | null;
}

async function enumerateDirectory(
  directory: FileSystemDirectoryHandle,
  recursive: boolean
): Promise<File[]> {
  const files: File[] = [];

  // @ts-expect-error: values() is part of the File System Access API
  for await (const handle of directory.values()) {
    if (handle.kind === 'file') {
      const file = await handle.getFile();
      if (SUPPORTED_FILE_REGEX.test(file.name)) {
        files.push(file);
      }
    } else if (recursive && handle.kind === 'directory') {
      const nested = await enumerateDirectory(handle, recursive);
      files.push(...nested);
    }
  }

  return files;
}

export const useLocalFolderSource = () => {
  const [state, setState] = useState<LocalFolderState>({ photos: [], loading: false, error: null });
  const objectUrls = useRef<string[]>([]);

  const resetObjectUrls = useCallback(() => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
  }, []);

  const selectFolder = useCallback(
    async (
      { recursive }: LocalFolderSelectionOptions = { recursive: true }
    ): Promise<LocalFolderState> => {
      if (!('showDirectoryPicker' in window)) {
        const fallbackState: LocalFolderState = {
          photos: [],
          source: undefined,
          loading: false,
          error: 'Directory access is not supported in this browser.'
        };
        setState(fallbackState);
        return fallbackState;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        resetObjectUrls();
        const directoryHandle = await (window as any).showDirectoryPicker();
        const files = await enumerateDirectory(directoryHandle, recursive);
        files.sort((a, b) => (a.lastModified ?? 0) - (b.lastModified ?? 0));
        const photos: PhotoItem[] = files.map((file, index) => {
          const url = URL.createObjectURL(file);
          objectUrls.current.push(url);
          return {
            id: `${directoryHandle.name}-${index}-${file.name}`,
            title: file.name,
            url,
            takenAt: file.lastModified ? new Date(file.lastModified).toISOString() : undefined
          };
        });

        const nextState: LocalFolderState = {
          photos,
          source: {
            type: 'local',
            displayName: directoryHandle.name,
            lastSynced: new Date().toISOString()
          },
          loading: false,
          error: photos.length === 0 ? 'No supported image files were found in the selected folder.' : null
        };
        setState(nextState);
        return nextState;
      } catch (error) {
        console.warn('Unable to load directory', error);
        const failureState: LocalFolderState = {
          photos: [],
          source: undefined,
          loading: false,
          error: (error as Error).message
        };
        setState(failureState);
        return failureState;
      }
    },
    [resetObjectUrls]
  );

  const clearSelection = useCallback(() => {
    resetObjectUrls();
    setState({ photos: [], source: undefined, loading: false, error: null });
  }, [resetObjectUrls]);

  return { ...state, selectFolder, clearSelection };
};
