import { z } from "zod";

export const createDistrictRateSchema = z.object({
  districtId: z.string().cuid(),
  fiscalYearId: z.string().cuid(),
  pdfUrl: z.string().url("Invalid PDF URL"),
  pdfSize: z.number().int().positive().optional(),
  pdfPages: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const updateDistrictRateSchema = createDistrictRateSchema.partial();

export const searchDistrictRateSchema = z.object({
  q: z.string().max(100).optional(),
  province: z.string().optional(),
  fiscalYear: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(["newest", "oldest", "downloads", "name"]).default("newest"),
});

export type CreateDistrictRateInput = z.infer<typeof createDistrictRateSchema>;
export type UpdateDistrictRateInput = z.infer<typeof updateDistrictRateSchema>;
export type SearchDistrictRateInput = z.infer<typeof searchDistrictRateSchema>;
