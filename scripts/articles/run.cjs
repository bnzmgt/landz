const { getTrends } = require("./trends.cjs");
const { detectCategory } = require("./category.cjs");
const { detectIntent } = require("./intent.cjs");
const { analyzeKeyword } = require("./analyze.cjs");
const { generateMarkdown } = require("./generate.cjs");
const { saveArticle } = require("./save.cjs");
const { generateArticle } = require("./ai.cjs");

const keyword = process.argv.slice(2).join(" ");

if (!keyword) {
    console.log("Keyword required");
    process.exit(1);
}

async function main() {
    console.log(`Searching trends for: ${keyword}`);

    const trends = await getTrends(keyword);

    console.log(trends);

    const trendKeyword = keyword;

    const category = detectCategory(trendKeyword);

    const analysis = await analyzeKeyword(trendKeyword);

    const intent = analysis.intent || detectIntent(trendKeyword);

    console.log(`Category: ${category}`);
    console.log(`Intent: ${intent}`);
    console.log("\nANALYSIS:");
    console.log(JSON.stringify(analysis, null, 2));

    const aiArticle = await generateArticle(trendKeyword, category, intent, analysis);

    const cleanArticle = {
        title: aiArticle.title,

        slug: aiArticle.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-"),

        description: aiArticle.excerpt,

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
