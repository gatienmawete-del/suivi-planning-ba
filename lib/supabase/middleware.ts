import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }: CookieToSet) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  // Laisser passer les routes de signout sans vérification
  if (pathname.startsWith("/auth/signout")) {
    return supabaseResponse;
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isPublic =
    pathname === "/" ||
    isAuthPage ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public");

  // IMPORTANT: pas de code entre createServerClient et getUser()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Si erreur d'auth (token corrompu/expiré) et pas sur une page publique,
  // on redirige vers login en nettoyant les cookies pour casser la boucle
  if (error && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    // Supprimer tous les cookies Supabase pour éviter la boucle
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    });
    return response;
  }

  // Si erreur d'auth sur page publique (ex: /login), nettoyer les cookies stale
  // pour que le user ne soit pas considéré comme connecté au prochain appel
  if (error && isAuthPage) {
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        supabaseResponse.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    });
    return supabaseResponse;
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Rediriger vers dashboard SEULEMENT si user valide (pas d'erreur)
  if (user && !error && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protection du rôle viewer : accès uniquement à /dashboard et /admin/analytics
  if (user && !error) {
    const isAdminRoute = pathname.startsWith("/admin/");
    const isAnalytics = pathname.startsWith("/admin/analytics");
    const isBaOnlyRoute =
      pathname.startsWith("/planning") ||
      pathname.startsWith("/history") ||
      pathname.startsWith("/objectives") ||
      pathname.startsWith("/vacations") ||
      pathname.startsWith("/settings");

    // Charger le profil pour vérifier le rôle
    if (isAdminRoute || isBaOnlyRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "viewer") {
        // Viewer ne peut accéder qu'au dashboard et analytics
        if ((isAdminRoute && !isAnalytics) || isBaOnlyRoute) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
