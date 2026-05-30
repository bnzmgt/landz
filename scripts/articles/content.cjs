function generateArticle(title, category) {
    return `
# ${title}

${title} menjadi salah satu topik yang banyak dicari.

## Kenapa Banyak Dicari

Penjelasan tentang ${category}.

## Tips Memilih

Tips memilih produk yang tepat.

## Rekomendasi Produk

Lihat produk pilihan yang tersedia.

## Kesimpulan

Pilih produk sesuai kebutuhan dan budget.
`;
}

module.exports = {
    generateArticle,
};
