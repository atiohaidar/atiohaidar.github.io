export type ApiErrorPayload = {
  message: string;
  status?: number;
  endpoint?: string;
};

const listeners = new Set<(payload: ApiErrorPayload) => void>();

export const errorEvents = {
  emit(payload: ApiErrorPayload) {
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error('Error in error event listener', error);
      }
    });
  },
  subscribe(listener: (payload: ApiErrorPayload) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
