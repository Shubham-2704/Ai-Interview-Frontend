import * as z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().trim().nonempty("Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().nonempty("Full name is required"),
  email: z.email(),
  password: z.string().trim().nonempty("Password is required"),
});

export const sessionSchema = z.object({
  role: z.string().trim().nonempty("Role is required"),
  experience: z.string().nonempty("Experience is required"),
  topicsToFocus: z.string().trim().nonempty("Topics to focus is required"),
  description: z.string().trim().optional(),
});
