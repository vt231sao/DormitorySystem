import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950">
            <aside className="w-full md:w-64 border-r bg-white dark:bg-zinc-900 p-6">
                <div className="mb-8 flex items-center justify-center md:justify-start">
                    <h2 className="text-xl font-bold text-blue-600">Гуртожиток Плюс</h2>
                </div>
                <nav className="flex flex-col space-y-2">
                    <Button variant="ghost" className="justify-start w-full" asChild>
                        <Link href="/">Головна</Link>
                    </Button>
                    <Button variant="secondary" className="justify-start w-full" asChild>
                        <Link href="/students">Студенти</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start w-full" asChild>
                        <Link href="/rooms">Кімнати</Link>
                    </Button>
                </nav>
            </aside>

            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}