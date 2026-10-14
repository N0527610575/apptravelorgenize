import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3000;
const APK_PATH = path.resolve('app/build/outputs/apk/debug/app-debug.apk');

const htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Travel Companion</title>
  <meta name="description" content="Native Android Travel Document Vault & Smart Companion powered by Kotlin and Jetpack Compose.">
  <meta property="og:title" content="Smart Travel Companion">
  <meta property="og:description" content="Native Android Travel Document Vault & Smart Companion powered by Kotlin and Jetpack Compose.">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f3f4f6; }
    .android-frame { width: 390px; height: 820px; border-radius: 44px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 12px #1f2937; overflow: hidden; position: relative; background: #f2f2f7; color: #1c1c1e; }
    .notch { width: 130px; height: 26px; background: #1f2937; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 50; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4">

  <!-- Top Bar / Actions -->
  <div class="w-full max-w-4xl flex items-center justify-between mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">✈️</div>
      <div>
        <h1 class="font-bold text-lg text-white">Smart Travel Companion (Native Android)</h1>
        <p class="text-xs text-emerald-400 font-mono">● Kotlin 1.9 + Jetpack Compose + Room SQLite</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <a href="/download-apk" download="app-debug.apk" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition">
        <span>⬇️ הורד APK</span>
        <span class="text-xs bg-blue-800 px-2 py-0.5 rounded-md">19 MB</span>
      </a>
    </div>
  </div>

  <div class="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-5xl w-full">
    
    <!-- Android Phone Frame Simulator -->
    <div class="android-frame flex flex-col">
      <div class="notch"></div>
      
      <!-- Android Status Bar -->
      <div class="h-10 pt-2 px-6 flex justify-between items-center text-xs text-gray-500 font-semibold z-40">
        <span>10:00</span>
        <div class="flex gap-1.5 items-center">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      <!-- App Header -->
      <div class="bg-white px-5 py-3 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 class="font-bold text-base text-gray-900">חופשה ברומא</h2>
          <p class="text-xs text-blue-600 font-medium">כספת מקומית מוצפנת • טיסה LY385</p>
        </div>
        <button onclick="toggleVault()" class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200">
          📁 כספת (4)
        </button>
      </div>

      <!-- Scrollable Mobile Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3.5" id="app-body">
        
        <!-- Context Banner -->
        <div id="toast-banner" class="bg-gray-900 text-white p-3 rounded-2xl flex justify-between items-center text-xs shadow-sm">
          <span id="toast-text" class="font-medium">שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.</span>
          <span id="phase-badge" class="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono">BOARDING_GATE</span>
        </div>

        <!-- Flight Status Banner -->
        <div class="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-4 rounded-2xl shadow-md">
          <div class="flex justify-between items-center mb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm">LY385 אל על</span>
                <span class="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">בזמן</span>
              </div>
              <p class="text-xs text-blue-100 mt-0.5">נתב״ג (TLV) ➔ רומא (FCO)</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="bg-white/10 p-2 rounded-xl">
              <div class="text-[10px] text-blue-200">שער עלייה</div>
              <div class="font-black text-amber-300 text-sm mt-0.5">B22</div>
            </div>
            <div class="bg-white/10 p-2 rounded-xl">
              <div class="text-[10px] text-blue-200">המראה</div>
              <div class="font-black text-white text-sm mt-0.5">10:00</div>
            </div>
            <div class="bg-white/10 p-2 rounded-xl">
              <div class="text-[10px] text-blue-200">איסוף כבודה</div>
              <div class="font-black text-emerald-300 text-sm mt-0.5">מסוע 8</div>
            </div>
          </div>
        </div>

        <!-- Hero Card -->
        <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
          <div class="w-full flex justify-between items-center mb-3">
            <span id="hero-title" class="font-bold text-sm text-gray-900">כרטיס עלייה למטוס - נחמן</span>
            <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">מאובטח Offline</span>
          </div>

          <!-- Hero Dynamic Body -->
          <div id="hero-content" class="w-full flex flex-col items-center py-2">
            <div class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">הצג לסריקה בעמדת השער</div>
            <div class="w-48 h-48 bg-gray-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <div class="text-3xl mb-1">🏁</div>
              <div class="font-mono text-xs font-bold text-gray-600">[ QR / BCBP ]</div>
              <div class="font-black text-xl text-blue-700 mt-1">LY385</div>
            </div>
            <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span id="hero-seat" class="font-bold text-blue-600">מושב 27E</span>
              <span>•</span>
              <span>תקן IATA BCBP</span>
            </div>
          </div>

          <button onclick="toggleHeroMode()" class="text-blue-600 text-xs font-bold mt-3 hover:underline">
            ⇄ החלף תצוגה (ברקוד / מספר מושב ענק)
          </button>
        </div>

        <!-- Passenger Tabs -->
        <div class="space-y-1.5">
          <div class="text-[11px] font-bold text-gray-400 px-1">מעבר מהיר בין כרטיסי נוסעים</div>
          <div class="flex gap-2">
            <button onclick="selectPassenger('pass_1', 'נחמן חסון', '27E')" id="btn-pass-1" class="flex-1 bg-blue-600 text-white p-2.5 rounded-2xl shadow-sm text-right flex items-center justify-between">
              <div>
                <div class="font-bold text-xs flex items-center gap-1.5">
                  <span>נחמן</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div class="text-[10px] text-blue-200">מושב 27E</div>
              </div>
              <span class="text-xs">✓</span>
            </button>
            <button onclick="selectPassenger('pass_2', 'שולמית חיה', '27F')" id="btn-pass-2" class="flex-1 bg-white text-gray-900 border border-gray-200 p-2.5 rounded-2xl text-right flex items-center justify-between">
              <div>
                <div class="font-bold text-xs">שולמית</div>
                <div class="text-[10px] text-gray-400">מושב 27F</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Wayfinding Button (Landed phase) -->
        <div id="wayfinding-box" class="hidden">
          <a href="https://www.google.com/maps/search/?api=1&query=Rome+Marriott+Hotel" target="_blank" class="w-full bg-emerald-600 text-white font-bold text-xs p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
            <span>📍 נווט למלון (Google Maps)</span>
          </a>
        </div>

      </div>

      <!-- Android Navigation Bar -->
      <div class="h-6 flex justify-center items-center pb-2">
        <div class="w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>

    <!-- Side Control Panel: Sensor Simulation & Info -->
    <div class="flex-1 max-w-md space-y-4">
      <div class="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-lg">
        <h3 class="font-bold text-sm text-white mb-1 flex items-center gap-2">
          <span>🎛️ סימולטור חיישני מכשיר (State Machine)</span>
        </h3>
        <p class="text-xs text-gray-400 mb-4">בדוק את תגובת האפליקציה לחיישני חומרה (ברומטר, אקסלרומטר, GPS):</p>
        
        <div class="grid grid-cols-2 gap-2 text-xs">
          <button onclick="setPhase('AT_DEPARTURE_AIRPORT', 'הגעת לשדה התעופה. בורדינג ייפתח 45 דק׳ לפני ההמראה.', false)" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-right font-medium">
            🏢 שדה תעופה (GPS)
          </button>
          <button onclick="setPhase('BOARDING_GATE', 'שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.', true)" class="p-3 bg-blue-600/30 border border-blue-500/40 rounded-xl text-right font-bold text-blue-300">
            🎫 שער עלייה (ברקוד)
          </button>
          <button onclick="setPhase('FINDING_SEAT', 'טיסה נעימה. מספר המושב שלך מוצג על המסך.', false, 'seat')" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-right font-medium">
            💺 מציאת מושב (ענק)
          </button>
          <button onclick="setPhase('IN_FLIGHT', 'מצב טיסה פעיל (צניחת לחץ ברומטרי > 30 hPa).', false, 'seat')" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-right font-medium">
            ✈️ טיסה (ברומטר)
          </button>
          <button onclick="setPhase('LANDED_AT_DESTINATION', 'ברוכים הבאים לרומא! לחץ למטה לניווט למלון.', false, 'seat', true)" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-right font-medium text-emerald-400">
            🛬 נחיתה ביעד (ניווט)
          </button>
          <button onclick="setPhase('IDLE_PRE_TRIP', 'חופשה מתקרבת.', false)" class="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-right font-medium">
            🏠 שגרה / בית
          </button>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-lg text-xs space-y-2 text-gray-300">
        <h4 class="font-bold text-white text-sm mb-2">📦 סטטוס פרויקט Android Native</h4>
        <div class="flex justify-between border-b border-gray-800 pb-1.5">
          <span class="text-gray-400">קומפילציית Gradle</span>
          <span class="text-emerald-400 font-bold">✅ Succeeded (APK ready)</span>
        </div>
        <div class="flex justify-between border-b border-gray-800 pb-1.5">
          <span class="text-gray-400">מסלול APK</span>
          <span class="font-mono text-[11px] text-gray-300">app/build/.../app-debug.apk</span>
        </div>
        <div class="flex justify-between border-b border-gray-800 pb-1.5">
          <span class="text-gray-400">ספריית UI</span>
          <span class="text-blue-400 font-semibold">Jetpack Compose + Material 3</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">מסד נתונים</span>
          <span class="text-purple-400 font-semibold">Room SQLite + VaultCrypto</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    let currentPassenger = { id: 'pass_1', name: 'נחמן חסון', seat: '27E' };
    let heroMode = 'barcode'; // 'barcode' or 'seat'

    function selectPassenger(id, name, seat) {
      currentPassenger = { id, name, seat };
      document.getElementById('hero-title').innerText = 'כרטיס עלייה למטוס - ' + name.split(' ')[0];
      document.getElementById('hero-seat').innerText = 'מושב ' + seat;
      
      const btn1 = document.getElementById('btn-pass-1');
      const btn2 = document.getElementById('btn-pass-2');
      if (id === 'pass_1') {
        btn1.className = 'flex-1 bg-blue-600 text-white p-2.5 rounded-2xl shadow-sm text-right flex items-center justify-between';
        btn2.className = 'flex-1 bg-white text-gray-900 border border-gray-200 p-2.5 rounded-2xl text-right flex items-center justify-between';
      } else {
        btn2.className = 'flex-1 bg-blue-600 text-white p-2.5 rounded-2xl shadow-sm text-right flex items-center justify-between';
        btn1.className = 'flex-1 bg-white text-gray-900 border border-gray-200 p-2.5 rounded-2xl text-right flex items-center justify-between';
      }
      renderHero();
    }

    function toggleHeroMode() {
      heroMode = heroMode === 'barcode' ? 'seat' : 'barcode';
      renderHero();
    }

    function renderHero() {
      const el = document.getElementById('hero-content');
      if (heroMode === 'barcode') {
        el.innerHTML = \`
          <div class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">הצג לסריקה בעמדת השער</div>
          <div class="w-48 h-48 bg-gray-50 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
            <div class="text-3xl mb-1">🏁</div>
            <div class="font-mono text-xs font-bold text-gray-600">[ QR / BCBP ]</div>
            <div class="font-black text-xl text-blue-700 mt-1">LY385</div>
          </div>
          <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span class="font-bold text-blue-600">מושב \${currentPassenger.seat}</span>
            <span>•</span>
            <span>תקן IATA BCBP</span>
          </div>
        \`;
      } else {
        el.innerHTML = \`
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">המושב שלך במטוס</div>
          <div class="text-8xl font-black text-blue-600 font-mono my-2">\${currentPassenger.seat}</div>
          <div class="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium">תא עליון מעל השורה • שרוול ישיר</div>
        \`;
      }
    }

    function setPhase(phase, toast, showBarcode, forceHeroMode, showWayfinding) {
      document.getElementById('toast-text').innerText = toast;
      document.getElementById('phase-badge').innerText = phase;
      if (forceHeroMode) {
        heroMode = forceHeroMode;
        renderHero();
      } else if (showBarcode) {
        heroMode = 'barcode';
        renderHero();
      }
      const wf = document.getElementById('wayfinding-box');
      if (showWayfinding) {
        wf.classList.remove('hidden');
      } else {
        wf.classList.add('hidden');
      }
    }

    function toggleVault() {
      alert("כספת מקומית מוצפנת (Room Database):\\n- 2 כרטיסי עלייה למטוס (IATA BCBP)\\n- 1 שובר מלון Rome Marriott\\n- 1 פוליסת ביטוח PassportCard");
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/download-apk') {
    if (fs.existsSync(APK_PATH)) {
      const stat = fs.statSync(APK_PATH);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="SmartTravelCompanion-debug.apk"',
        'Content-Length': stat.size
      });
      const stream = fs.createReadStream(APK_PATH);
      stream.pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('APK not found. Please compile the app first.');
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlContent);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Smart Travel Companion Server running on http://0.0.0.0:${PORT}`);
});
