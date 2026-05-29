const googleTrends = require("google-trends-api");

async function getTrends(keyword) {
    const result = await googleTrends.relatedQueries({
        keyword,
        geo: "ID",
    });

    return JSON.parse(result);
}

module.exports = {
    getTrends,
};
