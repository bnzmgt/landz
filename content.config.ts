import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
    collections: {
        products: defineCollection({
            type: "page",
            source: "products/*.md",

            schema: z.object({
                title: z.string(),
                slug: z.string(),
                price: z.string(),
                image: z.string(),
                affiliate: z.string(),
                category: z.string(),
                rating: z.number().optional(),
                brand: z.string().optional(),
            }),
        }),

        categories: defineCollection({
            type: "page",
            source: "categories/*.md",
            schema: z.object({
                title: z.string(),
                slug: z.string(),
                description: z.string(),
                image: z.string(),
                count: z.number(),
            }),
        }),

        reviews: defineCollection({
            type: "page",
            source: "reviews/*.md",
        }),

        articles: defineCollection({
            type: "page",
            source: "articles/*.md",
            schema: z.object({
                title: z.string(),
                slug: z.string(),
                description: z.string().optional(),
                image: z.string().optional(),
                date: z.string(),
                author: z.string(),
                category: z.string(),
                tags: z.array(z.string()).optional(),
                isFeatured: z.boolean().optional(),
            }),
        }),
    },
});
