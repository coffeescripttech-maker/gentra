import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { defaultSession, loadSession, saveSession } from '@/storage/session';
import type { DriverProfile, EarningsDay, PassengerProfile, Role, SessionState, TripReceipt } from '@/types';

interface SessionContextValue {
  state: SessionState;
  isLoaded: boolean;
  role: Role;
  setRole: (role: Role) => void;
  updatePassenger: (patch: Partial<PassengerProfile>) => void;
  updateDriver: (patch: Partial<DriverProfile>) => void;
  addReceipt: (receipt: TripReceipt) => void;
  /** Record one completed driver trip toward today's earnings. */
  addEarnings: (cash: number, onlineMinutes: number) => void;
  /** Credit the passenger wallet (top-up). */
  addFunds: (amount: number) => void;
  /** Toggle the short ride-timing demo mode. */
  setFastDemo: (fastDemo: boolean) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Hydrate from AsyncStorage on mount.
  useEffect(() => {
    let active = true;
    loadSession().then((loaded) => {
      if (!active) return;
      setState(loaded);
      loadedRef.current = true;
      setIsLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever state changes, but only after the first hydration.
  useEffect(() => {
    if (!loadedRef.current || !state) return;
    saveSession(state);
  }, [state]);

  const setRole = useCallback((role: Role) => {
    setState((prev) => (prev ? { ...prev, role, roleChosen: true } : prev));
  }, []);

  const updatePassenger = useCallback((patch: Partial<PassengerProfile>) => {
    setState((prev) => (prev ? { ...prev, passenger: { ...prev.passenger, ...patch } } : prev));
  }, []);

  const updateDriver = useCallback((patch: Partial<DriverProfile>) => {
    setState((prev) => (prev ? { ...prev, driver: { ...prev.driver, ...patch } } : prev));
  }, []);

  const addReceipt = useCallback((receipt: TripReceipt) => {
    setState((prev) => (prev ? { ...prev, receipts: [receipt, ...prev.receipts] } : prev));
  }, []);

  const addEarnings = useCallback((cash: number, onlineMinutes: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const today = new Date().toISOString().slice(0, 10);
      const existing = prev.earnings.find((e) => e.date === today);
      const updatedDay: EarningsDay = existing
        ? { ...existing, trips: existing.trips + 1, cash: existing.cash + cash, onlineMinutes: existing.onlineMinutes + onlineMinutes }
        : { date: today, trips: 1, cash, onlineMinutes };
      const earnings = existing
        ? prev.earnings.map((e) => (e.date === today ? updatedDay : e))
        : [updatedDay, ...prev.earnings];
      return { ...prev, earnings };
    });
  }, []);

  const setFastDemo = useCallback((fastDemo: boolean) => {
    setState((prev) => (prev ? { ...prev, fastDemo } : prev));
  }, []);

  const addFunds = useCallback((amount: number) => {
    setState((prev) => (prev ? { ...prev, walletBalance: prev.walletBalance + amount } : prev));
  }, []);

  const reset = useCallback(() => {
    setState(defaultSession());
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      state: state ?? defaultSession(),
      isLoaded,
      role: state?.role ?? 'passenger',
      setRole,
      updatePassenger,
      updateDriver,
      addReceipt,
      addEarnings,
      addFunds,
      setFastDemo,
      reset,
    }),
    [state, isLoaded, setRole, updatePassenger, updateDriver, addReceipt, addEarnings, addFunds, setFastDemo, reset],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
