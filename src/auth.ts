import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt"},
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/error",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    Credentials({
        credentials: {
            email: {label: "Email", type: "email"},
            password: {label: "Password", type: "password"}
        },
        async authorize(credentials){
            if (!credentials.email || !credentials.password) {
                return null
            }
            const user = await db.user.findUnique({
                where: { email : credentials.email as string },
            })
            if (!user || !user.passwordHash){
                return null;
            }
            const passwordMatch = await bcrypt.compare(
                credentials.password as string,
                user.passwordHash
            );
            if (passwordMatch) {
                return user;
            }
            return null;
        }
    })
    ],
    callbacks: {
        async signIn({user, account}){
            if (account?.provider === "google"){
                const existingUser = await db.user.findUnique({
                    where: { email: user.email as string },
                });
                if (!existingUser){
                    return "/auth/error?error=AccessDenied";
                }
            }
            return true;
        },
        async jwt({ token, user}){
            if (user){
                token.id = user.id;
            }
            if (token.email){
               const dbUser = await db.user.findUnique({
                   where: { email: token.email as string },
               });
               if (dbUser){
                   token.role = dbUser.role;
                   token.hasPassword = !!dbUser.passwordHash;
               }
            }
            return token;
        },
        async session({ session, token}){
            if (token && session.user){
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.hasPassword = token.hasPassword as boolean;
            }
            return session;
        }
    }
})