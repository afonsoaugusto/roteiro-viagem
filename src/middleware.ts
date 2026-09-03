import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "roteiro_session";

function isValid(token: string | undefined) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  const [value, signature] = token.split(".");
  if (!value || !signature) return false;
  const expected = createHmac("sha256", secret).update(value).digest("base64url");
  try {
    return (
      value === "ok" &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon.svg"
  ) {
    return NextResponse.next();
  }

  if (!isValid(request.cookies.get(COOKIE)?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
