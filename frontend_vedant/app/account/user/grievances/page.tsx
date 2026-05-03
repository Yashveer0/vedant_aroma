// app/account/user/grievances/page.tsx

"use client";

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchMyGrievances, Grievance } from '@/lib/redux/slices/grievanceSlice';
import Link from 'next/link';

// --- UI Components & Icons ---
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, ChevronDown, FileText, Loader2 } from 'lucide-react';

// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get badge color based on status
const getStatusVariant = (status: Grievance['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case 'Pending': return 'default';
        case 'In Progress': return 'secondary';
        case 'Resolved': return 'outline';
        case 'Closed': return 'secondary';
        case 'Rejected': return 'destructive';
        default: return 'default';
    }
};


export default function MyGrievancesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { grievances, status, error } = useSelector((state: RootState) => state.grievance);

    useEffect(() => {
        dispatch(fetchMyGrievances());
    }, [dispatch]);

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            );
        }

        if (status === 'failed') {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-red-600">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Failed to load your grievances: {error}</p>
                </div>
            );
        }

        if (grievances.length === 0) {
            return (
                <div className="text-center py-16">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No Grievances Found</h3>
                    <p className="mt-1 text-sm text-gray-500">You have not submitted any grievances yet.</p>
                    <Button asChild className="mt-6">
                        <Link href="/corporate-info/grievance-cell">Submit a Grievance</Link>
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {grievances.map((g) => (
                    <Collapsible key={g._id} className="rounded-lg border">
                        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50">
                            <div className="text-left">
                                <p className="font-mono text-sm text-gray-500">Ticket ID: {g.ticketId}</p>
                                <p className="font-semibold">{g.natureOfGrievance}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={getStatusVariant(g.status)}>{g.status}</Badge>
                                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-6 border-t bg-gray-50">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Your Complaint:</h4>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{g.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">Submitted on {formatDate(g.createdAt)}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Admin Response:</h4>
                                    {g.adminResponse ? (
                                        <p className="text-gray-800 text-sm bg-blue-50 p-3 rounded-md border border-blue-200 whitespace-pre-wrap">{g.adminResponse}</p>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No response from admin yet.</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">Last Updated on {formatDate(g.updatedAt)}</p>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
                <Card>
                    <CardHeader>
                        <CardTitle>My Grievances</CardTitle>
                        <CardDescription>
                            Here you can track the status of all your submitted complaints and view responses from our team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderContent()}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}