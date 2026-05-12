"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface OccupancyChartProps {
    occupied: number
    free: number
}

export default function OccupancyChart({ occupied, free }: OccupancyChartProps) {
    const data = [
        { name: "Зайнято", value: occupied },
        { name: "Вільно", value: free }
    ]

    const COLORS = ["#2563eb", "#e4e4e7"]

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: unknown) => [`${String(value || 0)} місць`, ""]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}