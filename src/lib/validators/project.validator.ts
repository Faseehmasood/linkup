import { z } from "zod";

export const createProjectValidator = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  status: z
    .enum(["active", "completed", "on-hold"])
    .default("active"),
  deadline: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  totalAmount: z
    .number()
    .min(0, "Amount cannot be negative"),
  currency: z
    .enum(["USD", "EUR", "GBP", "PKR"])
    .default("USD"),
  clientId: z
    .string()
    .min(1, "Client is required"),
});

export const updateProjectValidator = createProjectValidator.partial();

export type CreateProjectInput = z.infer<typeof createProjectValidator>;
export type UpdateProjectInput = z.infer<typeof updateProjectValidator>;