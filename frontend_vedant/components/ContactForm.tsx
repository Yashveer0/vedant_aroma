"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from "@/lib/redux/store";
import { submitContactForm } from "@/lib/redux/slices/contactSlice";
import { motion } from "framer-motion";

// UI Components
import { Upload, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Optional: Add validation for file size or type here
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Create a FormData object to handle multipart data (text + file)
    const submissionData = new FormData();
    submissionData.append('fullName', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('phoneNumber', formData.phone);
    submissionData.append('message', formData.message);
    
    // 2. Append the file only if one is selected
    if (selectedFile) {
      submissionData.append('referenceImage', selectedFile);
    }

    try {
      // 3. Dispatch the async thunk and use .unwrap() to handle promises
      await dispatch(submitContactForm(submissionData)).unwrap();
      
      // 4. On success, reset the form state
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSelectedFile(null);
      // To clear the file input visually, we can reset the form element itself
      const form = e.target as HTMLFormElement;
      form.reset();

    } catch (error) {
      // Error toasts are handled automatically by the slice's rejected case
      console.error("Submission failed:", error);
    } finally {
      // 5. Always stop the loading indicator
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-2xl mx-auto"
      id="contactus"
    >
      <div
        className="rounded-2xl p-8 border bg-background"
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name" // Corresponds to formData state key
                value={formData.name}
                onChange={handleInputChange}
                required
                className="rounded-xl"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email" // Corresponds to formData state key
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="rounded-xl"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone" // Corresponds to formData state key
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message" // Corresponds to formData state key
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="rounded-xl resize-none"
              placeholder="Tell us about your custom jewelry requirements..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Image (Optional)</Label>
            <div className="relative">
              {/* This input is hidden but is triggered by the label */}
              <Input id="reference" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isSubmitting} />
              <Label
                htmlFor="reference"
                className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors ${isSubmitting ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:bg-gray-50'}`}
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 truncate px-2">{selectedFile ? selectedFile.name : "Click or drag to upload"}</p>
                </div>
              </Label>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}