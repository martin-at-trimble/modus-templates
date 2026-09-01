import { useSyncExternalStore } from 'react';

function subscribeMedia(query: string, onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

export function useMediaQuery(query: string, serverSnapshot = false) {
  return useSyncExternalStore(
    (onStoreChange) => subscribeMedia(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}
