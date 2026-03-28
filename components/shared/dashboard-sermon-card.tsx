"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, ChevronDown, ChevronRight, CloudOff, Download } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Link01Icon, Edit02Icon, Delete01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { softDeleteSermon, unpublishSermon } from "@/lib/sermon-actions";
import { offlineDb } from "@/lib/offline-db";

interface DashboardSermonCardProps {
  sermon: Sermon;
  isFullWidth?: boolean;
  showOfflineIndicator?: boolean;
  isPendingSync?: boolean;
}

const statusConfig: Record<SermonStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  in_progress: { label: "Em progresso", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  finished: { label: "Finalizado", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  preached: { label: "Pregado", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

export function DashboardSermonCard({ sermon, isFullWidth = false, showOfflineIndicator = false, isPendingSync = false }: DashboardSermonCardProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const status = statusConfig[sermon.status] || statusConfig.draft;
  const isLocal = offlineDb.isLocalId(sermon.id);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await softDeleteSermon(sermon.id);
    setIsDeleting(false);
    setIsSheetOpen(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sermão removido");
      router.refresh();
    }
  };

  const handleUnpublish = async () => {
    const result = await unpublishSermon(sermon.id);
    setIsSheetOpen(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sermão despublicado");
      router.refresh();
    }
  };

  const cardWidth = isFullWidth ? "w-full" : "w-[85%] sm:w-64";

  return (
    <>
      <Link
        key={sermon.id}
        href={`/sermons/${sermon.id}`}
        className={cn(
          "group flex-none h-36 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col p-4 relative overflow-hidden",
          cardWidth,
          isFullWidth ? "snap-start" : "snap-start"
        )}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
            <HugeiconsIcon icon={Note01Icon} size={20} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground shrink-0">
              {format(new Date(sermon.created_at), "dd MMM", { locale: ptBR })}
            </span>
            {isMobile || isFullWidth ? (
              <button
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSheetOpen(true);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            ) : (
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSheetOpen(true);
                    }}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} className="mr-2" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {sermon.title || "Sem título"}
        </h3>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", status.className)}>
            {status.label}
          </span>
          {sermon.is_public && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={Link01Icon} size={10} className="mr-1" />
              Público
            </span>
          )}
          {(isLocal || isPendingSync) && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <CloudOff className="h-2.5 w-2.5 mr-1" />
              Pendente
            </span>
          )}
          {showOfflineIndicator && !isLocal && !isPendingSync && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400" title="Disponível offline">
              <Download className="h-2.5 w-2.5 mr-1" />
              Offline
            </span>
          )}
        </div>
      </Link>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 pt-2">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/20" />
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="text-base">{sermon.title || "Sem título"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsSheetOpen(false);
                setIsShareDialogOpen(true);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors"
            >
              <HugeiconsIcon icon={Link01Icon} size={18} />
              {sermon.is_public ? "Editar link" : "Publicar"}
            </button>
            
            <button
              onClick={() => {
                setIsSheetOpen(false);
                router.push(`/sermons/${sermon.id}`);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors"
            >
              <HugeiconsIcon icon={Edit02Icon} size={18} />
              Editar
            </button>
            
            {sermon.is_public && (
              <button
                onClick={handleUnpublish}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
                Despublicar
              </button>
            )}
            
            <div className="h-px bg-border my-2" />
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-lg hover:bg-muted transition-colors text-destructive"
            >
              <HugeiconsIcon icon={Delete01Icon} size={18} />
              {isDeleting ? "Removendo..." : "Remover"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

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
  showOfflineIndicator?: boolean;
  isPendingSync?: boolean;
}

export function SermonTableRow({ sermon, showOfflineIndicator = false, isPendingSync = false }: SermonTableRowProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const status = statusConfig[sermon.status] || statusConfig.draft;
  const isLocal = offlineDb.isLocalId(sermon.id);

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
        <div className="col-span-4 flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium", status.className)}>
            {status.label}
          </span>
          {sermon.is_public && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={Link01Icon} size={10} className="mr-1" />
              Público
            </span>
          )}
          {(isLocal || isPendingSync) && (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <CloudOff className="h-2.5 w-2.5 mr-1" />
              Pendente
            </span>
          )}
          {showOfflineIndicator && !isLocal && !isPendingSync && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400" title="Disponível offline">
              <Download className="h-2.5 w-2.5 mr-1" />
              Offline
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
