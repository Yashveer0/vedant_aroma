'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
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

const CategoryPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { categories, categoryStatus } = useSelector(
    (state: RootState) => state.admin
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{
    _id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      dispatch(addCategory(newCategoryName.trim()));
      setNewCategoryName('');
      setIsAddDialogOpen(false);
    } else {
      toast.error('Category name cannot be empty.');
    }
  };

  const handleEditCategory = () => {
    if (selectedCategory && selectedCategory.name.trim()) {
      dispatch(
        editCategory({ id: selectedCategory._id, name: selectedCategory.name.trim() })
      );
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    } else {
      toast.error('Category name cannot be empty.');
    }
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      dispatch(removeCategory(selectedCategory._id));
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCategory}>
                Save category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {categoryStatus === 'loading' && <p>Loading categories...</p>}
      {categoryStatus === 'succeeded' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={isEditDialogOpen && selectedCategory?._id === category._id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setIsEditDialogOpen(false);
                        setSelectedCategory(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="edit-name"
                            value={selectedCategory?.name || ''}
                            onChange={(e) =>
                              setSelectedCategory(
                                selectedCategory
                                  ? { ...selectedCategory, name: e.target.value }
                                  : null
                              )
                            }
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleEditCategory}>
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={isDeleteDialogOpen && selectedCategory?._id === category._id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setIsDeleteDialogOpen(false);
                        setSelectedCategory(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category);
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
                          This action cannot be undone. This will permanently delete the
                          category.
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
                          onClick={handleDeleteCategory}
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
      )}
      {categoryStatus === 'failed' && (
        <p className="text-red-500">Failed to load categories.</p>
      )}
    </div>
  );
};

export default CategoryPage;