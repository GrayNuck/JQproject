const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const app = express();

const UPLOAD_DIR = path.join(__dirname, 'public/uploads');
const ADMIN_PASS = process.env.ADMIN_PASS || "adomin";

app.use(express.json({ limit: '50mb' }));
app.use('/files', express.static(UPLOAD_DIR));

// ★ ここがポイント：URLにアクセスした時にHTMLを表示する
app.get('/', (req, res) => {
    // GitHubにある index.html を読み込んで表示する
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Renderの死活監視用
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// 12:59に全削除
cron.schedule('59 12 * * *', async () => {
    await fs.emptyDir(UPLOAD_DIR);
    console.log('Purge complete');
}, { timezone: "Asia/Tokyo" });

app.post('/log-check', async (req, res) => {
    const { name, content, pass } = req.body;
    if (pass !== ADMIN_PASS) return res.status(403).send("Forbidden");
    try {
        await fs.ensureDir(UPLOAD_DIR);
        const fileName = `${Date.now()}-${name}`;
        await fs.writeFile(path.join(UPLOAD_DIR, fileName), content, 'base64');
        res.json({ url: `${req.protocol}://${req.get('host')}/files/${fileName}` });
    } catch (err) { res.status(500).send("Error"); }
});

app.listen(3000, () => console.log("Terminal Online"));
