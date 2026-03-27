"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Clock, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Link01Icon, FavouriteIcon, Edit02Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Sermon, SermonStatus } from "@/types/sermon";
import { ShareSermonDialog } from "./share-sermon-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSermonCardProps {
  sermon: Sermon;
}

const statusConfig: Record<SermonStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  in_progress: { label: "Em progresso", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  finished: { label: "Finalizado", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  preached: { label: "Pregado", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

export function DashboardSermonCard({ sermon }: DashboardSermonCardProps) {
  const isMobile = useIsMobile();
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const status = statusConfig[sermon.status] || statusConfig.draft;

  return (
    <>
      <Link
        key={sermon.id}
        href={`/sermons/${sermon.id}`}
        className="group flex-none w-full sm:w-64 h-36 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col p-4 relative overflow-hidden snap-start"
      >
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <HugeiconsIcon icon={Note01Icon} size={20} />
          </div>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                <HugeiconsIcon icon={Link01Icon} size={14} className="mr-2" />
                {sermon.is_public ? "Editar link" : "Publicar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/sermons/${sermon.id}`}>
                  <HugeiconsIcon icon={Edit02Icon} size={14} className="mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {sermon.title || "Sem título"}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", status.className)}>
            {status.label}
          </span>
          {sermon.is_public && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={Link01Icon} size={10} className="mr-1" />
              Público
            </span>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-auto">
          {format(new Date(sermon.created_at), "dd MMM yyyy", { locale: ptBR })}
        </p>
      </Link>

      <ShareSermonDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        sermonId={sermon.id}
        sermonTitle={sermon.title || ""}
        isPublic={sermon.is_public || false}
        existingSlug={sermon.slug || null}
      />
    </>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, icon, count, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <section className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {icon}
        <h2 className="text-sm font-medium">{title}</h2>
        {count !== undefined && (
          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{count}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x scroll-smooth no-scrollbar">
          {children}
        </div>
      )}
    </section>
  );
}

interface StatusFilterProps {
  selectedStatus: SermonStatus | "all";
  onStatusChange: (status: SermonStatus | "all") => void;
  counts: Record<SermonStatus | "all", number>;
}

export function StatusFilter({ selectedStatus, onStatusChange, counts }: StatusFilterProps) {
  const statuses: Array<{ value: SermonStatus | "all"; label: string; className: string }> = [
    { value: "all", label: "Todos", className: "" },
    { value: "draft", label: "Rascunho", className: "bg-slate-500/10 text-slate-600" },
    { value: "in_progress", label: "Em progresso", className: "bg-amber-500/10 text-amber-600" },
    { value: "finished", label: "Finalizado", className: "bg-emerald-500/10 text-emerald-600" },
    { value: "preached", label: "Pregado", className: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            selectedStatus === status.value
              ? "bg-primary text-primary-foreground"
              : status.className
          )}
        >
          {status.label}
          <span className="text-[10px] opacity-70">({counts[status.value]})</span>
        </button>
      ))}
    </div>
  );
}

interface SermonTableRowProps {
  sermon: Sermon;
}

export function SermonTableRow({ sermon }: SermonTableRowProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const status = statusConfig[sermon.status] || statusConfig.draft;

  return (
    <>
      <Link 
        key={sermon.id} 
        href={`/sermons/${sermon.id}`}
        className="group sm:grid sm:grid-cols-12 flex flex-col gap-2 sm:gap-4 py-3 px-2 hover:bg-muted/40 transition-colors items-start sm:items-center rounded-md"
      >
        <div className="col-span-5 flex items-center gap-3">
          <HugeiconsIcon icon={Note01Icon} size={16} className="text-muted-foreground" />
          <span className="font-medium text-sm">
            {sermon.title || "Sem título"}
          </span>
        </div>
        <div className="col-span-4 flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium", status.className)}>
            {status.label}
          </span>
          {sermon.is_public && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={Link01Icon} size={10} className="mr-1" />
              Público
            </span>
          )}
        </div>
        <div className="col-span-3 flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            {format(new Date(sermon.created_at), "MMM d", { locale: ptBR })}
          </span>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 hover:bg-muted rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                <HugeiconsIcon icon={Link01Icon} size={14} className="mr-2" />
                {sermon.is_public ? "Editar link" : "Publicar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/sermons/${sermon.id}`}>
                  <HugeiconsIcon icon={Edit02Icon} size={14} className="mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>

      <ShareSermonDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        sermonId={sermon.id}
        sermonTitle={sermon.title || ""}
        isPublic={sermon.is_public || false}
        existingSlug={sermon.slug || null}
      />
    </>
  );
}
