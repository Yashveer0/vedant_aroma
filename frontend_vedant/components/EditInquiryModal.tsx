"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

// Re-using the ContactInquiry type is a good practice
interface ContactInquiry {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    message: string;
    size?: string;
    referenceImage?: string;
    status: "New" | "Contacted" | "Completed" | "Rejected";
}

interface EditInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: ContactInquiry | null;
  onSave: (inquiryId: string, formData: FormData) => void;
}

export function EditInquiryModal({ isOpen, onClose, inquiry, onSave }: EditInquiryModalProps) {
  const [formData, setFormData] = useState<Partial<ContactInquiry>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setFormData(inquiry);
      setImageFile(null); // Reset file input on open
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleStatusChange = (value: ContactInquiry['status']) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = new FormData();
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
        if (key !== '_id' && value !== undefined) {
            submissionData.append(key, value as string);
        }
    });

    // Append the new image file if one was selected
    if (imageFile) {
      submissionData.append('referenceImage', imageFile);
    }
    
    onSave(inquiry._id, submissionData);
    // Let the parent component handle closing on success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Edit Inquiry: {inquiry.fullName}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={formData.fullName || ''} onChange={handleChange} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} /></div>
            <div><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} /></div>
            <div><Label htmlFor="size">Size</Label><Input id="size" value={formData.size || ''} onChange={handleChange} /></div>
            <div><Label htmlFor="message">Message</Label><Textarea id="message" value={formData.message || ''} onChange={handleChange} /></div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="referenceImage">Replace Reference Image (Optional)</Label>
              {inquiry.referenceImage && !imageFile && (
                <div className="mt-2"><img src={inquiry.referenceImage} alt="Reference" className="w-24 h-24 object-cover rounded"/></div>
              )}
              <Input id="referenceImage" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}