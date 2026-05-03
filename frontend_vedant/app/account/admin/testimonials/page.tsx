"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  Testimonial,
  NewTestimonialPayload,
} from '@/lib/redux/slices/testimonialSlice';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, FileText, PlusCircle, Trash2, FilePenLine } from 'lucide-react';

// A utility function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// The initial state for the form
const initialFormState: NewTestimonialPayload = {
    name: '',
    productName: '',
    youtubeLink: '',
};

export default function AdminTestimonialsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { testimonials, status, error } = useSelector((state: RootState) => state.testimonials);
  
  // State for the create/edit modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewTestimonialPayload>(initialFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all testimonials when the component mounts
  useEffect(() => {
    dispatch(fetchAllTestimonials());
  }, [dispatch]);

  // --- Handlers for Modal and Form ---

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (testimonial: Testimonial) => {
    setIsEditMode(true);
    setFormData({
      name: testimonial.name,
      productName: testimonial.productName,
      youtubeLink: testimonial.youtubeLink || '',
    });
    setEditingId(testimonial._id);
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && editingId) {
        // --- Update Logic ---
        await dispatch(updateTestimonial({ id: editingId, data: formData })).unwrap();
        toast.success("Testimonial Updated Successfully!");
      } else {
        // --- Create Logic ---
        await dispatch(createTestimonial(formData)).unwrap();
        toast.success("Testimonial Created Successfully!");
      }
      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      toast.error(`Operation Failed: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handler for Deletion ---

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial? This action cannot be undone.")) {
        return;
    }
    
    try {
        await dispatch(deleteTestimonial(id)).unwrap();
        toast.success("Testimonial Deleted!");
    } catch (err) {
        toast.error(`Failed to delete: ${err}`);
    }
  };


  // --- Render Logic ---

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="ml-2">Loading testimonials...</p>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className='font-semibold'>Failed to load testimonials</p>
          <p className='text-sm'>{error}</p>
        </div>
      );
    }
    
    if (testimonials.length === 0) {
        return (
            <div className="text-center py-16">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Testimonials Found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new testimonial.</p>
            </div>
        )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>YouTube Link</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.map((t) => (
            <TableRow key={t._id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell>{t.productName}</TableCell>
              <TableCell>
                {t.youtubeLink ? <a href={t.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Link</a> : 'N/A'}
              </TableCell>
              <TableCell>{formatDate(t.createdAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenEditModal(t)}>
                    <FilePenLine className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(t._id)}>
                    <Trash2 className="h-4 w-4" />
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
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Testimonial Management</CardTitle>
                <CardDescription>
                    Create, edit, and manage all user testimonials.
                </CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New
            </Button>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      {/* --- Create/Edit Testimonial Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Testimonial' : 'Create New Testimonial'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productName" className="text-right">Product Name *</Label>
                <Input id="productName" name="productName" value={formData.productName} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="youtubeLink" className="text-right">YouTube Link</Label>
                <Input id="youtubeLink" name="youtubeLink" value={formData.youtubeLink} onChange={handleFormChange} className="col-span-3" placeholder="https://youtube.com/watch?v=..." />
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Save Changes' : 'Create Testimonial'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}