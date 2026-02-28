const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

const UPLOAD_DIR = path.join(__dirname, 'public/uploads');
const ADMIN_PASS = process.env.ADMIN_PASS || "adomin";
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1476922880540282952/NLRrV73zlMkFXgNbo0XJjIDDLuGIY1Le4CMhjQToFoVaJ4HeX3jhbrimdHD1GIWROJS2";

app.use(express.json({ limit: '100mb' }));
app.use('/files', express.static(UPLOAD_DIR));

app.get('/', (req, res) => {
    const key = req.query.k;
    if (key === ADMIN_PASS) {
        res.sendFile(path.resolve(__dirname, 'index.html'));
    } else {
        res.send('Jeremy Quartus Terminal: Online');
    }
});

app.post('/log-check', async (req, res) => {
    const { name, content, pass } = req.body;
    if (pass !== ADMIN_PASS) return res.status(403).send("Forbidden");

    try {
        await fs.ensureDir(UPLOAD_DIR);
        const fileName = `${Date.now()}-${name}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        const buffer = Buffer.from(content, 'base64');

        // 1. サーバーへ保存
        await fs.writeFile(filePath, buffer);

        // 2. Discordへ転送 (URLが含まれていれば実行)
        if (DISCORD_WEBHOOK_URL.includes("discord.com")) {
            const form = new FormData();
            form.append('file', buffer, { filename: fileName });
            form.append('content', `🚀 **新着ファイル**\n名前: \`${name}\`\nパス: \`/files/${fileName}\``);

            await axios.post(DISCORD_WEBHOOK_URL, form, {
                headers: { ...form.getHeaders() }
            });
        }

        res.json({ url: `${req.protocol}://${req.get('host')}/files/${fileName}` });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log("Terminal Online"));
