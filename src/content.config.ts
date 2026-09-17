import { defineCollection } from "astro:content";

import { glob } from "astro/loaders";

import { z } from 'astro/zod';

const work = defineCollection({
    loader: glob({pattern: "src/content/work/*.md"}),
    schema: ({image}) => z.object({
        title: z.string().max(50),
        slug: z.string().max(50),
        link: z.url().optional(),
        github: z.url().optional(),
        image: image(),
        image2: image().optional(),
        image3: image().optional(),
        image4: image().optional(),
        image5: image().optional(),
        image6: image().optional(),
        type: z.enum(['website', 'app', 'experiment']),
        description: z.string().max(350),
        year: z.string().max(20),
        stack: z.array(z.enum(['Astro', 'Laravel', 'Svelte', 'HTML/CSS/JavaScript', 'Inertia.js'])),
    })
})

export const collections = { work };