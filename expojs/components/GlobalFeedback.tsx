import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Banner, Portal, Snackbar } from 'react-native-paper';

import { errorEvents, type ApiErrorPayload } from '@/services/errorEvents';

const SNACKBAR_DURATION = 5000;

type ErrorState = ApiErrorPayload & { id: number };

export const GlobalFeedback: React.FC = () => {
  const [queue, setQueue] = useState<ErrorState[]>([]);
  const [activeError, setActiveError] = useState<ErrorState | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let counter = 0;
    const unsubscribe = errorEvents.subscribe((payload) => {
      counter += 1;
      setQueue((prev) => [...prev, { ...payload, id: counter }]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!snackbarVisible && queue.length > 0) {
      const [next, ...rest] = queue;
      setActiveError(next);
      setQueue(rest);
      setSnackbarVisible(true);
    }
  }, [queue, snackbarVisible]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsOffline(!connected);
    });

    return () => unsubscribe();
  }, []);

  const snackbarMessage = useMemo(() => {
    if (!activeError) return '';
    if (activeError.status) {
      return `${activeError.message} (${activeError.status})`;
    }
    return activeError.message;
  }, [activeError]);

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
    setActiveError(null);
  };

  return (
    <>
      <Portal>
        <Snackbar
          style={styles.snackbar}
          visible={snackbarVisible && !!activeError}
          onDismiss={handleDismissSnackbar}
          duration={SNACKBAR_DURATION}
          action={activeError?.endpoint ? { label: 'Detail', onPress: () => {} } : undefined}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
      <Portal>
        <Banner
          visible={isOffline}
          icon="wifi-off"
          style={styles.banner}
        >
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </Banner>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 32,
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default GlobalFeedback;
