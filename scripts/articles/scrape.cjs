const axios = require("axios");
const cheerio = require("cheerio");

async function scrape(url) {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const title = $("title").text().trim();

    const paragraphs = [];

    $("p").each((index, element) => {
        const text = $(element).text().trim();

        if (text) {
            paragraphs.push(text);
        }
    });

    return {
        title,
        content: paragraphs.join("\n\n"),
    };
}

module.exports = {
    scrape,
};
