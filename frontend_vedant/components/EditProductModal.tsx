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
import { Product, Variant } from '@/lib/types/product';
import { updateProduct } from '@/lib/redux/slices/adminSlice';

// --- Interfaces ---
interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateSuccess: () => void;
}

// Updated initial state to include all variant fields
const initialVariantState: Partial<Variant> = { 
  name: '', 
  sku: '', 
  price: 0, 
  sale_price: 0, 
  stock_quantity: 0, 
  volume: 0,
  weight: 0,
  length: 0,
  breadth: 0,
  height: 0,
  duration_in_days: 0 // Added missing field
};

export function EditProductModal({ isOpen, onClose, product, onUpdateSuccess }: EditProductModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, subcategories } = useSelector((state: RootState) => state.admin);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<Partial<Variant>[]>([{...initialVariantState}]);
  const [tagsString, setTagsString] = useState("");
  
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);

  useEffect(() => {
    if (product) {
      const hasVariants = (product.variants?.length ?? 0) > 0;
      setIsVariable(hasVariants);
      setVariants(hasVariants ? [...(product.variants ?? [])] : [{...initialVariantState}]);
      setTagsString(product.tags?.join(', ') || "");
      setImagePreviews(product.images || []);
      setImageFiles(new Array(product.images?.length || 0).fill(null));
    }
  }, [product]);

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  const addVariant = () => setVariants([...variants, { ...initialVariantState }]);
  
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    } else {
      toast.info("A product must have at least one variant option.");
    }
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    if (newFiles[index] && newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]!);
    }
    newPreviews[index] = URL.createObjectURL(file);
    newFiles[index] = file;
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    if (previewToRemove) URL.revokeObjectURL(previewToRemove);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const addNewImageSlot = () => {
    if (imagePreviews.length < 5) {
      setImagePreviews(prev => [...prev, null]);
      setImageFiles(prev => [...prev, null]);
    } else {
      toast.error("Maximum of 5 images allowed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return toast.error("Product data missing.");

    const form = e.currentTarget as HTMLFormElement;
    const formElements = form.elements as any;
    if (!formElements.name.value.trim()) return toast.error("Product Name is required.");
    if (!formElements.description.value.trim()) return toast.error("Description is required.");

    setIsSubmitting(true);
    const data = new FormData(form);
    
    data.append('type', 'product');
    data.append('tags', tagsString);
    if (isVariable) {
      data.append('variants', JSON.stringify(variants));
    }

    const imageOrder = imagePreviews.map((p, i) => imageFiles[i] ? 'NEW_FILE_PLACEHOLDER' : p).filter(Boolean) as string[];
    data.append('imageOrder', JSON.stringify(imageOrder));
    imageFiles.forEach(file => file && data.append('images', file));

    const promise = dispatch(updateProduct({ productId: product._id, formData: data })).unwrap();

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (updatedProduct) => {
        setIsSubmitting(false);
        onUpdateSuccess();
        onClose();
        return `Product "${updatedProduct.name}" updated successfully!`;
      },
      error: (err) => {
        setIsSubmitting(false);
        return err || 'Failed to update product.';
      }
    });
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the details for "{product.name}".</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-4 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2"><Label>Product Name *</Label><Input name="name" defaultValue={product.name} required /></div>
              <div className="space-y-2"><Label>Description *</Label><Textarea name="description" defaultValue={product.description} required /></div>
              <div className="space-y-2"><Label>Brand *</Label><Input name="brand" defaultValue={product.brand} required /></div>
            </div>
            
            {!isVariable && (
              <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-md bg-slate-50">
                  <div><Label>Base Price (MRP) *</Label><Input name="price" type="number" defaultValue={product.price} step="0.01" required /></div>
                  <div><Label>Base Sale Price</Label><Input name="sale_price" type="number" defaultValue={product.sale_price} step="0.01" /></div>
                  <div><Label>Total Stock *</Label><Input name="stock_quantity" type="number" defaultValue={product.stock_quantity} required /></div>
                  <div><Label>Volume (ml)</Label><Input name="volume" type="number" defaultValue={product.volume} /></div>
                  {/* --- NEW FIELDS FOR SIMPLE PRODUCT --- */}
                  <div><Label>Weight (kg) *</Label><Input name="weight" type="number" defaultValue={product.weight} step="0.01" required /></div>
                  <div><Label>Length (cm) *</Label><Input name="length" type="number" defaultValue={product.length} step="0.01" required /></div>
                  <div><Label>Breadth (cm) *</Label><Input name="breadth" type="number" defaultValue={product.breadth} step="0.01" required /></div>
                  <div><Label>Height (cm) *</Label><Input name="height" type="number" defaultValue={product.height} step="0.01" required /></div>
              </div>
            )}

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch checked={isVariable} onCheckedChange={setIsVariable} />
                <Label>This product has multiple options (e.g., 10ml, 30ml)</Label>
              </div>

              {isVariable && (
                <div className="space-y-3 p-4 border rounded-md bg-slate-50">
                  <Label className="font-semibold">Product Variants *</Label>
                  {variants.map((variant, index) => (
                      <div key={variant._id || index} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 border rounded-md relative bg-white">
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Variant Name*</Label><Input placeholder="e.g., 10 ml" value={variant.name || ''} onChange={e => handleVariantChange(index, 'name', e.target.value)} required /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">SKU*</Label><Input placeholder="e.g., AROMA-10ML" value={variant.sku || ''} onChange={e => handleVariantChange(index, 'sku', e.target.value)} required /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Stock*</Label><Input type="number" value={variant.stock_quantity || ''} onChange={e => handleVariantChange(index, 'stock_quantity', parseInt(e.target.value) || 0)} required /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Price (MRP)*</Label><Input type="number" value={variant.price || ''} onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} required /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Sale Price</Label><Input type="number" value={variant.sale_price || ''} onChange={e => handleVariantChange(index, 'sale_price', parseFloat(e.target.value) || 0)} /></div>
                        <div className="col-span-12 md:col-span-4"><Label className="text-xs">Volume (ml)</Label><Input type="number" value={variant.volume || ''} onChange={e => handleVariantChange(index, 'volume', parseInt(e.target.value) || 0)} /></div>
                        {/* --- NEW FIELDS FOR VARIANTS --- */}
                        <div className="col-span-12 md:col-span-3"><Label className="text-xs">Weight (kg)*</Label><Input type="number" step="0.01" value={variant.weight || ''} onChange={e => handleVariantChange(index, 'weight', parseFloat(e.target.value) || 0)} required /></div>
                        <div className="col-span-12 md:col-span-3"><Label className="text-xs">Length (cm)*</Label><Input type="number" step="0.01" value={variant.length || ''} onChange={e => handleVariantChange(index, 'length', parseFloat(e.target.value) || 0)} required /></div>
                        <div className="col-span-12 md:col-span-3"><Label className="text-xs">Breadth (cm)*</Label><Input type="number" step="0.01" value={variant.breadth || ''} onChange={e => handleVariantChange(index, 'breadth', parseFloat(e.target.value) || 0)} required /></div>
                        <div className="col-span-12 md:col-span-3"><Label className="text-xs">Height (cm)*</Label><Input type="number" step="0.01" value={variant.height || ''} onChange={e => handleVariantChange(index, 'height', parseFloat(e.target.value) || 0)} required /></div>
                        
                        <div className="absolute top-1 right-1"><Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                      </div>))}
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" />Add Variant</Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div><Label>Category *</Label><Select name="category" defaultValue={product.category}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                <div><Label>Subcategory</Label><Select name="sub_category" defaultValue={product.sub_category}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subcategories.map(subcat => (<SelectItem key={subcat._id} value={subcat.name}>{subcat.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="col-span-2"><Label>Tags (comma-separated)</Label><Input value={tagsString} onChange={e => setTagsString(e.target.value)} /></div>
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <Label>Product Images (up to 5)</Label>
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-slate-50">
                    {preview ? (
                      <>
                        <Image src={preview} alt={`preview ${index}`} fill sizes="96px" className="object-cover rounded-md" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 z-10"><XCircle size={20} /></button>
                      </>
                    ) : (
                      <>
                        <Label htmlFor={`p-image-edit-${index}`} className="cursor-pointer text-center text-xs text-muted-foreground">Click to upload</Label>
                        <Input id={`p-image-edit-${index}`} type="file" accept="image/*" onChange={(e) => handleImageChange(index, e)} className="opacity-0 absolute inset-0 w-full h-full" />
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