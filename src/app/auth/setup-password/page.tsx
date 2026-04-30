"use client"

import { useActionState } from "react"
import { setupNewPassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupPasswordPage() {
    const [errorMessage, dispatch] = useActionState(setupNewPassword, undefined);

    return (
        <Card className="shadow-lg border-blue-500/20">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Завершення реєстрації</CardTitle>
                <CardDescription>
                    Схоже, ви входите вперше. Будь ласка, створіть надійний пароль для альтернативного входу.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Новий пароль</Label>
                        <Input id="password" name="password" type="password" placeholder="Мінімум 6 символів" required minLength={6} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                    </div>

                    {errorMessage && (
                        <div className="text-sm font-medium text-red-500 text-center">
                            {errorMessage}
                        </div>
                    )}

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit">
                        Зберегти пароль та увійти
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}