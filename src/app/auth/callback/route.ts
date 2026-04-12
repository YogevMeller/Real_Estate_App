import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/matches";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile for Google OAuth users (they skip the register form)
      const meta = data.user.user_metadata;
      await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: meta?.full_name?.split(" ")[0] || meta?.name?.split(" ")[0] || "",
        last_name: meta?.full_name?.split(" ").slice(1).join(" ") || "",
        avatar_url: meta?.avatar_url || null,
      }, { onConflict: "id", ignoreDuplicates: false });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_failed`);
}
