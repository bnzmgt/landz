import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const getSitemapUrls = async (): Promise<string[]> => {
    const base = process.cwd();

    const productsDir = join(base, "content/products");
    const categoriesDir = join(base, "content/categories");

    const [products, categories] = await Promise.all([readdir(productsDir), readdir(categoriesDir)]);

    return [
        "/",
        ...products.filter(f => f.endsWith(".md")).map(f => `/products/${f.replace(".md", "")}`),

        ...categories.filter(f => f.endsWith(".md")).map(f => `/categories/${f.replace(".md", "")}`),
    ];
};
