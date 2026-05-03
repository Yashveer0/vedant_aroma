"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { PackageOpen, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllBulkOrders, updateBulkOrder, deleteBulkOrder, BulkOrder } from "@/lib/redux/slices/bulkOrderSlice"

export default function AdminBulkOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // --- THE FIX IS HERE ---
  // The slice is named 'bulkOrders' (plural), so the selector must match.
  const { inquiries, status, error, currentPage, totalPages } = useSelector(
    (state: RootState) => state.bulkOrder // Changed from state.bulkOrder
  );
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllBulkOrders({ page }));
  }, [dispatch, page]);

  const handleStatusChange = async (inquiryId: string, newStatus: BulkOrder['status']) => {
    setUpdatingId(inquiryId);
    try {
      await dispatch(updateBulkOrder({ inquiryId, status: newStatus })).unwrap();
      toast({ title: "Status Updated" });
    } catch (err: any) {
      toast({ title: "Update Failed", description: String(err), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    try {
      await dispatch(deleteBulkOrder(inquiryId)).unwrap();
      toast({ title: "Inquiry Deleted" });
    } catch (err: any) {
      toast({ title: "Deletion Failed", description: String(err), variant: "destructive" });
    }
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (totalPages) {
        setPage((prev) => Math.min(totalPages, prev + 1));
    }
  };
  
  const renderTableContent = () => {
    // This check is important and now it will work correctly
    if (!Array.isArray(inquiries)) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="text-center">
                    Waiting for data...
                </TableCell>
            </TableRow>
        );
    }
    return inquiries.map((inquiry) => (
      <TableRow key={inquiry._id}>
        <TableCell>
            <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                <Image 
                    src={(inquiry.product?.images && inquiry.product.images.length > 0) ? inquiry.product.images[0] : '/placeholder.svg'} 
                    alt={inquiry.product?.name || 'Product image'} 
                    fill 
                    className="object-cover"
                />
            </div>
            <span className="font-medium truncate max-w-[150px]" title={inquiry.product?.name}>
                {inquiry.product?.name || 'Product Not Found'}
            </span>
            </div>
        </TableCell>
        <TableCell>
            <div className="font-medium">{inquiry.name}</div>
            <div className="text-sm text-gray-500">{inquiry.email}</div>
            <div className="text-sm text-gray-500">{inquiry.phone}</div>
        </TableCell>
        <TableCell className="text-center font-semibold text-lg">{inquiry.quantity}</TableCell>
        <TableCell className="max-w-[200px] truncate text-sm text-gray-600" title={inquiry.message}>
            {inquiry.message || 'N/A'}
        </TableCell>
        <TableCell>
            {updatingId === inquiry._id ? (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
            </div>
            ) : (
            <Select
                value={inquiry.status}
                onValueChange={(newStatus: BulkOrder['status']) => handleStatusChange(inquiry._id, newStatus)}
            >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            )}
        </TableCell>
        <TableCell className="text-right">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4"/>
                </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete the inquiry from "{inquiry.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                    onClick={() => handleDelete(inquiry._id)}
                    className="bg-red-600 hover:bg-red-700"
                    >
                    Yes, delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif">Bulk Order Inquiries</h1>
        <p className="text-gray-600 mt-1">Manage and track all bulk order requests from customers.</p>
      </div>

      {status === 'loading' && <div className="text-center py-10"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" /></div>}
      {status === 'failed' && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {status === 'succeeded' && (
        <div className="bg-white border rounded-lg shadow-sm">
          {inquiries && inquiries.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
                <PackageOpen className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">No Inquiries Found</h3>
                <p>New bulk order inquiries will appear here.</p>
            </div>
          ) : (
            <>
              <Table>
                 <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Product</TableHead>
                        <TableHead>Requester Info</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[180px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {renderTableContent()}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-4 border-t">
                <span className="text-sm text-gray-600">
                  Page {currentPage || 1} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm" onClick={handlePrevPage}
                    disabled={!currentPage || currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline" size="sm" onClick={handleNextPage}
                    disabled={!totalPages || !currentPage || currentPage >= totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}