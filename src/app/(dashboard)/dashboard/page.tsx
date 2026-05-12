import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, Wallet, BellRing } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import OccupancyChart from "@/components/dashboard/occupancy-chart"
import MassBillingButton from "@/components/dashboard/mass-billing-button"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user || session.user.role === "student") {
        redirect("/profile")
    }

    const [
        capacityResult,
        occupiedCount,
        repairRoomsCount,
        requestsCount,
        totalDebtResult,
        latestRequests,
        studentsWithDebts
    ] = await Promise.all([
        db.room.aggregate({ _sum: { capacity: true } }),
        db.placement.count({ where: { isCurrent: true } }),
        db.room.count({ where: { status: 'repair' } }),
        db.maintenanceRequest.count({ where: { status: 'new' } }),
        db.payment.aggregate({
            where: { status: 'debt' },
            _sum: { amount: true }
        }),
        db.maintenanceRequest.findMany({
            where: { status: 'new' },
            orderBy: { createdAt: 'desc' },
            take: 4,
            include: { student: true, room: true }
        }),
        db.student.findMany({
            where: { payments: { some: { status: 'debt' } } },
            include: { payments: { where: { status: 'debt' } } }
        })
    ])

    const totalCapacity = capacityResult._sum.capacity || 0
    const freeSpots = Math.max(0, totalCapacity - occupiedCount)
    const totalDebt = Number(totalDebtResult._sum.amount || 0)

    const topDebtors = studentsWithDebts
        .map(student => {
            const debtSum = student.payments.reduce((sum, p) => sum + Number(p.amount), 0)
            return { ...student, totalDebt: debtSum }
        })
        .sort((a, b) => b.totalDebt - a.totalDebt)
        .slice(0, 5)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Головна панель</h1>
                <p className="text-muted-foreground">Загальна статистика та управління гуртожитком.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Заселеність</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupiedCount} / {totalCapacity}</div>
                        <p className="text-xs text-muted-foreground">Зайнятих місць</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Кімнати в ремонті</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{repairRoomsCount}</div>
                        <p className="text-xs text-muted-foreground">Недоступні для поселення</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Фінанси (Борги)</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalDebt.toLocaleString()} ₴</div>
                        <p className="text-xs text-muted-foreground">Загальна сума несплат</p>
                        <MassBillingButton />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Нові заявки</CardTitle>
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{requestsCount}</div>
                        <p className="text-xs text-muted-foreground">Очікують розгляду</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Статистика місць</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <OccupancyChart occupied={occupiedCount} free={freeSpots} />
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-4 flex flex-col">
                    <CardHeader>
                        <CardTitle>Топ боржників</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4">
                            {topDebtors.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">Боржників не знайдено.</div>
                            ) : (
                                topDebtors.map(student => (
                                    <div key={student.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <Link href={`/students/${student.id}`} className="text-sm font-medium hover:underline hover:text-blue-600">
                                                {student.lastName} {student.firstName}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">{student.groupName}</span>
                                        </div>
                                        <Badge variant="destructive" className="font-bold">
                                            {student.totalDebt.toLocaleString()} ₴
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Останні заявки</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {latestRequests.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">Немає нових заявок.</div>
                        ) : (
                            latestRequests.map(req => (
                                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h4 className="text-sm font-semibold">{req.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
                                        <div className="flex gap-2 mt-1">
                                            {req.isAnonymous ? (
                                                <span className="text-xs font-medium italic">Анонімно</span>
                                            ) : (
                                                <Link href={`/students/${req.student.id}`} className="text-xs font-medium hover:underline text-blue-600">
                                                    {req.student.lastName} {req.student.firstName}
                                                </Link>
                                            )}
                                            {req.room && <span className="text-xs text-muted-foreground">| Кімната {req.room.number}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        {req.category === "COMPLAINT" && <Badge variant="destructive" className="text-[10px]">Скарга</Badge>}
                                        {req.category === "MAINTENANCE" && <Badge variant="outline" className="text-[10px]">Ремонт</Badge>}
                                        {req.category === "SUGGESTION" && <Badge className="bg-purple-100 text-purple-800 border-none text-[10px]">Побажання</Badge>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}