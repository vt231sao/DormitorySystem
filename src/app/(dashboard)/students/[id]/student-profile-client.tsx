"use client"

import { useTransition } from "react"
import { updateStudent } from "@/actions/student"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface PaymentData {
    id: string;
    billingPeriod: string;
    amount: number | string;
    status: string;
}

export interface PlacementData {
    id: string;
    isCurrent: boolean;
    room: {
        number: string;
        floor: number;
    } | null;
}

export interface DocumentData {
    id: string;
    documentType: string;
    filePath: string;
}

export interface StudentProfileData {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    groupName: string;
    email: string | null;
    phone: string | null;
    photoUrl: string | null;
    placements: PlacementData[];
    payments: PaymentData[];
    documents: DocumentData[];
}

interface ProfileClientProps {
    student: StudentProfileData;
    canEditEverything: boolean;
}

export default function StudentProfileClient({ student, canEditEverything }: ProfileClientProps) {
    const [isPending, startTransition] = useTransition()

    const currentPlacement = student.placements.find((p) => p.isCurrent)
    const currentRoom = currentPlacement?.room
    const historyPlacements = student.placements.filter((p) => !p.isCurrent)
    const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`

    async function handleSave(formData: FormData) {
        startTransition(async () => {
            const res = await updateStudent(student.id, formData)
            if (res?.error) alert(res.error)
        })
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
                <div className="relative group cursor-pointer">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Avatar className="w-24 h-24 border-2 border-zinc-100 group-hover:opacity-80 transition-opacity">
                            <AvatarImage src={student.photoUrl || ""} alt="Avatar" />
                            <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            Змінити
                        </div>
                    </Label>
                    <Input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{student.lastName} {student.firstName} {student.patronymic || ""}</h2>
                    <p className="text-muted-foreground">{student.groupName} | {student.email}</p>
                </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="personal">Особисті дані</TabsTrigger>
                    <TabsTrigger value="living">Проживання</TabsTrigger>
                    <TabsTrigger value="finance">Фінанси</TabsTrigger>
                    <TabsTrigger value="documents">Документи</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Контактна інформація</CardTitle>
                            <CardDescription>Дані для зв`язку з мешканцем.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form action={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Прізвище</Label>
                                        <Input name="lastName" defaultValue={student.lastName} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ім`я</Label>
                                        <Input name="firstName" defaultValue={student.firstName} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Академічна група</Label>
                                        <Input name="groupName" defaultValue={student.groupName} disabled={!canEditEverything} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email (Логін)</Label>
                                        <Input name="email" defaultValue={student.email || ""} disabled={!canEditEverything} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Номер телефону</Label>
                                        <Input name="phone" defaultValue={student.phone || ""} />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Збереження..." : "Зберегти зміни"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="living">
                    <Card>
                        <CardHeader>
                            <CardTitle>Проживання</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-8">
                                <h4 className="font-semibold mb-4">Поточне місце</h4>
                                {currentRoom ? (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="text-2xl font-bold">Кімната {currentRoom.number}</p>
                                            <p className="text-sm text-muted-foreground">Поверх: {currentRoom.floor}</p>
                                        </div>
                                        <Badge className="bg-green-600 hover:bg-green-700">Активно</Badge>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">Студента наразі не поселено.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Історія поселень</h4>
                                {historyPlacements.length > 0 ? (
                                    <ul className="space-y-2">
                                        {historyPlacements.map(placement => (
                                            <li key={placement.id} className="p-3 border rounded-md text-sm flex justify-between items-center">
                                                <span>Кімната {placement.room?.number || "Невідомо"}</span>
                                                <Badge variant="secondary">Архів</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Історія поселень відсутня.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finance">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Стан рахунку</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {student.payments.length > 0 ? (
                                    <ul className="space-y-3">
                                        {student.payments.map((payment) => (
                                            <li key={payment.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 gap-2">
                                                <div>
                                                    <span className="font-medium block">{payment.billingPeriod}</span>
                                                    <span className="font-bold text-lg">{payment.amount.toString()} грн</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={payment.status === 'debt' ? "destructive" : "default"}>
                                                        {payment.status === 'debt' ? "Борг" : "Сплачено"}
                                                    </Badge>
                                                    {payment.status === 'debt' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={async () => {
                                                                startTransition(async () => {
                                                                    const { payDebt } = await import("@/actions/payment")
                                                                    const res = await payDebt(payment.id)
                                                                    if (res?.error) alert(res.error)
                                                                })
                                                            }}
                                                            disabled={isPending}
                                                        >
                                                            Оплатити
                                                        </Button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground">Немає фінансових записів.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Документи</CardTitle>
                            <CardDescription>Скан-копії та довідки.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {student.documents?.length > 0 ? (
                                <ul className="space-y-2 mb-4">
                                    {student.documents.map(doc => (
                                        <li key={doc.id} className="flex justify-between items-center p-3 border rounded-md">
                                            <span className="font-medium">{doc.documentType}</span>
                                            <Button variant="outline" size="sm">Завантажити</Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground mb-4">Документів ще не завантажено.</p>
                            )}
                            <Label htmlFor="doc-upload" className="cursor-pointer w-full md:w-auto inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90">
                                Завантажити новий документ
                            </Label>
                            <Input id="doc-upload" type="file" className="hidden" />
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}