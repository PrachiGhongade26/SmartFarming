import "dotenv/config";
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(express.json());
app.use(cors());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are AgriBot, a smart farming assistant. 
                    Help farmers with crops, soil, irrigation, fertilizers, and pest control.
                    Keep answers short, practical, and friendly. Use farming emojis occasionally.`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const reply = response.choices[0]?.message?.content || "Sorry, no response.";
        res.json({ reply });

    } catch (error) {
        console.error("Groq error:", error.message);
        res.json({ reply: "Server error. Please try again." });
    }
});

app.listen(3000, () => {
    console.log("AgriBot server running on http://localhost:3000");
});
