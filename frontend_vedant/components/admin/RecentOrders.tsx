"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
export function RecentOrders() {
const { recentOrders } = useSelector((state: RootState) => state.dashboard);
return (
<Card>
<CardHeader>
<CardTitle>Recent Orders</CardTitle>
</CardHeader>
<CardContent>
<div className="space-y-6">
{recentOrders.map((order) => (
<div key={order._id} className="flex items-center">
<Avatar className="h-9 w-9">
<AvatarFallback>{order.user.fullName.charAt(0)}</AvatarFallback>
</Avatar>
<div className="ml-4 space-y-1">
<p className="text-sm font-medium leading-none">{order.user.fullName}</p>
</div>
<div className="ml-auto font-medium">
+₹{order.totalPrice.toLocaleString()}
</div>
</div>
))}
</div>
</CardContent>
</Card>
);
}