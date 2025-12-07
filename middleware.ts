import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const pathname = req.nextUrl.pathname;

    // Protect all user dashboard pages
    if (!token && pathname.startsWith("/dashboard/user")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect admin pages
    if (!token && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect test pages
    if (!token && pathname.startsWith("/test")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/user/:path*",
        "/admin/:path*",
        "/test/:path*",
    ],
};
