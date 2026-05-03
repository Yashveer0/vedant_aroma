"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editBlogFormSchema, EditBlogFormValues } from '@/lib/validators/blog';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { updateBlogPost } from '@/lib/redux/slices/blogSlice';
import { Blog } from '@/lib/redux/slices/blogSlice';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { 
    ssr: false,
    loading: () => <div className="min-h-[250px] w-full rounded-md border border-input bg-background animate-pulse" />,
});

interface EditBlogFormProps {
  initialData: Blog;
  onSuccess: () => void;
}

export const EditBlogForm = ({ initialData, onSuccess }: EditBlogFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const form = useForm<EditBlogFormValues>({
    resolver: zodResolver(editBlogFormSchema),
    defaultValues: {
      title: initialData.title || '',
      excerpt: initialData.excerpt || '',
      content: initialData.content || '',
      category: initialData.category || '',
      tags: initialData.tags?.join(', ') || '',
      status: initialData.status || 'draft',
      featuredImage: undefined, 
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: EditBlogFormValues) => {
    const formData = new FormData();
    
    formData.append('title', values.title);
    formData.append('excerpt', values.excerpt);
    formData.append('content', values.content);
    formData.append('category', values.category);
    formData.append('status', values.status);
    formData.append('tags', values.tags || '');
    console.log("FormData content:");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ', pair[1]);
  }
    if (values.featuredImage && values.featuredImage.length > 0) {
      formData.append('featuredImage', values.featuredImage[0]);
    }

    const result = await dispatch(updateBlogPost({ blogId: initialData._id, formData }));
    
    if (updateBlogPost.fulfilled.match(result)) {
      onSuccess(); 
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="title" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Blog post title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="category" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Personal Care">Personal Care</SelectItem>
                  <SelectItem value="Wellness">Wellness</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Company News">Company News</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <FormField name="excerpt" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt (Short Summary)</FormLabel>
            <FormControl><Textarea placeholder="A brief summary..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField name="content" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <RichTextEditor content={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField name="tags" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl><Input placeholder="e.g., skincare, wellness" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="status" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <div className="flex items-end gap-6">
            <div className="flex-shrink-0">
                <FormLabel>Current Image</FormLabel>
                <Image src={initialData.featuredImage} alt="Current image" width={100} height={75} className="rounded object-cover mt-2" />
            </div>
            <FormField name="featuredImage" control={form.control} render={({ field: { onChange, value, ...rest }}) => (
                <FormItem className="flex-1">
                    <FormLabel>Change Featured Image (Optional)</FormLabel>
                    <FormControl><Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                    </>
                ) : 'Update Post'}
            </Button>
        </div>
      </form>
    </Form>
  );
};