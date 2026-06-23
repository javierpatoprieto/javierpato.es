import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    keyword: z.string(),
    tags: z.array(z.string()).default([]),
    tone: z.enum(['warm', 'stone', 'deep']).default('warm'),
    emoji: z.string().default('✦'),
    cover: z.string(),
    read: z.string().default('5 min'),
  }),
});

export const collections = { blog };
