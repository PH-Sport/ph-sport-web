// src/content/config.ts
// Schema Zod de todas las Content Collections del proyecto.
// Es la fuente de verdad de los tipos de contenido.

import { defineCollection, z } from 'astro:content';

const players = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      name: z.string(),

      position: z.object({
        es: z.string(),
        en: z.string(),
      }),

      club: z.object({
        name: z.string(),
        country: z.string().optional(),
      }),

      photo: image(),

      // --- Opcionales: reservados para crecimiento futuro ---

      // true → aparece en la sección de highlights del hero o inicio
      featured: z.boolean().default(false),

      nationality: z.string().optional(),
      age: z.number().int().positive().optional(),

      social: z.object({
        instagram: z.string().url().optional(),
        twitter: z.string().url().optional(),
      }).optional(),
    }),
});

export const collections = { players };
