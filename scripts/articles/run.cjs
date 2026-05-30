const { getTrends } = require("./trends.cjs");
const { detectCategory } = require("./category.cjs");
// const { generateTitle } = require("./title.cjs");
// const { rewrite } = require("./rewrite.cjs");
const { generateMarkdown } = require("./generate.cjs");
const { saveArticle } = require("./save.cjs");
const { generateArticle } = require("./ai.cjs");

const keyword = process.argv[2];

if (!keyword) {
    console.log("Keyword required");
    process.exit(1);
}

async function main() {
    console.log(`Searching trends for: ${keyword}`);

    const trends = await getTrends(keyword);

    console.log(trends);

    const trendKeyword = trends[0] || keyword;

    const category = detectCategory(keyword);

    const aiArticle = await generateArticle(trendKeyword, category);

    const cleanArticle = {
        title: aiArticle.title || trendKeyword,

        slug: trendKeyword
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),

        description: aiArticle.excerpt || `Panduan dan informasi tentang ${trendKeyword}.`,

        date: new Date().toISOString().split("T")[0],

        tags: [trendKeyword],

        category,

        content: aiArticle.content,
    };

    const markdown = generateMarkdown(cleanArticle);

    const filepath = saveArticle(cleanArticle.title, markdown);

    console.log("\nSaved:\n");
    console.log(filepath);
}

main();
