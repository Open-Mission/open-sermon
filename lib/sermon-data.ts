import { createClient } from "@/lib/supabase/server";
import { Sermon } from "@/types/sermon";

export async function getSermons(limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("sermons")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: sermons, error } = await query;

  if (error) {
    console.error("getSermons - Error:", error);
    return [];
  }
  
  return (sermons || []) as Sermon[];
}
