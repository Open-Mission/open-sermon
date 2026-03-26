import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCached, sermonCacheKey } from "@/lib/redis";
import type { Sermon } from "@/types/sermon";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = sermonCacheKey(id);

    const sermon = await getCached<Sermon | null>(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from("sermons")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("API /sermons/[id] - Error:", error);
          return null;
        }

        return data as Sermon;
      },
      60
    );

    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("API /sermons/[id] - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
