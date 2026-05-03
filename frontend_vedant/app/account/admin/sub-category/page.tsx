'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib//redux/store';
import {
  fetchSubcategories,
  addSubcategory,
  editSubcategory,
  removeSubcategory,
} from '@/lib/redux/slices/adminSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SubcategoryPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { subcategories, subcategoryStatus } = useSelector(
    (state: RootState) => state.admin
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchSubcategories());
  }, [dispatch]);

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim()) {
      dispatch(addSubcategory(newSubcategoryName.trim()));
      setNewSubcategoryName('');
      setIsAddDialogOpen(false);
    } else {
      toast.error('Subcategory name cannot be empty.');
    }
  };

  const handleEditSubcategory = () => {
    if (selectedSubcategory && selectedSubcategory.name.trim()) {
      dispatch(
        editSubcategory({
          id: selectedSubcategory._id,
          name: selectedSubcategory.name.trim(),
        })
      );
      setIsEditDialogOpen(false);
      setSelectedSubcategory(null);
    } else {
      toast.error('Subcategory name cannot be empty.');
    }
  };

  const handleDeleteSubcategory = () => {
    if (selectedSubcategory) {
      dispatch(removeSubcategory(selectedSubcategory._id));
      setIsDeleteDialogOpen(false);
      setSelectedSubcategory(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Subcategories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Subcategory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subcategory</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddSubcategory}>
                Save subcategory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subcategoryStatus === 'loading' && <p>Loading subcategories...</p>}

      {subcategoryStatus === 'succeeded' &&
        (subcategories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategories.map((subcategory) => (
                <TableRow key={subcategory._id}>
                  <TableCell>{subcategory.name}</TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={
                        isEditDialogOpen &&
                        selectedSubcategory?._id === subcategory._id
                      }
                      onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setIsEditDialogOpen(false);
                          setSelectedSubcategory(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Subcategory</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="edit-name"
                              className="text-right"
                            >
                              Name
                            </Label>
                            <Input
                              id="edit-name"
                              value={selectedSubcategory?.name || ''}
                              onChange={(e) =>
                                setSelectedSubcategory(
                                  selectedSubcategory
                                    ? {
                                        ...selectedSubcategory,
                                        name: e.target.value,
                                      }
                                    : null
                                )
                              }
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={handleEditSubcategory}
                          >
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={
                        isDeleteDialogOpen &&
                        selectedSubcategory?._id === subcategory._id
                      }
                      onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setIsDeleteDialogOpen(false);
                          setSelectedSubcategory(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently
                            delete the subcategory.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteSubcategory}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg mt-4">
            <h2 className="text-xl font-semibold">No Subcategories Found</h2>
            <p className="text-muted-foreground mt-2">
              Click the "Add Subcategory" button to create one.
            </p>
          </div>
        ))}
        
      {subcategoryStatus === 'failed' && (
        <p className="text-red-500">Failed to load subcategories.</p>
      )}
    </div>
  );
};

export default SubcategoryPage;