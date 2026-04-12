import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "email" | "recovery" | null;
  const next = searchParams.get("next") ?? "/onboarding";

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

  // Handle email confirmation (token_hash flow)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.session) {
      // Session is now active — redirect to onboarding
      return NextResponse.redirect(`${origin}/onboarding`);
    }
    // If verifyOtp failed, redirect to auth with error info
    const errMsg = error?.message || "unknown";
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errMsg)}`);
  }

  // Handle OAuth / PKCE (code flow)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
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
