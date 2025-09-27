import { z } from "zod";

export const CourseCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(100, "Title must be at most 100 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long").max(1000, "Description must be at most 1000 characters long"),
  fileKey : z.string().min(1),
  price : z.number().min(1, "Price must be at least 1"),
  duration : z.number().min(1, "Duration must be at least 1 hour").max(500, "Duration must be at most 500 hours"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  category: z.string().min(3, "Category must be at least 3 characters long").max(50, "Category must be at most 50 characters long"),
  smallDescription: z.string().min(20, "Small description must be at least 20 characters long").max(200, "Small description must be at most 200 characters long"),
  slug : z.string().min(3),
  status : z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});


export type CourseCreateInput = z.infer<typeof CourseCreateSchema>;