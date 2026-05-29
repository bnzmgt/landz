async function rewrite(article) {
    return `
# ${article.title}

${article.content}
`.trim();
}

module.exports = {
    rewrite,
};
