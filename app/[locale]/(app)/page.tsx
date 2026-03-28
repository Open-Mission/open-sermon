import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  const [{ data: sermons }, { data: profile }] = await Promise.all([
    supabase
      .from("sermons")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", user?.id || "")
      .single(),
  ]);

  const userName = profile?.first_name || user?.email?.split("@")[0] || "Usuário";

  const recentSermons = sermons?.slice(0, 5) || [];
  const publishedSermons = sermons?.filter((s) => s.is_public) || [];
  const allSermons = sermons || [];

  return (
    <DashboardClient
      user={user}
      userName={userName}
      profile={profile}
      recentSermons={recentSermons}
      publishedSermons={publishedSermons}
      allSermons={allSermons}
    />
  );
}
