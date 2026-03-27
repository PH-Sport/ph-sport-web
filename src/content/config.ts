// src/content/config.ts
// Schema Zod de todas las Content Collections del proyecto.
// Es la fuente de verdad de los tipos de contenido.

import { defineCollection, z } from 'astro:content';

const players = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      name: z.string(),

      club: z.object({
        name: z.string(),
        country: z.string().optional(),
      }),

      photo: image(),

      // --- Opcionales: reservados para crecimiento futuro ---

      // true → aparece en la sección de highlights del hero o inicio
      featured: z.boolean().default(false),

      /** player | coach — agrupa la grid en /jugadores/ */
      role: z.enum(['player', 'coach']).default('player'),

      /**
       * ISO 3166-1 alpha-2 (0–2 banderas): selección / federación internacional, no nacionalidad civil.
       */
      nationalTeamCodes: z
        .array(z.string().length(2))
        .max(2)
        .transform((codes) => codes.map((c) => c.toUpperCase()))
        .optional(),
      age: z.number().int().positive().optional(),

      social: z.object({
        instagram: z.string().url().optional(),
        twitter: z.string().url().optional(),
      }).optional(),
    }),
});

export const collections = { players };
