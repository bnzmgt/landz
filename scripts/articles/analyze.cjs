require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function analyzeKeyword(keyword) {
    const response = await client.chat.completions.create({
        model: process.env.OPENROUTER_MODEL,
        temperature: 0.3,
        max_tokens: 500,
        messages: [
            {
                role: "system",
                content: `
Kamu adalah SEO Research Assistant.

Analisa keyword yang diberikan.

Output HARUS JSON valid:

{
  "intent": "guide",
  "primaryQuestion": "",
  "secondaryQuestions": [],
  "articleAngle": "",
  "mustCover": []
}

intent hanya boleh:
- guide
- tutorial
- comparison
- trend

Jangan output markdown.
Jangan output penjelasan tambahan.
`,
            },
            {
                role: "user",
                content: keyword,
            },
        ],
    });

    const text = response.choices[0].message.content;

    try {
        return JSON.parse(text);
    } catch {
        return {
            intent: "guide",
            userWants: [],
            questions: [],
            angle: "",
        };
    }
}

module.exports = {
    analyzeKeyword,
};
