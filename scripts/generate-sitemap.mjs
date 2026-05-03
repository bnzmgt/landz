import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";

const baseUrl = "https://dotuquonline.com";

const withSlash = path => {
    if (path === "/") return path;
    return path.endsWith("/") ? path : path + "/";
};

const getFiles = async dir => {
    const files = await readdir(dir);
    return files.filter(f => f.endsWith(".md"));
};

const generate = async () => {
    const root = process.cwd();

    const productsDir = join(root, "content/products");
    const categoriesDir = join(root, "content/categories");

    const [products, categories] = await Promise.all([getFiles(productsDir), getFiles(categoriesDir)]);

    const lastmod = new Date().toISOString();

    const urls = [
        {
            loc: "/",
            priority: "1.0",
        },

        ...products.map(f => ({
            loc: `/products/${f.replace(".md", "")}/`,
            priority: "0.8",
        })),

        ...categories.map(f => ({
            loc: `/categories/${f.replace(".md", "")}/`,
            priority: "0.7",
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        u => `
  <url>
    <loc>${baseUrl}${withSlash(u.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

    const outputPath = join(root, "public/sitemap.xml");

    await writeFile(outputPath, xml);

    console.log("✅ sitemap.xml generated");
};

generate();
