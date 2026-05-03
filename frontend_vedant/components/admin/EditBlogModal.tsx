"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditBlogForm } from './EditBlogForm';
import { Blog } from '@/lib/redux/slices/blogSlice';

interface EditBlogModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  blog: Blog | null;
}

export const EditBlogModal = ({ isOpen, setIsOpen, blog }: EditBlogModalProps) => {
  if (!blog) return null;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>
        <EditBlogForm initialData={blog} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};