// app/admin/dashboard/page.tsx (or wherever your dashboard page is)

"use client";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Package, CircleDollarSign, Loader2, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchDashboardData } from "@/lib/redux/slices/dashboardSlice";
import { SalesChart } from "@/components/admin/SalesChart";
import { RecentOrders } from "@/components/admin/RecentOrders";

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading, error } = useSelector((state: RootState) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    if (loading) {
        return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-red-600">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Failed to load dashboard data</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="">
            <h1 className=" mb-8 text-3xl font-bold">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    title="Total Sales" 
                    value={`₹${stats.totalSales.toLocaleString()}`} 
                    icon={CircleDollarSign} 
                />
                <StatCard 
                    title="Active Users" 
                    value={stats.activeUsers} 
                    icon={Users} 
                />
                <StatCard 
                    title="New Orders" 
                    value={stats.newOrders} 
                    icon={Package} 
                />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
                <div className="col-span-12 lg:col-span-4">
                    <SalesChart />
                </div>
                <div className="col-span-12 lg:col-span-3">
                    <RecentOrders />
                </div>
            </div>
        </div>
    );
}