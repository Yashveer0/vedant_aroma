// src/components/CategoryManager.tsx

"use client";

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { addCategory, editCategory, removeCategory } from '@/lib/redux/slices/adminSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export function CategoryManager() {
    const dispatch = useDispatch<AppDispatch>();
    const { categories, categoryStatus } = useSelector((state: RootState) => state.admin);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name cannot be empty.");
            return;
        }
        setIsAdding(true);
        try {
            await dispatch(addCategory(newCategoryName.trim())).unwrap();
            setNewCategoryName("");
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditClick = (category: { _id: string, name: string }) => {
        setEditingCategoryId(category._id);
        setEditingCategoryName(category.name);
    };

    const handleSaveEdit = async () => {
        if (!editingCategoryId || !editingCategoryName.trim()) return;
        await dispatch(editCategory({ id: editingCategoryId, name: editingCategoryName.trim() }));
        setEditingCategoryId(null);
    };

    const handleDelete = (id: string) => {
        dispatch(removeCategory(id));
    };

    if (categoryStatus === 'loading') {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Enter new category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isAdding}
                />
                <Button onClick={handleAddCategory} disabled={isAdding}>
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {categories.length === 0 && <p className="text-sm text-center text-muted-foreground">No categories found.</p>}
                {categories.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between p-2 border rounded-md">
                        {editingCategoryId === cat._id ? (
                            <Input
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="h-8"
                            />
                        ) : (
                            <span className="font-medium">{cat.name}</span>
                        )}

                        <div className="flex gap-1">
                            {editingCategoryId === cat._id ? (
                                <>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}><Save className="h-4 w-4 text-green-600" /></Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCategoryId(null)}><X className="h-4 w-4" /></Button>
                                </>
                            ) : (
                                <>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(cat)}><Edit className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                            <AlertDialogDescription>This will delete the "{cat.name}" category.</AlertDialogDescription>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(cat._id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}