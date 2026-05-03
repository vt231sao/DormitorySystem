"use client"

import { useState } from "react"
import { addStudent } from "@/actions/student"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddStudentDialog() {
    const [open, setOpen] = useState<boolean>(false)
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const result = await addStudent(formData);

        setIsLoading(false);

        if (result.error) {
            setError(result.error);
        }
        else {
            setOpen(false);
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    + Додати мешканця
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Новий мешканець</DialogTitle>
                    <DialogDescription>
                        Внесіть дані студента для реєстрації в системі гуртожитку.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Прізвище *</Label>
                            <Input id="lastName" name="lastName" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Ім`я *</Label>
                            <Input id="firstName" name="firstName" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="patronymic">По батькові</Label>
                        <Input id="patronymic" name="patronymic" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="groupName">Група *</Label>
                            <Input id="groupName" name="groupName" placeholder="Наприклад: ВТ-23-1" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Стать *</Label>
                            <Select name="gender" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Чоловіча</SelectItem>
                                    <SelectItem value="F">Жіноча</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input id="phone" name="phone" placeholder="+380..." type="tel" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input required id="email" name="email" type="email" />
                        </div>
                    </div>

                    {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Збереження..." : "Зберегти студента"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}