import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db),
    providers: [
        ...authConfig.providers,
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user || !user.passwordHash) return null;

                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (passwordsMatch) {
                    return { ...user, hasPassword: true };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const existingUser = await db.user.findUnique({
                    where: { email: user.email as string }
                });

                if (!existingUser) return "/auth/error?error=AccessDenied";
            }
            return true;
        },

        async jwt({ token, user, trigger }) {
            if (user || trigger === "signIn") {
                if (token.email) {
                    const dbUser = await db.user.findUnique({ where: { email: token.email } });
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                        token.hasPassword = !!dbUser.passwordHash;
                    }
                }
            }
            return token;
        },
        session: authConfig.callbacks?.session,
    }
})