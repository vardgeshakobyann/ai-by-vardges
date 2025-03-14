const chatsContainer = document.querySelector('.chats-container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = promptForm.querySelector('.prompt-input');

const API_KEY = "AIzaSyA8Gb7Z5at5d9ygXCOquy5YssBv8j2YzOA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

let userMessage = "";
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
        } else {
            clearInterval(typingInterval);
        }
    }, 40)
}

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector('.message-text');

    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    })

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text;
        textElement.textContent = responseText;
        typingEffect(responseText, textElement, botMsgDiv);
    } catch (error) {
        console.log(error);
    }
}

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector('.message-text').textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
        const botMsgHTML = `
            <img src="gemini.svg" class="avatar">
            <p class="message-text">Just a sec...</p>
        `;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        generateResponse(botMsgDiv);
    }, 600);
}

promptForm.addEventListener('submit', handleFormSubmit);