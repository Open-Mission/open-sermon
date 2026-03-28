"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Sermon, SermonStatus } from "@/types/sermon";
import { DashboardSermonCard, StatusFilter, SermonTableRow } from "./dashboard-sermon-card";
import { NewSermonButtonInline } from "./new-sermon-button-inline";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add02Icon } from "@hugeicons/core-free-icons";

interface AllSermonsSectionProps {
  sermons: Sermon[];
  syncedSermonIds: Set<string>;
  localOnlySermonIds: Set<string>;
  isOffline: boolean;
  selectedStatus: SermonStatus | "all";
  onStatusChange: (status: SermonStatus | "all") => void;
  statusCounts: Record<SermonStatus | "all", number>;
}

export function AllSermonsSection({ 
  sermons, 
  syncedSermonIds, 
  localOnlySermonIds, 
  isOffline,
  selectedStatus,
  onStatusChange,
  statusCounts
}: AllSermonsSectionProps) {
  const filteredSermons = selectedStatus === "all" 
    ? sermons 
    : sermons.filter(s => s.status === selectedStatus);

  return (
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
          onStatusChange={onStatusChange}
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
                  const isAvailableOffline = syncedSermonIds.has(sermon.id) || localOnlySermonIds.has(sermon.id);
                  return (
                    <SermonTableRow 
                      key={sermon.id} 
                      sermon={sermon} 
                      showOfflineIndicator={isAvailableOffline}
                      isPendingSync={isPending}
                      isUnavailableOffline={isOffline && !isAvailableOffline}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sm:hidden flex flex-col gap-2">
            {filteredSermons.map((sermon) => {
              const isPending = localOnlySermonIds.has(sermon.id);
              const isAvailableOffline = syncedSermonIds.has(sermon.id) || localOnlySermonIds.has(sermon.id);
              return (
                <DashboardSermonCard 
                  key={sermon.id} 
                  sermon={sermon} 
                  isFullWidth 
                  showOfflineIndicator={isAvailableOffline}
                  isPendingSync={isPending}
                  isUnavailableOffline={isOffline && !isAvailableOffline}
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
            {isOffline 
              ? "Nenhum sermão disponível offline. Conecte-se à internet para sincronizar."
              : selectedStatus === "all" 
                ? "Você ainda não criou nenhum sermão. Comece agora escrevendo uma nova mensagem."
                : "Nenhum sermão com este status."}
          </p>
          {!isOffline && (
            <div className="mt-6">
              <NewSermonButtonInline className="sm:hidden" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
