import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long." })
    .max(100, { message: "Title cannot be longer than 100 characters." }),
  
  excerpt: z
    .string()
    .min(20, { message: "Excerpt must be at least 20 characters long." })
    .max(200, { message: "Excerpt cannot be longer than 200 characters." }),
    
  content: z
    .string()
    .min(50, { message: "Content is too short. Please write at least 50 characters." }),
  
  category: z
    .string()
    .min(1, { message: "Please select a category." }),
    
  tags: z
    .string()
    .optional(),
    
  status: z
    .enum(["published", "draft"], { required_error: "Please select a status." }),
    
  featuredImage: z
    .any()
    .refine((files) => files?.length >= 1, "Featured image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});


export const editBlogFormSchema = blogFormSchema.extend({
  featuredImage: z 
    .any()
    .optional()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
export type EditBlogFormValues = z.infer<typeof editBlogFormSchema>;