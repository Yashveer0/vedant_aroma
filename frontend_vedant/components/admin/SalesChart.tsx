"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export function SalesChart() {
    const { salesOverview } = useSelector((state: RootState) => state.dashboard);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Sales Overview (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesOverview}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
}
