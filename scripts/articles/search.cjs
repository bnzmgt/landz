async function searchSources(keyword) {
    return [
        {
            title: "Example",
            url: "https://example.com",
        },
        {
            title: `${keyword} source 2`,
            url: "https://example.com/article-2",
        },
    ];
}

module.exports = {
    searchSources,
};
