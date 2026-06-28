import { z } from "zod";

export const promptFormSchema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок").max(200),
  content: z.string().trim().min(1, "Укажите содержание").max(10000),
  isPublic: z.boolean(),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["popular", "recent"]).default("recent"),
});
