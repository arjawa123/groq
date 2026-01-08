const express = require('express');
const Groq = require('groq-sdk'); // Ganti library
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Konfigurasi Groq (Gunakan API Key dari dashboard.groq.com)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/validate', async (req, res) => {
    const { words, userSentence } = req.body;

    try {
        const chatCompletion = await groq.chat.completions.create({
            // Model llama-3.1-8b-instant sangat cepat untuk validasi teks pendek
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "Tugas: Validasi kalimat Bahasa Jepang. Berikan respon HANYA dalam format JSON mentah."
                },
                {
                    "role": "user",
                    "content": `Kata wajib digunakan: ${words.join(", ")}. Kalimat User: "${userSentence}". 
                    Struktur JSON: { "is_correct": boolean, "correction": "string", "explanation": "string", "score": "string" }`
                }
            ],
            // Mengaktifkan mode JSON agar output selalu valid secara format
            "response_format": { "type": "json_object" },
            "temperature": 0.1, // Suhu rendah agar AI lebih konsisten dan tidak berhalusinasi
        });

        const content = chatCompletion.choices[0].message.content;
        res.json(JSON.parse(content));
        
    } catch (error) {
        console.error("Groq Error Detail:", error);
        res.status(500).json({ 
            error: "Gagal memproses validasi via Groq", 
            detail: error.message 
        });
    }
});

module.exports.handler = serverless(app);
