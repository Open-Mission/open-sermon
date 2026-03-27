"use client";

import { User } from "@supabase/supabase-js";
import { FileText, Globe, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { NewSermonButtonInline } from "@/components/shared/new-sermon-button-inline";
import { NewSermonFab } from "@/components/shared/new-sermon-fab";
import { UserMenu } from "@/components/shared/user-menu";
import { DashboardSermonCard, CollapsibleSection, StatusFilter, SermonTableRow } from "@/components/shared/dashboard-sermon-card";
import { useState } from "react";
import { Sermon, SermonStatus } from "@/types/sermon";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add02Icon } from "@hugeicons/core-free-icons";

interface DashboardClientProps {
  user: User | null;
  userName: string;
  recentSermons: Sermon[];
  publishedSermons: Sermon[];
  allSermons: Sermon[];
}

export function DashboardClient({ user, userName, recentSermons, publishedSermons, allSermons }: DashboardClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<SermonStatus | "all">("all");

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
          {recentSermons.map((sermon) => (
            <DashboardSermonCard key={sermon.id} sermon={sermon} />
          ))}
        </CollapsibleSection>
      )}

      {publishedSermons.length > 0 && (
        <CollapsibleSection
          title="Sermões públicos"
          icon={<Globe className="h-4 w-4" />}
          count={publishedSermons.length}
        >
          {publishedSermons.map((sermon) => (
            <DashboardSermonCard key={sermon.id} sermon={sermon} />
          ))}
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

                {filteredSermons.map((sermon) => (
                  <SermonTableRow key={sermon.id} sermon={sermon} />
                ))}
              </div>
            </div>

            <div className="sm:hidden grid grid-cols-1 gap-3">
              {filteredSermons.map((sermon) => (
                <DashboardSermonCard key={sermon.id} sermon={sermon} />
              ))}
              <Link
                href="/sermons/new"
                className="flex-none w-[85%] h-36 bg-transparent border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors snap-start"
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
