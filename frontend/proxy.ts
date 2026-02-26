import { apiError } from "@backend/api-response";
import { getAccessStatus } from "@backend/billing/access";
import { SESSION_COOKIE_NAME } from "@backend/auth/constants";
import { verifySessionToken } from "@backend/auth/session";
import { NextRequest, NextResponse } from "next/server";

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isApiPath(pathname)) {
      return NextResponse.json(apiError("Connexion requise."), { status: 401 });
    }

    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifySessionToken(token);
    const access = getAccessStatus(payload);

    if (!access.hasAccess) {
      if (isApiPath(pathname)) {
        return NextResponse.json(
          apiError("Essai expiré. Abonne-toi pour continuer à utiliser les outils."),
          { status: 402 }
        );
      }

      return NextResponse.redirect(new URL("/tarifs", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isApiPath(pathname)) {
      return NextResponse.json(apiError("Session invalide."), { status: 401 });
    }

    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/tools/:path*", "/api/tools/:path*"],
};
