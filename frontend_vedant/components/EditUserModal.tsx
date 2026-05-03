// components/EditUserModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminUser } from '@/lib/api/admin';
import { Loader2 } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  // --- THIS IS THE FIX ---
  // The onSave function is asynchronous, so it must return a Promise.
  onSave: (userId: string, data: Partial<AdminUser>) => Promise<void>;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);
  
  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof AdminUser, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
        // Now this correctly awaits the async onSave function from the parent.
        await onSave(user._id, formData);
    } catch (error) {
        // The parent's toast will show the error. We can safely stop the loading state here.
        console.error("Save failed:", error);
        setIsSubmitting(false); // Stop loading on failure
    }
    // On success, the parent component will close the modal, which will also reset isSubmitting.
  };

  // This function ensures the loading state is reset if the dialog is closed manually
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setIsSubmitting(false);
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Edit User: {user.fullName}</DialogTitle>
            <DialogDescription>Update the user's details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">Full Name</Label>
            <Input id="fullName" value={formData.fullName || ''} onChange={handleChange} className="col-span-3" disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" disabled={isSubmitting}/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}