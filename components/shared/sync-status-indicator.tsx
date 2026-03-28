"use client";

import { useSync } from "@/hooks/use-sync";
import { Cloud, CloudOff, CloudUpload, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator() {
  const { status, pendingCount, syncNow, isOnline } = useSync();

  if (status === "idle" && pendingCount === 0 && isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        <span className="hidden sm:inline">Salvo</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-amber-500 text-xs">
        <CloudOff className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Offline</span>
        {pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="flex items-center gap-1.5 text-blue-500 text-xs">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span className="hidden sm:inline">Sincronizando...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <button
        onClick={syncNow}
        className="flex items-center gap-1.5 text-destructive text-xs hover:text-destructive/80 transition-colors"
        title="Clique para tentar novamente"
      >
        <CloudUpload className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Erro ao sincronizar</span>
        {pendingCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
            {pendingCount}
          </span>
        )}
      </button>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={syncNow}
        className="flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground transition-colors"
        title="Clique para sincronizar"
      >
        <Cloud className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
      <Cloud className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Online</span>
    </div>
  );
}
