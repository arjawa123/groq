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
                    "content": `Anda adalah sistem validasi bahasa Jepang yang ketat. 
                    Anda WAJIB mengisi semua field dalam JSON. 
                    Jika kalimat benar, 'correction' tetap diisi dengan kalimat asli dan 'explanation' berisi pujian atau penjelasan tata bahasa yang digunakan.`
                },
                {
                    "role": "user",
                    "content": `
                    Kata wajib: ${words.join(", ")}
                    Kalimat: "${userSentence}"
                    
                    Format JSON harus tepat:
                    {
                      "is_correct": boolean,
                      "correction": "tulis kembali kalimat atau perbaiki jika salah",
                      "explanation": "jelaskan alasan koreksi atau jelaskan pola tata bahasa yang digunakan dalam Bahasa Indonesia",
                      "score": "angka 0-100"
                    }`
                }
            ],
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
