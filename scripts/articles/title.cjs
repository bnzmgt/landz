function generateTitle(keyword) {
    const key = keyword.toLowerCase();

    if (key.includes("tutorial")) {
        return `7 ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} yang Mudah Dipraktikkan`;
    }

    if (key.includes("cara")) {
        return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} dengan Mudah untuk Pemula`;
    }

    if (key.includes("model")) {
        return `10 ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} yang Sedang Populer`;
    }

    if (key.includes("ootd")) {
        return `Inspirasi ${keyword.toUpperCase()} yang Stylish dan Modern`;
    }

    return `Panduan Lengkap ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`;
}

module.exports = {
    generateTitle,
};
