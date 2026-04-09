import { getSitemapUrls } from "../utils/sitemap";

export default defineEventHandler(async event => {
    const urls = await getSitemapUrls();

    const base = "https://dotuquonline.com";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        url => `
  <url>
    <loc>${base}${url}</loc>
  </url>`
    )
    .join("")}
</urlset>`;

    event.node.res.setHeader("Content-Type", "application/xml");
    return xml;
});
