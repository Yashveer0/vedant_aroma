"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { 
    fetchSubcategories, 
    addSubcategory, 
    editSubcategory, 
    removeSubcategory 
} from '@/lib/redux/slices/adminSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash, Edit, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const SubcategoryManager = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { subcategories, subcategoryStatus } = useSelector((state: RootState) => state.admin);

    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        if (subcategoryStatus === 'idle') {
            dispatch(fetchSubcategories());
        }
    }, [subcategoryStatus, dispatch]);

    const handleAdd = () => {
        if (!newSubcategoryName.trim()) {
            toast.error("Subcategory name cannot be empty.");
            return;
        }
        dispatch(addSubcategory(newSubcategoryName.trim()));
        setNewSubcategoryName('');
    };

    const handleEditStart = (id: string, name: string) => {
        setEditingId(id);
        setEditingName(name);
    };

    const handleEditSave = () => {
        if (!editingId || !editingName.trim()) return;
        dispatch(editSubcategory({ id: editingId, name: editingName.trim() }));
        setEditingId(null);
        setEditingName('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleRemove = (id: string) => {
        dispatch(removeSubcategory(id));
    };

    return (
        <div className="p-1">
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="New subcategory name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd}>Add</Button>
            </div>
            <div className="max-h-80 overflow-y-auto pr-2">
                {subcategoryStatus === 'loading' && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                
                {subcategoryStatus === 'succeeded' && subcategories.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No subcategories found.</p>
                )}

                {subcategoryStatus === 'succeeded' && (
                    <ul className="space-y-2">
                        {subcategories.map(sub => (
                            <li key={sub._id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                                {editingId === sub._id ? (
                                    <Input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                        className="h-8"
                                    />
                                ) : (
                                    <span className="font-medium text-sm">{sub.name}</span>
                                )}
                                <div className="flex items-center gap-1">
                                    {editingId === sub._id ? (
                                        <>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleEditSave}><Check size={16} /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleEditCancel}><X size={16} /></Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditStart(sub._id, sub.name)}><Edit size={16} /></Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleRemove(sub._id)}><Trash size={16} /></Button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};