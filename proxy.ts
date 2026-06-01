import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "./lib/admin";
import { isPhoneUserAgent } from "./lib/device";
import { isTestingMode } from "./lib/site-mode";

const PROTECTED_PREFIXES = ["/dashboard", "/trade-log", "/storage", "/settings", "/select-plan", "/setup"];
const SETUP_REQUIRED_PREFIXES = ["/dashboard", "/trade-log", "/storage"];
const PHONE_BLOCKED_PREFIXES = ["/login", "/auth/callback", ...PROTECTED_PREFIXES];
const AUTH_ROUTES = ["/login", "/select-plan"];
const TESTING_ALLOWED_PUBLIC_ROUTES = [
  "/",
  "/unsupported-device",
  "/login",
  "/auth/callback",
  "/about",
  "/contact",
  "/pricing",
  "/prices",
  "/privacy-policy",
  "/terms-and-conditions",
  "/terms",
];

const isRouteMatch = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const isProtectedRoute = (pathname: string) => isRouteMatch(pathname, PROTECTED_PREFIXES);
const isPhoneBlockedRoute = (pathname: string) => isRouteMatch(pathname, PHONE_BLOCKED_PREFIXES);
const isAuthRoute = (pathname: string) => isRouteMatch(pathname, AUTH_ROUTES);

function redirect(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const testingMode = isTestingMode();
  const isPhone = isPhoneUserAgent(request.headers.get("user-agent"));

  if (isPhone && isPhoneBlockedRoute(pathname)) {
    return redirect(request, "/unsupported-device");
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminUser(user?.email);

  if (testingMode && !isAdmin) {
    const allowedPublicRoute = isRouteMatch(pathname, TESTING_ALLOWED_PUBLIC_ROUTES);

    if (isProtectedRoute(pathname)) {
      return redirect(request, "/");
    }

    if (!allowedPublicRoute) {
      return redirect(request, "/");
    }
  }

  if (isProtectedRoute(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user) return response;

  const { data: planRow } = await supabase
    .from("user_plans")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isProtectedRoute(pathname) && pathname !== "/select-plan" && !planRow) {
    return redirect(request, "/select-plan");
  }

  let setupCompleted = false;

  if (planRow) {
    const { data: settingsRow } = await supabase
      .from("user_trade_settings")
      .select("setup_completed")
      .eq("user_id", user.id)
      .maybeSingle();

    setupCompleted = settingsRow?.setup_completed === true;
  }

  if (isRouteMatch(pathname, SETUP_REQUIRED_PREFIXES) && planRow && !setupCompleted) {
    return redirect(request, "/setup");
  }

  if (pathname === "/setup" && planRow && setupCompleted) {
    return redirect(request, "/dashboard");
  }

  if (isAuthRoute(pathname) && planRow) {
    return redirect(request, setupCompleted ? "/dashboard" : "/setup");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$|api/stripe/webhook).*)",
  ],
};
