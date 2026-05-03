"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
// --- MODIFICATION: Import fetchCategories ---
import { fetchBlogs, deleteBlogPost, Blog } from '@/lib/redux/slices/blogSlice';
import { fetchCategories } from '@/lib/redux/slices/adminSlice'; // Import the action
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';

import { AddBlogModal } from '@/components/AddBlogModal';
import { EditBlogModal } from '@/components/admin/EditBlogModal';

const AdminBlogsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { posts, loading, totalPages, currentPage } = useSelector((state: RootState) => state.blog);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    // --- MODIFICATION: Fetch both blogs and categories on component mount ---
    dispatch(fetchBlogs({ page: 1, limit: 10 })); 
    dispatch(fetchCategories()); // Dispatch the action to get categories
  }, [dispatch]);
  
  const handleOpenEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditModalOpen(true);
  };

  const handleDelete = (blogId: string) => {
    dispatch(deleteBlogPost(blogId));
  };
  
  const handlePageChange = (page: number) => {
    dispatch(fetchBlogs({ page, limit: 10 }));
  };

  return (
    <div className="container mx-auto py-10">
      <AddBlogModal isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} />
      {selectedBlog && (
          <EditBlogModal 
            isOpen={isEditModalOpen} 
            setIsOpen={setIsEditModalOpen} 
            blog={selectedBlog} 
          />
      )}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Blog
        </Button>
      </div>
      
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-24">Loading posts...</TableCell></TableRow>
            ) : posts.length > 0 ? (
              posts.map((blog: Blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <Image src={blog.featuredImage} alt={blog.title} width={60} height={40} className="rounded object-cover aspect-[3/2]" />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(blog.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditModal(blog)}>
                            <Edit className="mr-2 h-4 w-4" /> 
                            <span>Edit</span>
                          </DropdownMenuItem>
                          
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                              <Trash2 className="mr-2 h-4 w-4" /> 
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog post titled "{blog.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(blog._id)} 
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Yes, delete it
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center h-24">No blog posts found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => handlePageChange(page)}
            >
                {page}
            </Button>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogsPage;