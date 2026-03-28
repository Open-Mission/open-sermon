"use client";

import { User } from "@supabase/supabase-js";
import { FileText, Globe, Clock, Plus, CloudOff, Download } from "lucide-react";
import Link from "next/link";
import { NewSermonButtonInline } from "@/components/shared/new-sermon-button-inline";
import { NewSermonFab } from "@/components/shared/new-sermon-fab";
import { UserMenu } from "@/components/shared/user-menu";
import { DashboardSermonCard, CollapsibleSection, StatusFilter, SermonTableRow } from "@/components/shared/dashboard-sermon-card";
import { useState, useEffect } from "react";
import { Sermon, SermonStatus } from "@/types/sermon";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add02Icon } from "@hugeicons/core-free-icons";
import { offlineDb } from "@/lib/offline-db";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  user: User | null;
  userName: string;
  recentSermons: Sermon[];
  publishedSermons: Sermon[];
  allSermons: Sermon[];
}

export function DashboardClient({ user, userName, recentSermons, publishedSermons, allSermons }: DashboardClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<SermonStatus | "all">("all");
  const [offlineSermons, setOfflineSermons] = useState<Sermon[]>([]);
  const [isOffline, setIsOffline] = useState(false);

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
    if (allSermons.length > 0 && user?.id) {
      offlineDb.saveSermons(allSermons);
    }
  }, [allSermons, user?.id]);

  const syncedSermonIds = new Set(offlineSermons.map(s => s.id).filter(id => !offlineDb.isLocalId(id)));
  const localOnlySermonIds = new Set(offlineSermons.filter(s => offlineDb.isLocalId(s.id)).map(s => s.id));

  const filteredSermons = selectedStatus === "all" 
    ? allSermons 
    : allSermons.filter(s => s.status === selectedStatus);

  const statusCounts: Record<SermonStatus | "all", number> = {
    all: allSermons.length,
    draft: allSermons.filter(s => s.status === "draft").length,
    in_progress: allSermons.filter(s => s.status === "in_progress").length,
    finished: allSermons.filter(s => s.status === "finished").length,
    preached: allSermons.filter(s => s.status === "preached").length,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20 px-4 sm:px-6 md:px-8 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <span className="text-4xl">☀️</span> Olá, {userName}
        </h1>
        <UserMenu user={user} showDetails={false} />
      </div>

      {recentSermons.length > 0 && (
        <CollapsibleSection
          title="Visitados recentemente"
          icon={<Clock className="h-4 w-4" />}
          count={recentSermons.length}
        >
          {recentSermons.map((sermon) => {
            const isPending = localOnlySermonIds.has(sermon.id);
            const isAvailableOffline = syncedSermonIds.has(sermon.id);
            return (
              <DashboardSermonCard 
                key={sermon.id} 
                sermon={sermon}
                showOfflineIndicator={isAvailableOffline}
                isPendingSync={isPending}
              />
            );
          })}
        </CollapsibleSection>
      )}

      {publishedSermons.length > 0 && (
        <CollapsibleSection
          title="Sermões públicos"
          icon={<Globe className="h-4 w-4" />}
          count={publishedSermons.length}
        >
          {publishedSermons.map((sermon) => {
            const isPending = localOnlySermonIds.has(sermon.id);
            const isAvailableOffline = syncedSermonIds.has(sermon.id);
            return (
              <DashboardSermonCard 
                key={sermon.id} 
                sermon={sermon}
                showOfflineIndicator={isAvailableOffline}
                isPendingSync={isPending}
              />
            );
          })}
        </CollapsibleSection>
      )}

      {(syncedSermonIds.size > 0 || localOnlySermonIds.size > 0) && (
        <CollapsibleSection
          title="Disponíveis offline"
          icon={<Download className="h-4 w-4" />}
          count={syncedSermonIds.size + localOnlySermonIds.size}
          defaultOpen={isOffline}
        >
          {localOnlySermonIds.size > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 mb-2 px-1">
                <CloudOff className="h-3.5 w-3.5" />
                <span>Aguardando sincronização ({localOnlySermonIds.size})</span>
              </div>
              {offlineSermons.filter(s => localOnlySermonIds.has(s.id)).map((sermon) => (
                <DashboardSermonCard key={sermon.id} sermon={sermon} isPendingSync />
              ))}
            </div>
          )}
          {syncedSermonIds.size > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSermons
                .filter(s => syncedSermonIds.has(s.id))
                .slice(0, 6)
                .map((sermon) => (
                  <DashboardSermonCard key={sermon.id} sermon={sermon} showOfflineIndicator />
                ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <h2 className="text-sm font-medium">Todos os sermões</h2>
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{allSermons.length}</span>
          </div>
          <NewSermonButtonInline className="hidden sm:flex" />
        </div>

        <div className="sm:hidden">
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            counts={statusCounts}
          />
        </div>

        {filteredSermons.length > 0 ? (
          <>
            <div className="hidden sm:block">
              <div className="grid grid-cols-1 divide-y border-b">
                <div className="hidden sm:grid grid-cols-12 gap-4 py-2 text-xs font-medium text-muted-foreground px-2">
                  <div className="col-span-5">Nome</div>
                  <div className="col-span-4">Status</div>
                  <div className="col-span-3 text-right">Data</div>
                </div>

                {filteredSermons.map((sermon) => {
                  const isPending = localOnlySermonIds.has(sermon.id);
                  const isAvailableOffline = syncedSermonIds.has(sermon.id);
                  return (
                    <SermonTableRow 
                      key={sermon.id} 
                      sermon={sermon} 
                      showOfflineIndicator={isAvailableOffline}
                      isPendingSync={isPending}
                    />
                  );
                })}
              </div>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3">
              {filteredSermons.map((sermon) => {
                const isPending = localOnlySermonIds.has(sermon.id);
                const isAvailableOffline = syncedSermonIds.has(sermon.id);
                return (
                  <DashboardSermonCard 
                    key={sermon.id} 
                    sermon={sermon} 
                    isFullWidth 
                    showOfflineIndicator={isAvailableOffline}
                    isPendingSync={isPending}
                  />
                );
              })}
              <Link
                href="/sermons/new"
                className="flex-none w-full h-36 bg-transparent border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <HugeiconsIcon icon={Add02Icon} size={20} />
                </div>
                <span className="text-sm font-medium">Novo sermão</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">Nenhum sermão encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {selectedStatus === "all" 
                ? "Você ainda não criou nenhum sermão. Comece agora escrevendo uma nova mensagem para sua equipe ou igreja."
                : "Nenhum sermão com este status."}
            </p>
            <div className="mt-6">
              <NewSermonButtonInline className="sm:hidden" />
            </div>
          </div>
        )}
      </section>

      <NewSermonFab />
    </div>
  );
}
