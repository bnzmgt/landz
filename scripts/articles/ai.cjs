require("dotenv").config();

const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateArticle(keyword, category) {
    const response = await client.chat.completions.create({
        model: process.env.OPENROUTER_MODEL,
        max_tokens: 1200,
        temperature: 0.7,
        messages: [
            {
                role: "system",
                content: `
Kamu adalah penulis SEO affiliate Indonesia.

Tugas:
- Buat artikel SEO bahasa Indonesia.
- Relevan dengan kategori yang diberikan.
- Gunakan markdown.
- Soft selling.
- Jangan hard selling.
- Minimal 600 kata.

Struktur artikel:

# Judul

Paragraf pembuka

## Pembahasan

## Tips

## Rekomendasi Produk

## Kesimpulan

Penting:
- Jangan output JSON.
- Jangan output penjelasan tambahan.
- Jangan output code block.
- Hanya markdown.
                `,
            },
            {
                role: "user",
                content: `
Keyword: ${keyword}
Category: ${category}

Buat artikel SEO affiliate yang natural dan mudah dibaca.
                `,
            },
        ],
    });

    const markdown = response.choices[0].message.content;

    fs.writeFileSync("./tmp-ai-response.txt", markdown);

    console.log("\nAI RESPONSE:\n");
    console.log(markdown);

    return {
        title: keyword,
        excerpt: "",
        keywords: [keyword],
        relatedProducts: [],
        content: markdown,
    };
}

module.exports = {
    generateArticle,
};
