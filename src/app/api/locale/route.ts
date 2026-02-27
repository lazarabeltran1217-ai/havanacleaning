import { NextRequest, NextResponse } from "next/server";
import { LOCALES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale");

  if (!locale || !LOCALES.includes(locale as (typeof LOCALES)[number])) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect back to the referring page, or homepage
  const referer = req.headers.get("referer");
  let redirectUrl: URL;

  if (referer) {
    redirectUrl = new URL(referer);
    // Remove any existing locale query param from the referer
    redirectUrl.searchParams.delete("locale");
  } else {
    redirectUrl = new URL("/", req.url);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}
