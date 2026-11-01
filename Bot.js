const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('SCAN THIS QR IN WHATSAPP');
});

client.on('ready', () => console.log('BOT IS LIVE! Add me to groups'));

client.on('message', async msg => {
    const text = msg.body.toLowerCase();
    if (!text.startsWith('bot')) return;
    
    const chat = await msg.getChat();
    chat.sendStateTyping();
    
    const prompt = msg.body.slice(3).trim();
    
    const res = await groq.chat.completions.create({
        messages: [
            {role: "system", content: "You are a helpful WhatsApp group AI. Short answers."},
            {role: "user", content: prompt}
        ],
        model: "llama-3.1-8b-instant"
    });
    
    msg.reply(res.choices[0].message.content);
});

client.initialize();