const CATEGORY_MAP = {
    // Fashion Muslim
    hijab: "fashion-muslim",
    jilbab: "fashion-muslim",
    khimar: "fashion-muslim",
    pashmina: "fashion-muslim",
    bergo: "fashion-muslim",
    mukena: "fashion-muslim",
    gamis: "fashion-muslim",
    abaya: "fashion-muslim",
    tunik: "fashion-muslim",
    sarung: "fashion-muslim",

    // Pakaian Wanita
    kebaya: "pakaian-wanita",
    blouse: "pakaian-wanita",
    kemeja: "pakaian-wanita",
    cardigan: "pakaian-wanita",
    outer: "pakaian-wanita",
    batik: "pakaian-wanita",
    dress: "pakaian-wanita",
    rok: "pakaian-wanita",

    // Pakaian Dalam
    bra: "pakaian-dalam",
    beha: "pakaian-dalam",
    bh: "pakaian-dalam",
    lingerie: "pakaian-dalam",
    panties: "pakaian-dalam",
    "celana dalam": "pakaian-dalam",

    // Beauty
    skincare: "beauty",
    serum: "beauty",
    sunscreen: "beauty",
    moisturizer: "beauty",
    makeup: "beauty",
    lipstik: "beauty",
    cushion: "beauty",

    // Fashion Umum
    tas: "fashion",
    sepatu: "fashion",
    sandal: "fashion",
    dompet: "fashion",
    "jam tangan": "fashion",
};

function detectCategory(keyword) {
    const key = keyword.toLowerCase();

    for (const item in CATEGORY_MAP) {
        if (key.includes(item)) {
            return CATEGORY_MAP[item];
        }
    }

    return "fashion-muslim";
}

module.exports = {
    detectCategory,
};
