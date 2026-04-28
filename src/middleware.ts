import { auth } from './auth';
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user;
    const { pathname } = req.nextUrl;

    const isPublicRoute = pathname.startsWith("/auth") || pathname.startsWith("/api/auth");

    const isSetupPasswordRoute = pathname === "/auth/setup-password"

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    if (isLoggedIn) {
        if (!user?.hasPassword && !isSetupPasswordRoute && !pathname.startsWith("/api")) {
            return NextResponse.redirect(new URL("/auth/setup-password", req.nextUrl));
        }

        if (isPublicRoute && user?.hasPassword) {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}