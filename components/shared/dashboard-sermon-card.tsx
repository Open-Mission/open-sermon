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

const statusConfig: Record<SermonStatus, { label: string; dot: string; color: string }> = {
  draft: { label: "Rascunho", dot: "bg-slate-400", color: "text-slate-500" },
  in_progress: { label: "Em progresso", dot: "bg-amber-400", color: "text-amber-600" },
  finished: { label: "Finalizado", dot: "bg-emerald-400", color: "text-emerald-600" },
  preached: { label: "Pregado", dot: "bg-violet-400", color: "text-violet-600" },
};

const statusGradients: Record<SermonStatus, string> = {
  draft: "from-slate-100 to-slate-50 dark:from-slate-900/40 dark:to-slate-900/20",
  in_progress: "from-amber-50 to-amber-25 dark:from-amber-900/20 dark:to-amber-900/10",
  finished: "from-emerald-50 to-emerald-25 dark:from-emerald-900/20 dark:to-emerald-900/10",
  preached: "from-violet-50 to-violet-25 dark:from-violet-900/20 dark:to-violet-900/10",
};

export function DashboardSermonCard({ sermon, isFullWidth = false, showOfflineIndicator = false, isPendingSync = false }: DashboardSermonCardProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const status = statusConfig[sermon.status] || statusConfig.draft;
  const gradient = statusGradients[sermon.status] || statusGradients.draft;
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

  const cardWidth = isFullWidth ? "w-full" : "w-[85%] sm:w-72";

  return (
    <>
      <Link
        key={sermon.id}
        href={`/sermons/${sermon.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group flex-none h-40 bg-gradient-to-br border border-transparent rounded-2xl transition-all duration-300 ease-out flex flex-col p-5 relative overflow-hidden cursor-pointer",
          cardWidth,
          "snap-start",
          gradient,
          isHovered && "shadow-lg shadow-black/5 dark:shadow-black/20 border-border/50"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
            "bg-white/60 dark:bg-white/10 backdrop-blur-sm",
            isHovered && "shadow-md"
          )}>
            <HugeiconsIcon 
              icon={Note01Icon} 
              size={22} 
              className={cn("transition-colors duration-300", status.color)}
              strokeWidth={1.5}
            />
          </div>
          <div className="flex items-center gap-2">
            {isMobile || isFullWidth ? (
              <button
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-muted-foreground/60 hover:text-foreground transition-colors"
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
                    className={cn(
                      "p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-muted-foreground/60 hover:text-foreground transition-all duration-200",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
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
        
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 tracking-tight text-foreground/90">
          {sermon.title || "Sem título"}
        </h3>
        
        <div className="flex items-center justify-between gap-2 mt-auto pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", status.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            {sermon.is_public && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-500 dark:text-blue-400">
                <HugeiconsIcon icon={Link01Icon} size={11} />
                Público
              </span>
            )}
            {(isLocal || isPendingSync) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <CloudOff className="h-3 w-3" />
                Pendente
              </span>
            )}
            {showOfflineIndicator && !isLocal && !isPendingSync && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400" title="Disponível offline">
                <Download className="h-3 w-3" />
                Offline
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/50 shrink-0 font-medium tracking-wide">
            {format(new Date(sermon.created_at), "dd MMM", { locale: ptBR })}
          </span>
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
    <section className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors w-full py-1"
      >
        <span className={cn(
          "transition-transform duration-200",
          isOpen ? "rotate-0" : "-rotate-90"
        )}>
          <ChevronDown className="h-4 w-4" />
        </span>
        <span className="text-muted-foreground/40">
          {icon}
        </span>
        <h2 className="text-sm font-medium tracking-tight">{title}</h2>
        {count !== undefined && (
          <span className="text-[11px] text-muted-foreground/50 font-medium">{count}</span>
        )}
      </button>
      
      <div className={cn(
        "grid transition-all duration-300 ease-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x scroll-smooth no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatusFilterProps {
  selectedStatus: SermonStatus | "all";
  onStatusChange: (status: SermonStatus | "all") => void;
  counts: Record<SermonStatus | "all", number>;
}

export function StatusFilter({ selectedStatus, onStatusChange, counts }: StatusFilterProps) {
  const statuses: Array<{ value: SermonStatus | "all"; label: string; dot: string; color: string }> = [
    { value: "all", label: "Todos", dot: "bg-foreground/50", color: "text-foreground/70" },
    { value: "draft", label: "Rascunho", dot: "bg-slate-400", color: "text-slate-500" },
    { value: "in_progress", label: "Em progresso", dot: "bg-amber-400", color: "text-amber-600" },
    { value: "finished", label: "Finalizado", dot: "bg-emerald-400", color: "text-emerald-600" },
    { value: "preached", label: "Pregado", dot: "bg-violet-400", color: "text-violet-600" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status) => {
        const isSelected = selectedStatus === status.value;
        return (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isSelected
                ? "bg-foreground text-background"
                : cn("hover:bg-muted/50", status.color)
            )}
          >
            <span className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              isSelected ? "bg-background" : status.dot
            )} />
            {status.label}
            <span className={cn(
              "text-[10px] transition-opacity",
              isSelected ? "opacity-60" : "opacity-50"
            )}>
              {counts[status.value]}
            </span>
          </button>
        );
      })}
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
  const [isHovered, setIsHovered] = React.useState(false);
  
  const status = statusConfig[sermon.status] || statusConfig.draft;
  const isLocal = offlineDb.isLocalId(sermon.id);

  return (
    <>
      <Link 
        key={sermon.id} 
        href={`/sermons/${sermon.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group sm:grid sm:grid-cols-12 flex flex-col gap-2 sm:gap-4 py-3.5 px-3 hover:bg-muted/30 transition-all duration-200 items-start sm:items-center rounded-lg"
      >
        <div className="col-span-5 flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
            "bg-muted/50",
            isHovered && "bg-muted"
          )}>
            <HugeiconsIcon icon={Note01Icon} size={16} className={status.color} strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm text-foreground/90">
            {sermon.title || "Sem título"}
          </span>
        </div>
        <div className="col-span-4 flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", status.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          {sermon.is_public && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-500 dark:text-blue-400">
              <HugeiconsIcon icon={Link01Icon} size={11} />
              Público
            </span>
          )}
          {(isLocal || isPendingSync) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <CloudOff className="h-3 w-3" />
              Pendente
            </span>
          )}
          {showOfflineIndicator && !isLocal && !isPendingSync && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400" title="Disponível offline">
              <Download className="h-3 w-3" />
              Offline
            </span>
          )}
        </div>
        <div className="col-span-3 flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs text-muted-foreground/70 font-medium">
            {format(new Date(sermon.created_at), "MMM d", { locale: ptBR })}
          </span>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "p-1.5 hover:bg-muted rounded-lg text-muted-foreground/50 hover:text-foreground transition-all duration-200",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
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
