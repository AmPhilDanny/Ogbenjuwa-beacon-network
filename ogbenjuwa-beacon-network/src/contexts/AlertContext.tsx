import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type AlertType = 'sos' | 'incident';

interface AlertState {
  isActive: boolean;
  type: AlertType | null;
  timestamp: number | null;
  message: string;
}

interface AlertContextValue extends AlertState {
  triggerAlert: (type?: AlertType, message?: string) => void;
  resolveAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertState>({
    isActive: false,
    type: null,
    timestamp: null,
    message: '',
  });

  const triggerAlert = useCallback((type: AlertType = 'sos', message?: string) => {
    setState({
      isActive: true,
      type,
      timestamp: Date.now(),
      message: message ?? (type === 'sos'
        ? 'EMERGENCY SOS ACTIVE — Help has been notified.'
        : 'Community alert active. Stay informed.'),
    });
  }, []);

  const resolveAlert = useCallback(() => {
    setState({
      isActive: false,
      type: null,
      timestamp: null,
      message: '',
    });
  }, []);

  return (
    <AlertContext.Provider value={{ ...state, triggerAlert, resolveAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}
