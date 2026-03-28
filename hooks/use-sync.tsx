"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { syncService, type SyncStatus } from "@/lib/sync-service";

interface SyncContextType {
  status: SyncStatus;
  pendingCount: number;
  syncNow: () => Promise<void>;
  isOnline: boolean;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    syncService.initialize(userId);

    const unsubscribe = syncService.subscribe((newStatus, count) => {
      setStatus(newStatus);
      setPendingCount(count);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      syncService.destroy();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId]);

  const syncNow = useCallback(async () => {
    await syncService.syncPendingOperations();
  }, []);

  return (
    <SyncContext.Provider value={{ status, pendingCount, syncNow, isOnline }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
