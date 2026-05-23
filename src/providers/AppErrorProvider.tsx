import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AppErrorModal } from '@components/ui/common/AppErrorModal';

export interface ShowAppErrorOptions {
  title?: string;
  confirmLabel?: string;
  retryLabel?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

interface AppErrorContextValue {
  showAppError: (message: string, options?: ShowAppErrorOptions) => void;
  hideAppError: () => void;
}

const AppErrorContext = createContext<AppErrorContextValue | null>(null);

interface AppErrorState {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  retryLabel: string;
  onClose?: () => void;
  onRetry?: () => void;
}

const initialState: AppErrorState = {
  visible: false,
  title: 'Erreur',
  message: '',
  confirmLabel: 'Compris',
  retryLabel: 'Réessayer',
};

export function AppErrorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppErrorState>(initialState);

  const hideAppError = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showAppError = useCallback((message: string, options?: ShowAppErrorOptions) => {
    const trimmed = message.trim();
    setState({
      visible: true,
      title: options?.title?.trim() || 'Erreur',
      message: trimmed || 'Une erreur inattendue est survenue.',
      confirmLabel: options?.confirmLabel ?? 'Compris',
      retryLabel: options?.retryLabel ?? 'Réessayer',
      onClose: options?.onClose,
      onRetry: options?.onRetry,
    });
  }, []);

  const handleClose = useCallback(() => {
    const callback = state.onClose;
    hideAppError();
    callback?.();
  }, [hideAppError, state.onClose]);

  const handleRetry = useCallback(() => {
    const callback = state.onRetry;
    hideAppError();
    callback?.();
  }, [hideAppError, state.onRetry]);

  const value = useMemo(
    () => ({
      showAppError,
      hideAppError,
    }),
    [hideAppError, showAppError],
  );

  return (
    <AppErrorContext.Provider value={value}>
      {children}
      <AppErrorModal
        visible={state.visible}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        retryLabel={state.retryLabel}
        onClose={handleClose}
        onRetry={state.onRetry ? handleRetry : undefined}
      />
    </AppErrorContext.Provider>
  );
}

export function useAppError(): AppErrorContextValue {
  const ctx = useContext(AppErrorContext);
  if (!ctx) {
    throw new Error('useAppError must be used within AppErrorProvider');
  }
  return ctx;
}
