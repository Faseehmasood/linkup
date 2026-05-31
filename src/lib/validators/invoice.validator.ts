import { z } from "zod";

export const createInvoiceValidator = z.object({
  projectId: z
    .string()
    .min(1, "Project is required"),
  milestoneIds: z
    .array(z.string())
    .min(1, "At least one milestone is required"),
  amount: z
    .number()
    .min(0, "Amount cannot be negative"),
  currency: z
    .enum(["USD", "EUR", "GBP", "PKR"])
    .default("USD"),
  dueDate: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  wiseEmail: z
    .string()
    .email("Invalid Wise email")
    .optional(),
  payoneerEmail: z
    .string()
    .email("Invalid Payoneer email")
    .optional(),
});

export const updateInvoiceStatusValidator = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

export const sendInvoiceValidator = z.object({
  invoiceId: z
    .string()
    .min(1, "Invoice ID is required"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceValidator>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusValidator>;
export type SendInvoiceInput = z.infer<typeof sendInvoiceValidator>;