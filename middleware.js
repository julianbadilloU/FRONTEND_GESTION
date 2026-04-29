import { NextResponse } from "next/server";

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

export function middleware(request) {
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
  const accessToken = request.cookies.get("furmatch.access_token")?.value;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
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
