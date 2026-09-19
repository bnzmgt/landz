# Landz

Affiliate & Content Marketing Platform / Auto-Blog & Catalog berbasis **Nuxt 4** dan **Nuxt Content**, dilengkapi pipeline **Web Scraping** dan **AI Content Automation**.

---

## 🛠️ Tech Stack & Architecture

### 1. Core Framework & Runtime
- **Framework**: [Nuxt 4](https://nuxt.com/) (`v4.3.1`) — Fullstack Vue framework dengan SSR & prerendering/SSG.
- **UI Core**: [Vue 3](https://vuejs.org/) (`v3.5.29`) & [Vue Router](https://router.vuejs.org/) (`v4.6.4`).
- **Server Engine**: [Nitro](https://nitro.unjs.io/) & [Node.js](https://nodejs.org/) (ES Modules).
- **Language**: [TypeScript](https://www.typescriptlang.org/).

### 2. Content Management & Data Layer
- **Content Engine**: [@nuxt/content](https://content.nuxt.com/) (`v3.12.0`) — Content management berbasis file Markdown / Git-based CMS dengan validasi Zod:
  - `products`: Katalog produk affiliate.
  - `categories`: Kategori produk dan artikel.
  - `articles`: Artikel blog / SEO.
  - `reviews`: Ulasan produk.
- **Embedded Database**: `better-sqlite3` (`v12.6.2`) — SQLite lokal untuk penyimpanan cache/data scraping.
- **Frontmatter Parser**: `gray-matter` (`v4.0.3`).

### 3. Styling & UI Components
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) via `@nuxtjs/tailwindcss` (`v6.14.0`).
- **UI Components**: [DaisyUI](https://daisyui.com/) (`v5.5.19`) dengan custom theme `dotuqu`.
- **Plugins & Typography**:
  - `@tailwindcss/typography` (formatting konten Markdown)
  - `@tailwindcss/line-clamp`
  - Font: `Poppins` (Google Fonts)
- **Icons**: `@phosphor-icons/vue` (`v2.2.1`).

### 4. Automation, Scraping & AI Pipeline (`scripts/`)
- **Web Scraping & Browser Automation**:
  - `puppeteer` (`v24.38.0`) — Scraping dinamis (PDP e-commerce/Shopee).
  - `cheerio` (`v1.2.0`) & `axios` (`v1.13.6`) — Parsing HTML statis & HTTP client.
- **AI & Content Generation**:
  - `openai` (`v6.39.1`) — Generator artikel, rewrite konten, intent & category classifier (`scripts/articles/`).
- **SEO & Trend Intelligence**:
  - `google-trends-api` (`v4.9.2`) — Riset tren pencarian Google.
  - `rss-parser` (`v3.13.0`) — Parsing RSS feed eksternal.
  - Custom sitemap generator (`scripts/generate-sitemap.mjs`).
- **CLI & Utilities**:
  - `commander` (`v14.0.3`), `slugify` (`v1.6.6`), `dotenv` (`v17.4.2`).

---

## 🚀 Getting Started

### Setup
Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server
Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Production Build & Preview
Build the application for production (otomatis menjalankan generator sitemap):

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview the production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Static Site Generation:

```bash
npm run generate
```

### Scraping & Automation Scripts
Menjalankan script scraping PDP produk:

```bash
npm run scrape <PRODUCT_URL>
# atau: node scripts/getz.cjs <PRODUCT_URL>
```

---

## 📚 Documentation
- [Nuxt Documentation](https://nuxt.com/docs/getting-started/introduction)
- [Nuxt Content Documentation](https://content.nuxt.com/)
- [Deployment Documentation](https://nuxt.com/docs/getting-started/deployment)
