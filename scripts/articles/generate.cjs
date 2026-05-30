function generateMarkdown(article) {
    return `---
title: "${article.title}"
slug: "${article.slug}"
description: "${article.description}"
image: "/images/articles/default.jpg"
date: "${article.date}"
author: "Admin"
relatedProducts: []
sources: []
category: "${article.category}"
tags: ${JSON.stringify(article.tags)}
published: true
---

${article.content}
`;
}

module.exports = {
    generateMarkdown,
};
