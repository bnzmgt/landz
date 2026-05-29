const { getTrends } = require("./trends.cjs");
const { searchSources } = require("./search.cjs");
const { scrape } = require("./scrape.cjs");
const { cleanText } = require("./clean.cjs");
const { rewrite } = require("./rewrite.cjs");
const { generateMarkdown } = require("./generate.cjs");
const { saveArticle } = require("./save.cjs");

const keyword = process.argv[2];

if (!keyword) {
    console.log("Keyword required");
    process.exit(1);
}

async function main() {
    console.log(`Searching trends for: ${keyword}`);

    const trends = await getTrends(keyword);

    console.log(JSON.stringify(trends, null, 2));

    console.log("\nSources:\n");

    const sources = await searchSources(keyword);

    if (sources.length > 0) {
        console.log("\nScraping first source...\n");

        const article = await scrape(sources[0].url);

        console.log(JSON.stringify(article, null, 2));
    }

    const article = await scrape(sources[0].url);

    const cleanContent = cleanText(article.content);

    console.log({
        title: article.title,
        content: cleanContent,
    });

    const cleanArticle = {
        title: article.title,
        content: cleanContent,
    };

    const draft = await rewrite(cleanArticle);

    console.log("\nDraft Article:\n");

    console.log(draft);

    const markdown = generateMarkdown(cleanArticle);

    console.log("\nGenerated Markdown:\n");

    console.log(markdown);

    const filepath = saveArticle(cleanArticle.title, markdown);

    console.log("\nSaved:\n");

    console.log(filepath);

    console.log(JSON.stringify(sources, null, 2));
}

main();
