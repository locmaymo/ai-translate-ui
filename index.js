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
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d} ngày ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m} phút ${s} giây`;
}

// Giao diện HTML cao cấp
const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Translate Studio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; overflow-x: hidden; }
        /* Nền Gradient mờ ảo sang trọng */
        .bg-mesh {
            background-image: 
                radial-gradient(at 0% 0%, hsla(253,16%,7%,0.03) 0px, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,39%,30%,0.03) 0px, transparent 50%),
                radial-gradient(at 100% 0%, hsla(339,49%,30%,0.03) 0px, transparent 50%);
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>
<body class="text-slate-800 min-h-screen bg-mesh flex flex-col relative">
    
    <!-- Các đốm sáng trang trí nền -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300 mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-purple-300 mix-blend-multiply filter blur-[100px] opacity-30 -z-10 animate-pulse" style="animation-duration: 10s;"></div>

    <main class="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Header Section -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                </div>
                <div>
                    <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        AI Translate <span class="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Studio</span>
                    </h1>
                    <p class="text-sm font-medium text-slate-500 mt-1">Nền tảng dịch thuật đa ngôn ngữ thông minh</p>
                </div>
            </div>
            
            <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <span class="flex h-3 w-3 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span class="text-sm font-bold text-slate-700">Hệ thống Đang chạy</span>
            </div>
        </header>

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            <!-- Cột Trái: Khu vực Dịch thuật (Chiếm 8 cột) -->
            <div class="xl:col-span-8 space-y-6">
                <div class="glass-card rounded-[2rem] p-6 relative overflow-hidden">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        
                        <!-- Ô Nhập Gốc -->
                        <div class="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm h-[480px] focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <div class="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                                <select class="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:text-indigo-600 transition" id="sourceLang">
                                    <option value="en">🇺🇸 Tiếng Anh (English)</option>
                                    <option value="vi">🇻🇳 Tiếng Việt</option>
                                    <option value="ja">🇯🇵 Tiếng Nhật (日本語)</option>
                                    <option value="zh">🇨🇳 Tiếng Trung (中文)</option>
                                    <option value="ko">🇰🇷 Tiếng Hàn (한국어)</option>
                                    <option value="fr">🇫🇷 Tiếng Pháp (Français)</option>
                                </select>
                            </div>
                            <textarea id="sourceText" class="custom-scrollbar flex-1 w-full p-5 resize-none outline-none text-lg text-slate-700 bg-transparent placeholder-slate-400" placeholder="Nhập văn bản cần dịch tại đây..."></textarea>
                            <div class="px-5 py-4 flex justify-between items-center border-t border-slate-50">
                                <span class="text-xs font-semibold text-slate-400" id="charCount">0 ký tự</span>
                                <button onclick="translateText()" id="translateBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-200">
                                    Dịch ngay
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Ô Kết quả -->
                        <div class="flex flex-col bg-indigo-50/30 rounded-2xl border border-indigo-100/50 shadow-sm h-[480px]">
                            <div class="px-5 py-4 border-b border-indigo-100/50 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
                                <select class="text-sm font-bold text-indigo-700 bg-transparent outline-none cursor-pointer" id="targetLang">
                                    <option value="vi">🇻🇳 Tiếng Việt</option>
                                    <option value="en">🇺🇸 Tiếng Anh (English)</option>
                                    <option value="ja">🇯🇵 Tiếng Nhật (日本語)</option>
                                    <option value="zh">🇨🇳 Tiếng Trung (中文)</option>
                                    <option value="ko">🇰🇷 Tiếng Hàn (한국어)</option>
                                    <option value="fr">🇫🇷 Tiếng Pháp (Français)</option>
                                </select>
                                <button onclick="copyTarget()" class="text-indigo-500 hover:text-indigo-700 p-1 transition" title="Sao chép">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                </button>
                            </div>
                            <textarea id="targetText" readonly class="custom-scrollbar flex-1 w-full p-5 resize-none outline-none text-lg text-slate-800 bg-transparent" placeholder="Bản dịch sẽ xuất hiện tại đây..."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cột Phải: System Monitor (Chiếm 4 cột) -->
            <div class="xl:col-span-4">
                <div class="glass-card rounded-[2rem] p-6 sticky top-8">
                    <h2 class="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                        Tài Nguyên Máy Chủ
                    </h2>
                    
                    <div class="space-y-5">
                        
                        <!-- Uptime Card -->
                        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime</div>
                                    <div id="sys-uptime" class="text-sm font-bold text-slate-700 mt-0.5">Đang tải...</div>
                                </div>
                            </div>
                        </div>

                        <!-- CPU Widget -->
                        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div class="flex justify-between items-end mb-3">
                                <div class="flex items-center gap-2 text-slate-700">
                                    <div class="p-1.5 bg-sky-50 rounded-lg"><svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg></div>
                                    <span class="font-bold text-sm">CPU Load</span>
                                </div>
                                <span id="sys-cpu-pct" class="text-3xl font-black text-slate-800 tracking-tight">0%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                                <div id="cpuBar" class="bg-gradient-to-r from-sky-400 to-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" style="width: 0%"></div>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" id="sys-cpu-cores">0 Cores</div>
                                <div class="text-sm font-semibold text-slate-700 leading-tight" id="sys-cpu-model">Đang tải thông tin CPU...</div>
                            </div>
                        </div>

                        <!-- RAM Widget -->
                        <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div class="flex justify-between items-end mb-3">
                                <div class="flex items-center gap-2 text-slate-700">
                                    <div class="p-1.5 bg-amber-50 rounded-lg"><svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg></div>
                                    <span class="font-bold text-sm">Memory</span>
                                </div>
                                <span id="sys-ram-pct" class="text-3xl font-black text-slate-800 tracking-tight">0%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                                <div id="ramBar" class="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" style="width: 0%"></div>
                            </div>
                            
                            <!-- Bảng thông số RAM chi tiết -->
                            <div class="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Used</div>
                                    <div id="sys-ram-used" class="text-sm font-bold text-slate-700 mt-0.5">0 GB</div>
                                </div>
                                <div class="border-x border-slate-200">
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Free</div>
                                    <div id="sys-ram-free" class="text-sm font-bold text-emerald-600 mt-0.5">0 GB</div>
                                </div>
                                <div>
                                    <div class="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                                    <div id="sys-ram-total" class="text-sm font-bold text-slate-700 mt-0.5">0 GB</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Lắng nghe độ dài văn bản
        document.getElementById('sourceText').addEventListener('input', function() {
            document.getElementById('charCount').innerText = this.value.length + ' ký tự';
        });

        // Copy văn bản đích
        function copyTarget() {
            const text = document.getElementById('targetText');
            if(text.value) {
                text.select();
                document.execCommand('copy');
                alert('Đã sao chép bản dịch!');
            }
        }

        // Cập nhật thông số hệ thống Realtime từ API
        setInterval(async () => {
            try { 
                const res = await fetch('/sysinfo'); 
                const data = await res.json();
                
                // Cập nhật Uptime
                document.getElementById('sys-uptime').innerText = data.uptimeStr;

                // Cập nhật CPU
                document.getElementById('sys-cpu-pct').innerText = data.cpuPercent + '%'; 
                document.getElementById('cpuBar').style.width = data.cpuPercent + '%';
                document.getElementById('sys-cpu-cores').innerText = data.cpuCores + ' CPU Cores';
                document.getElementById('sys-cpu-model').innerText = data.cpuModel;
                
                // Cập nhật RAM chi tiết
                document.getElementById('sys-ram-pct').innerText = data.ramPercent + '%'; 
                document.getElementById('ramBar').style.width = data.ramPercent + '%';
                document.getElementById('sys-ram-used').innerText = data.ramUsedGB;
                document.getElementById('sys-ram-free').innerText = data.ramFreeGB;
                document.getElementById('sys-ram-total').innerText = data.ramTotalGB;
                
            } catch(e) {}
        }, 1500);

        // Logic Gọi API Dịch thuật MyMemory
        async function translateText() {
            const text = document.getElementById('sourceText').value.trim();
            if (!text) return;
            
            const sl = document.getElementById('sourceLang').value;
            const tl = document.getElementById('targetLang').value;
            const tb = document.getElementById('targetText');
            const btn = document.getElementById('translateBtn');
            
            btn.disabled = true; 
            btn.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>'; 
            tb.value = 'Hệ thống đang phân tích ngữ nghĩa...';
            
            try {
                const response = await fetch(\`https://api.mymemory.translated.net/get?q=\${encodeURIComponent(text)}&langpair=\${sl}|\${tl}\`);
                const data = await response.json();
                tb.value = (data && data.responseData && data.responseData.translatedText) 
                            ? data.responseData.translatedText 
                            : 'Lỗi phản hồi, vui lòng thử lại.';
            } catch (e) { 
                tb.value = 'Không thể kết nối đến máy chủ dịch thuật lúc này.'; 
            } finally { 
                btn.disabled = false; 
                btn.innerHTML = 'Dịch ngay <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>'; 
            }
        }
    </script>
</body>
</html>`;

http.createServer((req, res) => {
    if (req.url === '/sysinfo') {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        const cpus = os.cpus();
        // Xóa các ký tự thừa như (R), (TM), @ tốc độ... để tên chip hiển thị đẹp hơn
        const cpuModel = cpus.length > 0 ? cpus[0].model.replace(/\(R\)|\(TM\)|@.*$/g, '').trim() : "Unknown CPU";
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            cpuPercent: getCpuUsage(), 
            cpuModel: cpuModel, 
            cpuCores: cpus.length,
            ramPercent: ((usedMem / totalMem) * 100).toFixed(1), 
            ramUsedGB: (usedMem / 1024 / 1024 / 1024).toFixed(2) + " GB",
            ramFreeGB: (freeMem / 1024 / 1024 / 1024).toFixed(2) + " GB",
            ramTotalGB: (totalMem / 1024 / 1024 / 1024).toFixed(2) + " GB",
            uptimeStr: formatUptime(os.uptime()) 
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); 
        res.end(html);
    }
}).listen(7860, '0.0.0.0', () => console.log('UI Server Running on port 7860'));
