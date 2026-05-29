const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

function saveArticle(title, markdown) {
    const slug = slugify(title, {
        lower: true,
        strict: true,
    });

    const filepath = path.join(process.cwd(), "content", "articles", `${slug}.md`);

    fs.writeFileSync(filepath, markdown);

    return filepath;
}

module.exports = {
    saveArticle,
};
