"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, Coupon } from '@/lib/redux/slices/couponSlice';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit, PlusCircle } from 'lucide-react';

// The AddEditCouponModal component is perfect and needs no changes.
interface AddEditCouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Coupon>) => Promise<void>;
    coupon: Coupon | null;
}

function AddEditCouponModal({ isOpen, onClose, onSave, coupon }: AddEditCouponModalProps) {
    const [code, setCode] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = !!coupon;

    useEffect(() => {
        if (isOpen) { // Only update state when the modal opens
            if (isEditMode && coupon) {
                setCode(coupon.code);
                setDiscountPercentage(coupon.discountPercentage);
                setStatus(coupon.status);
            } else {
                setCode('');
                setDiscountPercentage(0);
                setStatus('active');
            }
        }
    }, [coupon, isEditMode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const couponData: Partial<Coupon> = { code, discountPercentage, status };
        if (isEditMode && coupon) {
            couponData._id = coupon._id;
        }
        await onSave(couponData);
        // Don't reset state here; let the parent's successful save close the modal.
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? `Edit Coupon: ${coupon?.code}` : 'Add New Coupon'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4 space-y-4">
                        <div><Label htmlFor="code">Coupon Code</Label><Input id="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required disabled={isSubmitting || isEditMode} /></div>
                        <div><Label htmlFor="discount">Discount (%)</Label><Input id="discount" type="number" min="1" max="100" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} required disabled={isSubmitting} /></div>
                        <div><Label>Status</Label><Select value={status} onValueChange={(v: 'active' | 'inactive') => setStatus(v)} disabled={isSubmitting}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


export default function CouponAdminPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { coupons, status, error } = useSelector((state: RootState) => state.coupon);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
    const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');

    // --- IMPROVEMENT: Combined useEffect for fetching data ---
    // This single effect handles both the initial load and filter changes.
    useEffect(() => {
        const filter = statusFilter === 'All' ? undefined : statusFilter;
        dispatch(fetchCoupons(filter));
    }, [statusFilter, dispatch]);

    const handleAddClick = () => {
        setCurrentCoupon(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (coupon: Coupon) => {
        setCurrentCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (coupon: Coupon) => {
        setCurrentCoupon(coupon);
        setIsDeleteOpen(true);
    };

    // This function is already correct.
    const handleSave = async (couponData: Partial<Coupon>) => {
        try {
            if (currentCoupon) { // Edit mode
                await dispatch(updateCoupon({ couponId: currentCoupon._id, couponData })).unwrap();
            } else { // Add mode
                await dispatch(createCoupon({ code: couponData.code!, discountPercentage: couponData.discountPercentage! })).unwrap();
            }
            setIsModalOpen(false); // Close modal only on success
        } catch (err) {
            // The slice handles the error toast, so we just log it here for debugging.
            console.error("Failed to save coupon:", err);
        }
    };
    
    // --- FIX: Added .unwrap() to the delete dispatch ---
    const handleDeleteConfirm = async () => {
        if (!currentCoupon) return;
        try {
            // .unwrap() will ensure that if the API fails, the catch block is executed.
            await dispatch(deleteCoupon(currentCoupon._id)).unwrap();
            setIsDeleteOpen(false);
        } catch (err) {
            // The slice handles the toast, this is just for debugging.
            console.error("Failed to delete coupon:", err);
        }
    };

    if (status === 'loading') return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    // No need to show a top-level error, as the slice handles it with a toast.
    // if (status === 'failed') return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Manage Coupons</h1>
                    <div className="w-[180px]">
                        <Select value={statusFilter} onValueChange={(value: 'All' | 'active' | 'inactive') => setStatusFilter(value)}>
                            <SelectTrigger id="status-filter" className='bg-white'>
                                <SelectValue placeholder="Filter by status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length > 0 ? coupons.map((coupon) => (
                            <TableRow key={coupon._id}>
                                <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                                <TableCell>{coupon.discountPercentage}%</TableCell>
                                <TableCell><Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>{coupon.status}</Badge></TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(coupon)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(coupon)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No coupons found for the selected filter.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddEditCouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} coupon={currentCoupon} />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete the coupon "{currentCoupon?.code}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}