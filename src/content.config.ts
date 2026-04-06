import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const strOrArr = z.union([z.string(), z.array(z.string())])
  .transform(v => Array.isArray(v) ? v.join(', ') : v);

const buceo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/buceo' }),
  schema: z.object({
    title: z.string(),
    type: z.string().optional().default('destino-buceo'),
    region: z.string().optional().default(''),
    pais: z.string().optional().default(''),
    puntos_inmersion_principales: z.array(z.string()).optional().default([]),
    profundidad_min: z.coerce.number().optional().default(0),
    profundidad_max: z.coerce.number().optional().default(0),
    visibilidad_media: z.string().optional().default(''),
    temperatura_agua_min: z.coerce.number().optional().default(0),
    temperatura_agua_max: z.coerce.number().optional().default(0),
    corrientes: z.string().optional().default(''),
    temporada_alta: strOrArr.optional().default(''),
    temporada_baja: strOrArr.optional().default(''),
    certificacion_minima: z.string().optional().default('OW'),
    vida_marina_destacada: z.array(z.string()).optional().default([]),
    liveaboards_disponibles: z.array(z.string()).optional().default([]),
    centros_buceo_recomendados: z.array(z.string()).optional().default([]),
    proveedores_scibasku: z.array(z.string()).optional().default([]),
    precio_semana_aprox: z.string().optional().default(''),
    giora_estuvo: z.boolean().optional().default(false),
    updated: z.union([z.string(), z.date()])
      .transform(v => v instanceof Date ? v.toISOString().split('T')[0] : v)
      .optional().default(''),
    status: z.enum(['draft', 'review', 'published']).optional().default('draft'),
    tags: z.array(z.string()).optional().default([]),
  }).passthrough(), // allow extra fields from old-format fichas
});

export const collections = { buceo };
