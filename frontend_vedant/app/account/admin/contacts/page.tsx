"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchInquiries, updateInquiry, deleteInquiry } from '@/lib/redux/slices/contactSlice';

// UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit, Eye } from 'lucide-react';

// --- FIX 1: The type definition now matches your backend model and Redux slice exactly ---
interface ContactInquiry {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    message: string;
    status: "New" | "Contacted" | "Completed" | "Rejected";
    createdAt: string;
    updatedAt: string;
}

// =================================================================
// --- VIEW INQUIRY MODAL (Simplified) ---
// =================================================================
function ViewInquiryModal({ isOpen, onClose, inquiry }: { isOpen: boolean, onClose: () => void, inquiry: ContactInquiry | null }) {
  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Inquiry from: {inquiry.fullName}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          {/* FIX 2: Removed referenceImage and size fields as they don't exist */}
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><p className="text-sm text-muted-foreground pt-1 break-words">{inquiry.email}</p></div>
            <div><Label>Phone</Label><p className="text-sm text-muted-foreground pt-1">{inquiry.phoneNumber || 'N/A'}</p></div>
            <div>
              <Label>Status</Label>
              <div className="text-sm pt-1"><Badge>{inquiry.status}</Badge></div>
            </div>
             <div>
              <Label>Received On</Label>
              <p className="text-sm text-muted-foreground pt-1">{new Date(inquiry.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div>
            <Label>Message</Label>
            <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md border mt-1 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =================================================================
// --- EDIT INQUIRY MODAL (Refactored to use objects, not FormData) ---
// =================================================================
function EditInquiryModal({ isOpen, onClose, inquiry, onSave }: { 
    isOpen: boolean, 
    onClose: () => void, 
    inquiry: ContactInquiry | null, 
    // FIX 3: onSave now expects a plain object with the updates
    onSave: (id: string, updates: Partial<ContactInquiry>) => Promise<void> 
}) {
  const [status, setStatus] = useState<ContactInquiry['status']>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setStatus(inquiry.status);
    }
  }, [inquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry) return;
    setIsSubmitting(true);
    
    // Create a plain object with only the fields that can be changed
    const updates = { status };

    await onSave(inquiry._id, updates);
    setIsSubmitting(false);
  };

  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Inquiry: {inquiry.fullName}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div><Label>Customer Name</Label><Input value={inquiry.fullName || ''} disabled /></div>
            <div><Label>Email</Label><Input type="email" value={inquiry.email || ''} disabled /></div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: ContactInquiry['status']) => setStatus(v)} disabled={isSubmitting}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// =================================================================
// --- MAIN PAGE COMPONENT (Updated Handlers and useEffect) ---
// =================================================================
export default function ContactAdminPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { inquiries, status, error } = useSelector((state: RootState) => state.contact);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState<ContactInquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // FIX 4: Combined useEffect for cleaner data fetching
  useEffect(() => {
    // If filter is 'All', pass `undefined` to the thunk so no query param is sent.
    dispatch(fetchInquiries(statusFilter === 'All' ? undefined : statusFilter));
  }, [statusFilter, dispatch]);

  const handleViewClick = (inquiry: ContactInquiry) => {
    setCurrentInquiry(inquiry);
    setIsViewOpen(true);
  };

  const handleEditClick = (inquiry: ContactInquiry) => {
    setCurrentInquiry(inquiry);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (inquiry: ContactInquiry) => {
    setCurrentInquiry(inquiry);
    setIsDeleteOpen(true);
  };

  // FIX 5: handleSave now sends a plain object to the thunk
  const handleSave = async (inquiryId: string, updates: Partial<ContactInquiry>) => {
    try {
      await dispatch(updateInquiry({ inquiryId, updates })).unwrap();
      setIsEditOpen(false); // Close modal on success
    } catch (err) {
      // The slice already shows a toast, so we just log here for debugging
      console.error("Update failed:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentInquiry) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteInquiry(currentInquiry._id)).unwrap();
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading') return <div className="p-8 flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === 'failed') return <div className="p-8 text-red-600 text-center">Error fetching data: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <div className="w-full sm:w-auto min-w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="w-full bg-white">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length > 0 ? inquiries.map((inquiry) => (
              <TableRow key={inquiry._id}>
                <TableCell>
                  <div className="font-medium">{inquiry.fullName}</div>
                  <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                </TableCell>
                <TableCell className="max-w-sm truncate">{inquiry.message}</TableCell>
                <TableCell><Badge>{inquiry.status}</Badge></TableCell>
                <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" title="View" onClick={() => handleViewClick(inquiry)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditClick(inquiry)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Delete" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(inquiry)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No inquiries found for this filter.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <ViewInquiryModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} inquiry={currentInquiry} />
      <EditInquiryModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} inquiry={currentInquiry} onSave={handleSave} />
      
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action will permanently delete the inquiry from "{currentInquiry?.fullName}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}