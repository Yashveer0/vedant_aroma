"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { Address } from '@/lib/redux/slices/authSlice';
// --- UPDATED: Import async thunks from userSlice ---
import { fetchUserProfile, deleteUserAddress, setDefaultUserAddress } from '@/lib/redux/slices/userSlice';
import Navbar  from '@/components/Navbar';
import Footer  from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Star, Loader2 } from 'lucide-react';
import { AddressForm } from '@/components/AddressForm';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: { address: Address, onEdit: () => void, onDelete: () => void, onSetDefault: () => void }) => (
  <Card className={`transition-all ${address.isDefault ? 'border-2 border-[#D09D13]' : 'border'}`}>
    <CardContent className="p-6">
      <div className="flex justify-between">
        <div>
          {address.isDefault && (
            <span className="mb-2 inline-block rounded-full bg-[#D09D13]/10 px-3 py-1 text-xs font-semibold text-[#D09D13]">
              Default
            </span>
          )}
          <p className="font-bold text-gray-800">{address.fullName}</p>
          <p className="text-gray-600">{address.street}</p>
          <p className="text-gray-600">{address.city}, {address.state} - {address.postalCode}</p>
          <p className="mt-2 text-gray-600">Phone: {address.phone}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button variant="ghost" size="icon" onClick={onEdit}><Edit size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></Button>
        </div>
      </div>
      {!address.isDefault && (
        <Button variant="outline" onClick={onSetDefault} className="mt-4">
          <Star size={16} className="mr-2" /> Set as Default
        </Button>
      )}
    </CardContent>
  </Card>
);

export default function AddressesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // --- UPDATED: Select user object which contains addresses ---
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { status: userStatus } = useSelector((state: RootState) => state.user);
  const addresses = user?.addresses || [];
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      // Fetch fresh address data on page load
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, router, dispatch]);

  if (userStatus === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      // --- UPDATED: Dispatch async thunk ---
      dispatch(deleteUserAddress(id));
    }
  };

  const handleSetDefault = (id: string) => {
    // --- UPDATED: Dispatch async thunk ---
    dispatch(setDefaultUserAddress(id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
          <Button onClick={handleAddNew} className="bg-[#D09D13] hover:bg-[#b48a10]">
            <Plus size={20} className="mr-2" /> Add New Address
          </Button>
        </div>
        
        {/* This JSX is now only rendered after the client has mounted, preventing the mismatch */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address._id} 
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => handleDelete(address._id)}
                onSetDefault={() => handleSetDefault(address._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
            <h2 className="text-xl font-medium text-gray-900">No addresses found</h2>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new shipping address.</p>
          </div>
        )}
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm 
            initialData={editingAddress} 
            onClose={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}