function generateMarkdown(article) {
    return `---
title: "${article.title}"
excerpt: ""
keywords: []
relatedProducts: []
sources: []
published: false
---

# ${article.title}

${article.content}
`;
}

module.exports = {
    generateMarkdown,
};
