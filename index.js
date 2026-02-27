const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const UPLOAD_DIR = path.join(__dirname, 'public/uploads');
const ADMIN_PASS = process.env.ADMIN_PASS || "adomin";

app.use(express.json({ limit: '100mb' }));
app.use('/files', express.static(UPLOAD_DIR));

// ルートアクセスでindex.htmlを返す
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
        await fs.writeFile(path.join(UPLOAD_DIR, fileName), content, 'base64');
        res.json({ url: `${req.protocol}://${req.get('host')}/files/${fileName}` });
    } catch (err) { res.status(500).send("Error"); }
});

app.listen(3000, () => console.log("Terminal Online"));
