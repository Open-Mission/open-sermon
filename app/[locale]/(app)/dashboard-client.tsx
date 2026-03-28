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
    <div className="mx-auto max-w-5xl pb-24 px-4 sm:px-6 md:px-8 pt-8">
      <header className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
            Olá, {userName}
          </h1>
          <UserMenu user={user} showDetails={false} />
        </div>
        <p className="text-sm text-muted-foreground/60">
          {allSermons.length === 0 
            ? "Comece criando seu primeiro sermão"
            : `${allSermons.length} sermão${allSermons.length !== 1 ? "s" : ""} na sua biblioteca`
          }
        </p>
      </header>

      {recentSermons.length > 0 && (
        <CollapsibleSection
          title="Visitados recentemente"
          icon={<Clock className="h-3.5 w-3.5" />}
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
          icon={<Globe className="h-3.5 w-3.5" />}
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

      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2.5 text-muted-foreground/50">
            <FileText className="h-3.5 w-3.5" />
            <h2 className="text-sm font-medium tracking-tight">Todos os sermões</h2>
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
              <div className="grid grid-cols-1">
                <div className="hidden sm:grid grid-cols-12 gap-4 py-2 text-[11px] font-medium text-muted-foreground/50 px-3 uppercase tracking-wider">
                  <div className="col-span-5">Nome</div>
                  <div className="col-span-4">Status</div>
                  <div className="col-span-3 text-right">Data</div>
                </div>

                <div className="divide-y divide-border/50 rounded-xl border border-border/30 overflow-hidden">
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
            </div>

            <div className="sm:hidden flex flex-col gap-2">
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
                className="flex-none w-full h-32 bg-transparent border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground/50 hover:border-foreground/30 hover:text-foreground/70 transition-all duration-300"
              >
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <HugeiconsIcon icon={Add02Icon} size={18} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Novo sermão</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-5">
              <FileText className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-foreground/80 mb-1">Nenhum sermão encontrado</h3>
            <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed">
              {selectedStatus === "all" 
                ? "Você ainda não criou nenhum sermão. Comece agora escrevendo uma nova mensagem."
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
