"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function SaveIndicator() {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleSaveStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ isSaving: boolean }>;
      setIsSaving(customEvent.detail.isSaving);
    };

    window.addEventListener('sermon-save-status', handleSaveStatus);
    return () => window.removeEventListener('sermon-save-status', handleSaveStatus);
  }, []);

  if (!isSaving) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2 font-medium">
      <RefreshCw className="h-3 w-3 animate-spin" />
      <span>Salvando...</span>
    </div>
  );
}
