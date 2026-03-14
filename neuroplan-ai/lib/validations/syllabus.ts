import { z } from "zod";

// This is the blueprint for a single study unit
export const TopicSchema = z.object({
  title: z.string().min(2, "Title is too short").max(100),
  description: z.string().min(10, "Description needs more detail").max(500),
  difficulty: z.number().min(1).max(5), // 1 = Easy, 5 = Hard
});

// This is what we expect the AI to return (an array of topics)
export const SyllabusResponseSchema = z.object({
  subjects: z.array(TopicSchema),
});

// This creates a TypeScript type based on the schema
export type SyllabusData = z.infer<typeof SyllabusResponseSchema>;