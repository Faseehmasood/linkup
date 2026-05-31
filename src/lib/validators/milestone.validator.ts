import { z } from "zod";

export const createMilestoneValidator = z.object({
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
  amount: z
    .number()
    .min(0, "Amount cannot be negative"),
  dueDate: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  projectId: z
    .string()
    .min(1, "Project is required"),
});

export const updateMilestoneValidator = createMilestoneValidator
  .partial()
  .omit({ projectId: true });

export const completeMilestoneValidator = z.object({
  status: z.enum(["pending", "in-progress", "completed"]),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneValidator>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneValidator>;
export type CompleteMilestoneInput = z.infer<typeof completeMilestoneValidator>;