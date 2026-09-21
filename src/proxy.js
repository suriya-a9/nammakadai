import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Admin routes use their own JWT session. The secure admin layout performs
  // full signature + database validation; this gives unauthenticated visitors
  // an immediate redirect before rendering protected admin pages.
  if (pathname.startsWith("/admin")) {
    const isPublicAdminRoute =
      pathname === "/admin/login" || pathname === "/admin/setup";
    if (!isPublicAdminRoute && !request.cookies.has("admin_token")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Skip static / internal requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // This lightweight guard checks for a customer session cookie. The checkout page
  // and every customer/order API validate its JWT signature and database identity.
  const customerToken = request.cookies.get("customer_session")?.value;
  const protectedRoutes = ["/account/dashboard", "/account/order", "/account/notification", "/account/addresses"];
  if (!customerToken && (protectedRoutes.some(route => pathname === route || pathname.startsWith(route + "/")))) {
    const next = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/auth/login?next=${next}`, request.url));
  }
  if (!customerToken && pathname === "/checkout") {
    return NextResponse.redirect(new URL("/auth/login?next=%2Fcheckout", request.url));
  }
  // Other storefront routes including cart remain public.

  if (request.headers.get("x-redirected")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|images|fonts).*)",
  ],
};
