import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { Home, Users, DoorOpen, Wrench, User } from "lucide-react";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const isStudent = session?.user?.role === "student";

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950">
            <aside className="w-full md:w-64 border-r bg-white dark:bg-zinc-900 p-6 flex flex-col">
                <div className="mb-8 flex items-center justify-center md:justify-start">
                    <h2 className="text-xl font-bold text-blue-600">Гуртожиток Плюс</h2>
                </div>

                <nav className="flex flex-col space-y-2 flex-1">
                    {/* НАВІГАЦІЯ ДЛЯ СТУДЕНТА */}
                    {isStudent && (
                        <>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/profile"><User className="mr-2 h-4 w-4" /> Мій профіль</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/requests"><Wrench className="mr-2 h-4 w-4" /> Мої заявки</Link>
                            </Button>
                        </>
                    )}

                    {/* НАВІГАЦІЯ ДЛЯ КОМЕНДАНТА / АДМІНА */}
                    {!isStudent && (
                        <>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/dashboard"><Home className="mr-2 h-4 w-4" /> Головна</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/students"><Users className="mr-2 h-4 w-4" /> Студенти</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/rooms"><DoorOpen className="mr-2 h-4 w-4" /> Кімнати</Link>
                            </Button>
                            <Button variant="ghost" className="justify-start w-full" asChild>
                                <Link href="/requests"><Wrench className="mr-2 h-4 w-4" /> Заявки на ремонт</Link>
                            </Button>
                        </>
                    )}
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}