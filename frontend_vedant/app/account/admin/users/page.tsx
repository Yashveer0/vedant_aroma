"use client";
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchUsers, deleteUser, updateUser } from '@/lib/redux/slices/adminSlice';
import { EditUserModal } from '@/components/EditUserModal';
import { ViewUserModal } from '@/components/viewUserModal';
import { AdminUser } from '@/lib/api/admin';
import { Loader2, MessageCircle } from 'lucide-react'; // <-- IMPORT WHATSAPP ICON
import { toast } from 'sonner';

// --- NEW: Tooltip for better UX on icon buttons ---
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, userStatus, userPagination } = useSelector((state: RootState) => state.admin);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, name: debouncedSearchQuery }));
  }, [dispatch, currentPage, debouncedSearchQuery]);

  const handleEditClick = (user: AdminUser) => {
    setCurrentUser(user);
    setEditModalOpen(true);
  };

  const handleViewClick = (user: AdminUser) => {
    setCurrentUser(user);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (user: AdminUser) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!currentUser) return;

    setIsDeleting(true);
    try {
      await toast.promise(dispatch(deleteUser(currentUser._id)).unwrap(), {
          loading: 'Deleting user...',
          success: 'User deleted successfully!',
          error: 'Failed to delete user.',
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      setCurrentUser(null);
    }
  };
  
  const handleUpdateUser = async (userId: string, data: Partial<AdminUser>) => {
    await toast.promise(dispatch(updateUser({ userId, updates: data })).unwrap(), {
      loading: 'Updating user...',
      success: () => {
        setEditModalOpen(false);
        return 'User updated successfully!';
      },
      error: 'Failed to update user.',
    });
  };
  
  // --- NEW: Function to open WhatsApp chat ---
  const handleWhatsAppClick = (phone: string) => {
    // Basic cleanup: remove spaces, plus signs, etc. and assume Indian country code if not present.
    let formattedPhone = phone.replace(/[\s+()-]/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }
    
    if (formattedPhone) {
      window.open(`https://wa.me/${formattedPhone}`, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("No valid phone number found for this user.");
    }
  };

  const isLoading = userStatus === 'loading';

  return (
    // --- NEW: Wrap in TooltipProvider for the tooltips to work ---
    <TooltipProvider>
      <div>
        <h1 className="text-3xl font-bold mb-4">Users</h1>
        <div className="flex justify-between items-center mb-4 ">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm bg-white"
          />
        </div>

        {isLoading && (!users || users.length === 0) ? (
          <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="border bg-white shadow-md p-4 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Verified</TableHead> 
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? 'default' : 'destructive'}>
                            {user.isVerified ? 'Verified' : 'Not Verified'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2 flex items-center justify-end">
                           {/* --- NEW: WhatsApp Button with Tooltip --- */}
                           {user.phone && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleWhatsAppClick(user.phone!)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <MessageCircle className="h-6 w-6" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Chat on WhatsApp</p>
                              </TooltipContent>
                            </Tooltip>
                           )}

                          <Button variant="outline" size="sm" onClick={() => handleViewClick(user)}>View</Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(user)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={userPagination.currentPage === 1 || isLoading}>Previous</Button>
              <span>Page {userPagination.currentPage} of {userPagination.totalPages}</span>
              <Button onClick={() => setCurrentPage(p => p + 1)} disabled={userPagination.currentPage >= userPagination.totalPages || isLoading}>Next</Button>
            </div>
          </>
        )}

        {currentUser && <EditUserModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={currentUser} onSave={handleUpdateUser} />}
        {currentUser && <ViewUserModal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} user={currentUser} />}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user "{currentUser?.fullName}" and all their associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}