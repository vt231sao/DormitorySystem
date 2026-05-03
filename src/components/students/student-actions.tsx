"use client"

import { useState } from "react"
import { deleteStudent, updateStudent } from "@/actions/student"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Student } from "@prisma/client"

interface StudentActionsProps {
    student: Student;
}

export default function StudentActions({ student }: StudentActionsProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function onEditSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");
        const result = await updateStudent(student.id, formData);
        setIsLoading(false);

        if (result?.error) {
            setError(result.error);
        } else {
            setIsEditDialogOpen(false);
        }
    }

    async function onDelete() {
        const result = await deleteStudent(student.id);
        if (result?.error) {
            alert(result.error);
        }
    }

    return (
        <div className="flex justify-end gap-2">
            {/* Кнопка та Модалка РЕДАГУВАННЯ */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-blue-600">
                        Ред.
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Редагування мешканця</DialogTitle>
                    </DialogHeader>
                    <form action={onEditSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Прізвище *</Label>
                                <Input id="lastName" name="lastName" defaultValue={student.lastName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Ім`я *</Label>
                                <Input id="firstName" name="firstName" defaultValue={student.firstName} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="patronymic">По батькові</Label>
                            <Input id="patronymic" name="patronymic" defaultValue={student.patronymic || ""} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="groupName">Група *</Label>
                                <Input id="groupName" name="groupName" defaultValue={student.groupName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Стать *</Label>
                                <Select name="gender" defaultValue={student.gender} required>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Чоловіча</SelectItem>
                                        <SelectItem value="F">Жіноча</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input id="phone" name="phone" defaultValue={student.phone || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label>Email (Не редагується)</Label>
                            <Input value={student.email || ""} disabled className="bg-zinc-100" />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Оновлення..." : "Зберегти зміни"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Кнопка та Алерт ВИДАЛЕННЯ */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        Вид.
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ви абсолютно впевнені?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Це незворотна дія. Вона назавжди видалить студента
                            <span className="font-semibold text-black dark:text-white"> {student.lastName} {student.firstName} </span>
                            з бази даних, а також його обліковий запис для входу.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Скасувати</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                            Так, видалити
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}