"use client";

import { Download, CloudOff } from "lucide-react";
import { Sermon } from "@/types/sermon";
import { DashboardSermonCard, CollapsibleSection } from "./dashboard-sermon-card";

interface AvailableOfflineSectionProps {
  displaySermons: Sermon[];
  offlineSermons: Sermon[];
  syncedSermonIds: Set<string>;
  localOnlySermonIds: Set<string>;
  isOffline: boolean;
}

export function AvailableOfflineSection({ 
  displaySermons,
  offlineSermons,
  syncedSermonIds, 
  localOnlySermonIds, 
  isOffline 
}: AvailableOfflineSectionProps) {
  const hasOfflineContent = syncedSermonIds.size > 0 || localOnlySermonIds.size > 0;
  
  if (!hasOfflineContent) return null;

  return (
    <CollapsibleSection
      title="Disponíveis offline"
      icon={<Download className="h-3.5 w-3.5" />}
      count={syncedSermonIds.size + localOnlySermonIds.size}
      defaultOpen={isOffline}
    >
      {localOnlySermonIds.size > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-amber-600/80 dark:text-amber-500/80 mb-2 px-1">
            <CloudOff className="h-3 w-3" />
            <span>Aguardando sincronização ({localOnlySermonIds.size})</span>
          </div>
          {offlineSermons.filter(s => localOnlySermonIds.has(s.id)).map((sermon) => (
            <DashboardSermonCard key={sermon.id} sermon={sermon} isPendingSync />
          ))}
        </div>
      )}
      {syncedSermonIds.size > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {displaySermons
            .filter(s => syncedSermonIds.has(s.id))
            .slice(0, 6)
            .map((sermon) => (
              <DashboardSermonCard key={sermon.id} sermon={sermon} showOfflineIndicator />
            ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
