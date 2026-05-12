"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Обов'язково встанови: npx shadcn-ui@latest add avatar

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
    const currentPlacement = student.placements.find((p) => p.isCurrent);
    const currentRoom = currentPlacement?.room;

    const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
                <Avatar className="w-24 h-24 border-2 border-zinc-100">
                    <AvatarImage src={student.photoUrl || ""} alt="Avatar" />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-700">{initials}</AvatarFallback>
                </Avatar>
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
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Прізвище</Label>
                                        <Input defaultValue={student.lastName} disabled={!canEditEverything} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ім`я</Label>
                                        <Input defaultValue={student.firstName} disabled={!canEditEverything} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Академічна група</Label>
                                        <Input defaultValue={student.groupName} disabled={!canEditEverything} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email (Логін)</Label>
                                        <Input defaultValue={student.email || ""} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Номер телефону</Label>
                                        <Input defaultValue={student.phone || ""} />
                                    </div>
                                </div>
                                <Button type="button">Зберегти зміни</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="living">
                    <Card>
                        <CardHeader>
                            <CardTitle>Поточне місце проживання</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentRoom ? (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-2xl font-bold">Кімната {currentRoom.number}</p>
                                        <p className="text-sm text-muted-foreground">Поверх: {currentRoom.floor}</p>
                                    </div>
                                    <Badge className="bg-green-600 hover:bg-green-700">Активно</Badge>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">Студента наразі не поселено в жодну кімнату.</p>
                            )}
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
                                            <li key={payment.id} className="flex justify-between items-center border-b pb-2">
                                                <span className="font-medium">{payment.billingPeriod}</span>
                                                <span className="font-bold">{payment.amount.toString()} грн</span>
                                                <Badge variant={payment.status === 'debt' ? "destructive" : "default"}>
                                                    {payment.status === 'debt' ? "Борг" : "Сплачено"}
                                                </Badge>
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
                            <Button className="w-full md:w-auto">Завантажити новий документ</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}