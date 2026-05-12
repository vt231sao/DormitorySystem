"use client"

import { useState } from "react"
import { createRequest } from "@/actions/request"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export default function CreateRequestDialog() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        setError("");

        const result = await createRequest(formData);

        setIsLoading(false);

        if (result?.error) {
            setError(result.error);
        } else {
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    + Створити заявку
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Нове звернення</DialogTitle>
                    <DialogDescription>
                        Опишіть вашу проблему або пропозицію. Адміністрація розгляне її найближчим часом.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Короткий заголовок *</Label>
                        <Input id="title" name="title" placeholder="Наприклад: Зламався кран у ванній" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Категорія *</Label>
                            <Select name="category" required defaultValue="MAINTENANCE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MAINTENANCE">Ремонт</SelectItem>
                                    <SelectItem value="COMPLAINT">Скарга</SelectItem>
                                    <SelectItem value="SUGGESTION">Побажання</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Пріоритет *</Label>
                            <Select name="priority" required defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue placeholder="Оберіть" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Низький</SelectItem>
                                    <SelectItem value="medium">Середній</SelectItem>
                                    <SelectItem value="high">Високий</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Детальний опис *</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Опишіть ситуацію детальніше..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="isAnonymous" name="isAnonymous" />
                        <Label htmlFor="isAnonymous" className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Відправити анонімно
                        </Label>
                    </div>

                    {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? "Відправка..." : "Відправити звернення"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}