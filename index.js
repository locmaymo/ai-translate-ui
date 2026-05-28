const http = require('http');
const os = require('os');

// Hàm tính toán CPU
let previousCpu = os.cpus();
function getCpuUsage() {
    let startIdle = 0, startTotal = 0, endIdle = 0, endTotal = 0;
    const currentCpu = os.cpus();
    
    previousCpu.forEach(core => {
        for (let type in core.times) { startTotal += core.times[type]; }
        startIdle += core.times.idle;
    });
    currentCpu.forEach(core => {
        for (let type in core.times) { endTotal += core.times[type]; }
        endIdle += core.times.idle;
    });
    previousCpu = currentCpu;
    
    const idleDelta = endIdle - startIdle;
    const totalDelta = endTotal - startTotal;
    return totalDelta === 0 ? 0 : (100 - (100 * idleDelta / totalDelta)).toFixed(1);
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
}

// Giao diện HTML thuần
const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Translate</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .glass-panel { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="glass-panel border-b border-slate-200 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
                <span class="text-xl font-semibold text-slate-700">AI Translate</span>
            </div>
            
            <!-- System Stats -->
            <div class="flex items-center gap-4 text-xs font-mono bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <div class="flex items-center gap-1 text-slate-600" title="Uptime">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="sys-uptime">0h 0m</span>
                </div>
                <div class="w-px h-4 bg-slate-300"></div>
                <div class="flex items-center gap-1 text-sky-600" title="CPU Usage">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                    <span id="sys-cpu">0%</span>
                </div>
                <div class="w-px h-4 bg-slate-300"></div>
                <div class="flex items-center gap-1 text-amber-600" title="RAM Usage">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    <span id="sys-ram">0%</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Source Text -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <select class="text-sm font-medium text-blue-600 outline-none bg-transparent cursor-pointer" id="sourceLang">
                        <option value="en">Tiếng Anh (English)</option>
                        <option value="vi">Tiếng Việt</option>
                        <option value="ja">Tiếng Nhật (日本語)</option>
                    </select>
                </div>
                <textarea id="sourceText" class="flex-1 w-full p-4 resize-none outline-none text-lg text-slate-700" placeholder="Nhập văn bản cần dịch..."></textarea>
                <div class="px-4 py-3 flex justify-end">
                    <button onclick="translateText()" id="translateBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2">
                        Dịch
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>

            <!-- Target Text -->
            <div class="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <select class="text-sm font-medium text-blue-600 outline-none bg-transparent cursor-pointer" id="targetLang">
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">Tiếng Anh (English)</option>
                        <option value="ja">Tiếng Nhật (日本語)</option>
                    </select>
                </div>
                <div class="flex-1 w-full relative">
                    <textarea id="targetText" readonly class="w-full h-full p-4 resize-none outline-none text-lg text-slate-800 bg-transparent" placeholder="Bản dịch sẽ xuất hiện tại đây..."></textarea>
                </div>
            </div>

        </div>
    </main>

    <script>
        // Cập nhật thông số hệ thống Realtime
        setInterval(async () => {
            try {
                const res = await fetch('/sysinfo');
                const data = await res.json();
                document.getElementById('sys-cpu').innerText = data.cpu + '%';
                document.getElementById('sys-ram').innerText = data.ramPercent + '%';
                document.getElementById('sys-uptime').innerText = data.uptimeStr;
            } catch(e) {}
        }, 2000);

        // Logic Dịch (Sử dụng MyMemory API miễn phí)
        async function translateText() {
            const text = document.getElementById('sourceText').value.trim();
            const sourceLang = document.getElementById('sourceLang').value;
            const targetLang = document.getElementById('targetLang').value;
            const targetBox = document.getElementById('targetText');
            const btn = document.getElementById('translateBtn');

            if (!text) return;

            btn.disabled = true;
            btn.innerHTML = 'Đang xử lý...';
            targetBox.value = 'Đang dịch...';

            try {
                const response = await fetch(\`https://api.mymemory.translated.net/get?q=\${encodeURIComponent(text)}&langpair=\${sourceLang}|\${targetLang}\`);
                const data = await response.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    targetBox.value = data.responseData.translatedText;
                } else {
                    targetBox.value = 'Không thể lấy dữ liệu dịch.';
                }
            } catch (error) {
                targetBox.value = 'Đã xảy ra lỗi kết nối.';
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Dịch <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
            }
        }
    </script>
</body>
</html>
`;

http.createServer((req, res) => {
    if (req.url === '/sysinfo') {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            cpu: getCpuUsage(),
            ramPercent: ((usedMem / totalMem) * 100).toFixed(1),
            uptimeStr: formatUptime(os.uptime())
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }
}).listen(7860, () => console.log('UI Server Running on port 7860'));
