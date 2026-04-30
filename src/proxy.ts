import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user;
    const pathname = req.nextUrl.pathname;

    console.log(`[PROXY] Маршрут: ${pathname} | Авторизований: ${isLoggedIn}`);

    const isPublicRoute = pathname.startsWith("/auth") || pathname.startsWith("/api/auth");
    const isSetupPasswordRoute = pathname === "/auth/setup-password";

    if (!isLoggedIn && !isPublicRoute) {
        console.log(`[PROXY ACTION] Блокування доступу. Редірект на логін.`);
        return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }

    if (isLoggedIn) {
        if (!user?.hasPassword && !isSetupPasswordRoute && !pathname.startsWith("/api")) {
            console.log(`[PROXY ACTION] Пароль відсутній. Редірект на створення пароля.`);
            return NextResponse.redirect(new URL("/auth/setup-password", req.nextUrl));
        }

        if (isPublicRoute && user?.hasPassword) {
            console.log(`[PROXY ACTION] Вже в системі. Редірект в панель керування.`);
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};