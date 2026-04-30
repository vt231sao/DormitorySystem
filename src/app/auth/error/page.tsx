"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <Card className="shadow-lg border-red-500/20">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-red-600">Доступ заборонено</CardTitle>
                <CardDescription className="text-base mt-2">
                    {error === "AccessDenied"
                        ? "Ваша пошта не зареєстрована в системі комендантів. Будь ласка, зверніться до адміністратора гуртожитку для надання доступу."
                        : "Виникла невідома помилка під час авторизації."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-4">
                <Button asChild variant="outline">
                    <Link href="/auth/login">Повернутися до входу</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<p className="text-center">Завантаження...</p>}>
            <ErrorContent />
        </Suspense>
    );
}