"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { Address } from '@/lib/redux/slices/authSlice';
import { addUserAddress, updateUserAddress } from '@/lib/redux/slices/userSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// Assuming you use shadcn/ui, import these for the type selector
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AddressFormProps {
  initialData?: Address | null;
  onClose: () => void;
}

export const AddressForm = ({ initialData, onClose }: AddressFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // --- FIX: Add 'type' to the initial state, defaulting to 'Home' ---
  const [formData, setFormData] = useState({
    fullName: '', 
    phone: '', 
    street: '', 
    city: '', 
    state: '', 
    postalCode: '',
    type: 'Home' as 'Home' | 'Work' // Add the 'type' field
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        phone: initialData.phone,
        street: initialData.street,
        city: initialData.city,
        state: initialData.state,
        postalCode: initialData.postalCode,
        type: initialData.type, // Populate 'type' when editing
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (initialData) {
        // Editing sends the full data object
        await dispatch(updateUserAddress({ addressId: initialData._id, addressData: formData })).unwrap();
      } else {
        // Adding sends the form data which now matches the expected type
        await dispatch(addUserAddress(formData)).unwrap();
      }
      onClose(); // Close the dialog on success
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit Phone Number" required maxLength={10} />
      <Input name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" required />
      <div className="grid grid-cols-2 gap-4">
        <Input name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
        <Input name="state" value={formData.state} onChange={handleChange} placeholder="State" required />
      </div>
      <Input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" required />
      
      {/* --- FIX: Added UI for selecting address type --- */}
      <div>
        <Label className="text-sm font-medium">Address Type</Label>
        <RadioGroup
            value={formData.type}
            onValueChange={(value: 'Home' | 'Work') => setFormData({ ...formData, type: value })}
            className="flex items-center space-x-4 mt-2"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="Home" id="r-home" />
                <Label htmlFor="r-home" className="cursor-pointer">Home</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="Work" id="r-work" />
                <Label htmlFor="r-work" className="cursor-pointer">Work</Label>
            </div>
        </RadioGroup>
      </div>

      {error && <p className="text-sm text-red-500 pt-2">{error}</p>}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};