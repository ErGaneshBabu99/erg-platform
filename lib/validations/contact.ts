import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters"),
  email: z.string().email("Invalid email address").max(255),
  phone: z
    .string()
    .regex(/^(\+977)?[0-9]{9,10}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3).max(200),
  message: z.string().min(10, "Message too short").max(2000),
  type: z
    .enum([
      "GENERAL",
      "WORD_FORMAT",
      "EXCEL_FORMAT",
      "EDITABLE_FORMAT",
      "CUSTOM_REQUEST",
    ])
    .default("GENERAL"),
  districtRateId: z.string().cuid().optional(),
  honeypot: z.string().max(0).optional(), // Bot detection
});

export type ContactInput = z.infer<typeof contactSchema>;
