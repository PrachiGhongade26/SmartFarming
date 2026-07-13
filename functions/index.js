require("dotenv").config();
const { onRequest } = require("firebase-functions/v2/https");
const fetch = require("node-fetch");

exports.chatbot = onRequest(async (req, res) => {

    const userMessage = req.body.message;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a smart farming assistant. Help farmers with crops, irrigation, soil, fertilizers. Give simple and practical answers."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            })
        });

        const data = await response.json();

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (error) {
        res.json({ reply: "Error connecting to AI 😢" });
    }
});