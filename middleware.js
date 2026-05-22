import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = [
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/reset-password",
  "/nueva-contrasena",
  "/terminos-y-condiciones",
  "/",
];

const PROTECTED_PREFIXES = ["/adoptante", "/albergue", "/admin"];

/**
 * Decodifica el payload de un JWT sin verificar firma.
 * @param {string} token
 * @returns {object|null}
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Permitir assets estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Si es ruta pública, permitir
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Verificar si la ruta necesita protección
  const needsProtection = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!needsProtection) {
    return NextResponse.next();
  }

  // Leer token desde la cookie
  const accessToken = request.cookies.get("accessToken")?.value || request.cookies.get("furmatch.access_token")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── VALIDACIÓN CRIPTOGRÁFICA DE JWT ──
  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'furmatch_dev_secret_key_2026');
    const { payload: verifiedPayload } = await jwtVerify(accessToken, secret);
    payload = verifiedPayload;
  } catch (err) {
    console.warn("[middleware] JWT Verification failed:", err.message);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("furmatch.access_token");
    return response;
  }

  // ── VALIDACIÓN DE ROL ──
  const userRole = payload?.role?.toLowerCase();
  const userEstadoCuenta = payload?.estado_cuenta;

  const roleByPrefix = {
    "/adoptante": "adoptante",
    "/albergue": "albergue",
    "/admin": "admin",
  };

  const requiredRole = PROTECTED_PREFIXES.find((prefix) =>
    pathname.startsWith(prefix)
  )
    ? roleByPrefix[
        PROTECTED_PREFIXES.find((prefix) => pathname.startsWith(prefix))
      ]
    : null;

  if (requiredRole && userRole !== requiredRole) {
    // Redirigir al dashboard correspondiente según el rol
    const redirectPath =
      userRole === "adoptante"      ? "/adoptante/feed"
    : userRole === "albergue"       ? "/albergue/mascotas"
    : userRole === "admin"          ? "/admin/tags"
    : "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // ── VALIDACIÓN DE PERFIL COMPLETO ──
  // Si el perfil está incompleto y NO está yendo al onboarding, redirigir
  if (
    userEstadoCuenta === "perfil_incompleto" &&
    !pathname.includes("/onboarding") &&
    requiredRole
  ) {
    const onboardingPath =
      userRole === "adoptante"
        ? "/adoptante/onboarding"
        : userRole === "albergue"
        ? "/albergue/onboarding"
        : null;

    if (onboardingPath) {
      return NextResponse.redirect(new URL(onboardingPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - public images
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
