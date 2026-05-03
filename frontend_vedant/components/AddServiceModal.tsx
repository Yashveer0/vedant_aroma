"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, XCircle, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

// --- Interfaces for State Management ---
interface VariantState {
  name: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  duration_in_days?: number;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

// --- Constants ---
const MAX_IMAGES = 5;
// const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // REMOVED: Size limit constant
const initialVariantState: VariantState = { 
  name: '', 
  sku: '', 
  price: 0, 
  sale_price: 0, 
  stock_quantity: 0, 
  duration_in_days: 0 
};

export function AddServiceModal({ isOpen, onClose, onSave }: AddServiceModalProps) {
  const { categories, subcategories } = useSelector((state: RootState) => state.admin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<VariantState[]>([{...initialVariantState}]);
  
  // File management states
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(new Array(MAX_IMAGES).fill(null));
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(new Array(MAX_IMAGES).fill(null));
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // --- Variant Field Handlers ---
  const handleVariantChange = (index: number, field: keyof VariantState, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };
  
  const addVariant = () => setVariants([...variants, { ...initialVariantState }]);

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    } else {
      toast.info("A variable service must have at least one option.");
    }
  };

  // --- File Upload Handlers ---
  // REMOVED: The calculateTotalSize function is no longer needed.

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const newFiles = [...imageFiles];
    newFiles[index] = file;
    
    // REMOVED: Size check logic
    // if (calculateTotalSize(newFiles, videoFile) > MAX_TOTAL_SIZE) { ... }

    const newPreviews = [...imagePreviews];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newPreviews[index] = URL.createObjectURL(file);
    setImageFiles(newFiles); 
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]; 
    const newPreviews = [...imagePreviews];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newFiles[index] = null; 
    newPreviews[index] = null;
    setImageFiles(newFiles); 
    setImagePreviews(newPreviews);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // REMOVED: Size check logic
    // if (calculateTotalSize(imageFiles, file) > MAX_TOTAL_SIZE) { ... }
    
    if (videoFile && videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file); 
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  // --- Form Reset ---
  const resetForm = () => {
    setIsSubmitting(false);
    setIsVariable(false);
    setVariants([{...initialVariantState}]);
    imagePreviews.forEach(url => { if (url) URL.revokeObjectURL(url); });
    setImageFiles(new Array(MAX_IMAGES).fill(null)); 
    setImagePreviews(new Array(MAX_IMAGES).fill(null));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null); 
    setVideoPreview(null);
    const form = document.getElementById('add-service-form') as HTMLFormElement;
    form?.reset();
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate images
    if (!imageFiles.some(file => file !== null)) {
      toast.error("Please upload at least one service image.");
      return;
    }
    
    // REMOVED: Final size check on submit
    // if (calculateTotalSize(imageFiles, videoFile) > MAX_TOTAL_SIZE) { ... }

    // Validate variants if variable service
    if (isVariable) {
      for (const variant of variants) {
        if (!variant.name || !variant.sku || !variant.price || variant.stock_quantity < 0) {
          toast.error("All variant fields (Name, SKU, Price, Stock) are required.");
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const data = new FormData(form);
      
      data.set('type', 'service');
      
      if (isVariable) {
        data.set('variants', JSON.stringify(variants));
      }

      imageFiles.forEach(file => { 
        if (file) data.append('images', file); 
      });
      
      if (videoFile) {
        data.append('video', videoFile);
      }

      console.log('Submitting service data...');
      await onSave(data);
      resetForm();
    } catch (error) {
      console.error('Service creation error:', error);
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>Fill in the details for the new service. * indicates required fields.</DialogDescription>
        </DialogHeader>

        <form id="add-service-form" onSubmit={handleSubmit}>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name *</Label>
                <Input id="service-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-description">Description *</Label>
                <Textarea id="service-description" name="description" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-instructions">Instructions for User</Label>
              <Textarea 
                id="user-instructions"
                name="userInputInstructions" 
                placeholder="e.g., Please provide your full name, date of birth (DD/MM/YYYY), and time of birth for the kundali analysis." 
              />
              <p className="text-xs text-muted-foreground">
                Enter any questions for the user. This will appear on the cart page for them to fill out.
              </p>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <Label className="font-semibold text-base">Pricing & Availability</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-slate-50">
                <div>
                  <Label htmlFor="base-price">Base Price (MRP) *</Label>
                  <Input id="base-price" name="price" type="number" step="0.01" required={!isVariable} />
                </div>
                <div>
                  <Label htmlFor="sale-price">Base Sale Price</Label>
                  <Input id="sale-price" name="sale_price" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="stock-quantity">Total Available Slots *</Label>
                  <Input id="stock-quantity" name="stock_quantity" type="number" required={!isVariable} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="variable-switch-service" 
                  checked={isVariable} 
                  onCheckedChange={setIsVariable} 
                />
                <Label htmlFor="variable-switch-service">This service has multiple options (e.g., 7 days, 41 days)</Label>
              </div>

              {isVariable && (
                <div className="space-y-3 p-4 border rounded-md bg-slate-50">
                  <Label className="font-semibold text-base">Service Options *</Label>
                  {variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 border rounded-md relative bg-white">
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">Option Name*</Label>
                        <Input 
                          placeholder="e.g., 07 days Healing" 
                          value={variant.name} 
                          onChange={e => handleVariantChange(index, 'name', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">SKU*</Label>
                        <Input 
                          placeholder="e.g., HEAL-7D" 
                          value={variant.sku} 
                          onChange={e => handleVariantChange(index, 'sku', e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">Available Slots*</Label>
                        <Input 
                          type="number" 
                          value={variant.stock_quantity || ''} 
                          onChange={e => handleVariantChange(index, 'stock_quantity', parseInt(e.target.value) || 0)} 
                          required 
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">Price (MRP)*</Label>
                        <Input 
                          type="number" 
                          value={variant.price || ''} 
                          onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} 
                          required 
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">Sale Price</Label>
                        <Input 
                          type="number" 
                          value={variant.sale_price || ''} 
                          onChange={e => handleVariantChange(index, 'sale_price', parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Label className="text-xs font-medium">Duration (in days)</Label>
                        <Input 
                          type="number" 
                          value={variant.duration_in_days || ''} 
                          onChange={e => handleVariantChange(index, 'duration_in_days', parseInt(e.target.value) || 0)} 
                        />
                      </div>
                      <div className="absolute top-1 right-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addVariant} 
                    className="mt-2"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Option
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select name="sub_category">
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map(subcat => (
                      <SelectItem key={subcat._id} value={subcat.name}>{subcat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" placeholder="e.g., Healing, Vastu, Remote" />
              </div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                {/* UPDATED: Removed the size limit text from the label */}
                <Label>Service Images <span className='text-red-800'>(up to 5)</span> *</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(MAX_IMAGES)].map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`image-service-${index}`} className="text-xs text-muted-foreground">
                        Image {index + 1}
                      </Label>
                      <Input 
                        id={`image-service-${index}`} 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageChange(index, e)} 
                        className="text-xs" 
                      />
                      {imagePreviews[index] && (
                        <div className="relative mt-2 w-20 h-20">
                          <Image 
                            src={imagePreviews[index]!} 
                            alt={`preview ${index}`} 
                            fill 
                            sizes="80px" 
                            className="object-cover rounded-md" 
                          />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)} 
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-service">Service Video (optional)</Label>
                <Input 
                  id="video-service" 
                  name="video" 
                  type="file" 
                  accept="video/*" 
                  onChange={handleVideoChange} 
                />
                {videoPreview && (
                  <div className="relative w-full aspect-video mt-2">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <button 
                      type="button" 
                      onClick={removeVideo} 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { resetForm(); onClose(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Creating...
                </>
              ) : (
                "Create Service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}