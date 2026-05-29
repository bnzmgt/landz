function cleanText(text) {
    return text.replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();
}

module.exports = {
    cleanText,
};
