import { z } from "zod";

export const createClientValidator = z.object({
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
  company: z
    .string()
    .max(350, "Company name cannot exceed 350 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .min(10, "Invalid phone number")
    .max(15, "Invalid phone number")
    .optional(),
});

export const updateClientValidator = createClientValidator.partial();

export const inviteClientValidator = z.object({
  clientId: z
    .string()
    .min(1, "Client ID is required"),
});

export const verifyMagicLinkValidator = z.object({
  token: z
    .string()
    .min(1, "Token is required"),
});

export type CreateClientInput = z.infer<typeof createClientValidator>;
export type UpdateClientInput = z.infer<typeof updateClientValidator>;
export type InviteClientInput = z.infer<typeof inviteClientValidator>;
export type VerifyMagicLinkInput = z.infer<typeof verifyMagicLinkValidator>;