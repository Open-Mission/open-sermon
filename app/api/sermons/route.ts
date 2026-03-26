import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getCached,
  sermonsCacheKey,
} from "@/lib/redis";
import type { Sermon } from "@/types/sermon";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const cacheKey = sermonsCacheKey(user.id, limit);

    const sermons = await getCached<Sermon[]>(
      cacheKey,
      async () => {
        let query = supabase
          .from("sermons")
          .select("*")
          .is("deleted_at", null)
          .order("updated_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error("API /sermons - Error:", error);
          return [];
        }

        return (data || []) as Sermon[];
      },
      30
    );

    return NextResponse.json(sermons);
  } catch (error) {
    console.error("API /sermons - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
