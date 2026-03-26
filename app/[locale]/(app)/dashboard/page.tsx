import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, FileText, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon } from "@hugeicons/core-free-icons";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();

  // Fetch sermons
  const { data: sermons } = await supabase
    .from("sermons")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch user profile
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuário";

  // Separate recent vs all
  const recentSermons = sermons?.slice(0, 5) || [];
  const allSermons = sermons || [];

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20 px-4 sm:px-6 md:px-8 mt-10">
      
      {/* Notion-style Greeting */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <span className="text-4xl">☀️</span> Olá, {userName}
        </h1>
      </div>

      {recentSermons.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <h2 className="text-sm font-medium">{t("recentSermons", { default: "Visitados recentemente" })}</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x scroll-smooth no-scrollbar">
            {recentSermons.map((sermon) => (
              <Link
                key={sermon.id}
                href={`/sermons/${sermon.id}`}
                className="group flex-none w-64 h-36 bg-card border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col p-4 relative overflow-hidden snap-start"
              >
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <HugeiconsIcon icon={Note01Icon} size={20} />
                </div>
                <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                  {sermon.title || "Sem título"}
                </h3>
                <p className="text-xs text-muted-foreground mt-auto">
                  {format(new Date(sermon.created_at), "dd MMM yyyy", { locale: ptBR })}
                </p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Notion-style List Area */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground border-b pb-2">
          <FileText className="h-4 w-4" />
          <h2 className="text-sm font-medium">{t("allSermons")}</h2>
          <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{allSermons.length}</span>
        </div>

        {allSermons.length > 0 ? (
          <div className="grid grid-cols-1 divide-y border-b">
            {/* Table Header like Notion */}
            <div className="hidden sm:grid grid-cols-12 gap-4 py-2 text-xs font-medium text-muted-foreground px-2">
              <div className="col-span-6">Nome</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3 text-right">Data</div>
            </div>

            {/* Table Rows */}
            {allSermons.map((sermon) => (
              <Link 
                key={sermon.id} 
                href={`/sermons/${sermon.id}`}
                className="group sm:grid sm:grid-cols-12 flex flex-col gap-2 sm:gap-4 py-3 px-2 hover:bg-muted/40 transition-colors items-start sm:items-center rounded-md"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <HugeiconsIcon icon={Note01Icon} size={16} className="text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {sermon.title || "Sem título"}
                  </span>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {sermon.status || "Ativo"}
                  </span>
                </div>
                <div className="col-span-3 text-xs text-muted-foreground sm:text-right flex items-center justify-between sm:justify-end w-full sm:w-auto">
                  <span>{format(new Date(sermon.created_at), "MMM d", { locale: ptBR })}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{t("noSermons")}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Você ainda não criou nenhum sermão. Comece agora escrevendo uma nova mensagem para usa equipe ou igreja.
            </p>
            <Button className="mt-6" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Sermão
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
