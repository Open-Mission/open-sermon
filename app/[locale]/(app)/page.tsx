import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { FileText, Globe, Clock } from "lucide-react";
import { UserMenu } from "@/components/shared/user-menu";
import { NewSermonButtonInline } from "@/components/shared/new-sermon-button-inline";
import { NewSermonFab } from "@/components/shared/new-sermon-fab";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();

  const { data: sermons } = await supabase
    .from("sermons")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Usuário";

  const recentSermons = sermons?.slice(0, 5) || [];
  const publishedSermons = sermons?.filter(s => s.is_public) || [];
  const allSermons = sermons || [];

  return (
    <DashboardClient
      user={user}
      userName={userName}
      recentSermons={recentSermons}
      publishedSermons={publishedSermons}
      allSermons={allSermons}
    />
  );
}
