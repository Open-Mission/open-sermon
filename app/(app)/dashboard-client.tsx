/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { User } from "@supabase/supabase-js";
import { useState, useEffect, useMemo } from "react";
import { Sermon, SermonStatus } from "@/types/sermon";
import { offlineDb } from "@/lib/offline-db";
import { NewSermonFab } from "@/components/shared/new-sermon-fab";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { DashboardGreeting } from "@/components/shared/dashboard-greeting";
import { RecentSermonsSection } from "@/components/shared/recent-sermons-section";
import { PublishedSermonsSection } from "@/components/shared/published-sermons-section";
import { AllSermonsSection } from "@/components/shared/all-sermons-section";
import { OnboardingModal } from "@/components/shared/onboarding-modal";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface DashboardClientProps {
  user: User | null;
  userName: string;
  profile: Profile | null;
  recentSermons: Sermon[];
  publishedSermons: Sermon[];
  allSermons: Sermon[];
}

export function DashboardClient({ user, userName, profile, recentSermons, publishedSermons, allSermons }: DashboardClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<SermonStatus | "all">("all");
  const [offlineSermons, setOfflineSermons] = useState<Sermon[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const needsOnboarding = !profile?.first_name;
  const displayName = profile?.first_name || userName;

  useEffect(() => {
    if (needsOnboarding && user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
    }
  }, [needsOnboarding, user?.id]);

  useEffect(() => {
    const loadOfflineSermons = async () => {
      if (user?.id) {
        const sermons = await offlineDb.getAllSermons(user.id);
        setOfflineSermons(sermons);
      }
    };
    loadOfflineSermons();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user?.id]);

  useEffect(() => {
    if (allSermons.length > 0 && user?.id && navigator.onLine) {
      offlineDb.saveSermons(allSermons);
    }
  }, [allSermons, user?.id]);

  const syncedSermonIds = useMemo(() => {
    const allSermonIds = new Set(allSermons.map(s => s.id));
    return new Set(
      offlineSermons
        .map(s => s.id)
        .filter(id => !offlineDb.isLocalId(id) && allSermonIds.has(id))
    );
  }, [offlineSermons, allSermons]);
  
  const localOnlySermonIds = useMemo(() => {
    return new Set(offlineSermons.filter(s => offlineDb.isLocalId(s.id)).map(s => s.id));
  }, [offlineSermons]);

  const displaySermons = useMemo(() => {
    if (isOffline) {
      return offlineSermons;
    }
    return allSermons;
  }, [isOffline, offlineSermons, allSermons]);

  const statusCounts: Record<SermonStatus | "all", number> = useMemo(() => ({
    all: displaySermons.length,
    draft: displaySermons.filter(s => s.status === "draft").length,
    in_progress: displaySermons.filter(s => s.status === "in_progress").length,
    finished: displaySermons.filter(s => s.status === "finished").length,
    preached: displaySermons.filter(s => s.status === "preached").length,
  }), [displaySermons]);

  const displayRecentSermons = useMemo(() => {
    if (isOffline) {
      return offlineSermons.slice(0, 5);
    }
    return recentSermons;
  }, [isOffline, offlineSermons, recentSermons]);

  const displayPublishedSermons = useMemo(() => {
    if (isOffline) {
      return offlineSermons.filter(s => s.is_public);
    }
    return publishedSermons;
  }, [isOffline, offlineSermons, publishedSermons]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        userId={user?.id || ""}
        email={user?.email || ""}
        onComplete={handleOnboardingComplete}
      />

      <div className="mx-auto max-w-5xl pb-24 px-4 sm:px-6 md:px-8 pt-8">
        {isOffline && (
          <OfflineBanner count={offlineSermons.length} />
        )}

        <DashboardGreeting 
          user={user} 
          userName={displayName} 
          sermonCount={displaySermons.length} 
          avatarUrl={profile?.avatar_url}
        />

        <RecentSermonsSection
          sermons={displayRecentSermons}
          syncedSermonIds={syncedSermonIds}
          localOnlySermonIds={localOnlySermonIds}
          isOffline={isOffline}
        />

        <PublishedSermonsSection
          sermons={displayPublishedSermons}
          syncedSermonIds={syncedSermonIds}
          localOnlySermonIds={localOnlySermonIds}
          isOffline={isOffline}
        />

        <AllSermonsSection
          sermons={displaySermons}
          syncedSermonIds={syncedSermonIds}
          localOnlySermonIds={localOnlySermonIds}
          isOffline={isOffline}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusCounts={statusCounts}
        />

        <NewSermonFab />
      </div>
    </>
  );
}
