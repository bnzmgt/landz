function detectIntent(keyword) {
    const text = keyword.toLowerCase();

    if (text.includes("cara") || text.includes("tutorial") || text.includes("panduan")) {
        return "tutorial";
    }

    if (text.includes("terbaru") || text.includes("trend") || text.includes("viral")) {
        return "trend";
    }

    if (text.includes("vs") || text.includes("perbandingan")) {
        return "comparison";
    }

    return "guide";
}

module.exports = {
    detectIntent,
};
