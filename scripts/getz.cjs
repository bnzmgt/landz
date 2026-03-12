const puppeteer = require("puppeteer");
const fs = require("fs");
const slugify = require("slugify");

const url = process.argv[2];

if (!url) {
    console.log("Usage: node getz.js PRODUCT_URL");
    process.exit();
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });

    const page = await browser.newPage();

    console.log("Opening product page...");

    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
    });

    await page.waitForSelector("h1");
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
        const title = document.querySelector("h1")?.innerText || document.title;

        // DEBUG semua elemen yang mengandung Rp
        let price = null;

        try {
            const script = document.querySelector("script#__NEXT_DATA__");

            if (script) {
                const data = JSON.parse(script.textContent);

                const item = data?.props?.pageProps?.initialState?.DOMAIN_PDP?.data?.PDP_BFF_DATA?.cachedMap;

                if (item) {
                    const key = Object.keys(item)[0];
                    const product = item[key].item;

                    if (product.price) {
                        const value = product.price / 100000;
                        price = "Rp" + value.toLocaleString("id-ID");
                    }
                }
            }
        } catch (e) {}

        // CATEGORY
        const categories = [];
        const breadcrumb = document.querySelector(".page-product__breadcrumb");

        if (breadcrumb) {
            breadcrumb.querySelectorAll("a").forEach(a => {
                const text = a.innerText.trim();

                if (text && text !== "Shopee") {
                    categories.push(text);
                }
            });
        }

        // DESCRIPTION (lebih akurat)
        let description = "";

        const elements = Array.from(document.querySelectorAll("*"));

        const descHeader = elements.find(el => el.innerText && el.innerText.trim() === "Deskripsi Produk");

        if (descHeader) {
            let node = descHeader.parentElement;

            // cari container berikutnya yang punya teks panjang
            while (node && node.innerText.length < 50) {
                node = node.nextElementSibling;
            }

            if (node) {
                const text = node.innerText
                    .split("\n")
                    .map(t => t.trim())
                    .filter(t => t.length > 20);

                description = text.join("\n\n");
            }
        }

        // IMAGES
        const images = [];

        document.querySelectorAll("picture img").forEach(img => {
            const collect = url => {
                if (!url) return;

                if (url.includes("susercontent.com")) {
                    const clean = url.split("@")[0];

                    images.push(clean);
                }
            };

            collect(img.src);

            if (img.srcset) {
                img.srcset.split(",").forEach(s => {
                    const u = s.trim().split(" ")[0];

                    collect(u);
                });
            }
        });

        return {
            title,
            price,
            categories: [...new Set(categories)],
            images: [...new Set(images)],
            description,
        };
    });

    console.log("TITLE:", data.title);
    console.log("PRICE:", data.price);
    console.log("CATEGORY:", data.categories);
    console.log("IMAGES:", data.images.length);

    const slug = slugify(data.title, {
        lower: true,
        strict: true,
    });

    const category = data.categories.length
        ? slugify(data.categories[data.categories.length - 1], {
              lower: true,
              strict: true,
          })
        : "produk";

    const image = data.images.length ? data.images[0] : "";

    const md = `---
title: "${data.title}"
slug: "${slug}"
price: "${data.price || ""}"
category: "${category}"
categories:
${data.categories
    .map(
        c =>
            `    - "${slugify(c, {
                lower: true,
                strict: true,
            })}"`
    )
    .join("\n")}
image: "${image}"
images:
${data.images.map(i => `  - "${i}"`).join("\n")}

affiliate: "${url}"
---

${data.description}
`;

    if (!fs.existsSync("products")) {
        fs.mkdirSync("products");
    }

    const file = `content/products/${slug}.md`;

    fs.writeFileSync(file, md);

    console.log("Markdown created:");
    console.log(file);

    await browser.close();
}

run();
