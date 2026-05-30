require("dotenv").config();

const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateArticle(keyword, category, intent = "guide", analysis = {}) {
    let intentPrompt = "";

    switch (intent) {
        case "tutorial":
            intentPrompt = `
Buat artikel tutorial.

Fokus membantu pembaca menyelesaikan masalah.

Gunakan langkah-langkah yang praktis.

Jangan membuat heading:
- Pembahasan
- Tips
- Rekomendasi Produk
- Kesimpulan
`;
            break;

        case "trend":
            intentPrompt = `
Buat artikel trend dan inspirasi.

Bahas:
- model yang sedang populer
- warna yang sedang diminati
- gaya yang banyak dicari
- perubahan tren terbaru

Jangan menjelaskan definisi dasar produk.
`;
            break;

        case "comparison":
            intentPrompt = `
Buat artikel perbandingan.

Bahas kelebihan dan kekurangan.

Bantu pembaca mengambil keputusan.
`;
            break;

        default:
            intentPrompt = `
Buat artikel buying guide.

Fokus membantu pembaca memilih produk yang tepat.

Bahas:
- hal yang perlu diperhatikan
- karakteristik produk
- siapa yang cocok menggunakan produk tersebut
`;
    }

    const response = await client.chat.completions.create({
        model: process.env.OPENROUTER_MODEL,
        max_tokens: 1800,
        temperature: 1.0,
        messages: [
            {
                role: "system",
                content: `
Kamu adalah penulis blog lifestyle Indonesia.

Tulislah seperti blogger Indonesia yang sedang memberi rekomendasi kepada teman.

Gaya tulisan:

- Natural
- Mengalir
- Terasa ditulis manusia
- Tidak terdengar seperti AI
- Tidak terdengar seperti makalah
- Tidak terdengar seperti tugas sekolah

Gunakan:
- observasi realistis
- situasi sehari-hari
- contoh penggunaan
- pengalaman yang masuk akal

Hindari kalimat seperti:
- banyak orang
- sangat penting
- pada dasarnya
- dalam era modern
- saat ini masyarakat
- seiring perkembangan zaman

Sebelum menulis artikel, lakukan proses berpikir internal berikut:

1. Analisa keyword yang diberikan.
2. Tentukan apa yang kemungkinan ingin diketahui pengguna.
3. Tentukan masalah yang sedang ingin diselesaikan pengguna.
4. Tentukan informasi yang paling berguna untuk menjawab pencarian tersebut.
5. Tentukan sudut pandang artikel yang paling relevan.

Gunakan hasil analisa tersebut untuk menyusun artikel.

Jangan tampilkan proses analisa kepada pengguna.

Fokus menjawab search intent, bukan sekadar mengulang keyword.

Jika keyword bersifat informasional:
- berikan panduan
- berikan contoh
- berikan konteks yang relevan

Jika keyword bersifat trend:
- bahas tren
- bahas perkembangan terbaru
- bahas hal yang sedang populer

Jika keyword bersifat perbandingan:
- bantu pengguna mengambil keputusan

Jika keyword berkaitan dengan ukuran, spesifikasi, cara memilih, atau panduan:
- fokus pada langkah praktis
- fokus pada kesalahan yang sering terjadi
- fokus pada solusi yang dapat langsung diterapkan

Jangan menjelaskan definisi dasar produk yang sudah umum diketahui kecuali benar-benar diperlukan untuk menjawab pencarian.

Output HARUS dalam format berikut:

TITLE:
judul artikel

EXCERPT:
deskripsi singkat

CONTENT:
isi artikel markdown

Aturan TITLE:
- Maksimal 70 karakter
- Menarik untuk diklik
- Bukan keyword mentah
- Harus mencerminkan search intent
- Harus terasa seperti judul artikel blog modern
- Hindari judul generik
- Jangan hanya mengulang keyword

Aturan EXCERPT:
- 1 sampai 2 kalimat
- Ringkas
- Menjelaskan manfaat artikel

Aturan CONTENT:
- Markdown
- Minimal 700 kata
- Jangan membuat heading:
  - Pembahasan
  - Tips
  - Rekomendasi Produk
  - Kesimpulan
- Gunakan heading natural
- Fokus pada search intent
- Soft selling secara alami


${intentPrompt}
                `,
            },
            {
                role: "user",
                content: `
Keyword: ${keyword}
Category: ${category}
Intent: ${intent}
User Wants:
${(analysis.userWants || []).join("\n- ")}

Questions:
${(analysis.questions || []).join("\n- ")}

Recommended Angle:
${analysis.angle || ""}
Pahami terlebih dahulu apa yang sebenarnya dicari pengguna ketika mengetik keyword tersebut.
Buat artikel yang menjawab kebutuhan pengguna secara langsung.
Jangan mengulang keyword secara berlebihan.
Tulis artikel blog Indonesia yang natural dan layak dipublikasikan.
                `,
            },
        ],
    });

    const text = response.choices[0].message.content;

    fs.writeFileSync("./tmp-ai-response.txt", text);

    console.log("\nAI RESPONSE:\n");
    console.log(text);

    const titleMatch = text.match(/TITLE:\s*([\s\S]*?)EXCERPT:/i);

    const excerptMatch = text.match(/EXCERPT:\s*([\s\S]*?)CONTENT:/i);

    const contentMatch = text.match(/CONTENT:\s*([\s\S]*)/i);

    const title = titleMatch?.[1]?.trim() || keyword;

    const excerpt = excerptMatch?.[1]?.trim() || "";

    const content = contentMatch?.[1]?.trim() || text;

    return {
        title,
        excerpt,
        keywords: [keyword],
        relatedProducts: [],
        content,
    };
}

module.exports = {
    generateArticle,
};
