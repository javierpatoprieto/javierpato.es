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

const proyectos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    client: z.string(),
    sector: z.string(),
    year: z.string().default('2026'),
    url: z.string(),
    summary: z.string(),
    services: z.array(z.string()).default([]),
    scope: z.enum(['branding', 'web']).default('web'),
    tone: z.enum(['rose', 'peri', 'plum']).default('rose'),
    shotDesktop: z.string(),
    shotMobile: z.string(),
    logo: z.string().optional(),
    brandingTitle: z.string().optional(),
    brandingText: z.string().optional(),
    order: z.number().default(0),
  }),
});

const landings = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),            // meta title (SEO)
    description: z.string(),      // meta description
    kicker: z.string(),          // eyebrow
    h1: z.string(),
    lead: z.string(),
    keyword: z.string(),
    intent: z.enum(['ciudad', 'sector']).default('sector'),
    stats: z.array(z.tuple([z.string(), z.string()])).default([]),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    related: z.array(z.string()).default([]),  // slugs de proyectos a destacar
    order: z.number().default(0),
  }),
});

export const collections = { blog, proyectos, landings };
