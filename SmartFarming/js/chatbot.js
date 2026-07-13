function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (message === "") return;

    const chatBox = document.getElementById("chatBox");

    // Show user message
    const userRow = document.createElement("div");
    userRow.classList.add("chat-row");
    const userMsg = document.createElement("div");
    userMsg.classList.add("message", "user");
    userMsg.innerText = message;
    userRow.appendChild(userMsg);
    chatBox.appendChild(userRow);

    input.value = "";

    // Show "Thinking..." while waiting
    const botRow = document.createElement("div");
    botRow.classList.add("chat-row", "bot-row");
    const botImg = document.createElement("img");
    botImg.src = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
    botImg.classList.add("bot-img");
    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.innerText = "🌱 Thinking...";
    botRow.appendChild(botImg);
    botRow.appendChild(botMsg);
    chatBox.appendChild(botRow);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Send message to Node.js server → Groq AI
    fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        botMsg.innerText = data.reply;
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => {
        botMsg.innerText = "❌ Cannot connect to server. Make sure Node.js is running!";
        console.error(err);
    });
}

// Press Enter to send
document.getElementById("userInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});
