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

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());
  void params;

  const token = request.cookies.get("uat")?.value || "";

  const protectedRoutes = [
    "/account/dashboard",
    "/account/notification",
    "/account/wallet",
    "/account/bank-details",
    "/account/point",
    "/account/refund",
    "/account/order",
    "/account/addresses",
    "/wishlist",
    "/compare",
  ];

  let settingData = null;

  try {
    const response = await fetch(process.env.API_PROD_URL + "/settings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      settingData = await response.json();
    }
  } catch (error) {
    console.error("Settings API Error:", error);
  }

  const path = pathname;

  if (
    settingData?.values?.maintenance?.maintenance_mode &&
    path !== "/maintenance"
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (
    !settingData?.values?.maintenance?.maintenance_mode &&
    path === "/maintenance"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (protectedRoutes.includes(path) && !request.cookies.has("uat")) {
    const response = NextResponse.redirect(
      new URL(request?.cookies?.get("currentPath")?.value || "/", request.url)
    );
    response.cookies.set("showAuthToast", "true", { httpOnly: false });
    return response;
  }

  if (path === "/checkout" && !request.cookies.has("uat")) {
    if (settingData?.values?.activation?.guest_checkout) {
      if (request.cookies.get("cartData") == "digital") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (path === "/auth/login" && request.cookies.has("uat")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (path === "/auth/otp-verification" && !request.cookies.has("ue")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    path === "/auth/update-password" &&
    (!request.cookies.has("uo") || !request.cookies.has("ue"))
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

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
