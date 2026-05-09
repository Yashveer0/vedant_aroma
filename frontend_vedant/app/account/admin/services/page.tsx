"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { 
  fetchServices, 
  deleteProduct as deleteService,
  createProduct as createService,
  fetchServiceById, 
  fetchCategories,
  fetchSubcategories
} from '@/lib/redux/slices/adminSlice';
import { ViewProductModal as ViewServiceModal } from '@/components/ViewProductModal';
import { Product as Service } from '@/lib/types/product'; 
import { AddServiceModal } from '@/components/AddServiceModal';
import { EditServiceModal } from '@/components/EditServiceModal';
import { toast } from 'sonner';
import { resolveMediaUrl } from '@/lib/media';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryManager } from '@/components/CategoryManager';
import { SubcategoryManager } from '@/components/SubcategoryManager';

export default function ServicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { services, error, serviceStatus: status, selectedService, selectedServiceStatus, servicePagination } = useSelector((state: RootState) => state.admin);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSubcategoryManagerOpen, setIsSubcategoryManagerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchServices({ page: currentPage, limit: 10 }));
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [currentPage, dispatch]);
  
  const handleCreateNew = async (formData: FormData) => {
    const promise = dispatch(createService(formData)).unwrap();
    toast.promise(promise, {
        loading: 'Creating service...',
        success: (newService) => {
            setIsAddDialogOpen(false);
            dispatch(fetchServices({ page: currentPage, limit: 10 }));
            return `Service "${newService.name}" created!`;
        },
        error: (err) => err || 'Failed to create service.'
    });
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchServices({ page: currentPage, limit: 10 }));
  };

  const handleDeleteClick = (service: Service) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentService || !currentService._id) return;
    setIsDeleting(true);
    const promise = dispatch(deleteService(currentService._id)).unwrap();
    toast.promise(promise, {
        loading: 'Deleting service...',
        success: () => {
            setIsDeleteDialogOpen(false);
            setIsDeleting(false);
            if (services.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                dispatch(fetchServices({ page: currentPage, limit: 10 }));
            }
            return `Service "${currentService.name}" deleted.`;
        },
        error: (err) => {
            setIsDeleting(false);
            return err || 'Failed to delete service.';
        }
    });
  };
  
  const handleEditClick = (service: Service) => {
    setCurrentService(service);
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (serviceId?: string) => {
    if(serviceId)
    dispatch(fetchServiceById(serviceId));
    setIsViewDialogOpen(true);
  };

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, servicePagination.totalPages));
  
  if (status === 'loading' && services.length === 0) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === 'failed') return <div className="p-8 text-red-600">Error fetching data: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <div className='flex items-center gap-2'>
          {/* <Button variant="outline" onClick={() => setIsSubcategoryManagerOpen(true)}>Manage Subcategories</Button>
          <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)}>Manage Categories</Button> */}
          <Button onClick={() => setIsAddDialogOpen(true)}>Add New Service</Button>
        </div>
      </div>

      <div className='bg-white p-4 rounded-md shadow-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available Slots</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service: Service) => {
              const isVariable = service.variants && service.variants.length > 0;
              const sellingPrice = service.sale_price ?? service.price ?? 0;
              const originalPrice = service.price ?? 0;
              const displayPrice = (
                <div className="flex flex-col">
                  <span className="font-semibold">{isVariable ? `Starts at ₹${sellingPrice.toLocaleString()}` : `₹${sellingPrice.toLocaleString()}`}</span>
                  {service.sale_price && (<span className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>)}
                </div>
              );
              const displaySlots = service.stock_quantity ?? 0;
              const slotsText = isVariable ? `${displaySlots} (in options)` : displaySlots;
              
              return (
                <TableRow key={service._id}>
                  <TableCell><Image src={resolveMediaUrl(service.images?.[0])} alt={service.name} width={48} height={48} className="object-cover rounded-md" /></TableCell>
                  <TableCell className="font-medium"><Tooltip><TooltipTrigger><p className="max-w-[250px] truncate">{service.name}</p></TooltipTrigger><TooltipContent><p>{service.name}</p></TooltipContent></Tooltip></TableCell>
                  <TableCell>{displayPrice}</TableCell>
                  <TableCell>{slotsText}</TableCell>
                  <TableCell className="capitalize">{service.category}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="default" size="sm" onClick={() => handleViewClick(service._id)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(service)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(service)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-4 py-4">
        <span className="text-sm text-gray-700">Page {servicePagination.currentPage} of {servicePagination.totalPages || 1}</span>
        <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={servicePagination.currentPage <= 1}>Previous</Button>
        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={servicePagination.currentPage >= servicePagination.totalPages}>Next</Button>
      </div>

      <AddServiceModal 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleCreateNew}
      />
      <ViewServiceModal 
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        product={selectedService}
        status={selectedServiceStatus}
      />
      <EditServiceModal 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentService(null);
        }}
        service={currentService}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{currentService?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
          <CategoryManager />
        </DialogContent>
      </Dialog>
      <Dialog open={isSubcategoryManagerOpen} onOpenChange={setIsSubcategoryManagerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Manage Subcategories</DialogTitle></DialogHeader>
          <SubcategoryManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}
