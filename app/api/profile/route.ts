import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { first_name, last_name, phone, church_name, church_role, bio, timezone, avatar_url } = body;

  const full_name = [first_name, last_name].filter(Boolean).join(" ");

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      first_name,
      last_name,
      full_name,
      phone,
      church_name,
      church_role,
      bio,
      timezone,
      avatar_url,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
