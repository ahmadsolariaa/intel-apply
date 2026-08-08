import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import {jwtVerify} from "jose";

const COOKIE = "ia_session";
const PUBLIC = ["/login"];

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  let ok = false;

  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = true;
    } catch {
      ok = false;
    }
  }

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!ok && !isPublic && !pathname.startsWith("/api/auth/login")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (ok && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/applications";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)"],
};
