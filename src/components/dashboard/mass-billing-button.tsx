"use client"

import { useState } from "react"
import { massAccrueDebt } from "@/actions/finance"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Receipt } from "lucide-react"

export default function MassBillingButton() {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleBilling = async () => {
        setIsLoading(true)
        const result = await massAccrueDebt()
        setIsLoading(false)

        if (result.error) {
            alert(result.error)
        } else {
            setOpen(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full mt-4 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200">
                    <Receipt className="w-4 h-4 mr-2" />
                    Нарахувати плату
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Масове нарахування плати</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ви збираєтесь автоматично нарахувати борг за проживання (1500 грн) всім студентам, які наразі мають статус активного поселення. Цю дію неможливо скасувати автоматично.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Скасувати</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBilling} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? "Нарахування..." : "Підтвердити нарахування"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}