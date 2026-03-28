"use client";

import { Clock } from "lucide-react";
import { Sermon } from "@/types/sermon";
import { DashboardSermonCard, CollapsibleSection } from "./dashboard-sermon-card";

interface RecentSermonsSectionProps {
  sermons: Sermon[];
  syncedSermonIds: Set<string>;
  localOnlySermonIds: Set<string>;
  isOffline: boolean;
}

export function RecentSermonsSection({ 
  sermons, 
  syncedSermonIds, 
  localOnlySermonIds, 
  isOffline 
}: RecentSermonsSectionProps) {
  if (sermons.length === 0) return null;

  return (
    <CollapsibleSection
      title="Visitados recentemente"
      icon={<Clock className="h-3.5 w-3.5" />}
      count={sermons.length}
    >
      {sermons.map((sermon) => {
        const isPending = localOnlySermonIds.has(sermon.id);
        const isAvailableOffline = syncedSermonIds.has(sermon.id) || localOnlySermonIds.has(sermon.id);
        return (
          <DashboardSermonCard 
            key={sermon.id} 
            sermon={sermon}
            showOfflineIndicator={isAvailableOffline}
            isPendingSync={isPending}
            isUnavailableOffline={isOffline && !isAvailableOffline}
          />
        );
      })}
    </CollapsibleSection>
  );
}
