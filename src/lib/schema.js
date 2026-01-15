import * as z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().trim().nonempty("Password is required"),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(50, "Full name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces"),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .max(100, "Password must be less than 100 characters"),
});

export const sessionSchema = z.object({
  role: z.string().trim().nonempty("Role is required"),
  experience: z.string().nonempty("Experience is required"),
  topicsToFocus: z.string().trim().nonempty("Topics to focus is required"),
  description: z.string().trim().optional(),
});
