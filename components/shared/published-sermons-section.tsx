"use client";

import { Globe } from "lucide-react";
import { Sermon } from "@/types/sermon";
import { DashboardSermonCard, CollapsibleSection } from "./dashboard-sermon-card";

interface PublishedSermonsSectionProps {
  sermons: Sermon[];
  syncedSermonIds: Set<string>;
  localOnlySermonIds: Set<string>;
  isOffline: boolean;
}

export function PublishedSermonsSection({ 
  sermons, 
  syncedSermonIds, 
  localOnlySermonIds, 
  isOffline 
}: PublishedSermonsSectionProps) {
  if (sermons.length === 0) return null;

  return (
    <CollapsibleSection
      title="Sermões públicos"
      icon={<Globe className="h-3.5 w-3.5" />}
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
