"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { 
  fetchProducts, 
  deleteProduct, 
  createProduct, 
  fetchProductById, 
  fetchCategories, 
  fetchSubcategories 
} from '@/lib/redux/slices/adminSlice';
import { ViewProductModal } from '@/components/ViewProductModal';
import { Product } from '@/lib/types/product';
import { EditProductModal } from '@/components/EditProductModal';
import { AddProductModal } from '@/components/AddProductModal';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryManager } from '@/components/CategoryManager';
import { SubcategoryManager } from '@/components/SubcategoryManager';

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, error, status, selectedProduct, selectedProductStatus, productPagination } = useSelector((state: RootState) => state.admin);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSubcategoryManagerOpen, setIsSubcategoryManagerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit: 10, type:"product" }));
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [currentPage, dispatch]);
  
  const handleCreateNew = async (formData: FormData) => {
    const promise = dispatch(createProduct(formData)).unwrap();
    toast.promise(promise, {
        loading: 'Creating product...',
        success: (newProduct) => {
            setIsAddDialogOpen(false);
            dispatch(fetchProducts({ page: currentPage, limit: 10,type:"product" }));
            return `Product "${newProduct.name}" created!`;
        },
        error: (err) => err || 'Failed to create product.'
    });
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchProducts({ page: currentPage, limit: 10,type:"product" }));
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentProduct?._id) return;
    setIsDeleting(true);
    const promise = dispatch(deleteProduct(currentProduct._id)).unwrap();

    toast.promise(promise, {
        loading: 'Deleting product...',
        success: () => {
            setIsDeleteDialogOpen(false);
            setIsDeleting(false);
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                dispatch(fetchProducts({ page: currentPage, limit: 10,type:"product" }));
            }
            return `Product "${currentProduct.name}" deleted.`;
        },
        error: (err) => {
            setIsDeleting(false);
            return err || 'Failed to delete product.';
        }
    });
  };
  
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (productId: string | undefined) => {
    if (!productId) return;
    dispatch(fetchProductById(productId));
    setIsViewDialogOpen(true);
  };

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, productPagination.totalPages));
  
  if (status === 'loading' && products.length === 0) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (status === 'failed') return <div className="p-8 text-red-600">Error fetching data: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className='flex items-center gap-2'>
          {/* <Button variant="outline" onClick={() => setIsSubcategoryManagerOpen(true)}>Manage Subcategories</Button> */}
          {/* <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)}>Manage Categories</Button> */}
          <Button onClick={() => setIsAddDialogOpen(true)}>Add New Product</Button>
        </div>
      </div>

      <div className='bg-white p-4 rounded-md shadow-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isVariable = (product.variants?.length ?? 0) > 0;
              const sellingPrice = product.sale_price ?? product.price ?? 0;
              const originalPrice = product.price ?? 0;
              const displayStock = product.stock_quantity ?? 0;
              
              return (
                <TableRow key={product._id}>
                  <TableCell><Image src={product.images[0] || '/placeholder.svg'} alt={product.name} width={48} height={48} className="object-cover rounded-md" /></TableCell>
                  <TableCell className="font-medium"><Tooltip><TooltipTrigger><p className="max-w-[250px] truncate">{product.name}</p></TooltipTrigger><TooltipContent><p>{product.name}</p></TooltipContent></Tooltip></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{isVariable ? `Starts at ₹${sellingPrice.toLocaleString()}` : `₹${sellingPrice.toLocaleString()}`}</span>
                      {product.sale_price && (<span className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>)}
                    </div>
                  </TableCell>
                  <TableCell>{isVariable ? `${displayStock} (in variants)` : displayStock}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="default" size="sm" onClick={() => handleViewClick(product._id)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-4 py-4">
        <span className="text-sm text-gray-700">Page {productPagination.currentPage} of {productPagination.totalPages || 1}</span>
        <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={!productPagination || productPagination.currentPage <= 1}>Previous</Button>
        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!productPagination || productPagination.currentPage >= productPagination.totalPages}>Next</Button>
      </div>

      <AddProductModal 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleCreateNew}
      />
      <ViewProductModal 
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        product={selectedProduct}
        status={selectedProductStatus}
      />
      
      <EditProductModal 
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCurrentProduct(null);
        }}
        product={currentProduct}
        onUpdateSuccess={handleUpdateSuccess}
      />

<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{currentProduct?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteConfirm}>
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>{/* ... */}</Dialog>
      <Dialog open={isSubcategoryManagerOpen} onOpenChange={setIsSubcategoryManagerOpen}>{/* ... */}</Dialog>
    </div>
  );
}