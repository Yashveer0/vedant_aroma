"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchAllReels,
  createReel,
  updateReel,
  deleteReel,
  Reel,
  NewReelPayload,
} from '@/lib/redux/slices/reelSlice';
import { toast } from 'sonner';

// --- UI Components & Icons ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, FileText, PlusCircle, Trash2, FilePenLine } from 'lucide-react';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const initialFormState: NewReelPayload = {
    title: '',
    productName: '',
    youtubeLink: '',
};

export default function AdminReelsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { reels, status, error } = useSelector((state: RootState) => state.reels);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewReelPayload>(initialFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllReels());
  }, [dispatch]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reel: Reel) => {
    setIsEditMode(true);
    setFormData({
      title: reel.title,
      productName: reel.productName,
      youtubeLink: reel.youtubeLink || '',
    });
    setEditingId(reel._id);
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode && editingId) {
        await dispatch(updateReel({ id: editingId, data: formData })).unwrap();
        toast.success("Reel updated successfully!");
      } else {
        await dispatch(createReel(formData)).unwrap();
        toast.success("Reel created successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(`Operation failed: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this reel?")) return;
    try {
      await dispatch(deleteReel(id)).unwrap();
      toast.success("Reel deleted!");
    } catch (err) {
      toast.error(`Failed to delete: ${err}`);
    }
  };

  const renderContent = () => {
    if (status === 'loading') return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (status === 'failed') return <div className="text-center text-red-600"><AlertCircle className="mx-auto h-8 w-8 mb-2" /><p>Error: {error}</p></div>;
    if (reels.length === 0) return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold">No Reels Found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new promotional reel.</p>
      </div>
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reels.map((reel) => (
            <TableRow key={reel._id}>
              <TableCell className="font-medium">{reel.title}</TableCell>
              <TableCell>{reel.productName}</TableCell>
              <TableCell>
                {reel.youtubeLink ? <a href={reel.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Video</a> : 'N/A'}
              </TableCell>
              <TableCell>{formatDate(reel.createdAt)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleOpenEditModal(reel)}><FilePenLine className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(reel._id)}><Trash2 className="h-4 w-4" /></Button>
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
            <CardTitle>Promotional Reels Management</CardTitle>
            <CardDescription>Create, edit, and manage product promotion videos.</CardDescription>
          </div>
          <Button onClick={handleOpenCreateModal}><PlusCircle className="mr-2 h-4 w-4" />Create New</Button>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{isEditMode ? 'Edit Reel' : 'Create New Reel'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productName" className="text-right">Product *</Label>
                <Input id="productName" name="productName" value={formData.productName} onChange={handleFormChange} required className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="youtubeLink" className="text-right">YouTube Link</Label>
                <Input id="youtubeLink" name="youtubeLink" value={formData.youtubeLink} onChange={handleFormChange} className="col-span-3" placeholder="https://youtube.com/..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Create Reel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}