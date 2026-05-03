"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddBlogForm } from './admin/AddBlogForm';

interface AddBlogModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const AddBlogModal = ({ isOpen, setIsOpen }: AddBlogModalProps) => {

  const handleSuccess = () => {
    setIsOpen(false); // फ़ॉर्म सफलतापूर्वक सबमिट होने पर मॉडल को बंद कर दें
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Blog Post</DialogTitle>
        </DialogHeader>
        <AddBlogForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};