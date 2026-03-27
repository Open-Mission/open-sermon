"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  WifiOffIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { useSermonOfflineStatus } from "@/hooks/use-sermons";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  sermonId: string;
  className?: string;
}

export function OfflineIndicator({
  sermonId,
  className,
}: OfflineIndicatorProps) {
  const { data: offlineStatus, isLoading } = useSermonOfflineStatus(sermonId);

  if (isLoading || !offlineStatus?.isOfflineAvailable) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 text-emerald-600 dark:text-emerald-400", className)}
    >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
      <span>Offline disponível</span>
    </Badge>
  );
}

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 data-[offline=true]:text-amber-600 data-[offline=true]:dark:text-amber-400 data-[offline=true]:border-amber-500/50",
        className
      )}
      data-offline={!navigator.onLine}
    >
      {navigator.onLine ? (
        <>
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
          <span>Online</span>
        </>
      ) : (
        <>
          <HugeiconsIcon icon={WifiOffIcon} size={12} />
          <span>Offline</span>
        </>
      )}
    </Badge>
  );
}
