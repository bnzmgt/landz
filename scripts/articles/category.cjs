const CATEGORY_MAP = {
    hijab: "fashion-muslim",
    gamis: "fashion-muslim",
    mukena: "fashion-muslim",
    sarung: "fashion-muslim",

    tas: "fashion",
    sepatu: "fashion",
    sandal: "fashion",

    skincare: "beauty",
    makeup: "beauty",

    bra: "bra",
};

function detectCategory(keyword) {
    const key = keyword.toLowerCase();

    for (const item in CATEGORY_MAP) {
        if (key.includes(item)) {
            return CATEGORY_MAP[item];
        }
    }

    return "general";
}

module.exports = {
    detectCategory,
};
