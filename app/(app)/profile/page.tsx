import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, status, is_public")
    .is("deleted_at", null);

  const stats = {
    total: sermons?.length || 0,
    preached: sermons?.filter(s => s.status === "preached").length || 0,
    inProgress: sermons?.filter(s => s.status === "in_progress").length || 0,
    public: sermons?.filter(s => s.is_public).length || 0,
  };

  return (
    <ProfileClient 
      user={user} 
      profile={profile} 
      stats={stats}
    />
  );
}
