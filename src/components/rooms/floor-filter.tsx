"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface FloorFilterProps {
    totalFloors?: number;
}

export default function FloorFilter({ totalFloors = 5 }: FloorFilterProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const currentFloor = Number(searchParams.get("floor")) || 1

    const handleFloorChange = (floor: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("floor", floor.toString())
        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Поверх:</span>
            {Array.from({ length: totalFloors }, (_, i) => i + 1).map((floor) => (
                <Button
                    key={floor}
                    variant={currentFloor === floor ? "default" : "outline"}
                    onClick={() => handleFloorChange(floor)}
                    className="min-w-10"
                >
                    {floor}
                </Button>
            ))}
        </div>
    )
}