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
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": `Anda adalah Sensei (Guru) Bahasa Jepang ahli yang khusus membantu siswa tingkat dasar (A2/N5). 
                    Tugas Anda: Memvalidasi kalimat yang dibuat siswa berdasarkan kata kunci tertentu.
                    
                    Pedoman Validasi:
                    1. Periksa apakah semua "Kata Wajib" ada dalam kalimat.
                    2. Periksa akurasi partikel (wa, ga, o, ni, de, dll).
                    3. Periksa konjugasi kata kerja (bentuk ~masu, ~te, dll).
                    4. Jika kalimat benar, jelaskan MENGAPA itu benar secara tata bahasa.
                    5. Jika kalimat salah, berikan koreksi yang paling alami bagi penutur asli Jepang.
                    
                    Output WAJIB berupa JSON dengan field:
                    - is_correct: boolean
                    - correction: string (kalimat yang sudah diperbaiki/asli jika sudah benar)
                    - explanation: string (penjelasan mendalam dalam Bahasa Indonesia tentang pola kalimat/partikel)
                    - score: integer (0-100)`
                },
                {
                    "role": "user",
                    "content": `
                    INPUT DATA:
                    - Kata Wajib: [${words.join(", ")}]
                    - Kalimat Siswa: "${userSentence}"
                    
                    Tolong validasi dengan detail seperti guru bahasa.`
                }
            ],
            "response_format": { "type": "json_object" },
            "temperature": 0.3, // Sedikit dinaikkan dari 0.1 agar penjelasan lebih mengalir (tidak kaku)
        });

        const content = chatCompletion.choices[0].message.content;
        res.json(JSON.parse(content));
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Gagal memproses validasi" });
    }
});

module.exports.handler = serverless(app);
