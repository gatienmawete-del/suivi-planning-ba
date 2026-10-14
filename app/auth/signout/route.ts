import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });

  // Supprimer explicitement les cookies Supabase
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
  ];
  // Supprimer aussi les cookies au format sb-<ref>-auth-token
  const allCookies = request.headers.get("cookie") ?? "";
  const sbCookies = allCookies
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((name) => name.startsWith("sb-") && name.endsWith("-auth-token"));

  [...cookieNames, ...sbCookies].forEach((name) => {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
    // Variantes chunked (sb-xxx-auth-token.0, .1, etc.)
    for (let i = 0; i < 5; i++) {
      response.cookies.set(`${name}.${i}`, "", { maxAge: 0, path: "/" });
    }
  });

  return response;
}
