"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function StudentFilter() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("query", term)
        } else {
            params.delete("query")
        }
        replace(`${pathname}?${params.toString()}`, {scroll: false})
    }, 300)
    const handlePaymentFilter = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "all"){
            params.set("payment", value)
        }
        else{
            params.delete("payment")
        }
        replace(`${pathname}?${params.toString()}`, {scroll: false})
    }
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                    type="search"
                    placeholder="Пошук за ПІБ чи групою..."
                    className="pl-8"
                    defaultValue={searchParams.get("query")?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <Select
                defaultValue={searchParams.get("payment")?.toString() || "all"}
                onValueChange={handlePaymentFilter}
            >
                <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Статус оплати" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Всі статуси</SelectItem>
                    <SelectItem value="paid">Оплачено</SelectItem>
                    <SelectItem value="debt">Боржники</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}