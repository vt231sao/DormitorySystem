"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { signOut } from "@/auth";

export async function loginWithGoogle() {
    await signIn("google", {redirectTo: "/dashboard"});
}

export async function loginWithCredentials(prevState: string | undefined, formData: FormData) {
    try {
        await signIn("credentials", Object.fromEntries(formData));
    }
    catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Невірна пошта або пароль";
                default:
                    return "Щось пішло не так";
            }
        }
        throw error;
    }
}

export async function setupNewPassword(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return "Не знайдено активної сесії"
    }

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if(!password || password.length < 6) {
        return "Пароль має містити мінімум 6 символів";
    }
    if (password !== confirmPassword) {
        return "Паролі не співпадають";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: {email: session.user.email},
        data: {passwordHash: hashedPassword},
    });

    await signOut({ redirectTo: "/auth/login" })
}





