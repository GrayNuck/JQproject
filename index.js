<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Jeremy Quartus</title>
    <style>
        :root {
            --bg: #0c0d13;
            --card-gray: rgba(22, 22, 23, 0.85); 
            --text-white: #f5f5f7;
            --text-dim: #86868b;
            --apple-blue: #0071e3;
        }

        body, html {
            margin: 0; padding: 0;
            background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
            color: var(--text-white);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; overflow: hidden;
        }

        /* ✨ 流星背景：画像 0c8fca.png で動いていたやつ */
        .stars { position: fixed; top: 0; left: 0; width: 100%; height: 120%; transform: rotate(-45deg); z-index: 0; pointer-events: none; }
        .star {
            position: absolute; background: linear-gradient(45deg, #fff, transparent);
            border-radius: 50%; filter: drop-shadow(0 0 6px #fff);
            transform: translate3d(104em, 0, 0);
            animation: fall 9s linear infinite;
        }
        @keyframes fall { to { transform: translate3d(-30em, 0, 0); } }

        /* 星の配置（44個分） */
        .star:nth-child(1) { height:2px; width:6.77em; --top-offset: 17.45vh; animation-duration: 7.28s; animation-delay: 4.65s; }
        .star:nth-child(2) { height:2px; width:5.43em; --top-offset: 53.99vh; animation-duration: 11.77s; animation-delay: 7.50s; }
        .star:nth-child(3) { height:2px; width:6.98em; --top-offset: 6.36vh; animation-duration: 8.09s; animation-delay: 6.23s; }
        /* ... (ここに星の定義が44個続きます。以前のCSSをそのまま使ってください) ... */

        .apple-card {
            width: 90%; max-width: 400px;
            background: var(--card-gray);
            backdrop-filter: blur(20px); 
            border-radius: 36px; padding: 50px 30px;
            text-align: center; position: relative; z-index: 10;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .apple-input { width: 100%; background: #000; border: 1px solid #424245; border-radius: 12px; padding: 15px; color: white; margin-bottom: 20px; font-size: 16px; box-sizing: border-box; }
        .apple-button { background: var(--apple-blue); color: white; padding: 14px 30px; border-radius: 980px; font-weight: 600; border: none; cursor: pointer; width: 100%; font-size: 16px; }
        .drop-zone { background: rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; margin-top: 20px; cursor: pointer; border: 1px dashed rgba(255,255,255,0.2); transition: 0.3s; }
        .drop-zone:hover { background: rgba(255,255,255,0.1); }
        
        #main-content { display: none; }
    </style>
</head>
<body>

    <div class="stars">
        <script>
            for(let i=0; i<44; i++) document.write('<div class="star"></div>');
        </script>
    </div>

    <div id="auth-section" class="apple-card">
        <div style="font-weight: 800; font-size: 24px; margin-bottom: 20px;">Jeremy Quartus</div>
        <input type="password" id="pass-input" class="apple-input" placeholder="Passcode" onkeydown="if(event.key==='Enter') unlock()">
        <button onclick="unlock()" class="apple-button">接続</button>
    </div>

    <div id="main-content" class="apple-card">
        <h1 style="font-size: 28px; margin-bottom: 5px;">Upload Terminal</h1>
        <p style="color: var(--text-dim); font-size: 14px; margin-bottom: 30px;">ファイルを同期してください。</p>
        
        <div class="drop-zone" onclick="document.getElementById('actual-file').click()">
            <p id="drop-text" style="font-weight: 600; margin: 0;">タップして同期</p>
            <span style="font-size: 11px; color: var(--text-dim);">MAX 100MB</span>
        </div>
        <input type="file" id="actual-file" style="display:none;" onchange="startUpload()">

        <div id="url-result" style="display:none; margin-top: 20px;">
            <input type="text" id="download-url" readonly class="apple-input" style="font-size: 12px; color: var(--apple-blue);">
            <button onclick="copyURL()" class="apple-button" style="background:#424245;">コピー</button>
        </div>
    </div>

<script>
    let globalPass = "";
    // RenderのURLに合わせて自動設定
    const host = window.location.host;

    function unlock() {
        const p = document.getElementById('pass-input').value;
        if(p === "adomin") {
            globalPass = p;
            document.getElementById('auth-section').style.display = "none";
            document.getElementById('main-content').style.display = "block";
        } else {
            alert("認証に失敗しました");
        }
    }

    async function startUpload() {
        const file = document.getElementById('actual-file').files[0];
        if (!file) return;
        document.getElementById('drop-text').innerText = "同期中...";

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target.result.split(',')[1];
            try {
                const response = await fetch('/log-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: file.name, content: base64Data, pass: globalPass })
                });
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('url-result').style.display = 'block';
                    document.getElementById('download-url').value = data.url;
                    document.getElementById('drop-text').innerText = "同期完了";
                }
            } catch (err) { alert("同期エラー"); }
        };
        reader.readAsDataURL(file);
    }

    function copyURL() {
        const url = document.getElementById("download-url");
        url.select();
        navigator.clipboard.writeText(url.value);
        alert("URLをコピーしました");
    }
</script>
</body>
</html>
