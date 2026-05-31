import { z } from "zod";

export const registerValidator = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password cannot exceed 32 characters"),
});

export const loginValidator = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const updateProfileValidator = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .trim()
    .optional(),
  wise: z
    .string()
    .email("Invalid Wise email")
    .optional(),
  payoneer: z
    .string()
    .email("Invalid Payoneer email")
    .optional(),
  avatar: z
    .string()
    .url("Invalid avatar URL")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerValidator>;
export type LoginInput = z.infer<typeof loginValidator>;
export type UpdateProfileInput = z.infer<typeof updateProfileValidator>;