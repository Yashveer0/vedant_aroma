"use client";

import { useState, useEffect } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { Product as Service } from '@/lib/types/product';
import { updateProduct as updateService } from '@/lib/redux/slices/adminSlice';

// --- Interfaces ---
interface VariantState {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  duration_in_days?: number;
}

// CORRECTED: The props interface now uses 'onUpdateSuccess'
interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onUpdateSuccess: () => void;
}

const initialVariantState: VariantState = { name: '', sku: '', price: 0, sale_price: 0, stock_quantity: 0, duration_in_days: 0 };

export function EditServiceModal({ isOpen, onClose, service, onUpdateSuccess }: EditServiceModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, subcategories } = useSelector((state: RootState) => state.admin);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<VariantState[]>([{...initialVariantState}]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);

  useEffect(() => {
    if (service) {
      // CORRECTED: This check is now fully type-safe and prevents errors.
      const hasVariants = (service.variants?.length ?? 0) > 0;
      setIsVariable(hasVariants);
      setVariants(hasVariants ? [...(service.variants ?? [])] : [{...initialVariantState}]);
      
      setImagePreviews(service.images || []);
      setImageFiles(new Array(service.images?.length || 0).fill(null));
    }
  }, [service]);

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
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    if (newFiles[index] && newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newPreviews[index] = URL.createObjectURL(file);
    newFiles[index] = file;
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };
  
  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    const fileToRemove = imageFiles[index];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    if (fileToRemove && previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
    }
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };
  
  const addNewImageSlot = () => {
    if (imagePreviews.length >= 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    setImagePreviews([...imagePreviews, null]);
    setImageFiles([...imageFiles, null]);
  };

  // --- Form Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      toast.error("Service data is missing, cannot update.");
      return;
    }
    setIsSubmitting(true);
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    
    data.append('type', 'service');
    if (isVariable) data.append('variants', JSON.stringify(variants));

    const imageOrder = imagePreviews.map((preview, index) => {
        if (imageFiles[index]) return 'NEW_FILE_PLACEHOLDER';
        return preview;
    }).filter(Boolean) as string[];

    data.append('imageOrder', JSON.stringify(imageOrder));
    
    imageFiles.forEach(file => {
      if (file) data.append('images', file);
    });
    if(!service._id)
        toast.error("service is not selected")
    const promise = dispatch(updateService({ productId: service._id, formData: data })).unwrap();

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (updatedService) => {
        onUpdateSuccess();
        onClose();
        return `Service "${updatedService.name}" updated successfully!`;
      },
      error: (err) => {
        setIsSubmitting(false);
        return err || 'Failed to update service.';
      }
    });
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>Update the details for "{service.name}".</DialogDescription>
        </DialogHeader>

        <form id="edit-service-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2"><Label>Service Name *</Label><Input name="name" defaultValue={service.name}  /></div>
              <div className="space-y-2"><Label>Description *</Label><Textarea name="description" defaultValue={service.description}  /></div>
            </div>

            <div className="space-y-2">
                <Label>Instructions for User</Label>
                <Textarea 
                    name="userInputInstructions" 
                    defaultValue={service.userInputInstructions}
                    placeholder="e.g., Please provide your full name, date of birth (DD/MM/YYYY), and time of birth for the kundali analysis." 
                />
                <p className="text-xs text-muted-foreground">
                    Edit the questions you need the user to answer for this service.
                </p>
              </div>
            <div className="border-t pt-4 space-y-4">
               <Label className="font-semibold text-base">Pricing & Availability</Label>
               {!isVariable && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md bg-slate-50">
                    <div><Label>Base Price (MRP) *</Label><Input name="price" type="number" defaultValue={service.price} step="0.01"  /></div>
                    <div><Label>Base Sale Price</Label><Input name="sale_price" type="number" defaultValue={service.sale_price} step="0.01" /></div>
                    <div><Label>Total Slots *</Label><Input name="stock_quantity" type="number" defaultValue={service.stock_quantity}  /></div>
                 </div>
               )}
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="variable-switch-edit" checked={isVariable} onCheckedChange={setIsVariable} />
                <Label htmlFor="variable-switch-edit">This service has multiple options</Label>
              </div>
              {isVariable && (
                <div className="space-y-3 p-4 border rounded-md bg-slate-50">
                  <Label className="font-semibold text-base">Service Options *</Label>
                  {variants.map((variant, index) => (
                      <div key={variant._id || index} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 border rounded-md relative bg-white">
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">Option Name*</Label><Input placeholder="e.g., 07 days Healing" value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)}   /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">SKU*</Label><Input placeholder="e.g., HEAL-7D" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)}   /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">Slots*</Label><Input type="number" value={variant.stock_quantity || ''} onChange={e => handleVariantChange(index, 'stock_quantity', parseInt(e.target.value) || 0)}   /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">Price (MRP)*</Label><Input type="number" value={variant.price || ''} onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}   /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">Sale Price</Label><Input type="number" value={variant.sale_price || ''} onChange={e => handleVariantChange(index, 'sale_price', parseFloat(e.target.value) || 0)} /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs font-medium">Duration (days)</Label><Input type="number" value={variant.duration_in_days || ''} onChange={e => handleVariantChange(index, 'duration_in_days', parseInt(e.target.value) || 0)} /></div>
                        <div className="absolute top-1 right-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                      </div>))}
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Add Another Option</Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div><Label>Category *</Label><Select name="category" defaultValue={service.category}  ><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                <div><Label>Subcategory</Label><Select name="sub_category" defaultValue={service.sub_category}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{subcategories.map(subcat => (<SelectItem key={subcat._id} value={subcat.name}>{subcat.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="col-span-2"><Label>Tags (comma-separated)</Label><Input name="tags" defaultValue={service.tags?.join(', ')} placeholder="e.g., Healing, Vastu" /></div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <Label>Service Images (up to 5)</Label>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-slate-50">
                    {preview ? (
                      <>
                        <Image src={typeof preview === 'string' ? preview : URL.createObjectURL(preview as File)} alt={`preview ${index}`} fill sizes="96px" className="object-cover rounded-md" onLoad={e => { if (typeof preview !== 'string') URL.revokeObjectURL(e.currentTarget.src) }}/>
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 z-10"><XCircle size={20} /></button>
                      </>
                    ) : (
                      <>
                        <Label htmlFor={`image-edit-${index}`} className="cursor-pointer text-center text-xs text-muted-foreground">Click to upload</Label>
                        <Input id={`image-edit-${index}`} type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                      </>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <Button type="button" variant="outline" onClick={addNewImageSlot} className="w-24 h-24 flex flex-col items-center justify-center border-dashed">
                    <PlusCircle className="h-6 w-6" />
                    <span className="mt-1 text-xs">Add Image</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}