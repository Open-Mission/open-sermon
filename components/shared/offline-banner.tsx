"use client";

import { WifiOff } from "lucide-react";

interface OfflineBannerProps {
  count: number;
}

export function OfflineBanner({ count }: OfflineBannerProps) {
  if (count === 0) return null;

  return (
    <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
      <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-500" />
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          Modo offline
        </p>
        <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
          Exibindo {count} sermão{count !== 1 ? "s" : ""} disponível{count !== 1 ? "is" : ""} localmente
        </p>
      </div>
    </div>
  );
}
