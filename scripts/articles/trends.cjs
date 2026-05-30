const googleTrends = require("google-trends-api");

async function getTrends(keyword) {
    const result = await googleTrends.relatedQueries({
        keyword,
        geo: "ID",
    });

    const data = JSON.parse(result);

    const queries = data.default.rankedList?.[0]?.rankedKeyword || [];

    return queries
        .slice(0, 10)
        .map(item => item.query)
        .filter(Boolean);
}

module.exports = {
    getTrends,
};
