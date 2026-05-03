"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchAllGrievances, updateGrievance, Grievance } from '@/lib/redux/slices/grievanceSlice';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

// A utility function to format dates nicely
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// A helper function to get badge color based on status
const getStatusVariant = (status: Grievance['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case 'Pending': return 'default'; // Blue/Default
        case 'In Progress': return 'secondary'; // Grey
        case 'Resolved': return 'outline'; // Green (using outline as a proxy)
        case 'Closed': return 'secondary';
        case 'Rejected': return 'destructive'; // Red
        default: return 'default';
    }
};

export default function AdminGrievancesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { grievances, status, error } = useSelector((state: RootState) => state.grievance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  
  // State for the update form inside the modal
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState<Grievance['status']>('Pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all grievances when the component mounts
  useEffect(() => {
    dispatch(fetchAllGrievances());
  }, [dispatch]);

  // Handler to open the modal and populate it with grievance data
  const handleViewDetails = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setAdminResponse(grievance.adminResponse || '');
    setNewStatus(grievance.status);
    setIsModalOpen(true);
  };

  // Handler to submit the update
  const handleUpdateGrievance = async () => {
    if (!selectedGrievance) return;
    setIsUpdating(true);

    try {
      await dispatch(updateGrievance({
        id: selectedGrievance._id,
        status: newStatus,
        adminResponse: adminResponse,
      })).unwrap();
      
      toast.success("Grievance Updated", {
        description: `Ticket ${selectedGrievance.ticketId} has been successfully updated.`,
      });

      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      toast.error("Update Failed", {
        description: String(err),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Failed to load grievances: {error}</p>
        </div>
      );
    }
    
    if (grievances.length === 0) {
        return (
            <div className="text-center py-16">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Grievances Found</h3>
                <p className="mt-1 text-sm text-gray-500">There are currently no grievances submitted by users.</p>
            </div>
        )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grievances.map((g) => (
            <TableRow key={g._id}>
              <TableCell className="font-medium">{g.ticketId}</TableCell>
              <TableCell>{formatDate(g.createdAt)}</TableCell>
              <TableCell>
                  <div className="font-medium">{g.fullName}</div>
                  <div className="text-sm text-muted-foreground">{g.email}</div>
              </TableCell>
              <TableCell>{g.natureOfGrievance}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(g.status)}>{g.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(g)}>
                  View / Update
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grievance Management</CardTitle>
          <CardDescription>
            View, manage, and respond to all user-submitted grievances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* --- Update Grievance Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grievance Details: {selectedGrievance?.ticketId}</DialogTitle>
            <DialogDescription>
              Review the user's complaint and provide an update or response.
            </DialogDescription>
          </DialogHeader>
          {selectedGrievance && (
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-4">
                <Label>User</Label>
                <div className="col-span-2">
                    <p className="font-semibold">{selectedGrievance.fullName}</p>
                    <p className="text-sm text-gray-500">{selectedGrievance.email}</p>
                    {selectedGrievance.phoneNumber && <p className="text-sm text-gray-500">{selectedGrievance.phoneNumber}</p>}
                </div>
              </div>

               <div className="grid grid-cols-3 items-center gap-4 border-b pb-4">
                 <Label>Order ID</Label>
                 <p className="col-span-2 font-mono text-sm">{selectedGrievance.orderId || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-3 items-start gap-4 border-b pb-4">
                <Label>Description</Label>
                <p className="col-span-2 text-sm bg-gray-50 p-3 rounded-md border">{selectedGrievance.description}</p>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={(value: Grievance['status']) => setNewStatus(value)}>
                    <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 items-start gap-4">
                <Label htmlFor="response">Admin Response</Label>
                <Textarea
                  id="response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Provide a detailed response to the user here..."
                  className="col-span-2 min-h-[120px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateGrievance} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}