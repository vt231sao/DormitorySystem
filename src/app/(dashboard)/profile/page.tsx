import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function ProfileRouterPage() {
    const session = await auth();

    if (!session?.user?.email) redirect("/auth/login");

    if (session.user.role === "student") {
        const student = await db.student.findUnique({
            where: { email: session.user.email }
        });

        if (student) {
            redirect(`/students/${student.id}`);
        } else {
            return <div>Профіль студента не знайдено. Зверніться до коменданта.</div>;
        }
    }

    redirect("/students");
}