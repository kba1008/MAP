// Global Error Handler
window.addEventListener('error', function(event) {
  console.error('[Pengesan Ralat]', event.error || event.message);
  showToast('Ralat aplikasi: ' + (event.message || 'Sesuatu yang tidak dijangka berlaku.'), 'error');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => console.log('ServiceWorker didaftarkan'))
      .catch(error => console.error('ServiceWorker gagal:', error));
  });
}

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzgHoqiFOpdGfD7kgfZHtaPmlhWzkZWVCTAT8HSNeOvAb2DOr592vqstUFPmHiH7rSM/exec";

const EMOJI_LIST = [
  "📍 Lokasi Biasa", "🏁 Mula/Tamat", "🚩 Bendera Merah", "🎌 Bendera Silang", "⭐ Bintang",
  "⛺ Khemah", "🎯 Sasaran", "🏃 Larian", "🚶 Berjalan", "🚴 Berbasikal",
  "🚗 Kereta", "🚑 Ambulans", "🚓 Polis", "🚒 Bomba", "🚁 Helikopter",
  "🏥 Hospital", "💊 Kecemasan", "🏪 Kedai", "🍔 Makanan", "☕ Minuman",
  "🥤 Air", "🚰 punca Air", "🚽 Tandas", "🚹 Tandas Lelaki", "🚺 Tandas Wanita",
  "⚠️ Amaran", "⛔ Dilarang Masuk", "❌ Salah", "✅ Betul/Selesai", "ℹ️ Informasi",
  "🏕️ Tapak Perkhemahan", "🔥 Unggun Api", "🌲 Kawasan Hutan", "⛰️ Bukit/Gunung", "🧭 Kompas",
  "🗺️ Peta Laluan", "🔦 Lampu Suluh", "🎒 Beg Sandang", "📻 Walkie Talkie", "⏱️ Masa/Jam Randik",
  "📌 Checkpoint", "🛤️ Trek/Laluan", "🌉 Jambatan", "🦟 Kawasan Serangga", "🩹 Peti Kecemasan",
  "📣 Taklimat/Pengumuman", "📸 Kawasan Bergambar", "🗑️ Tong Sampah", "☀️ Siang/Panas", "🌙 Waktu Malam"
];

// Sistem Pemantauan Viewer (Presence)
const mySessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
let presenceInterval = null;

// ============================================================
// Domain Lock (Soft Lock)
// Nota: Ini menghalang "clone biasa" daripada berjalan pada domain lain.
// Ia bukan keselamatan 100% (attacker mahir masih boleh bypass).
// ============================================================
const DOMAIN_LOCK = {
  // ⇩⇩⇩ SUIS INDUK: tukar ke `true` untuk aktifkan semula sekatan domain. ⇩⇩⇩
  enabled: false,
  allowedOrigins: ['https://kba1008.github.io'],
  allowedPathPrefix: '/MAP/', // repo GitHub Pages: https://kba1008.github.io/MAP/
  storageKey: 'domain_lock', // localStorage key
  bypassValue: 'off' // bila "off" → bypass domain lock (untuk dev)
};

function isDomainLockBypassed_() {
  try {
    if (DOMAIN_LOCK.enabled === false) return true; // suis induk OFF → sentiasa bypass
    const params = new URLSearchParams(window.location.search);
    if (params.get('domain_lock') === DOMAIN_LOCK.bypassValue) return true;
    if (localStorage.getItem(DOMAIN_LOCK.storageKey) === DOMAIN_LOCK.bypassValue) return true;
    return false;
  } catch (e) {
    return false;
  }
}

// Jadikan mudah untuk enable/disable bila-bila (boleh dipanggil dari console atau butang tetapan).
window.disableDomainLock = function(ingatPeranti = true) {
  try {
    if (ingatPeranti) localStorage.setItem(DOMAIN_LOCK.storageKey, DOMAIN_LOCK.bypassValue);
  } catch (e) {}
  const u = new URL(window.location.href);
  u.searchParams.set('domain_lock', DOMAIN_LOCK.bypassValue);
  window.location.href = u.toString();
};

window.enableDomainLock = function() {
  try { localStorage.removeItem(DOMAIN_LOCK.storageKey); } catch (e) {}
  const u = new URL(window.location.href);
  u.searchParams.delete('domain_lock');
  window.location.href = u.toString();
};

function enforceDomainLock() {
  try {
    if (isDomainLockBypassed_()) return;

    const okOrigin = DOMAIN_LOCK.allowedOrigins.includes(window.location.origin);
    const okPath = window.location.pathname.startsWith(DOMAIN_LOCK.allowedPathPrefix);
    if (!okOrigin || !okPath) {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui;background:#0f172a;color:#fff;">
          <div style="max-width:560px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:20px;">
            <h2 style="margin:0 0 8px 0;font-size:18px;">Akses Disekat</h2>
            <p style="margin:0 0 10px 0;opacity:0.9;font-size:13px;line-height:1.5;">
              Aplikasi ini dikunci kepada domain rasmi. Sila guna pautan rasmi GitHub Pages.
            </p>
            <p style="margin:0;font-size:12px;opacity:0.7;">
              Origin semasa: <b>${escapeXml(window.location.origin)}</b><br/>
              Path semasa: <b>${escapeXml(window.location.pathname)}</b>
            </p>
            <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
              <button onclick="(function(){try{var u=new URL(location.href);u.searchParams.set('domain_lock','off');location.href=u.toString();}catch(e){location.href=location.href + (location.search?'&':'?') + 'domain_lock=off';}})()"
                style="flex:1;min-width:180px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(16,185,129,0.2);color:#fff;cursor:pointer;font-weight:600;">
                Buka untuk sesi ini
              </button>
              <button onclick="(function(){try{localStorage.setItem('domain_lock','off');}catch(e){} try{var u=new URL(location.href);u.searchParams.set('domain_lock','off');location.href=u.toString();}catch(e){location.href=location.href + (location.search?'&':'?') + 'domain_lock=off';}})()"
                style="flex:1;min-width:180px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(59,130,246,0.2);color:#fff;cursor:pointer;font-weight:600;">
                Buka & ingat peranti
              </button>
            </div>
            <p style="margin:12px 0 0 0;font-size:11px;opacity:0.75;line-height:1.45;">
              Nota: Ini hanya untuk ujian/dev. Untuk aktifkan semula domain lock, buang <code>?domain_lock=off</code> dari URL
              atau klik butang “Enable Domain Lock” dalam Tetapan (Master).
            </p>
          </div>
        </div>
      `;
      throw new Error('Domain lock: akses disekat');
    }
  } catch (e) {
    // Jika ada apa-apa ralat semasa render (sangat jarang), tetap hentikan.
    throw e;
  }
}

function appendClientParamsToUrl(url) {
  const u = new URL(url, window.location.href);
  u.searchParams.set('origin', window.location.origin);
  u.searchParams.set('path', window.location.pathname);
  if (isDomainLockBypassed_()) u.searchParams.set('domain_lock', DOMAIN_LOCK.bypassValue);
  return u.toString();
}

let globalUsers = [];
let allData = []; 
let globalSettings = { live_tracking: true };

let mode = null;
let currentUser = null;
let map = null;
let layerControl = null;
let currentBaseLayer = "Google Maps";
let isRecording = false;
let isWaitingForGPS = false;
const ACCURACY_THRESHOLD = 25; 
let watchId = null;
let currentTrekIndex = -1;
let treks = [];
let checkpoints = [];
let mapTexts = [];
let addingCheckpoint = false;
let addingText = false;
let editingCPIndex = -1;
let editingTextIndex = -1;
let pendingCPLatLng = null;
let pendingTextLatLng = null;
let currentEventId = null;
let editingTrekIndex = -1;

let sidebarOpen = false;
let authMode = 'login'; 
let lastGpsPos = null;
let hasUnsavedChanges = false;

let isNavigating = false;
let navWatchId = null;
let userNavMarker = null;

// Simpan kata laluan admin (hanya untuk paparan Master)
let adminPasswordMap = {};

// Web Bluetooth & Multi-Device Variables
let connectedDevices = [];
let deviceGpsWatchId = null;

// Live Tracking Variables
let isLiveBroadcasting = false;
let liveBroadcastWatchId = null;
let lastLiveBroadcastTime = 0;
let liveParticipantMarkers = {};
let globalLiveMonitorInterval = null;

// RainViewer Real-time Radar
let rainLayer = L.tileLayer('', { 
  opacity: 0.6, 
  maxZoom: 22, 
  maxNativeZoom: 13, 
  zIndex: 1000, 
  attribution: '© RainViewer',
  errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
});
let weatherInterval = null;

function escapeXml(unsafe) {
  if(typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
    }
  });
}

// Jalankan domain lock seawal mungkin (sebelum kod peta/Leaflet).
enforceDomainLock();

const mapIconsSVG = {
  'map-pin': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  'flag': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
  'star': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  'tent': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/></svg>',
  'target': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
};

const mapLayers = {
  "Google Maps": L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20, attribution: '© Google Maps' }),
  "Google Satelit": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20, attribution: '© Google Maps' }),
  "Esri Satelit": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '© Esri & Contributors' }),
  "OSM Standard (Denai & Jalan)": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }),
  "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap' })
};

const hikingOverlay = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '© Waymarked Trails',
  transparent: true,
  opacity: 0.8
});

const overlays = {
  "Google Rupa Bumi (Kontur)": L.tileLayer('https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20, opacity: 0.6, attribution: '© Google Maps' }),
  "Radar Cuaca Terkini (RainViewer)": rainLayer,
  "Laluan Hiking & Denai": hikingOverlay
};

async function fetchWeatherRadar() {
    try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
            const latest = data.radar.past[data.radar.past.length - 1];
            const host = data.host;
            const colorScheme = 2;
            const smooth = 1;
            const snow = 1;
            const tileUrl = `${host}${latest.path}/256/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.png`;
            rainLayer.setUrl(tileUrl);
            console.log('[Radar Cuaca] Dikemaskini:', new Date(latest.time * 1000).toLocaleString());
        }
    } catch(e) {
        console.error('[Radar Cuaca] Gagal memuatkan data dari RainViewer API:', e);
    }
}

function bindMarkerEditEvents(marker) {
  if (mode !== 'admin' && mode !== 'master') return;
  const triggerEdit = (e) => {
    if (e && e.originalEvent) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
    }
    const idx = checkpoints.findIndex(c => c.marker === marker);
    if (idx > -1) {
        openEditCP(idx);
    }
  };
  marker.off('contextmenu', triggerEdit).on('contextmenu', triggerEdit);
  marker.off('dblclick', triggerEdit).on('dblclick', triggerEdit);
}

function bindTrekDblClick(layer, name) {
    layer.off('dblclick').on('dblclick', function(e) {
        L.DomEvent.stopPropagation(e);
        if (mode === 'admin' || mode === 'master') {
            const idx = treks.findIndex(t => t.polyline === layer);
            if (idx > -1) editTrek(idx);
        }
    });
    if (name) {
        if (layer.getTooltip()) {
            layer.setTooltipContent(name);
        } else {
            layer.bindTooltip(name, { sticky: true, className: 'bg-slate-800 text-white border-0 rounded px-2 py-0.5 text-xs shadow-md' });
        }
    }
}

let _dialogResolve = null;
function closeDialog(result) {
    document.getElementById('custom-dialog').classList.add('hidden');
    if (_dialogResolve) _dialogResolve(result);
    _dialogResolve = null;
}

function customDialog({ type, title, msg, defaultVal }) {
    return new Promise((resolve) => {
        _dialogResolve = resolve;
        const modal = document.getElementById('custom-dialog');
        document.getElementById('dialog-title').textContent = title || 'Perhatian';
        document.getElementById('dialog-msg').innerHTML = msg || '';
        
        const input = document.getElementById('dialog-input');
        const btns = document.getElementById('dialog-buttons');
        
        if(type === 'prompt') {
            input.classList.remove('hidden');
            input.value = defaultVal || '';
            input.focus();
            btns.innerHTML = `
                <button onclick="closeDialog(null)" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">Batal</button>
                <button onclick="closeDialog(document.getElementById('dialog-input').value)" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors">Sahkan</button>
            `;
        } else if(type === 'confirm') {
            input.classList.add('hidden');
            btns.innerHTML = `
                <button onclick="closeDialog(false)" class="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">Batal</button>
                <button onclick="closeDialog(true)" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors">Pasti</button>
            `;
        } else {
            input.classList.add('hidden');
            btns.innerHTML = `
                <button onclick="closeDialog(true)" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors">Tutup</button>
            `;
        }
        modal.classList.remove('hidden');
    });
}

function markUnsavedChanges() {
    hasUnsavedChanges = true;
    const saveBtn = document.getElementById('save-btn');
    if(saveBtn) {
        saveBtn.classList.add('btn-pulse');
        saveBtn.classList.replace('bg-cyan-500', 'bg-amber-500');
        saveBtn.classList.replace('hover:bg-cyan-600', 'hover:bg-amber-600');
    }
}

function clearUnsavedChanges() {
    hasUnsavedChanges = false;
    const saveBtn = document.getElementById('save-btn');
    if(saveBtn) {
        saveBtn.classList.remove('btn-pulse');
        saveBtn.classList.replace('bg-amber-500', 'bg-cyan-500');
        saveBtn.classList.replace('hover:bg-amber-600', 'hover:bg-cyan-600');
    }
}

function setupEmojiDropdown() {
    const select = document.getElementById('cp-icon');
    if (!select) return;
    select.innerHTML = '';
    const standard = [
       {v: 'map-pin', t: '📍 Pin Biasa'},
       {v: 'flag', t: '🚩 Bendera'},
       {v: 'star', t: '⭐ Bintang'},
       {v: 'tent', t: '⛺ Khemah'},
       {v: 'target', t: '🎯 Sasaran'}
    ];
    standard.forEach(s => select.add(new Option(s.t, s.v)));
    
    const optGroup = document.createElement('optgroup');
    optGroup.label = "Ikon Emoji";
    EMOJI_LIST.forEach(e => {
        const val = e.split(' ')[0]; 
        optGroup.appendChild(new Option(e, val));
    });
    select.appendChild(optGroup);
}

function getCustomIcon(iconName, color = '#10b981', size = 28) {
  size = parseInt(size) || 28;
  const halfSize = size / 2;
  const padding = Math.max(2, Math.floor(size * 0.15));

  if (mapIconsSVG[iconName]) {
    const svg = mapIconsSVG[iconName];
    return L.divIcon({
      html: `<div style="background:${color}; padding: ${padding}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); color: white;">${svg}</div>`,
      className: 'custom-cp-icon',
      iconSize: [size, size],
      iconAnchor: [halfSize, halfSize],
      popupAnchor: [0, -halfSize]
    });
  } else {
    const fontSize = Math.max(12, Math.floor(size * 0.55));
    return L.divIcon({
      html: `<div style="background:white; padding: 2px; border-radius: 50%; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: ${fontSize}px;">${iconName}</div>`,
      className: 'custom-cp-icon',
      iconSize: [size, size],
      iconAnchor: [halfSize, halfSize],
      popupAnchor: [0, -halfSize]
    });
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function getPolygonArea(coords) {
  const R = 6378137;
  let area = 0;
  if (coords.length < 3) return 0;
  for (let i = 0; i < coords.length; i++) {
      let j = (i + 1) % coords.length;
      let lat1 = coords[i].lat * Math.PI / 180;
      let lat2 = coords[j].lat * Math.PI / 180;
      let lng1 = coords[i].lng * Math.PI / 180;
      let lng2 = coords[j].lng * Math.PI / 180;
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = area * R * R / 2.0;
  return Math.abs(area);
}

function openMediaViewer(elementId, type) {
    const sourceEl = document.getElementById(elementId);
    if(!sourceEl || sourceEl.classList.contains('hidden')) return;

    const modal = document.getElementById('media-viewer-modal');
    const img = document.getElementById('media-viewer-img');
    const vid = document.getElementById('media-viewer-vid');

    if (type === 'image') {
        img.src = sourceEl.src;
        img.classList.remove('hidden');
        vid.classList.add('hidden');
        vid.pause();
    } else {
        vid.src = sourceEl.src;
        vid.classList.remove('hidden');
        img.classList.add('hidden');
        vid.play();
    }
    modal.classList.remove('hidden');
}

function closeMediaViewer() {
    const modal = document.getElementById('media-viewer-modal');
    const vid = document.getElementById('media-viewer-vid');
    vid.pause();
    vid.src = '';
    document.getElementById('media-viewer-img').src = '';
    modal.classList.add('hidden');
}

function bindCheckpointPopup(marker, name, lat, lng, media = {}, desc = '') {
  const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeLink = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  
  const loadingSvg = `<svg class="w-5 h-5 text-emerald-500 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

  const images = Array.isArray(media.images) ? media.images : [];
  const video = (media.video && media.video.id) ? media.video : null;

  const mediaLoadList = []; // { domId, mediaId, kind, mimeType? }
  let mediaHtml = '';

  if (video && video.id) {
    const vidDomId = 'vid-' + Math.random().toString(36).substr(2, 9);
    mediaLoadList.push({ domId: vidDomId, mediaId: video.id, kind: 'video' });
    mediaHtml += `
      <div class="relative w-full h-36 mt-2 mb-3 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer group" onclick="openMediaViewer('${vidDomId}', 'video')">
         <div id="${vidDomId}-loader" class="absolute inset-0 flex items-center justify-center text-[11px] text-white bg-slate-800 z-10">${loadingSvg} Memuatkan Video...</div>
         <video id="${vidDomId}" class="hidden w-full h-full object-cover" muted playsinline loop></video>
         <div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all z-20">
             <svg class="w-10 h-10 text-white opacity-90 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
         </div>
         <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 z-20"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Video</div>
      </div>`;
  }

  if (images.length > 0) {
    const grid = images.map((img) => {
      const id = (img && typeof img === 'object') ? img.id : String(img || '');
      const imgDomId = 'img-' + Math.random().toString(36).substr(2, 9);
      mediaLoadList.push({ domId: imgDomId, mediaId: id, kind: 'image' });
      return `
        <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer group" onclick="openMediaViewer('${imgDomId}', 'image')">
           <div id="${imgDomId}-loader" class="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 bg-slate-200 z-10">${loadingSvg} Memuatkan...</div>
           <img id="${imgDomId}" class="hidden w-full h-full object-cover">
           <div class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all z-20">
               <svg class="w-8 h-8 text-white opacity-90 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
           </div>
        </div>`;
    }).join('');

    mediaHtml += `
      <div class="mt-2 mb-3">
        <p class="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-bold text-center">Gambar (${images.length})</p>
        <div class="grid grid-cols-3 gap-2">
          ${grid}
        </div>
      </div>`;
  }

  let descHtml = desc ? `<div class="bg-slate-50 p-2.5 rounded-lg mb-3 border border-slate-200 text-left shadow-sm"><p class="text-[11px] md:text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">${escapeXml(desc)}</p></div>` : '';

  const popupContent = `
    <div class="text-left min-w-[220px] max-w-[280px]">
      <h3 class="text-[15px] font-bold text-slate-800 mb-1 leading-tight break-words pr-2 border-b border-slate-200 pb-2">${escapeXml(name)}</h3>
      ${mediaHtml}
      ${descHtml}
      <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg mb-3 border border-slate-200 shadow-sm">
        <div class="text-left">
           <span class="block text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Koordinat Semasa</span>
           <span class="block text-[11px] text-slate-700 font-mono font-semibold">${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
           <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
      <p class="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-bold text-center">Navigasi Ke Lokasi</p>
      <div class="grid grid-cols-2 gap-2">
        <a href="${gmapsLink}" target="_blank" class="py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold no-underline hover:bg-blue-600 hover:text-white transition-colors flex flex-col items-center justify-center gap-1 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> G-Maps
        </a>
        <a href="${wazeLink}" target="_blank" class="py-2 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-semibold no-underline hover:bg-cyan-500 hover:text-white transition-colors flex flex-col items-center justify-center gap-1 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg> Waze
        </a>
      </div>
    </div>
  `;
  
  marker.bindPopup(popupContent, { minWidth: 220, className: 'custom-modern-popup' });

  marker.off('popupopen');
  if (mediaLoadList.length > 0) {
    marker.on('popupopen', function() {
      mediaLoadList.forEach(item => {
        const el = document.getElementById(item.domId);
        const loader = document.getElementById(`${item.domId}-loader`);
        if (!el || !loader) return;
        if (!el.classList.contains('hidden') || el.dataset.fetching) return;

        el.dataset.fetching = "true";
        fetch(appendClientParamsToUrl(GAS_WEB_APP_URL + "?action=get_media&media_id=" + encodeURIComponent(item.mediaId)))
          .then(res => res.json())
          .then(data => {
            if (data.status === 'ok') {
              el.src = `data:${data.mimeType};base64,${data.base64}`;
              el.classList.remove('hidden');
              loader.classList.add('hidden');
              if (item.kind === 'video') {
                el.muted = true;
                el.play().catch(() => {});
              }
            } else {
              loader.innerHTML = `<span class="text-[10px] text-red-500 font-bold">Gagal</span>`;
            }
          })
          .catch(() => {
            loader.innerHTML = `<span class="text-[10px] text-red-500 font-bold">Ralat</span>`;
          });
      });
    });
  }
}

async function pingPresence() {
    try {
        const res = await fetch(appendClientParamsToUrl(GAS_WEB_APP_URL + "?action=ping&session_id=" + mySessionId));
        const data = await res.json();
        if (data && data.status === 'ok') {
            const badge = document.getElementById('active-viewers-badge');
            const countEl = document.getElementById('active-viewers-count');
            if (badge && countEl) {
                countEl.textContent = data.count;
                badge.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.log("Presence ping failed", e);
    }
}

function startPresencePing() {
    pingPresence();
    presenceInterval = setInterval(pingPresence, 45000);
}

window.addEventListener('load', async () => {
  setupEmojiDropdown();
  startPresencePing();
  
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('share');
  
  if (shareId) {
     mode = 'shared-viewer';
     document.getElementById('login-screen').classList.add('hidden');
     document.getElementById('main-screen').classList.remove('hidden');
     document.getElementById('topbar').classList.add('hidden');
     document.getElementById('sidebar').classList.add('hidden');
     sidebarOpen = false;
     
     if (!map) initMap(); 
     else map.invalidateSize();
     
     await syncFromGAS();
     loadSharedViewerEvent(shareId);
  } else {
     const storedUser = localStorage.getItem('trek_mapper_session');
     if(storedUser) {
         try {
             currentUser = JSON.parse(storedUser);
             showToast('Sesi dipulihkan. Selamat kembali, ' + currentUser.username, 'info');
             startApp(currentUser.role);
         } catch(e) {
             console.error("Session parse error", e);
             localStorage.removeItem('trek_mapper_session');
         }
     }
     syncFromGAS();
  }
});

async function syncFromGAS() {
  const overlay = document.getElementById('sync-overlay');
  if(overlay) overlay.classList.remove('hidden');
  try {
    let url = appendClientParamsToUrl(GAS_WEB_APP_URL + "?action=getData");
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (shareId) {
        url = appendClientParamsToUrl(GAS_WEB_APP_URL + "?action=getSharedEvent&event_id=" + encodeURIComponent(shareId));
    }

    const response = await fetch(url);
    const text = await response.text();
    
    if (text.includes('<html') || text.includes('Sign in')) {
       throw new Error("Akses Ditolak: Sila pastikan Web App GAS di-deploy dengan akses 'Anyone'.");
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch(e) {
      throw new Error('Format Data Pelayan tidak sah. Pastikan pautan Web App GAS betul.');
    }

    if (json.status === 'ok') {
      globalUsers = json.data.users || [];
      allData = json.data.trekData || [];
      globalSettings = json.data.settings || { live_tracking: true };
      
      if (currentUser && currentUser.role === 'admin') renderSavedEvents();
      if (currentUser && currentUser.role === 'master') {
         renderAdminList();
         renderMasterEventList();
      }
      
      applyTrackingSettingsVisibility();

      if (mode !== 'shared-viewer') {
        showToast('Data dikemaskini dari pangkalan', 'success');
      }
    } else {
      throw new Error(json.message || 'Ralat dari pelayan.');
    }
  } catch (error) {
    console.error('Gagal menyegerak:', error);
    showToast(error.message || 'Gagal menyegerak data dari server. Sila semak pautan.', 'error');
  } finally {
    if(overlay) overlay.classList.add('hidden');
  }
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-cyan-500', warning: 'bg-amber-500' };
  const div = document.createElement('div');
  div.className = `toast px-4 py-2.5 ${colors[type] || colors.info} rounded-lg text-sm font-medium shadow-lg pointer-events-auto text-white flex items-center gap-2`;
  
  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'x-circle' : 'info');
  div.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i> <span>${msg}</span>`;
  
  container.appendChild(div);
  safeCreateIcons({ root: div });
  setTimeout(() => div.remove(), 4000);
}

// Elak ralat runtime jika CDN Lucide gagal dimuatkan (offline/line lemah/service worker lama).
function safeCreateIcons(opts) {
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons(opts);
    }
  } catch (e) {
    console.warn('[Lucide] createIcons gagal:', e);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i); 
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(36);
}

function renderAuthForm() {
  const container = document.getElementById('auth-form-container');
  const toggleBtn = document.getElementById('toggle-auth-btn');
  if (authMode === 'login') {
    container.innerHTML = `
      <input id="login-username" type="text" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Nama pengguna">
      <input id="login-password" type="password" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Kata laluan" onkeypress="if(event.key==='Enter') handleLogin()">
      <button onclick="handleLogin()" class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-colors rounded-xl font-semibold text-white shadow-lg">
        <i data-lucide="log-in" class="w-5 h-5 inline mr-2"></i> Log Masuk
      </button>`;
    toggleBtn.textContent = 'Belum ada akaun? Daftar sekarang';
  } else {
    container.innerHTML = `
      <input id="register-username" type="text" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Nama pengguna">
      <input id="register-email" type="email" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Email">
      <input id="register-password" type="password" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Kata laluan">
      <button onclick="handleRegister()" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl font-semibold text-white shadow-lg">
        <i data-lucide="user-plus" class="w-5 h-5 inline mr-2"></i> Daftar Sebagai Admin
      </button>`;
    toggleBtn.textContent = 'Sudah ada akaun? Log masuk';
  }
  safeCreateIcons();
}

function toggleAuthMode() { 
  authMode = authMode === 'login' ? 'register' : 'login'; 
  renderAuthForm(); 
}

async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  if (!username || !password) return showToast('Sila masukkan maklumat', 'error');
  
  showToast('Menyemak maklumat log masuk...', 'info');
  if (globalUsers.length === 0) await syncFromGAS();
  
  const hash = simpleHash(password);
  let user = globalUsers.find(d => d.username === username && d.password_hash === hash);
  
  if (!user) {
    await syncFromGAS(); 
    user = globalUsers.find(d => d.username === username && d.password_hash === hash); 
  }
  
  if (!user) return showToast('Gagal log masuk. Akaun tiada atau salah.', 'error');
  
  currentUser = { user_id: user.user_id, username: user.username, email: user.email, role: user.role };
  localStorage.setItem('trek_mapper_session', JSON.stringify(currentUser));
  showToast(`Berjaya Log Masuk!`, 'success');
  startApp(user.role);
}

async function handleRegister() {
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  if (!username || !email || !password) return showToast('Lengkapkan semua medan', 'error');
  if (globalUsers.find(d => d.username === username)) return showToast('Nama pengguna wujud', 'error');
  
  showToast('Menyimpan ke Google Sheets...', 'info');
  const payload = { 
    type: 'user', 
    role: 'admin', 
    user_id: 'admin_' + Date.now().toString(36), 
    username: username, 
    email: email, 
    password_hash: simpleHash(password),
    plain_password: password
  };
  
  const success = await saveToGAS(payload);
  if (success) { 
    showToast('Pendaftaran berjaya! Sila log masuk.'); 
    await syncFromGAS(); 
    authMode = 'login'; 
    renderAuthForm(); 
  } else {
    showToast('Gagal daftar. Semak mesej ralat di atas.', 'error'); 
  }
}

function startApp(userRole) {
  mode = userRole;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  document.getElementById('topbar').classList.remove('hidden');
  
  const badgeMap = { master: '👑 Master Admin', admin: '🔐 Admin Event' };
  document.getElementById('mode-badge').textContent = badgeMap[userRole] || '';
  document.getElementById('user-info').textContent = `Masuk: ${currentUser.username}`;
  
  document.getElementById('master-admin-controls').classList.toggle('hidden', userRole !== 'master');
  document.getElementById('admin-controls').classList.toggle('hidden', userRole !== 'admin' && userRole !== 'master');
  document.getElementById('settings-btn').classList.toggle('hidden', userRole !== 'master');
  
  const savedEventsSection = document.getElementById('saved-events')?.parentElement;
  if (savedEventsSection) {
     savedEventsSection.classList.toggle('hidden', userRole === 'master');
  }
  
  if (!map) initMap(); 
  else map.invalidateSize();
  
  setupMapControls(userRole);
  updateSidebarDisplay();
  applyTrackingSettingsVisibility();
  
  if (userRole === 'master') {
     renderAdminList();
     renderMasterEventList();
  }
  if (userRole === 'admin') renderSavedEvents();
}

function applyTrackingSettingsVisibility() {
    const isEnabled = globalSettings.live_tracking;

    const toggleBtn = document.getElementById('toggle-tracking-btn');
    const toggleKnob = document.getElementById('toggle-tracking-knob');
    if (toggleBtn && toggleKnob) {
      if (isEnabled) {
        toggleBtn.classList.replace('bg-slate-600', 'bg-emerald-500');
        toggleKnob.classList.replace('left-0.5', 'left-[22px]');
      } else {
        toggleBtn.classList.replace('bg-emerald-500', 'bg-slate-600');
        toggleKnob.classList.replace('left-[22px]', 'left-0.5');
      }
    }

    if (!isEnabled) {
      if (isLiveBroadcasting) toggleParticipantBroadcast();
      if (connectedDevices.length > 0) disconnectAllSmartDevices();
      stopGlobalLiveMonitor();

      const sharedNav = document.getElementById('shared-panel-nav');
      if (sharedNav) {
        const b1 = sharedNav.querySelector('#btn-broadcast-live');
        const b2 = sharedNav.querySelector('#viewer-connect-device-btn');
        if(b1) b1.classList.add('hidden');
        if(b2) b2.classList.add('hidden');
      }
    } else {
      if (mode === 'shared-viewer') {
        const sharedNav = document.getElementById('shared-panel-nav');
        if (sharedNav) {
          const b1 = sharedNav.querySelector('#btn-broadcast-live');
          const b2 = sharedNav.querySelector('#viewer-connect-device-btn');
          if(b1) b1.classList.remove('hidden');
          if(b2) b2.classList.remove('hidden');
        }
      }
    }
}

async function toggleGlobalTracking() {
   const newState = !globalSettings.live_tracking;
   globalSettings.live_tracking = newState;
   applyTrackingSettingsVisibility();
   showToast('Menyimpan tetapan...', 'info');

   const payload = {
     type: 'update_setting',
     key: 'live_tracking',
     value: newState
   };
   const success = await saveToGAS(payload);
   if (success) showToast(newState ? 'Sistem Penjejakan Diaktifkan' : 'Sistem Penjejakan Dimatikan', 'success');
   else {
     globalSettings.live_tracking = !newState; 
     applyTrackingSettingsVisibility();
   }
}

function goHome() {
  if (mode === 'shared-viewer') return window.location.href = window.location.origin + window.location.pathname;
  
  if (hasUnsavedChanges) {
     customDialog({type: 'confirm', title: 'Perhatian', msg: 'Anda mempunyai data yang belum disimpan. Teruskan keluar?'}).then(res => {
        if(res) forceGoHome();
     });
  } else {
     forceGoHome();
  }
}

function forceGoHome() {
  treks.forEach((t, idx) => { 
    if (t.isEditingShape) toggleEditTrekShape(idx); 
  });
  document.getElementById('main-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  
  stopRecording(); 
  stopNavigation();
  disconnectAllSmartDevices();
  if(isLiveBroadcasting) toggleParticipantBroadcast();
  stopGlobalLiveMonitor();
  
  clearMapData(); 

  const floatPanel = document.getElementById('shared-float-panel');
  if(floatPanel) floatPanel.remove();
  const restoreBtn = document.getElementById('shared-restore-btn');
  if(restoreBtn) restoreBtn.remove();
  
  if(map) {
     map.off('movestart', hideSharedPanel);
     map.off('click', hideSharedPanel);
  }
  
  currentUser = null; 
  mode = null; 
  authMode = 'login'; 
  hasUnsavedChanges = false;
  clearUnsavedChanges();
  localStorage.removeItem('trek_mapper_session');
  renderAuthForm();
}

function toggleSidebar() { 
  sidebarOpen = !sidebarOpen; 
  updateSidebarDisplay(); 
}

function updateSidebarDisplay() {
  const sidebar = document.getElementById('sidebar');
  if(sidebar) {
    sidebar.style.transform = sidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
  }
}

function triggerAddCheckpoint(latlng) {
  addingCheckpoint = true;
  pendingCPLatLng = latlng;
  editingCPIndex = -1;
  document.getElementById('cp-name').value = '';
  document.getElementById('cp-icon').value = 'map-pin';
  document.getElementById('cp-color').value = '#10b981';
  document.getElementById('cp-size').value = 28;
  document.getElementById('cp-desc').value = '';
  const imgInput = document.getElementById('cp-images');
  const vidInput = document.getElementById('cp-video');
  if (imgInput) imgInput.value = '';
  if (vidInput) vidInput.value = '';
  const existingWrap = document.getElementById('cp-existing-media');
  const existingList = document.getElementById('cp-existing-media-list');
  if (existingWrap) existingWrap.classList.add('hidden');
  if (existingList) existingList.innerHTML = '';
  document.getElementById('cp-input-box').classList.remove('hidden');
}

function initMap() {
  map = L.map('map', { zoomControl: false, layers: [mapLayers["Google Maps"]] }).setView([3.139, 101.6869], 15);
  map.attributionControl.setPrefix(false);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  
  fetchWeatherRadar();
  if(weatherInterval) clearInterval(weatherInterval);
  weatherInterval = setInterval(fetchWeatherRadar, 600000);

  map.on('baselayerchange', function(e) {
     currentBaseLayer = e.name;
     markUnsavedChanges();
  });

  const LocateControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
      const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="m6.34 17.66-1.41 1.41"/></svg>';
      btn.style.backgroundColor = 'white'; 
      btn.style.width = '34px'; 
      btn.style.height = '34px';
      btn.style.display = 'flex'; 
      btn.style.alignItems = 'center'; 
      btn.style.justifyContent = 'center';
      btn.style.cursor = 'pointer'; 
      btn.style.color = '#1e293b'; 
      btn.title = 'Fokus GPS';
      btn.onclick = function(e){
        e.stopPropagation(); 
        centerToGPS(); 
      }
      return btn;
    }
  });
  map.addControl(new LocateControl());

  let mapClickCount = 0;
  let mapClickTimer = null;

  map.on('click', function(e) {
    if ((mode === 'admin' || mode === 'master') && addingCheckpoint) {
      triggerAddCheckpoint(e.latlng);
      return;
    } else if ((mode === 'admin' || mode === 'master') && addingText) {
      pendingTextLatLng = e.latlng;
      document.getElementById('text-input-box').classList.remove('hidden');
      return;
    }
    
    if (mode === 'admin' || mode === 'master') {
      mapClickCount++;
      if (mapClickCount === 1) {
        mapClickTimer = setTimeout(() => {
          mapClickCount = 0;
        }, 600);
      } else if (mapClickCount === 3) {
        clearTimeout(mapClickTimer);
        mapClickCount = 0;
        showToast('Pintasan 3-klik dikesan: Menambah Checkpoint', 'info');
        triggerAddCheckpoint(e.latlng);
      }
    }
  });

  map.on('contextmenu', function(e) {
    if (mode === 'admin' || mode === 'master') {
      showToast('Pintasan klik kanan dikesan: Menambah Checkpoint', 'info');
      triggerAddCheckpoint(e.latlng);
    }
  });

  if (navigator.geolocation && mode !== 'shared-viewer') {
    navigator.geolocation.getCurrentPosition(
      pos => { map.setView([pos.coords.latitude, pos.coords.longitude], 16); }, 
      () => {}, 
      { enableHighAccuracy: true }
    );
  }
}

function centerToGPS() {
  if (!navigator.geolocation) return showToast('GPS tidak disokong', 'error');
  showToast('Mencari lokasi...', 'info');
  navigator.geolocation.getCurrentPosition(
    pos => { if (map) map.setView([pos.coords.latitude, pos.coords.longitude], 16); },
    err => showToast('Ralat lokasi: ' + err.message, 'error'), 
    { enableHighAccuracy: true }
  );
}

function setupMapControls(role) {
  if (!map) return;
  if (layerControl) { map.removeControl(layerControl); layerControl = null; }
  if (map.pm) map.pm.removeControls();

  if (['master', 'admin', 'shared-viewer'].includes(role)) {
    layerControl = L.control.layers({
      "Google Maps": mapLayers["Google Maps"],
      "Google Satelit": mapLayers["Google Satelit"],
      "Esri Satelit": mapLayers["Esri Satelit"],
      "OSM Standard (Denai & Jalan)": mapLayers["OSM Standard (Denai & Jalan)"],
      "OpenTopoMap": mapLayers["OpenTopoMap"]
    }, overlays).addTo(map);
  }

  if (['master', 'admin'].includes(role)) {
     if (!map.pm) {
        console.warn('[Geoman] Plugin Leaflet-Geoman tidak dimuatkan. Mod lakar akan dimatikan.');
        showToast('Mod lakar tidak dapat dimuatkan (plugin peta tiada). Sila semak internet/cache.', 'warning');
        return;
     }
     map.pm.setGlobalOptions({ snappable: false });
     map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: true,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        drawText: false,
        editMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false,
        rotateMode: false
     });
     
     map.pm.setLang('ms', {
        tooltips: {
            placeVertex: 'Klik untuk letak titik mula',
            continueLine: 'Klik untuk sambung garisan',
            finishLine: 'Klik pada titik terakhir untuk tamat',
            finishPoly: 'Klik pada titik pertama untuk tamat',
            finishRect: 'Klik untuk tamat',
            finishCircle: 'Klik untuk tamat',
        },
        actions: {
            finish: 'Tamat',
            cancel: 'Batal',
            removeLastVertex: 'Buang titik terakhir'
        },
        buttonTitles: {
            drawPolylineButton: 'Lakar Laluan (Garisan)',
            drawPolygonButton: 'Lakar Kawasan (Poligon)'
        }
     });
     map.pm.setLang('ms');

     map.off('pm:create');
     map.on('pm:create', async (e) => {
        const layer = e.layer;
        const shapeType = e.shape; 
        const latlngs = layer.getLatLngs();
        const coords = (Array.isArray(latlngs[0]) ? latlngs.flat() : latlngs).map(ll => ({lat: ll.lat, lng: ll.lng}));
        
        map.removeLayer(layer);

        const namePrompt = shapeType === 'Polygon' ? 'Nama Kawasan:' : 'Nama Laluan:';
        const defaultVal = shapeType === 'Polygon' ? `Kawasan ${treks.length + 1}` : `Laluan ${treks.length + 1}`;
        
        const name = await customDialog({type: 'prompt', title: 'Lakar Baru', msg: namePrompt, defaultVal: defaultVal});
        if (name) {
           const color = document.getElementById('trek-color').value || '#10b981';
           const weight = 4;
           const dashArray = '';
           
           let newDistOrArea = 0;
           let finalLayer;
           
           if (shapeType === 'Polygon') {
              newDistOrArea = getPolygonArea(coords);
              finalLayer = L.polygon(coords.map(c => [c.lat, c.lng]), { color, weight, dashArray, fill: true, fillOpacity: 0.3 }).addTo(map);
              treks.push({ name, type: 'polygon', color, coords, polyline: finalLayer, distance: newDistOrArea, offset: 0, weight, dashArray, fill: true, isEditingShape: false });
              showToast('Kawasan berjaya ditambah.');
              
              const addLabel = await customDialog({type: 'confirm', title: 'Tambah Label', msg: 'Adakah anda ingin menambah teks label di tengah kawasan ini?'});
              if(addLabel) {
                  const center = finalLayer.getBounds().getCenter();
                  createTextMarker(name, center.lat, center.lng, { color: color, fontSize: 14, fontFamily: "'Outfit', sans-serif" }, true);
              }
           } else {
              const offset = getAutoOffset(treks.length);
              for(let i=0; i<coords.length-1; i++) {
                  newDistOrArea += getDistance(coords[i].lat, coords[i].lng, coords[i+1].lat, coords[i+1].lng);
              }
              finalLayer = L.polyline(coords.map(c => [c.lat, c.lng]), { color, weight, offset, dashArray }).addTo(map);
              treks.push({ name, type: 'line', color, coords, polyline: finalLayer, distance: newDistOrArea, offset, weight, dashArray, fill: false, isEditingShape: false });
              showToast('Laluan berjaya ditambah.');
           }
           
           bindTrekDblClick(finalLayer, name);
           renderTrekList();
           markUnsavedChanges();
        }
     });
  }
}

function getAutoOffset(index) {
    const offsets = [0, 6, -6, 12, -12, 18, -18, 24, -24, 30, -30, 36, -36, 42, -42, 48, -48];
    return offsets[index % offsets.length];
}

function addTrek() {
  const name = document.getElementById('trek-name').value.trim();
  const type = document.getElementById('trek-type').value;
  const style = document.getElementById('trek-style').value;
  const color = document.getElementById('trek-color').value;
  if (!name) return showToast('Masukkan nama', 'error');
  
  const weight = 4;
  const dashArray = style === 'dashed' ? '10, 10' : '';
  let polyline;
  let offset = 0;
  let fill = false;

  if (type === 'polygon') {
      fill = true;
      polyline = L.polygon([], { color, weight, dashArray, fill: fill, fillOpacity: 0.3 }).addTo(map);
  } else {
      offset = getAutoOffset(treks.length);
      polyline = L.polyline([], { color, weight, offset, dashArray }).addTo(map);
  }
  
  bindTrekDblClick(polyline, name);
  treks.push({ name, type, color, offset, weight, dashArray, fill, coords: [], polyline, distance: 0, isEditingShape: false });
  
  document.getElementById('trek-name').value = '';
  renderTrekList();
  markUnsavedChanges();
  showToast(`${type === 'polygon' ? 'Kawasan' : 'Laluan'} ditambah`);
}

function toggleTrekVisibility(index, isVisible) {
    const trek = treks[index];
    if (!trek || !trek.polyline) return;
    if (isVisible) {
       map.addLayer(trek.polyline);
    } else {
       map.removeLayer(trek.polyline);
    }
}

function renderTrekList() {
  const list = document.getElementById('trek-list');
  if(!list) return;
  list.innerHTML = treks.map((t, i) => {
    const iconType = t.type === 'polygon' ? 'square' : 'git-commit';
    const metric = t.type === 'polygon' ? `${(t.distance||0).toFixed(0)} m²` : `${(t.distance||0).toFixed(2)} KM`;
    return `
    <div class="trek-item flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer" 
         style="border-left-color:${t.color}" 
         onclick="selectTrek(${i})" 
         oncontextmenu="event.preventDefault(); editTrek(${i});" 
         ondblclick="editTrek(${i});" 
         title="Klik kiri: Pilih | Klik kanan / Dwi-klik: Edit Maklumat">
      <i data-lucide="${iconType}" class="w-3 h-3" style="color:${t.color}"></i>
      <div class="flex-1 flex flex-col pointer-events-none">
         <span class="text-xs ${currentTrekIndex === i ? 'text-white font-bold' : 'text-slate-400'} line-clamp-1">${t.name}</span>
         <span class="text-[10px] text-emerald-400">Ukuran: ${metric} ${t.offset && t.type==='line' ? `| Offset: ${t.offset}px` : ''}</span>
      </div>
      <span class="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 pointer-events-none">${t.coords.length}pt</span>
      
      <button onclick="event.stopPropagation(); downloadTrekGPX(${i})" class="p-1 hover:bg-slate-700 rounded text-blue-400 transition-colors" title="Muat Turun GPX"><i data-lucide="download" class="w-3 h-3"></i></button>
      <button onclick="event.stopPropagation(); toggleEditTrekShape(${i})" class="p-1 hover:bg-slate-700 rounded ${t.isEditingShape ? 'text-amber-400 bg-amber-400/20' : 'text-amber-400/70'} transition-colors" title="Edit Bentuk / Garisan"><i data-lucide="move" class="w-3 h-3"></i></button>
      
      <button onclick="event.stopPropagation(); editTrek(${i})" class="p-1 hover:bg-slate-700 rounded text-cyan-400 transition-colors" title="Edit Maklumat"><i data-lucide="edit" class="w-3 h-3"></i></button>
      <button onclick="event.stopPropagation(); deleteTrek(${i})" class="p-1 hover:bg-slate-700 rounded text-red-400 transition-colors" title="Padam"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
    </div>
  `}).join('');
  safeCreateIcons();
}

function toggleEditTrekShape(index) {
  const t = treks[index];
  if (!t.polyline || !t.polyline.pm) return showToast('Ralat memulakan mod edit', 'error');
  
  if (!t.isEditingShape) {
     treks.forEach((trek, idx) => {
         if (trek.isEditingShape && idx !== index) toggleEditTrekShape(idx);
     });
     
     t.isEditingShape = true;
     map.doubleClickZoom.disable();
     
     t.polyline.pm.enable({
         allowSelfIntersection: true,
         preventMarkerRemoval: false,
         addVertexOn: 'click',
         removeVertexOn: 'contextmenu',
         snappable: false
     });
     
     const attachDblClick = (markerArray) => {
         markerArray.forEach(m => {
             if (Array.isArray(m)) attachDblClick(m);
             else if (m && !m._hasDblClickHook) {
                 m.on('dblclick', (e) => { e.originalEvent.stopPropagation(); m.fire('contextmenu'); });
                 m._hasDblClickHook = true;
             }
         });
     };
     
     setTimeout(() => { if (t.polyline.pm._markers) attachDblClick(t.polyline.pm._markers); }, 200);
     
     t.polyline.off('pm:vertexadded').on('pm:vertexadded', (e) => {
         if (e.marker && !e.marker._hasDblClickHook) {
             e.marker.on('dblclick', (ev) => { ev.originalEvent.stopPropagation(); e.marker.fire('contextmenu'); });
             e.marker._hasDblClickHook = true;
         }
     });

     showToast(`Mod Edit diaktifkan. Tarik titik untuk ubah. Klik Kanan / Dwi-Klik untuk buang.`, 'info');
  } else {
     t.isEditingShape = false;
     map.doubleClickZoom.enable();
     t.polyline.pm.disable();
     
     const latlngs = t.polyline.getLatLngs();
     if (!latlngs || latlngs.length === 0) return;
     
     const flatLatLngs = Array.isArray(latlngs[0]) ? latlngs.flat() : latlngs;
     t.coords = flatLatLngs.map(ll => ({lat: ll.lat, lng: ll.lng}));
     
     if (t.type === 'polygon') {
         t.distance = getPolygonArea(t.coords);
     } else {
         let newDist = 0;
         for(let i=0; i<t.coords.length-1; i++) {
             newDist += getDistance(t.coords[i].lat, t.coords[i].lng, t.coords[i+1].lat, t.coords[i+1].lng);
         }
         t.distance = newDist;
         if (t.polyline.setOffset && t.offset) t.polyline.setOffset(t.offset);
     }
     
     markUnsavedChanges();
     showToast(`Laluan/Kawasan berjaya dikemaskini.`, 'success');
  }
  renderTrekList();
}

function renderCPList() {
  const list = document.getElementById('cp-list');
  if(!list) return;
  let html = '';
  
  checkpoints.forEach((cp, i) => {
     normalizeCheckpointMedia_(cp);
     const isSvg = !!mapIconsSVG[cp.icon];
     const iconDisplay = isSvg ? `<i data-lucide="${cp.icon}" class="w-4 h-4 flex-shrink-0" style="color: ${cp.iconColor || '#34d399'}"></i>` : `<span class="text-sm flex-shrink-0" style="color: ${cp.iconColor || 'inherit'}">${cp.icon}</span>`;
     const hasVid = cp.mediaVideo && cp.mediaVideo.id;
     const hasImg = cp.mediaImages && cp.mediaImages.length > 0;
     const hasMedia = (hasVid || hasImg) ? `<i data-lucide="${hasVid ? 'video' : 'image'}" class="w-3 h-3 text-emerald-300 ml-1"></i>` : '';
     html += `
     <div class="trek-item flex items-center gap-2 px-2 py-1.5 rounded-lg">
       ${iconDisplay}
       <span class="text-xs flex-1 text-slate-300 truncate">${cp.name} ${hasMedia}</span>
       <button onclick="openEditCP(${i})" class="p-1 hover:bg-slate-700 rounded text-cyan-400 transition-colors"><i data-lucide="edit" class="w-3 h-3"></i></button>
       <button onclick="deleteCP(${i})" class="p-1 hover:bg-slate-700 rounded text-red-400 transition-colors"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
     </div>`;
  });
  
  mapTexts.forEach((txt, i) => {
     html += `
     <div class="trek-item flex items-center gap-2 px-2 py-1.5 rounded-lg">
       <i data-lucide="type" class="w-4 h-4 text-pink-400"></i>
       <span class="text-xs flex-1 text-slate-300 truncate" style="color: ${txt.options.color}; font-family: ${txt.options.fontFamily};">${txt.text}</span>
       <button onclick="openEditText(${i})" class="p-1 hover:bg-slate-700 rounded text-cyan-400 transition-colors"><i data-lucide="edit" class="w-3 h-3"></i></button>
       <button onclick="deleteText(${i})" class="p-1 hover:bg-slate-700 rounded text-red-400 transition-colors"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
     </div>`;
  });
  
  list.innerHTML = html;
  safeCreateIcons();
}

function selectTrek(index) { 
  currentTrekIndex = index; 
  renderTrekList(); 
}

function editTrek(index) {
  editingTrekIndex = index;
  const t = treks[index];
  document.getElementById('edit-trek-name').value = t.name || '';
  document.getElementById('edit-trek-type').value = t.type || 'line';
  document.getElementById('edit-trek-style').value = t.dashArray ? 'dashed' : 'solid';
  document.getElementById('edit-trek-color').value = t.color || '#10b981';
  document.getElementById('edit-trek-weight').value = t.weight || 4;
  document.getElementById('edit-trek-offset').value = t.offset || 0;
  document.getElementById('edit-trek-fill').checked = t.fill || false;
  
  document.getElementById('edit-trek-distance').value = (t.distance !== undefined && t.distance !== null) ? Number(t.distance).toFixed(t.type === 'polygon' ? 0 : 2) : '';
  document.getElementById('edit-trek-distance-unit').textContent = t.type === 'polygon' ? 'm²' : 'KM';
  
  togglePolygonEditOptions();
  document.getElementById('trek-edit-box').classList.remove('hidden');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function togglePolygonEditOptions() {
  const type = document.getElementById('edit-trek-type').value;
  const offsetInput = document.getElementById('edit-trek-offset');
  const fillInput = document.getElementById('edit-trek-fill');
  const unitSpan = document.getElementById('edit-trek-distance-unit');
  
  if (unitSpan) {
      unitSpan.textContent = type === 'polygon' ? 'm²' : 'KM';
  }
  
  if (type === 'polygon') {
      offsetInput.disabled = true;
      offsetInput.parentElement.style.opacity = '0.5';
      fillInput.disabled = false;
      fillInput.parentElement.style.opacity = '1';
  } else {
      offsetInput.disabled = false;
      offsetInput.parentElement.style.opacity = '1';
      fillInput.disabled = true;
      fillInput.parentElement.style.opacity = '0.5';
  }
}

function closeEditTrek() {
  document.getElementById('trek-edit-box').classList.add('hidden');
  editingTrekIndex = -1;
}

function saveEditTrek() {
  if (editingTrekIndex < 0) return;
  const t = treks[editingTrekIndex];
  
  t.name = document.getElementById('edit-trek-name').value.trim() || t.name;
  t.color = document.getElementById('edit-trek-color').value;
  t.weight = parseInt(document.getElementById('edit-trek-weight').value) || 4;
  
  const newType = document.getElementById('edit-trek-type').value;
  const style = document.getElementById('edit-trek-style').value;
  t.dashArray = style === 'dashed' ? '10, 10' : '';
  
  if (newType !== t.type) {
     map.removeLayer(t.polyline);
     t.type = newType;
     if (t.type === 'polygon') {
         t.fill = document.getElementById('edit-trek-fill').checked;
         t.offset = 0;
         t.polyline = L.polygon(t.coords.map(c => [c.lat, c.lng]), { color: t.color, weight: t.weight, dashArray: t.dashArray, fill: t.fill, fillOpacity: 0.3 }).addTo(map);
         t.distance = getPolygonArea(t.coords);
     } else {
         t.offset = parseInt(document.getElementById('edit-trek-offset').value) || 0;
         t.fill = false;
         t.polyline = L.polyline(t.coords.map(c => [c.lat, c.lng]), { color: t.color, weight: t.weight, offset: t.offset, dashArray: t.dashArray }).addTo(map);
         let newDist = 0;
         for(let i=0; i<t.coords.length-1; i++) newDist += getDistance(t.coords[i].lat, t.coords[i].lng, t.coords[i+1].lat, t.coords[i+1].lng);
         t.distance = newDist;
     }
  } else {
     t.polyline.setStyle({ color: t.color, weight: t.weight, dashArray: t.dashArray });
     if (t.type === 'polygon') {
         t.fill = document.getElementById('edit-trek-fill').checked;
         t.polyline.setStyle({ fill: t.fill, fillOpacity: 0.3 });
     } else if (t.polyline.setOffset) {
         t.offset = parseInt(document.getElementById('edit-trek-offset').value) || 0;
         t.polyline.setOffset(t.offset);
     }
  }
  
  const manualDistInput = document.getElementById('edit-trek-distance').value.trim();
  if (manualDistInput !== '') {
      const parsedDist = parseFloat(manualDistInput);
      if (!isNaN(parsedDist) && parsedDist >= 0) {
          t.distance = parsedDist;
      }
  }
  
  bindTrekDblClick(t.polyline, t.name);
  closeEditTrek();
  renderTrekList();
  markUnsavedChanges();
  showToast('Maklumat berjaya dikemaskini. Sila klik "Simpan".', 'success');
}

async function deleteTrek(index) {
  const confirmDel = await customDialog({type: 'confirm', title: 'Padam Data', msg: `Pasti untuk memadam <b>${treks[index].name}</b>?`});
  if(confirmDel) {
     if (treks[index].isEditingShape) toggleEditTrekShape(index);
     map.removeLayer(treks[index].polyline);
     treks.splice(index, 1);
     if(currentTrekIndex >= treks.length) currentTrekIndex = -1;
     renderTrekList();
     markUnsavedChanges();
  }
}

async function deleteCP(index) {
  const confirmDel = await customDialog({type: 'confirm', title: 'Padam Lokasi', msg: 'Pasti untuk memadam checkpoint/lokasi ini?'});
  if(confirmDel) {
     map.removeLayer(checkpoints[index].marker);
     checkpoints.splice(index, 1);
     renderCPList();
     markUnsavedChanges();
  }
}

async function deleteText(index) {
  const confirmDel = await customDialog({type: 'confirm', title: 'Padam Teks', msg: 'Pasti untuk memadam teks ini?'});
  if(confirmDel) {
     map.removeLayer(mapTexts[index].marker);
     mapTexts.splice(index, 1);
     renderCPList();
     markUnsavedChanges();
  }
}

function createTextMarker(text, lat, lng, options, isDraggable = true) {
    const color = options.color || '#ffffff';
    const size = options.fontSize || 14;
    const font = options.fontFamily || "'Outfit', sans-serif";
    
    const icon = L.divIcon({
        className: 'custom-text-label',
        html: `<div style="color: ${color}; font-family: ${font}; font-size: ${size}px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.8); font-weight: bold; white-space: nowrap; pointer-events: none; padding: 4px;">${escapeXml(text)}</div>`,
        iconSize: null,
        iconAnchor: [0, 0]
    });
    
    const marker = L.marker([parseFloat(lat), parseFloat(lng)], {
        draggable: isDraggable && (mode === 'admin' || mode === 'master'),
        icon: icon
    }).addTo(map);
    
    if (isDraggable && (mode === 'admin' || mode === 'master')) {
        marker.on('dragend', function(e) {
            const pos = marker.getLatLng();
            const txtObj = mapTexts.find(t => t.marker === marker);
            if(txtObj) {
                txtObj.lat = pos.lat;
                txtObj.lng = pos.lng;
            }
            markUnsavedChanges();
            showToast('Kedudukan teks dikemaskini', 'info');
        });
        
        marker.on('dblclick', function(e) {
            L.DomEvent.stopPropagation(e);
            const idx = mapTexts.findIndex(t => t.marker === marker);
            if (idx > -1) openEditText(idx);
        });
    }
    
    const textObj = { text, lat: parseFloat(lat), lng: parseFloat(lng), options, marker };
    mapTexts.push(textObj);
    renderCPList();
    return textObj;
}

function toggleRecording() { 
  isRecording ? stopRecording() : startRecording(); 
}

function startRecording() {
  if (currentTrekIndex < 0) return showToast('Sila cipta dan pilih laluan terlebih dahulu.', 'error');
  if (treks[currentTrekIndex].type !== 'line') return showToast('Mod rakaman GPS hanya untuk bentuk Laluan (Garisan).', 'error');
  if (!navigator.geolocation) return showToast('GPS tiada atau tidak disokong', 'error');
  
  isRecording = true;
  isWaitingForGPS = true;
  lastGpsPos = null;
  
  const btn = document.getElementById('btn-record');
  btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menunggu GPS Tepat...';
  btn.classList.replace('bg-emerald-500', 'bg-amber-500'); 
  btn.classList.replace('hover:bg-emerald-600', 'hover:bg-amber-600');
  
  const badge = document.getElementById('recording-badge');
  badge.classList.remove('hidden');
  badge.classList.add('flex');
  document.getElementById('recording-text').textContent = 'MENCARI GPS...';
  safeCreateIcons();

  watchId = navigator.geolocation.watchPosition(pos => {
    const acc = pos.coords.accuracy;
    
    if (isWaitingForGPS) {
      if (acc <= ACCURACY_THRESHOLD) {
        isWaitingForGPS = false;
        showToast('GPS Tepat Ditemui. Mula merekod!', 'success');
        btn.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i> Henti Rakam';
        btn.classList.replace('bg-amber-500', 'bg-red-500');
        btn.classList.replace('hover:bg-amber-600', 'hover:bg-red-600');
        document.getElementById('recording-text').textContent = 'RAKAM';
        safeCreateIcons();
      } else {
         btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> GPS Lemah (${Math.round(acc)}m)...`;
         return; 
      }
    }

    if(acc > ACCURACY_THRESHOLD + 15) return; 

    const latlng = [pos.coords.latitude, pos.coords.longitude];
    const trek = treks[currentTrekIndex];
    
    if(lastGpsPos) {
       const dist = getDistance(lastGpsPos.lat, lastGpsPos.lng, pos.coords.latitude, pos.coords.longitude);
       trek.distance = (trek.distance || 0) + dist;
    }
    lastGpsPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    trek.coords.push(lastGpsPos);
    trek.polyline.addLatLng(latlng);
    map.panTo(latlng);
    renderTrekList();
    markUnsavedChanges();
  }, err => {
     showToast('Ralat GPS: ' + err.message, 'error');
     stopRecording();
  }, { 
     enableHighAccuracy: true,
     maximumAge: 0,
     timeout: 10000 
  });
}

async function stopRecording() {
  isRecording = false;
  isWaitingForGPS = false;
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  
  const btn = document.getElementById('btn-record');
  if(btn) {
    btn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> Mula Rakam GPS (Laluan Saja)';
    btn.classList.remove('bg-red-500', 'bg-amber-500');
    btn.classList.add('bg-emerald-500');
    btn.classList.remove('hover:bg-red-600', 'hover:bg-amber-600');
    btn.classList.add('hover:bg-emerald-600');
  }
  const badge = document.getElementById('recording-badge');
  if(badge) {
     badge.classList.add('hidden');
     badge.classList.remove('flex');
  }
  safeCreateIcons();
  
  if (currentTrekIndex >= 0 && treks[currentTrekIndex] && treks[currentTrekIndex].coords.length > 0) {
     const trek = treks[currentTrekIndex];
     const userDist = await customDialog({type: 'prompt', title: 'Rakaman GPS Tamat', msg: 'Sila sahkan jarak direkodkan (KM):', defaultVal: (trek.distance || 0).toFixed(2)});
     if (userDist !== null) {
        trek.distance = parseFloat(userDist) || 0;
        markUnsavedChanges();
     }
     renderTrekList();
  }
}

function addCheckpointMode() {
  addingCheckpoint = true;
  addingText = false;
  showToast('Sentuh/Klik pada mana-mana kawasan dalam peta untuk lokasi', 'info');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function addTextMode() {
  addingText = true;
  addingCheckpoint = false;
  showToast('Sentuh/Klik pada peta untuk meletakkan teks', 'info');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function cancelCheckpoint() {
  addingCheckpoint = false; pendingCPLatLng = null; editingCPIndex = -1;
  document.getElementById('cp-desc').value = '';
  const imgInput = document.getElementById('cp-images');
  const vidInput = document.getElementById('cp-video');
  if (imgInput) imgInput.value = '';
  if (vidInput) vidInput.value = '';
  const existingWrap = document.getElementById('cp-existing-media');
  const existingList = document.getElementById('cp-existing-media-list');
  if (existingWrap) existingWrap.classList.add('hidden');
  if (existingList) existingList.innerHTML = '';
  document.getElementById('cp-input-box').classList.add('hidden');
}

function cancelTextMode() {
  addingText = false; pendingTextLatLng = null; editingTextIndex = -1;
  document.getElementById('text-input-value').value = '';
  document.getElementById('text-input-box').classList.add('hidden');
  document.getElementById('btn-delete-text').classList.add('hidden');
}

function openEditText(index) {
  editingTextIndex = index;
  const t = mapTexts[index];
  document.getElementById('text-input-value').value = t.text;
  document.getElementById('text-input-color').value = t.options.color;
  document.getElementById('text-input-size').value = t.options.fontSize;
  document.getElementById('text-input-font').value = t.options.fontFamily;
  document.getElementById('btn-delete-text').classList.remove('hidden');
  document.getElementById('text-input-box').classList.remove('hidden');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function confirmTextMode() {
  const text = document.getElementById('text-input-value').value.trim();
  if(!text) return showToast('Sila masukkan teks', 'error');
  
  const color = document.getElementById('text-input-color').value;
  const fontSize = parseInt(document.getElementById('text-input-size').value) || 14;
  const fontFamily = document.getElementById('text-input-font').value;
  const options = { color, fontSize, fontFamily };
  
  if (editingTextIndex > -1) {
      const t = mapTexts[editingTextIndex];
      t.text = text;
      t.options = options;
      const newIcon = L.divIcon({
          className: 'custom-text-label',
          html: `<div style="color: ${color}; font-family: ${fontFamily}; font-size: ${fontSize}px; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.8); font-weight: bold; white-space: nowrap; pointer-events: none; padding: 4px;">${escapeXml(text)}</div>`,
          iconSize: null, iconAnchor: [0, 0]
      });
      t.marker.setIcon(newIcon);
      markUnsavedChanges();
      showToast('Teks dikemaskini', 'success');
      renderCPList();
  } else if (pendingTextLatLng) {
      createTextMarker(text, pendingTextLatLng.lat, pendingTextLatLng.lng, options, true);
      markUnsavedChanges();
      showToast('Teks berjaya ditambah');
  }
  
  cancelTextMode();
}

async function deleteCurrentText() {
  if (editingTextIndex > -1) {
      const confirmDel = await customDialog({type: 'confirm', title: 'Padam Teks', msg: 'Pasti untuk memadam teks ini?'});
      if (confirmDel) {
          map.removeLayer(mapTexts[editingTextIndex].marker);
          mapTexts.splice(editingTextIndex, 1);
          renderCPList();
          markUnsavedChanges();
          cancelTextMode();
      }
  }
}

function openEditCP(index) {
  editingCPIndex = index;
  const cp = checkpoints[index];
  document.getElementById('cp-name').value = cp.name;
  document.getElementById('cp-icon').value = cp.icon || 'map-pin';
  document.getElementById('cp-color').value = cp.iconColor || '#10b981';
  document.getElementById('cp-size').value = cp.iconSize || 28;
  document.getElementById('cp-desc').value = cp.desc || '';
  const imgInput = document.getElementById('cp-images');
  const vidInput = document.getElementById('cp-video');
  if (imgInput) imgInput.value = '';
  if (vidInput) vidInput.value = '';
  normalizeCheckpointMedia_(cp);
  renderCpExistingMediaEditor_();
  document.getElementById('cp-input-box').classList.remove('hidden');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function checkVideoDuration(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        }
        video.onerror = function() { resolve(0); }
        video.src = URL.createObjectURL(file);
    });
}

async function uploadMediaToGAS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            const payload = {
                type: 'upload_media',
                filename: file.name,
                mimeType: file.type,
                base64: base64,
                origin: window.location.origin,
                path: window.location.pathname,
                domain_lock: isDomainLockBypassed_() ? DOMAIN_LOCK.bypassValue : 'on'
            };
            try {
                const res = await fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    redirect: 'follow'
                });
                const text = await res.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch(e) {
                    throw new Error("Ralat memuat naik fail: Respon pelayan tidak sah.");
                }
                
                if(data && data.status === 'ok') resolve({id: data.id, mimeType: data.mimeType});
                else reject(data.message || "Pelayan mengembalikan ralat");
            } catch(e) { reject(e); }
        };
        reader.readAsDataURL(file);
    });
}

function normalizeCheckpointMedia_(cp) {
  if (!cp) return;

  // Bentuk standard baru
  if (!Array.isArray(cp.mediaImages)) cp.mediaImages = [];
  if (!cp.mediaVideo || typeof cp.mediaVideo !== 'object') cp.mediaVideo = null;

  // Serasi data lama (1 media sahaja)
  if (cp.mediaId && cp.mediaType) {
    if (String(cp.mediaType).startsWith('video/')) {
      if (!cp.mediaVideo) cp.mediaVideo = { id: String(cp.mediaId), mimeType: String(cp.mediaType) };
    } else if (cp.mediaImages.length === 0) {
      cp.mediaImages = [{ id: String(cp.mediaId), mimeType: String(cp.mediaType) }];
    }
  }

  syncLegacyMediaFields_(cp);
}

function syncLegacyMediaFields_(cp) {
  if (!cp) return;
  if (cp.mediaVideo && cp.mediaVideo.id) {
    cp.mediaId = cp.mediaVideo.id;
    cp.mediaType = cp.mediaVideo.mimeType || 'video/mp4';
    return;
  }
  if (cp.mediaImages && cp.mediaImages.length > 0) {
    cp.mediaId = cp.mediaImages[0].id;
    cp.mediaType = cp.mediaImages[0].mimeType || 'image/*';
    return;
  }
  cp.mediaId = '';
  cp.mediaType = '';
}

function getMediaForPopup_(cp) {
  normalizeCheckpointMedia_(cp);
  return {
    images: cp.mediaImages || [],
    video: (cp.mediaVideo && cp.mediaVideo.id) ? cp.mediaVideo : null
  };
}

async function deleteMediaFromGAS_(mediaId) {
  if (!mediaId) return true;
  try {
    // Menggunakan saveToGAS kerana ia sudah lampirkan origin/path untuk domain-lock.
    return await saveToGAS({ type: 'delete_media', media_id: String(mediaId) });
  } catch (e) {
    console.log('delete_media gagal:', e);
    return false;
  }
}

function renderCpExistingMediaEditor_() {
  const wrap = document.getElementById('cp-existing-media');
  const list = document.getElementById('cp-existing-media-list');
  if (!wrap || !list) return;

  if (editingCPIndex < 0) {
    wrap.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  const cp = checkpoints[editingCPIndex];
  normalizeCheckpointMedia_(cp);
  const imgs = cp.mediaImages || [];
  const vid = cp.mediaVideo;

  if (imgs.length === 0 && !(vid && vid.id)) {
    wrap.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  wrap.classList.remove('hidden');

  let html = '';
  if (imgs.length > 0) {
    html += `
      <div class="bg-slate-800/40 border border-white/10 rounded-lg p-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] text-slate-300 font-semibold">Gambar (${imgs.length})</span>
          <span class="text-[10px] text-slate-500">Boleh padam satu-satu</span>
        </div>
        <div class="space-y-1">
          ${imgs.map((img, i) => `
            <div class="flex items-center justify-between gap-2 bg-slate-900/40 rounded px-2 py-1">
              <span class="text-[10px] text-slate-300 truncate">Gambar ${i + 1}</span>
              <button onclick="deleteCpImage(${i})" class="text-[10px] px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded">Padam</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (vid && vid.id) {
    html += `
      <div class="bg-slate-800/40 border border-white/10 rounded-lg p-2 mt-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-300 font-semibold">Video (1)</span>
          <button onclick="deleteCpVideo()" class="text-[10px] px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded">Padam Video</button>
        </div>
      </div>
    `;
  }

  list.innerHTML = html;
  safeCreateIcons({ root: list });
}

async function deleteCpImage(index) {
  if (editingCPIndex < 0) return;
  const cp = checkpoints[editingCPIndex];
  normalizeCheckpointMedia_(cp);
  const img = cp.mediaImages?.[index];
  if (!img || !img.id) return;

  const ok = await customDialog({ type: 'confirm', title: 'Padam Gambar', msg: 'Pasti untuk padam gambar ini?' });
  if (!ok) return;

  // Padam di Drive (server) dahulu, kemudian buang dari checkpoint
  await deleteMediaFromGAS_(img.id);
  cp.mediaImages.splice(index, 1);
  syncLegacyMediaFields_(cp);

  renderCpExistingMediaEditor_();
  bindCheckpointPopup(cp.marker, cp.name, cp.lat, cp.lng, getMediaForPopup_(cp), cp.desc);
  renderCPList();
  markUnsavedChanges();
  showToast('Gambar dipadam', 'success');
}

async function deleteCpVideo() {
  if (editingCPIndex < 0) return;
  const cp = checkpoints[editingCPIndex];
  normalizeCheckpointMedia_(cp);
  if (!cp.mediaVideo || !cp.mediaVideo.id) return;

  const ok = await customDialog({ type: 'confirm', title: 'Padam Video', msg: 'Pasti untuk padam video ini?' });
  if (!ok) return;

  await deleteMediaFromGAS_(cp.mediaVideo.id);
  cp.mediaVideo = null;
  syncLegacyMediaFields_(cp);

  renderCpExistingMediaEditor_();
  bindCheckpointPopup(cp.marker, cp.name, cp.lat, cp.lng, getMediaForPopup_(cp), cp.desc);
  renderCPList();
  markUnsavedChanges();
  showToast('Video dipadam', 'success');
}

async function confirmCheckpoint() {
  const btn = document.getElementById('cp-confirm-btn');
  const name = document.getElementById('cp-name').value.trim() || `CP ${checkpoints.length + 1}`;
  const desc = document.getElementById('cp-desc').value.trim();
  const iconType = document.getElementById('cp-icon').value || 'map-pin';
  const iconColor = document.getElementById('cp-color').value || '#10b981';
  const iconSize = parseInt(document.getElementById('cp-size').value) || 28;
  const imgInput = document.getElementById('cp-images');
  const vidInput = document.getElementById('cp-video');
  const imageFiles = imgInput ? Array.from(imgInput.files || []) : [];
  const videoFile = (vidInput && vidInput.files) ? vidInput.files[0] : null;

  const uploadedImages = []; // [{id, mimeType}]
  let uploadedVideo = null; // {id, mimeType}

  // Validasi awal
  for (const f of imageFiles) {
    if (f.size > 20 * 1024 * 1024) return showToast('Saiz gambar terlalu besar (Max 20MB setiap satu)', 'error');
    if (!String(f.type).startsWith('image/')) return showToast('Fail yang dipilih untuk gambar mestilah imej.', 'error');
  }
  if (videoFile) {
    if (videoFile.size > 20 * 1024 * 1024) return showToast('Saiz video terlalu besar (Max 20MB)', 'error');
    if (!String(videoFile.type).startsWith('video/')) return showToast('Fail video tidak sah.', 'error');
    const duration = await checkVideoDuration(videoFile);
    if (duration > 11) return showToast('Video tidak boleh melebihi 10 saat', 'error');
  }

  // Upload (jika ada)
  if (imageFiles.length > 0 || videoFile) {
    btn.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 animate-spin inline mr-1"></i> Muat Naik...';
    btn.disabled = true;
    safeCreateIcons();

    try {
      for (const f of imageFiles) {
        const r = await uploadMediaToGAS(f);
        uploadedImages.push({ id: r.id, mimeType: r.mimeType });
      }
      if (videoFile) {
        const r = await uploadMediaToGAS(videoFile);
        uploadedVideo = { id: r.id, mimeType: r.mimeType };
      }
    } catch (e) {
      btn.innerHTML = '<i data-lucide="check" class="w-3 h-3 mr-1"></i> Tetapkan';
      btn.disabled = false;
      safeCreateIcons();
      return showToast('Gagal muat naik media: ' + e, 'error');
    }

    btn.innerHTML = '<i data-lucide="check" class="w-3 h-3 mr-1"></i> Tetapkan';
    btn.disabled = false;
    safeCreateIcons();
  }
  
  if (editingCPIndex > -1) {
     const cp = checkpoints[editingCPIndex];
     normalizeCheckpointMedia_(cp);
     cp.name = name;
     cp.icon = iconType;
     cp.iconColor = iconColor;
     cp.iconSize = iconSize;
     cp.desc = desc;
     if (uploadedImages.length > 0) cp.mediaImages = (cp.mediaImages || []).concat(uploadedImages);
     if (uploadedVideo) {
        // Replace video: padam video lama jika ada
        if (cp.mediaVideo && cp.mediaVideo.id) {
          await deleteMediaFromGAS_(cp.mediaVideo.id);
        }
        cp.mediaVideo = uploadedVideo;
     }
     syncLegacyMediaFields_(cp);
     cp.marker.setIcon(getCustomIcon(iconType, iconColor, iconSize));
     cp.marker.setTooltipContent(name);
     bindCheckpointPopup(cp.marker, name, cp.lat, cp.lng, getMediaForPopup_(cp), cp.desc);
     bindMarkerEditEvents(cp.marker);
     markUnsavedChanges();
     showToast('Checkpoint dikemaskini');
  } else {
     const lat = parseFloat(pendingCPLatLng.lat);
     const lng = parseFloat(pendingCPLatLng.lng);
     const marker = L.marker([lat, lng], {
       draggable: mode === 'admin' || mode === 'master',
       icon: getCustomIcon(iconType, iconColor, iconSize)
     }).addTo(map)
     .bindTooltip(name, { permanent: true, direction: 'top', className: 'bg-slate-800 text-white border-0 rounded px-2 py-0.5 text-[10px] md:text-xs shadow-md' });

     const newCp = {
       name,
       desc: desc,
       lat: lat,
       lng: lng,
       marker,
       icon: iconType,
       iconColor: iconColor,
       iconSize: iconSize,
       mediaImages: uploadedImages,
       mediaVideo: uploadedVideo
     };
     syncLegacyMediaFields_(newCp);
     bindCheckpointPopup(marker, name, lat, lng, getMediaForPopup_(newCp), desc);

     marker.on('dragend', function(e) {
         const pos = marker.getLatLng();
         const cpIndex = checkpoints.findIndex(c => c.marker === marker);
         if(cpIndex > -1) {
             checkpoints[cpIndex].lat = pos.lat; 
             checkpoints[cpIndex].lng = pos.lng; 
             bindCheckpointPopup(marker, checkpoints[cpIndex].name, pos.lat, pos.lng, getMediaForPopup_(checkpoints[cpIndex]), checkpoints[cpIndex].desc);
             markUnsavedChanges();
         }
         showToast('Kedudukan dikemaskini', 'info');
     });
     bindMarkerEditEvents(marker);
     checkpoints.push(newCp);
     markUnsavedChanges();
     showToast(`Lokasi ditambah`);
  }
  document.getElementById('cp-name').value = '';
  document.getElementById('cp-desc').value = '';
  if (imgInput) imgInput.value = '';
  if (vidInput) vidInput.value = '';
  const existingWrap = document.getElementById('cp-existing-media');
  const existingList = document.getElementById('cp-existing-media-list');
  if (existingWrap) existingWrap.classList.add('hidden');
  if (existingList) existingList.innerHTML = '';
  document.getElementById('cp-input-box').classList.add('hidden');
  addingCheckpoint = false; pendingCPLatLng = null; editingCPIndex = -1;
  renderCPList();
}

function toggleNavigation() {
  if (isNavigating) {
    stopNavigation();
  } else {
    startNavigation();
  }
}

function startNavigation() {
  if (!navigator.geolocation) return showToast('Sistem GPS tidak disokong pada peranti anda', 'error');
  isNavigating = true;
  showToast('Memulakan Navigasi Kedudukan Saya...', 'info');

  const btns = document.querySelectorAll('#nav-toggle-btn, #viewer-nav-toggle-btn');
  btns.forEach(btn => {
     btn.classList.replace('bg-emerald-500', 'bg-red-500');
     btn.classList.replace('hover:bg-emerald-600', 'hover:bg-red-600');
     btn.innerHTML = '<i data-lucide="navigation-off" class="w-4 h-4"></i> Henti Navigasi';
  });
  safeCreateIcons();

  const userIcon = L.divIcon({
     html: `<div class="w-4 h-4 bg-blue-500 border-[3px] border-white rounded-full pulse-dot"></div>`,
     className: 'flex items-center justify-center',
     iconSize: [20, 20],
     iconAnchor: [10, 10]
  });

  navWatchId = navigator.geolocation.watchPosition(pos => {
     const latlng = [pos.coords.latitude, pos.coords.longitude];
     if (!userNavMarker) {
         userNavMarker = L.marker(latlng, {icon: userIcon, zIndexOffset: 1000}).addTo(map);
         map.setView(latlng, 16);
     } else {
         userNavMarker.setLatLng(latlng);
     }
  }, err => showToast('Ralat lokasi navigasi: ' + err.message, 'error'), {
     enableHighAccuracy: true,
     maximumAge: 0,
     timeout: 5000
  });
}

function stopNavigation() {
  isNavigating = false;
  if (navWatchId !== null) { navigator.geolocation.clearWatch(navWatchId); navWatchId = null; }
  if (userNavMarker) { map.removeLayer(userNavMarker); userNavMarker = null; }

  const btns = document.querySelectorAll('#nav-toggle-btn, #viewer-nav-toggle-btn');
  btns.forEach(btn => {
     btn.classList.replace('bg-red-500', 'bg-emerald-500');
     btn.classList.replace('hover:bg-red-600', 'hover:bg-emerald-600');
     btn.innerHTML = '<i data-lucide="navigation" class="w-4 h-4"></i> Navigasi Kedudukan Saya';
  });
  
  safeCreateIcons();
  if(mode) showToast('Navigasi Dihentikan');
}

function toggleParticipantBroadcast() {
    if (!globalSettings.live_tracking) return showToast('Sistem Penjejakan Langsung telah ditutup oleh Admin.', 'error');
    
    const eventId = currentEventId || new URLSearchParams(window.location.search).get('share');
    const participantName = document.getElementById('participant-name') ? document.getElementById('participant-name').value.trim() : 'Peserta Tanpa Nama';
    
    if(!eventId) return showToast('Sila pilih atau muat acara dahulu', 'error');
    if(!participantName) return showToast('Sila masukkan nama peserta', 'error');

    const btn = document.getElementById('btn-broadcast-live');

    if (isLiveBroadcasting) {
        isLiveBroadcasting = false;
        if(liveBroadcastWatchId !== null) {
            navigator.geolocation.clearWatch(liveBroadcastWatchId);
            liveBroadcastWatchId = null;
        }
        if(btn) {
            btn.classList.replace('bg-red-500', 'bg-rose-500');
            btn.classList.replace('hover:bg-red-600', 'hover:bg-rose-600');
            btn.innerHTML = '<i data-lucide="radio" class="w-4 h-4"></i> Mula Siaran GPS Sendiri';
        }
        safeCreateIcons();
        showToast('Siaran lokasi GPS dihentikan.');
    } else {
        if (!navigator.geolocation) return showToast('Sistem GPS tidak disokong pada peranti anda', 'error');
        isLiveBroadcasting = true;
        showToast('Memulakan Siaran Lokasi Telefon ke Server...', 'info');
        
        if(btn) {
            btn.classList.replace('bg-rose-500', 'bg-red-500');
            btn.classList.replace('hover:bg-rose-600', 'hover:bg-red-600');
            btn.innerHTML = '<i data-lucide="radio" class="w-4 h-4 animate-pulse"></i> Henti Siaran GPS';
        }
        safeCreateIcons();

        if(!isNavigating && connectedDevices.length === 0) startNavigation();

        liveBroadcastWatchId = navigator.geolocation.watchPosition(pos => {
            const now = Date.now();
            const speedMps = pos.coords.speed || 0;
            const speedKmh = (speedMps * 3.6).toFixed(1);

            if (now - lastLiveBroadcastTime > 8000) {
                const payload = {
                    type: 'live_update',
                    event_id: eventId,
                    participant_name: participantName,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    hr: '',
                    spo2: '',
                    speed: speedKmh,
                    icon: '📱'
                };
                
                payload.origin = window.location.origin;
                payload.path = window.location.pathname;
                fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                }).catch(e => console.log('Gagal hantar live GPS:', e));
                
                lastLiveBroadcastTime = now;
            }
        }, err => console.log('Ralat bacaan GPS', err), { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    }
}

function startGlobalLiveMonitor(eventId) {
    if (!eventId) return;
    if (!globalSettings.live_tracking) return;
    if (globalLiveMonitorInterval) clearInterval(globalLiveMonitorInterval);
    
    const fetchLive = () => {
        if (!globalSettings.live_tracking) {
            stopGlobalLiveMonitor();
            return;
        }
        fetch(appendClientParamsToUrl(GAS_WEB_APP_URL + `?action=get_live&event_id=${eventId}`))
        .then(r => r.json())
        .then(data => {
            if(data.status === 'ok' && data.live_data) {
                updateLiveParticipantMarkers(data.live_data);
            }
        }).catch(e => console.log('Live sync err', e));
    };
    
    fetchLive();
    globalLiveMonitorInterval = setInterval(fetchLive, 8000);
}

function stopGlobalLiveMonitor() {
    if (globalLiveMonitorInterval) {
        clearInterval(globalLiveMonitorInterval);
        globalLiveMonitorInterval = null;
    }
    Object.values(liveParticipantMarkers).forEach(m => map.removeLayer(m.marker));
    liveParticipantMarkers = {};
}

function updateLiveParticipantMarkers(liveList) {
    const now = new Date().getTime();
    liveList.forEach(p => {
         const participantId = p.participant_name;
         const lat = parseFloat(p.lat);
         const lng = parseFloat(p.lng);
         const ts = new Date(p.timestamp).getTime();
         const iconHtmlStr = p.icon || '🏃';
         
         if (now - ts > 300000) return;
         
         let popupHtml = `<div class="text-center min-w-[120px]">
              <p class="font-bold text-slate-800 text-sm mb-1 border-b pb-1">${escapeXml(p.participant_name)}</p>
              <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-left text-[10px] text-slate-600 mt-1">
                  <div>❤️ HR: <span class="font-bold text-red-500">${p.hr || '--'}</span></div>
                  <div>⚡ SpO2: <span class="font-bold text-blue-500">${p.spo2 || '--'}%</span></div>
                  <div class="col-span-2">🏃 Laju: <span class="font-bold text-emerald-600">${p.speed || '0.0'} km/j</span></div>
              </div>
         </div>`;
         
         if (liveParticipantMarkers[participantId]) {
             liveParticipantMarkers[participantId].marker.setLatLng([lat, lng]);
             liveParticipantMarkers[participantId].marker.setPopupContent(popupHtml);
             liveParticipantMarkers[participantId].lastSeen = ts;
             if(liveParticipantMarkers[participantId].currentIcon !== iconHtmlStr) {
                 const newIcon = L.divIcon({
                     html: `<div class="relative flex items-center justify-center"><div class="text-xl drop-shadow-md bg-white/90 backdrop-blur rounded-full border-2 border-rose-500 flex items-center justify-center w-8 h-8 z-10" style="line-height:1;">${iconHtmlStr}</div><div class="absolute w-10 h-10 bg-rose-500/30 rounded-full animate-ping"></div></div>`,
                     className: 'live-marker',
                     iconSize: [32, 32],
                     iconAnchor: [16, 16]
                 });
                 liveParticipantMarkers[participantId].marker.setIcon(newIcon);
                 liveParticipantMarkers[participantId].currentIcon = iconHtmlStr;
             }
         } else {
             const icon = L.divIcon({
                 html: `<div class="relative flex items-center justify-center"><div class="text-xl drop-shadow-md bg-white/90 backdrop-blur rounded-full border-2 border-rose-500 flex items-center justify-center w-8 h-8 z-10" style="line-height:1;">${iconHtmlStr}</div><div class="absolute w-10 h-10 bg-rose-500/30 rounded-full animate-ping"></div></div>`,
                     className: 'live-marker',
                 iconSize: [32, 32],
                 iconAnchor: [16, 16]
             });
             const marker = L.marker([lat, lng], {icon: icon, zIndexOffset: 2000}).addTo(map);
             marker.bindPopup(popupHtml, {className: 'custom-modern-popup'});
             marker.bindTooltip(p.participant_name, { permanent: true, direction: 'bottom', offset: [0, 16], className: 'bg-rose-600 text-white border-0 rounded px-1.5 py-0.5 text-[9px] shadow-sm' });
             liveParticipantMarkers[participantId] = { marker, lastSeen: ts, currentIcon: iconHtmlStr };
         }
    });

    Object.keys(liveParticipantMarkers).forEach(id => {
        if (now - liveParticipantMarkers[id].lastSeen > 300000) {
            map.removeLayer(liveParticipantMarkers[id].marker);
            delete liveParticipantMarkers[id];
        }
    });
}

async function connectSmartDeviceScanner() {
  if (!globalSettings.live_tracking) return showToast('Sistem Penjejakan Langsung telah ditutup oleh Admin.', 'error');

  try {
    if (!navigator.bluetooth) {
      return customDialog({type: 'alert', title: 'Tidak Disokong', msg: 'Ciri Web Bluetooth tidak disokong pada pelayar (browser) ini. Gunakan GPS Telefon di atas untuk menjejaki lokasi acara.'});
    }
    
    customDialog({type: 'info', title: 'Maklumat Bluetooth', msg: 'Sila pastikan peranti menyokong profil "Standard GATT Heart Rate". Jika tiada data diterima, pastikan peranti TIDAK sedang bersambung ke aplikasi telefon rasminya di latar belakang (unpair sementara peranti anda untuk kelancaran).'});
    showToast('Buka tetingkap imbasan Bluetooth... Sila pilih peranti.', 'info');
    
    const newDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['heart_rate', 0x1822, 0x1814, 'battery_service']
    });

    if(!newDevice) return;
    
    if(connectedDevices.find(d => d.device.id === newDevice.id)) {
        return showToast('Peranti ini sudah disambungkan.', 'info');
    }

    newDevice.addEventListener('gattserverdisconnected', () => onDeviceDisconnected(newDevice.id));

    showToast('Menyambung kepada ' + newDevice.name + '...', 'info');
    const server = await newDevice.gatt.connect();
    showToast('Berhubung dengan ' + newDevice.name, 'success');

    const deviceObj = {
        id: newDevice.id,
        name: newDevice.name || 'Peranti Pintar',
        participantName: newDevice.name || 'Peserta',
        device: newDevice,
        server: server,
        hrChar: null,
        spo2Char: null,
        icon: '🏃',
        isLocked: false,
        isConnected: true,
        reconnectInterval: null,
        marker: null
    };
    connectedDevices.push(deviceObj);
    
    document.getElementById('smart-device-panel').classList.remove('hidden');
    renderConnectedDevices();
    updateDeviceMarkersGps(); 

    await initDeviceCharacteristics(deviceObj);

  } catch (error) {
    console.error('Ralat Bluetooth:', error);
    if(error.name !== 'NotFoundError') {
        showToast('Gagal menyambung: ' + error.message, 'error');
    }
  }
}

async function initDeviceCharacteristics(deviceObj) {
    let hasHR = false;
    try {
      const hrService = await deviceObj.server.getPrimaryService('heart_rate');
      deviceObj.hrChar = await hrService.getCharacteristic('heart_rate_measurement');
      await deviceObj.hrChar.startNotifications();
      deviceObj.hrChar.addEventListener('characteristicvaluechanged', (e) => handleHRUpdate(e, deviceObj.id));
      hasHR = true;
    } catch(e) { console.warn('Tiada servis Heart Rate standard dijumpai utk ' + deviceObj.name); }
    
    if(!hasHR) {
       const el = document.getElementById(`metric-hr-${deviceObj.id}`);
       if(el) { el.style.opacity = '0.4'; document.getElementById(`val-hr-${deviceObj.id}`).textContent = 'N/A'; }
    }

    let hasSpo2 = false;
    try {
      const spo2Service = await deviceObj.server.getPrimaryService(0x1822);
      deviceObj.spo2Char = await spo2Service.getCharacteristic(0x2A5F);
      await deviceObj.spo2Char.startNotifications();
      deviceObj.spo2Char.addEventListener('characteristicvaluechanged', (e) => handleSpO2Update(e, deviceObj.id));
      hasSpo2 = true;
    } catch(e) { console.warn('Tiada servis SpO2 standard dijumpai utk ' + deviceObj.name); }

    if(!hasSpo2) {
       const el = document.getElementById(`metric-spo2-${deviceObj.id}`);
       if(el) { el.style.opacity = '0.4'; document.getElementById(`val-spo2-${deviceObj.id}`).textContent = 'N/A'; }
    }
}

function updateDeviceMarkersGps() {
    if (deviceGpsWatchId !== null) return;
    if (!navigator.geolocation) return;

    deviceGpsWatchId = navigator.geolocation.watchPosition(pos => {
        const baseLat = pos.coords.latitude;
        const baseLng = pos.coords.longitude;
        const speedMps = pos.coords.speed || 0;
        const speedKmh = (speedMps * 3.6).toFixed(1);

        const eventId = currentEventId || new URLSearchParams(window.location.search).get('share');
        const shouldBroadcast = !!eventId && globalSettings.live_tracking;
        const now = Date.now();

        connectedDevices.forEach((d, index) => {
            if (!d.isConnected) return;

            const gpsValEl = document.getElementById(`val-gps-${d.id}`);
            if(gpsValEl) gpsValEl.innerHTML = `${baseLat.toFixed(5)}<br>${baseLng.toFixed(5)}`;

            const offsetLat = baseLat + (index * 0.00003);
            const offsetLng = baseLng + (index * 0.00003);

            if (!d.marker) {
                const iconHtml = L.divIcon({
                    html: `<div class="text-xl drop-shadow-md bg-white/90 backdrop-blur rounded-full border-2 border-emerald-500 flex items-center justify-center w-8 h-8" style="line-height:1;">${d.icon}</div>`,
                    className: 'device-marker',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                d.marker = L.marker([offsetLat, offsetLng], { icon: iconHtml, zIndexOffset: 1500 }).addTo(map);
                d.marker.bindTooltip(d.participantName, { permanent: true, direction: 'top', className: 'bg-slate-800 text-white text-[10px] border-0 rounded px-1.5 py-0.5 mt-[-10px]' });
                
                if(connectedDevices.length === 1 && !isNavigating) map.setView([offsetLat, offsetLng], 17);
            } else {
                d.marker.setLatLng([offsetLat, offsetLng]);
            }

            if (shouldBroadcast && (now - lastLiveBroadcastTime > 8000)) {
                const hrEl = document.getElementById(`val-hr-${d.id}`);
                const spo2El = document.getElementById(`val-spo2-${d.id}`);
                const payload = {
                    type: 'live_update',
                    event_id: eventId,
                    participant_name: d.participantName,
                    lat: offsetLat,
                    lng: offsetLng,
                    hr: hrEl && hrEl.textContent !== '--' ? hrEl.textContent : '',
                    spo2: spo2El && spo2El.textContent !== '--' ? spo2El.textContent : '',
                    speed: speedKmh,
                    icon: d.icon
                };
                payload.origin = window.location.origin;
                payload.path = window.location.pathname;
                fetch(GAS_WEB_APP_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).catch(e=>console.log(e));
            }
        });
        
        if (shouldBroadcast && (now - lastLiveBroadcastTime > 8000)) {
            lastLiveBroadcastTime = now;
        }
    }, err => console.warn('Ralat GPS Peranti:', err), { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
}

function stopDeviceMarkersGps() {
    if (deviceGpsWatchId !== null) {
        navigator.geolocation.clearWatch(deviceGpsWatchId);
        deviceGpsWatchId = null;
    }
}

function renderConnectedDevices() {
    const container = document.getElementById('device-list-container');
    container.innerHTML = connectedDevices.map(d => `
        <div class="bg-slate-800/80 rounded-lg p-2 border border-slate-700 relative">
           <div class="absolute top-1.5 right-1.5 flex gap-1 items-center">
               <div id="status-dot-${d.id}" class="w-2 h-2 rounded-full ${d.isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'} mr-1" title="${d.isConnected ? 'Terhubung' : 'Terputus - Cuba menyambung semula...'}"></div>
               <button onclick="toggleDeviceLock('${d.id}')" class="text-slate-500 hover:text-amber-400 transition-colors" title="Kunci/Buka Kunci Peranti">
                   <i data-lucide="${d.isLocked ? 'lock' : 'unlock'}" class="w-4 h-4 ${d.isLocked ? 'text-amber-500' : ''}"></i>
               </button>
               <button onclick="disconnectSingleDevice('${d.id}')" class="text-slate-500 hover:text-red-400 transition-colors ${d.isLocked ? 'hidden' : ''}" title="Putuskan">
                   <i data-lucide="x-circle" class="w-4 h-4"></i>
               </button>
           </div>
           <div class="flex items-center gap-2 mb-1 pr-12">
                <select onchange="changeDeviceIcon('${d.id}', this.value)" class="bg-slate-900 border border-slate-600 rounded text-sm p-0.5 cursor-pointer text-white" title="Pilih Ikon Peta">
                    <option value="🏃" ${d.icon === '🏃' ? 'selected' : ''}>🏃 Lari</option>
                    <option value="🚶" ${d.icon === '🚶' ? 'selected' : ''}>🚶 Jalan</option>
                    <option value="🚴" ${d.icon === '🚴' ? 'selected' : ''}>🚴 Basikal</option>
                    <option value="🚗" ${d.icon === '🚗' ? 'selected' : ''}>🚗 Kereta</option>
                    <option value="🏍️" ${d.icon === '🏍️' ? 'selected' : ''}>🏍️ Motor</option>
                    <option value="🚑" ${d.icon === '🚑' ? 'selected' : ''}>🚑 Ambulans</option>
                </select>
                <input type="text" value="${d.participantName}" oninput="updateDeviceParticipantName('${d.id}', this.value)" class="w-full bg-slate-900 border border-slate-600 rounded text-[11px] p-1 text-white focus:outline-none focus:border-emerald-500" placeholder="Nama Peserta">
           </div>
           <div class="grid grid-cols-3 gap-1.5 text-center mt-2">
                <div id="metric-hr-${d.id}" class="bg-slate-900 rounded p-1 border border-slate-700">
                   <i data-lucide="heart" class="w-3 h-3 text-red-500 mx-auto mb-0.5 ${d.isConnected ? 'animate-pulse' : ''}"></i>
                   <div id="val-hr-${d.id}" class="text-[11px] font-mono font-bold text-white">--</div>
                </div>
                <div id="metric-spo2-${d.id}" class="bg-slate-900 rounded p-1 border border-slate-700">
                   <i data-lucide="activity" class="w-3 h-3 text-blue-400 mx-auto mb-0.5"></i>
                   <div id="val-spo2-${d.id}" class="text-[11px] font-mono font-bold text-white">--</div>
                </div>
                <div id="metric-gps-${d.id}" class="bg-slate-900 rounded p-1 border border-slate-700">
                   <i data-lucide="map-pin" class="w-3 h-3 text-emerald-400 mx-auto mb-0.5"></i>
                   <div id="val-gps-${d.id}" class="text-[9px] font-mono font-bold text-slate-300 leading-tight truncate">--<br>--</div>
                </div>
           </div>
        </div>
    `).join('');
    safeCreateIcons();
}

function updateDeviceParticipantName(id, newName) {
    const d = connectedDevices.find(x => x.id === id);
    if(d) {
        d.participantName = newName || d.name;
        if(d.marker) {
            d.marker.setTooltipContent(d.participantName);
        }
    }
}

function toggleDeviceLock(id) {
    const idx = connectedDevices.findIndex(x => x.id === id);
    if(idx > -1) {
        const d = connectedDevices[idx];
        d.isLocked = !d.isLocked;
        if (!d.isLocked && !d.isConnected) {
            clearInterval(d.reconnectInterval);
            cleanupDevice(d);
            connectedDevices.splice(idx, 1);
            showToast(`${d.participantName} dibuang kerana tidak dikunci lagi.`, 'info');
            if(connectedDevices.length === 0) {
                document.getElementById('smart-device-panel').classList.add('hidden');
                stopDeviceMarkersGps();
            }
        } else {
            showToast(d.isLocked ? 'Peranti dikunci. Sistem akan auto-sambung jika terputus.' : 'Peranti dibuka kunci.', 'info');
        }
        renderConnectedDevices();
    }
}

function changeDeviceIcon(id, icon) {
    const d = connectedDevices.find(x => x.id === id);
    if(d) {
        d.icon = icon;
        if(d.marker) {
            const iconHtml = L.divIcon({
                html: `<div class="text-xl drop-shadow-md bg-white/90 backdrop-blur rounded-full border-2 border-emerald-500 flex items-center justify-center w-8 h-8" style="line-height:1;">${icon}</div>`,
                className: 'device-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            d.marker.setIcon(iconHtml);
        }
    }
}

function handleHRUpdate(event, deviceId) {
    const value = event.target.value;
    const flags = value.getUint8(0);
    const format = flags & 0x01;
    let hr;
    if (format === 0) { hr = value.getUint8(1); }
    else { hr = value.getUint16(1, true); }
    const el = document.getElementById(`val-hr-${deviceId}`);
    if(el) el.textContent = hr;
}

function handleSpO2Update(event, deviceId) {
    try {
        const value = event.target.value;
        const spo2 = value.getUint16(1, true);
        const actualSpo2 = (spo2 & 0x0FFF) / 10; 
        const el = document.getElementById(`val-spo2-${deviceId}`);
        if(el) el.textContent = Math.round(actualSpo2);
    } catch(e) {
        const el = document.getElementById(`val-spo2-${deviceId}`);
        if(el) el.textContent = '--';
    }
}

function cleanupDevice(d) {
    if(d.hrChar) d.hrChar.removeEventListener('characteristicvaluechanged', handleHRUpdate);
    if(d.spo2Char) d.spo2Char.removeEventListener('characteristicvaluechanged', handleSpO2Update);
    if(d.marker) map.removeLayer(d.marker);
    if(d.reconnectInterval) clearInterval(d.reconnectInterval);
}

function disconnectSingleDevice(id) {
    const d = connectedDevices.find(x => x.id === id);
    if (d && d.isLocked) return showToast('Peranti sedang dikunci. Buka kunci untuk putuskan.', 'error');
    if (d && d.device.gatt.connected) d.device.gatt.disconnect();
    else onDeviceDisconnected(id);
}

function disconnectAllSmartDevices() {
    const unlocked = connectedDevices.filter(d => !d.isLocked);
    if (unlocked.length === 0 && connectedDevices.length > 0) {
        return showToast('Semua peranti dikunci. Buka kunci untuk putuskan.', 'info');
    }
    unlocked.forEach(d => {
        if (d.device.gatt.connected) d.device.gatt.disconnect();
        else onDeviceDisconnected(d.id);
    });
}

function onDeviceDisconnected(id) {
    const idx = connectedDevices.findIndex(x => x.id === id);
    if(idx > -1) {
        const d = connectedDevices[idx];
        d.isConnected = false;
        
        if (d.isLocked) {
            showToast(`Sambungan terputus: ${d.participantName}. Sistem akan cuba menyambung semula...`, 'warning');
            renderConnectedDevices();
            if (!d.reconnectInterval) {
                d.reconnectInterval = setInterval(() => autoReconnectDevice(d), 5000);
            }
        } else {
            cleanupDevice(d);
            connectedDevices.splice(idx, 1);
            showToast(`${d.participantName} telah diputuskan`, 'info');
            if(connectedDevices.length === 0) {
                document.getElementById('smart-device-panel').classList.add('hidden');
                stopDeviceMarkersGps();
            } else {
                renderConnectedDevices();
            }
        }
    }
}

async function autoReconnectDevice(d) {
    if (d.device.gatt.connected) {
        clearInterval(d.reconnectInterval);
        d.reconnectInterval = null;
        return;
    }
    try {
        d.server = await d.device.gatt.connect();
        clearInterval(d.reconnectInterval);
        d.reconnectInterval = null;
        d.isConnected = true;
        showToast(`${d.participantName} berjaya disambung semula!`, 'success');
        
        await initDeviceCharacteristics(d);
        renderConnectedDevices();
    } catch(e) {
        console.log('Gagal sambung semula:', d.participantName, e);
    }
}

async function saveToGAS(payload) {
  if (!GAS_WEB_APP_URL) {
    showToast("Pautan Web App GAS tidak dijumpai.", "error");
    return false;
  }
  try {
    // Lampirkan maklumat client untuk domain lock di server (soft lock)
    payload.origin = window.location.origin;
    payload.path = window.location.pathname;

    const res = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow'
    });
    const text = await res.text();

    if (text.includes('<html') || text.includes('Sign in')) {
       throw new Error("Akses Ditolak: Sila pastikan Web App GAS di-deploy dengan akses 'Anyone'.");
    }

    let result;
    try {
       result = JSON.parse(text);
    } catch(e) {
       console.error("Format balasan tidak sah:", text);
       throw new Error("Ralat pelayan: Format balasan tidak sah. Sila periksa pautan GAS.");
    }

    if (result && result.status !== 'ok') {
       throw new Error(result.message || "Ralat tidak diketahui dari pelayan.");
    }
    
    return true;
  } catch (error) { 
    console.error('Ralat GAS:', error); 
    showToast(error.message || "Gagal menyimpan rekod ke pelayan.", "error");
    return false; 
  }
}

async function saveEvent() {
  const eventName = document.getElementById('event-name').value.trim();
  if (!eventName) return showToast('Sila tulis nama acara', 'error');
  if (treks.length === 0 && checkpoints.length === 0 && mapTexts.length === 0) {
    return showToast('Tiada maklumat untuk disimpan', 'error');
  }

  treks.forEach((t, idx) => {
     if (t.isEditingShape) toggleEditTrekShape(idx);
  });

  let slugInput = document.getElementById('event-slug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const oldEventId = currentEventId;
  const eventId = slugInput || currentEventId || Date.now().toString(36);
  currentEventId = eventId;
  showToast('Menyimpan perubahan...', 'info');

  const existingEvent = allData.find(d => d.event_id === eventId);
  const eventOwner = existingEvent ? existingEvent.created_by : currentUser.user_id;

  let payloads = [];
  
  payloads.push({
      type: 'event_metadata',
      event_id: eventId,
      event_name: eventName,
      trek_name: '',
      trek_color: '',
      coordinates: '',
      checkpoint_name: 'map_layer',
      lat: '',
      lng: '',
      created_by: eventOwner,
      distance: '',
      icon: currentBaseLayer,
      media_id: '',
      media_type: '',
      media_images: '',
      media_video_id: '',
      media_video_type: ''
  });

  for (const t of treks) {
    payloads.push({
      type: 'trek', 
      event_id: eventId, 
      event_name: eventName, 
      trek_name: t.name, 
      trek_color: t.color, 
      coordinates: JSON.stringify(t.coords), 
      checkpoint_name: '', 
      lat: '', 
      lng: '', 
      created_by: eventOwner, 
      distance: t.distance || 0, 
      icon: JSON.stringify({offset: t.offset || 0, weight: t.weight || 4, type: t.type || 'line', dashArray: t.dashArray || '', fill: t.fill || false}), 
      media_id: '', 
      media_type: '',
      media_images: '',
      media_video_id: '',
      media_video_type: ''
    });
  }

  for (const cp of checkpoints) {
    normalizeCheckpointMedia_(cp);
    payloads.push({ 
      type: 'checkpoint', 
      event_id: eventId, 
      event_name: eventName, 
      trek_name: '', 
      trek_color: '', 
      coordinates: cp.desc || '', 
      checkpoint_name: cp.name, 
      lat: String(cp.lat), 
      lng: String(cp.lng), 
      created_by: eventOwner, 
      distance: '', 
      icon: JSON.stringify({ name: cp.icon || 'map-pin', color: cp.iconColor || '#10b981', size: cp.iconSize || 28 }), 
      media_id: cp.mediaId || '', 
      media_type: cp.mediaType || '',
      media_images: JSON.stringify(cp.mediaImages || []),
      media_video_id: (cp.mediaVideo && cp.mediaVideo.id) ? cp.mediaVideo.id : '',
      media_video_type: (cp.mediaVideo && cp.mediaVideo.mimeType) ? cp.mediaVideo.mimeType : ''
    });
  }

  for (const txt of mapTexts) {
    payloads.push({ 
      type: 'map_text', 
      event_id: eventId, 
      event_name: eventName, 
      trek_name: '', 
      trek_color: '', 
      coordinates: '', 
      checkpoint_name: txt.text, 
      lat: String(txt.lat), 
      lng: String(txt.lng), 
      created_by: eventOwner, 
      distance: '', 
      icon: JSON.stringify(txt.options), 
      media_id: '', 
      media_type: '',
      media_images: '',
      media_video_id: '',
      media_video_type: ''
    });
  }

  const masterPayload = { type: 'bulk_event', event_id: eventId, old_event_id: oldEventId, payloads: payloads };

  if (await saveToGAS(masterPayload)) {
    allData = allData.filter(d => d.event_id !== eventId && d.event_id !== oldEventId).concat(payloads);
    document.getElementById('share-btn').classList.remove('hidden');
    renderSavedEvents();
    if (currentUser.role === 'master') renderMasterEventList();
    clearUnsavedChanges();
    showToast('Berjaya disimpan & dikemaskini!');
    fitMapBounds();
    startGlobalLiveMonitor(eventId);
  } else {
    showToast('Gagal menyimpan rekod', 'error');
  }
}

function startNewEvent() {
  if (hasUnsavedChanges) {
      customDialog({type: 'confirm', title: 'Acara Baru', msg: 'Data belum disimpan. Teruskan mula acara baru?'}).then(res => {
          if (res) executeNewEvent();
      });
  } else {
      executeNewEvent();
  }
}

function executeNewEvent() {
    clearMapData();
    stopGlobalLiveMonitor();
    document.getElementById('event-name').value = '';
    document.getElementById('event-slug').value = '';
    document.getElementById('share-btn').classList.add('hidden');
    currentEventId = null;
    showToast('Ruang kerja dikosongkan untuk acara baru.', 'info');
}

async function confirmDeleteEvent(eventId) {
    const res = await customDialog({type: 'confirm', title: 'Padam Acara', msg: 'Adakah anda pasti untuk memadam acara ini secara kekal?'});
    if (res) {
        showToast('Memadam rekod...', 'info');
        const payload = { type: 'delete_event', event_id: eventId };
        const success = await saveToGAS(payload);
        if (success) {
            allData = allData.filter(d => d.event_id !== eventId);
            renderSavedEvents();
            if (currentUser && currentUser.role === 'master') renderMasterEventList();
            if (currentEventId === eventId) {
                executeNewEvent();
            }
            showToast('Acara berjaya dipadam.');
        }
    }
}

function clearMapData() {
  treks.forEach(t => map.removeLayer(t.polyline));
  checkpoints.forEach(cp => map.removeLayer(cp.marker));
  mapTexts.forEach(t => map.removeLayer(t.marker));
  treks = []; checkpoints = []; mapTexts = []; currentTrekIndex = -1;
  if(document.getElementById('trek-list')) { 
    renderTrekList(); 
    renderCPList(); 
  }
  clearUnsavedChanges();
}

function renderSavedEvents() {
  const container = document.getElementById('saved-events');
  if (!container || !currentUser) return;
  
  const events = allData.filter(d => d.created_by === currentUser.user_id && d.type !== 'event_metadata');
  const unique = [...new Map(events.map(d => [d.event_id, d.event_name])).entries()];
  
  container.innerHTML = unique.map(([id, name]) =>
    `<div class="trek-item flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-xs text-slate-300 hover:text-white bg-slate-800/50 mb-1">
        <div class="flex items-center gap-2 cursor-pointer flex-1 truncate" onclick="handleLoadEvent('${id}')">
            <i data-lucide="folder" class="w-3 h-3 text-emerald-400"></i> <span class="truncate">${name}</span>
        </div>
        <button onclick="confirmDeleteEvent('${id}')" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Padam Acara"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
    </div>`
  ).join('') || '<p class="text-xs text-slate-500 py-1">Tiada rekod tersimpan</p>';
  safeCreateIcons();
}

function renderMasterEventList() {
  const container = document.getElementById('master-event-list');
  if (!container) return;
  const events = allData.filter(d => d.type !== 'event_metadata');
  const unique = [...new Map(events.map(d => [d.event_id, d.event_name])).entries()];
  
  container.innerHTML = unique.map(([id, name]) =>
    `<div class="trek-item flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-xs text-slate-300 hover:text-white bg-slate-800/50 mb-1">
        <div class="flex items-center gap-2 cursor-pointer flex-1 truncate" onclick="handleLoadEvent('${id}')">
            <i data-lucide="map" class="w-3 h-3 text-emerald-400"></i> <span class="truncate">${name}</span>
        </div>
        <button onclick="confirmDeleteEvent('${id}')" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Padam Acara"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
    </div>`
  ).join('') || '<p class="text-xs text-slate-500 py-1">Tiada rekod acara tersimpan</p>';
  safeCreateIcons();
}

async function handleLoadEvent(eventId) {
   if (hasUnsavedChanges) {
       const res = await customDialog({type: 'confirm', title: 'Tukar Acara', msg: 'Anda mempunyai data yang belum disimpan. Tukar ke acara lain akan membatalkan perubahan ini. Teruskan?'});
       if(!res) return;
   }
   loadEvent(eventId);
}

function loadEvent(eventId) {
  clearMapData(); 
  stopGlobalLiveMonitor();
  currentEventId = eventId;
  const eventData = allData.filter(d => d.event_id === eventId);
  
  const metadata = eventData.find(d => d.type === 'event_metadata' && d.checkpoint_name === 'map_layer');
  let baseLayerName = metadata ? metadata.icon : "Google Maps";
  if (baseLayerName === "USGS Imagery" || baseLayerName === "OpenStreetMap") {
     baseLayerName = "OSM Standard (Denai & Jalan)";
  }
  if (metadata && mapLayers[baseLayerName]) {
     map.addLayer(mapLayers[baseLayerName]);
     currentBaseLayer = baseLayerName;
  } else if (metadata) {
     map.addLayer(mapLayers["Google Maps"]);
     currentBaseLayer = "Google Maps";
  }

  const firstEvent = eventData.find(d => d.type === 'trek' || d.type === 'checkpoint' || d.type === 'map_text');
  document.getElementById('event-name').value = firstEvent?.event_name || '';
  document.getElementById('event-slug').value = eventId;
  document.getElementById('share-btn').classList.remove('hidden');

  eventData.filter(d => d.type === 'trek').forEach(d => {
    const coords = JSON.parse(d.coordinates || '[]');
    let offset = 0;
    let weight = 4;
    let tType = 'line';
    let dashArray = '';
    let fill = false;
    try {
        if(d.icon && d.icon.startsWith('{')) {
            const parsed = JSON.parse(d.icon);
            offset = parsed.offset || 0;
            weight = parsed.weight || 4;
            tType = parsed.type || 'line';
            dashArray = parsed.dashArray || '';
            fill = parsed.fill || false;
        } else {
            offset = parseInt(d.icon) || 0;
        }
    } catch(e){}
    
    let polyline;
    if (tType === 'polygon') {
         polyline = L.polygon(coords.map(c => [parseFloat(c.lat), parseFloat(c.lng)]), { color: d.trek_color, weight: weight, dashArray: dashArray, fill: fill, fillOpacity: 0.3 }).addTo(map);
    } else {
         polyline = L.polyline(coords.map(c => [parseFloat(c.lat), parseFloat(c.lng)]), { color: d.trek_color, weight: weight, offset: offset, dashArray: dashArray }).addTo(map);
    }
    
    bindTrekDblClick(polyline, d.trek_name);
    treks.push({ name: d.trek_name, type: tType, color: d.trek_color, coords, polyline, distance: parseFloat(d.distance) || 0, offset: offset, weight: weight, dashArray: dashArray, fill: fill, isEditingShape: false });
  });

  eventData.filter(d => d.type === 'checkpoint').forEach(d => {
    if (d.checkpoint_name === 'map_layer') return;
    let iconType = 'map-pin';
    let iconColor = '#10b981';
    let iconSize = 28;

    try {
        if (d.icon && d.icon.startsWith('{')) {
            const parsed = JSON.parse(d.icon);
            iconType = parsed.name || 'map-pin';
            iconColor = parsed.color || '#10b981';
            iconSize = parsed.size || 28;
        } else if (d.icon) {
            iconType = d.icon;
        }
    } catch(e){}

    const lat = parseFloat(d.lat);
    const lng = parseFloat(d.lng);
    const marker = L.marker([lat, lng], {
      draggable: mode === 'admin' || mode === 'master',
      icon: getCustomIcon(iconType, iconColor, iconSize)
    }).addTo(map).bindTooltip(d.checkpoint_name, { permanent: true, direction: 'top', className: 'bg-slate-800 text-white border-0 rounded px-2 py-0.5 text-[10px] md:text-xs shadow-md' });
    
    const desc = d.coordinates || '';
    // Media (versi baru: banyak gambar + 1 video) + serasi versi lama
    let mediaImages = [];
    let mediaVideo = null;
    try {
        if (d.media_images) {
          const parsed = JSON.parse(d.media_images);
          if (Array.isArray(parsed)) mediaImages = parsed;
        }
    } catch(e){}
    if (d.media_video_id) {
      mediaVideo = { id: String(d.media_video_id), mimeType: String(d.media_video_type || '') };
    }
    // Fallback data lama
    if (!mediaVideo && d.media_id && d.media_type && String(d.media_type).startsWith('video/')) {
      mediaVideo = { id: String(d.media_id), mimeType: String(d.media_type) };
    }
    if (mediaImages.length === 0 && d.media_id && d.media_type && !String(d.media_type).startsWith('video/')) {
      mediaImages = [{ id: String(d.media_id), mimeType: String(d.media_type) }];
    }

    const cpObj = { name: d.checkpoint_name, desc: desc, lat: lat, lng: lng, marker, icon: iconType, iconColor: iconColor, iconSize: iconSize, mediaImages, mediaVideo };
    syncLegacyMediaFields_(cpObj);
    bindCheckpointPopup(marker, d.checkpoint_name, lat, lng, getMediaForPopup_(cpObj), desc);

    marker.on('dragend', function(e) {
         const pos = marker.getLatLng();
         const cpIndex = checkpoints.findIndex(c => c.marker === marker);
         if(cpIndex > -1) {
             checkpoints[cpIndex].lat = pos.lat; 
             checkpoints[cpIndex].lng = pos.lng;
             bindCheckpointPopup(marker, checkpoints[cpIndex].name, pos.lat, pos.lng, getMediaForPopup_(checkpoints[cpIndex]), checkpoints[cpIndex].desc);
             markUnsavedChanges();
         }
         showToast('Kedudukan dikemaskini', 'info');
    });
    bindMarkerEditEvents(marker);
    checkpoints.push(cpObj);
  });

  eventData.filter(d => d.type === 'map_text').forEach(d => {
    let options = { color: '#ffffff', fontSize: 14, fontFamily: "'Outfit', sans-serif" };
    try {
        if(d.icon && d.icon.startsWith('{')) options = JSON.parse(d.icon);
        else if(d.icon) options.color = d.icon;
    } catch(e){}
    createTextMarker(d.checkpoint_name, parseFloat(d.lat), parseFloat(d.lng), options, mode === 'admin' || mode === 'master');
  });

  renderTrekList(); 
  renderCPList(); 
  fitMapBounds(); 
  clearUnsavedChanges(); 
  startGlobalLiveMonitor(eventId);
  showToast('Acara berjaya dimuatkan');
  if(window.innerWidth < 768 && sidebarOpen) toggleSidebar();
}

function fitMapBounds() {
  let allCoords = [];
  
  treks.forEach(t => {
    if (t.coords && Array.isArray(t.coords)) {
      t.coords.forEach(c => {
        if (c.lat !== undefined && c.lng !== undefined) {
          allCoords.push([parseFloat(c.lat), parseFloat(c.lng)]);
        }
      });
    }
  });
  
  checkpoints.forEach(c => {
    if (c.lat !== undefined && c.lng !== undefined) {
      allCoords.push([parseFloat(c.lat), parseFloat(c.lng)]);
    }
  });
  
  mapTexts.forEach(t => {
    if (t.lat !== undefined && t.lng !== undefined) {
      allCoords.push([parseFloat(t.lat), parseFloat(t.lng)]);
    }
  });
  
  if (allCoords.length > 0) {
    try {
      const bounds = L.latLngBounds(allCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
      }
    } catch (e) {
      console.error("Ralat pada fitMapBounds:", e);
    }
  }
}

function loadSharedViewerEvent(eventId) {
  clearMapData();
  stopGlobalLiveMonitor();
  const eventData = allData.filter(d => d.event_id === eventId);
  if (eventData.length === 0) {
     customDialog({type: 'alert', title: 'Acara Tiada', msg: 'Event tidak dijumpai atau telah dipadam.'}).then(() => goHome());
     return;
  }
  
  const metadata = eventData.find(d => d.type === 'event_metadata' && d.checkpoint_name === 'map_layer');
  let baseLayerName = metadata ? metadata.icon : "Google Maps";
  if (baseLayerName === "USGS Imagery" || baseLayerName === "OpenStreetMap") {
     baseLayerName = "OSM Standard (Denai & Jalan)";
  }
  if (metadata && mapLayers[baseLayerName]) {
     map.addLayer(mapLayers[baseLayerName]);
     currentBaseLayer = baseLayerName;
  } else if (metadata) {
     map.addLayer(mapLayers["Google Maps"]);
     currentBaseLayer = "Google Maps";
  }
  
  const firstEvent = eventData.find(d => d.type === 'trek' || d.type === 'checkpoint' || d.type === 'map_text');
  const eventName = firstEvent?.event_name || 'Acara PWA';
  document.title = eventName + " - SMART EVENT MAP";
  setupMapControls('shared-viewer');
  
  let floatPanel = document.getElementById('shared-float-panel');
  if(!floatPanel) {
     floatPanel = document.createElement('div'); 
     floatPanel.id = 'shared-float-panel';
     floatPanel.className = 'absolute top-4 left-4 z-[1000] glass rounded-xl p-3 md:p-4 shadow-2xl pointer-events-auto max-w-[85vw] w-72 transition-all duration-300 border border-white/10 flex flex-col max-h-[85vh] overflow-y-auto sidebar-scroll';
     document.getElementById('map').appendChild(floatPanel);
     L.DomEvent.disableClickPropagation(floatPanel);
     L.DomEvent.disableScrollPropagation(floatPanel);
  }

  eventData.filter(d => d.type === 'trek').forEach(d => {
    const coords = JSON.parse(d.coordinates || '[]');
    let offset = 0;
    let weight = 4;
    let tType = 'line';
    let dashArray = '';
    let fill = false;
    try {
        if(d.icon && d.icon.startsWith('{')) {
            const parsed = JSON.parse(d.icon);
            offset = parsed.offset || 0;
            weight = parsed.weight || 4;
            tType = parsed.type || 'line';
            dashArray = parsed.dashArray || '';
            fill = parsed.fill || false;
        } else {
            offset = parseInt(d.icon) || 0;
        }
    } catch(e){}
    
    let polyline;
    if (tType === 'polygon') {
         polyline = L.polygon(coords.map(c => [parseFloat(c.lat), parseFloat(c.lng)]), { color: d.trek_color, weight: weight, dashArray: dashArray, fill: fill, fillOpacity: 0.3 }).addTo(map);
    } else {
         polyline = L.polyline(coords.map(c => [parseFloat(c.lat), parseFloat(c.lng)]), { color: d.trek_color, weight: weight, offset: offset, dashArray: dashArray }).addTo(map);
    }
    bindTrekDblClick(polyline, d.trek_name);
    treks.push({ name: d.trek_name, type: tType, color: d.trek_color, coords, distance: parseFloat(d.distance)||0, polyline });
  });

  eventData.filter(d => d.type === 'checkpoint').forEach(d => {
    if (d.checkpoint_name === 'map_layer') return;
    let iconType = 'map-pin';
    let iconColor = '#10b981';
    let iconSize = 28;
    try {
        if (d.icon && d.icon.startsWith('{')) {
            const parsed = JSON.parse(d.icon);
            iconType = parsed.name || 'map-pin';
            iconColor = parsed.color || '#10b981';
            iconSize = parsed.size || 28;
        } else if (d.icon) {
            iconType = d.icon;
        }
    } catch(e){}

    const lat = parseFloat(d.lat);
    const lng = parseFloat(d.lng);
    const marker = L.marker([lat, lng], {icon: getCustomIcon(iconType, iconColor, iconSize)}).addTo(map).bindTooltip(d.checkpoint_name, { permanent:true, direction:'top', className: 'bg-slate-800 text-white border-0 rounded px-2 py-0.5 text-[10px] md:text-xs shadow-md' });
    
    const desc = d.coordinates || '';
    let mediaImages = [];
    let mediaVideo = null;
    try {
      if (d.media_images) {
        const parsed = JSON.parse(d.media_images);
        if (Array.isArray(parsed)) mediaImages = parsed;
      }
    } catch(e){}
    if (d.media_video_id) {
      mediaVideo = { id: String(d.media_video_id), mimeType: String(d.media_video_type || '') };
    }
    if (!mediaVideo && d.media_id && d.media_type && String(d.media_type).startsWith('video/')) {
      mediaVideo = { id: String(d.media_id), mimeType: String(d.media_type) };
    }
    if (mediaImages.length === 0 && d.media_id && d.media_type && !String(d.media_type).startsWith('video/')) {
      mediaImages = [{ id: String(d.media_id), mimeType: String(d.media_type) }];
    }

    const cpObj = { name: d.checkpoint_name, desc: desc, marker, lat: lat, lng: lng, icon: iconType, iconColor: iconColor, iconSize: iconSize, mediaImages, mediaVideo };
    syncLegacyMediaFields_(cpObj);
    bindCheckpointPopup(marker, d.checkpoint_name, lat, lng, getMediaForPopup_(cpObj), desc);
    checkpoints.push(cpObj);
  });

  eventData.filter(d => d.type === 'map_text').forEach(d => {
    let options = { color: '#ffffff', fontSize: 14, fontFamily: "'Outfit', sans-serif" };
    try {
        if(d.icon && d.icon.startsWith('{')) options = JSON.parse(d.icon);
        else if(d.icon) options.color = d.icon;
    } catch(e){}
    createTextMarker(d.checkpoint_name, parseFloat(d.lat), parseFloat(d.lng), options, false);
  });

  const legendHtml = treks.map((t, idx) => 
     `<div class="flex items-center justify-between gap-4 mt-2"><div class="flex items-center gap-1.5"><input type="checkbox" checked onchange="toggleTrekVisibility(${idx}, this.checked)" class="accent-emerald-500 w-3 h-3 cursor-pointer"><div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${t.color}"></div><span class="text-[11px] md:text-xs text-slate-300 line-clamp-1">${t.name}</span></div><div class="flex items-center gap-2"><span class="text-[10px] text-emerald-400 whitespace-nowrap">${t.type==='polygon' ? (t.distance||0).toFixed(0)+' m²' : (t.distance||0).toFixed(2)+' KM'}</span><button onclick="downloadTrekGPX(${idx})" class="p-1 text-blue-400 hover:bg-slate-700 rounded transition-colors" title="Muat Turun GPX"><i data-lucide="download" class="w-3 h-3"></i></button></div></div>`
  ).join('');

  floatPanel.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 overflow-hidden" id="shared-panel-content">
         <h2 class="font-bold text-sm md:text-base text-white line-clamp-2">${escapeXml(eventName)}</h2>
         <p class="text-[10px] md:text-xs text-emerald-400 mt-0.5">Mod Navigasi Acara</p>
         ${treks.length > 0 ? `<div class="mt-2 pt-2 border-t border-white/10"><label class="text-[10px] text-slate-400 font-medium mb-1 block">Paparan Info:</label>${legendHtml}</div>` : ''}
      </div>
      <div class="flex flex-col gap-2">
         <button onclick="goHome()" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors flex-shrink-0 border border-slate-600 shadow-md" title="Keluar">
            <i data-lucide="home" class="w-4 h-4"></i>
         </button>
      </div>
    </div>
    <div class="mt-3 pt-3 border-t border-white/10" id="shared-panel-nav">
       <input id="participant-name" type="text" class="w-full mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-[11px] md:text-xs text-white focus:outline-none" placeholder="Nama (Utk Siaran GPS Sendiri)">
       <div class="flex gap-2">
          <button id="btn-broadcast-live" onclick="toggleParticipantBroadcast()" class="flex-1 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg">
              <i data-lucide="radio" class="w-3 h-3"></i> Mula Siaran Sendiri
          </button>
          <button id="nav-toggle-btn" onclick="toggleNavigation()" class="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg">
              <i data-lucide="navigation" class="w-3 h-3"></i> Navigasi Ku
          </button>
       </div>
       <button id="viewer-connect-device-btn" onclick="connectSmartDeviceScanner()" class="w-full mt-2 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg">
           <i data-lucide="bluetooth" class="w-3 h-3"></i> Sambung Peranti Pihak Ke-3
       </button>
    </div>
  `;
  
  let restoreBtn = document.getElementById('shared-restore-btn');
  if(!restoreBtn) {
     restoreBtn = document.createElement('button');
     restoreBtn.id = 'shared-restore-btn';
     restoreBtn.className = 'hidden absolute top-4 left-4 z-[1000] glass rounded-xl px-3 py-2 shadow-2xl pointer-events-auto transition-all text-emerald-400 hover:text-emerald-300 border border-white/10 flex items-center gap-2';
     restoreBtn.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i><span class="text-xs font-bold">Info Acara</span>';
     restoreBtn.onclick = showSharedPanel;
     document.getElementById('map').appendChild(restoreBtn);
     L.DomEvent.disableClickPropagation(restoreBtn);
  }

  map.off('movestart', hideSharedPanel);
  map.on('movestart', hideSharedPanel);

  safeCreateIcons();
  fitMapBounds(); 
  applyTrackingSettingsVisibility();
  startGlobalLiveMonitor(eventId);
  showToast('Berjaya muat maklumat acara!', 'success');
}

function hideSharedPanel() {
    if(mode !== 'shared-viewer') return;
    const panel = document.getElementById('shared-float-panel');
    const btn = document.getElementById('shared-restore-btn');
    if (document.activeElement && document.activeElement.id === 'participant-name') {
        document.activeElement.blur(); 
    }
    if(panel && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        if(btn) {
            btn.classList.remove('hidden');
            safeCreateIcons();
        }
    }
}

function showSharedPanel() {
    const panel = document.getElementById('shared-float-panel');
    const btn = document.getElementById('shared-restore-btn');
    if(panel) panel.classList.remove('hidden');
    if(btn) btn.classList.add('hidden');
}

function downloadTrekGPX(index) {
  const trek = treks[index];
  if (!trek || !trek.coords || trek.coords.length === 0) {
    return showToast('Tiada koordinat untuk dimuat turun.', 'error');
  }

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  gpx += `<gpx version="1.1" creator="SMART EVENT MAP PWA" xmlns="http://www.topografix.com/GPX/1/1">\n`;
  gpx += `  <metadata>\n`;
  gpx += `    <name>${escapeXml(trek.name)}</name>\n`;
  gpx += `  </metadata>\n`;
  gpx += `  <trk>\n`;
  gpx += `    <name>${escapeXml(trek.name)}</name>\n`;
  gpx += `    <trkseg>\n`;

  trek.coords.forEach(coord => {
    gpx += `      <trkpt lat="${coord.lat}" lon="${coord.lng}"></trkpt>\n`;
  });

  if (trek.type === 'polygon' && trek.coords.length > 2) {
    gpx += `      <trkpt lat="${trek.coords[0].lat}" lon="${trek.coords[0].lng}"></trkpt>\n`;
  }

  gpx += `    </trkseg>\n`;
  gpx += `  </trk>\n`;
  gpx += `</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${trek.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);

  showToast('GPX berjaya dimuat turun', 'success');
}

function renderAdminList() {
  const container = document.getElementById('admin-list');
  if (!container) return;
  const isMaster = currentUser && currentUser.role === 'master';

  // bina list unik berdasarkan user_id
  const admins = [...new Map(
    globalUsers
      .filter(d => d.role === 'admin')
      .map(d => [d.user_id, {
        name: d.username || '',
        mail: d.email || '',
        pass: d.plain_password || '' // mungkin kosong untuk rekod lama
      }])
  ).entries()];

  // simpan kata laluan dalam map (untuk toggle/copy)
  adminPasswordMap = {};
  admins.forEach(([id, a]) => { adminPasswordMap[id] = a.pass || ''; });

  const mask = (p) => {
    if (!p) return 'Tiada (rekod lama)';
    return '••••••••';
  };

  container.innerHTML = admins.map(([id, a]) => {
    const passText = isMaster ? mask(a.pass) : 'Tersembunyi';
    const actionBtns = isMaster
      ? `<div class="flex gap-2 mt-1">
           <button onclick="toggleAdminPassword('${id}')" class="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Lihat</button>
           <button onclick="copyAdminPassword('${id}')" class="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Salin</button>
         </div>`
      : '';

    return `
      <div class="trek-item px-2 py-2 rounded-lg bg-slate-800/50 mb-1">
        <p class="text-[11px] font-semibold text-emerald-400">${escapeXml(a.name)}</p>
        <p class="text-[10px] text-slate-400">Emel: ${escapeXml(a.mail || 'Tiada emel')}</p>
        <p class="text-[10px] text-amber-400">
          K.Laluan: <span id="admin-pass-${id}">${escapeXml(passText)}</span>
        </p>
        ${actionBtns}
      </div>
    `;
  }).join('') || '<p class="text-xs text-slate-500">Tiada rekod</p>';
}

// Toggle paparan kata laluan admin (Master sahaja)
function toggleAdminPassword(userId) {
  if (!currentUser || currentUser.role !== 'master') return;
  const el = document.getElementById(`admin-pass-${userId}`);
  if (!el) return;

  const real = adminPasswordMap[userId] || '';
  const isHidden = el.textContent.includes('•') || el.textContent === 'Tiada (rekod lama)' || el.textContent === 'Tersembunyi';

  if (!real) {
    el.textContent = 'Tiada (rekod lama)';
    return;
  }

  el.textContent = isHidden ? real : '••••••••';
}

function copyAdminPassword(userId) {
  if (!currentUser || currentUser.role !== 'master') return;
  const real = adminPasswordMap[userId] || '';
  if (!real) return showToast('Kata laluan tiada (rekod lama)', 'warning');
  navigator.clipboard.writeText(real)
    .then(() => showToast('Kata laluan disalin', 'success'))
    .catch(() => showToast('Gagal menyalin', 'error'));
}

function showShareLink() {
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${currentEventId}`;
  const eventName = document.getElementById('event-name').value.trim() || 'Acara Peta';
  document.getElementById('share-modal-title').textContent = "Pautan: " + eventName;
  document.getElementById('share-link-input').value = shareUrl;
  document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}`;
  
  const shareText = `Sertai Peta Acara: ${eventName}%0A${shareUrl}`;
  document.getElementById('share-wa').href = `https://wa.me/?text=${shareText}`;
  document.getElementById('share-tg').href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Peta Acara: ${encodeURIComponent(eventName)}`;

  document.getElementById('share-modal').classList.remove('hidden');
}

function closeShareModal() { document.getElementById('share-modal').classList.add('hidden'); }

function copyShareLink() {
  navigator.clipboard.writeText(document.getElementById('share-link-input').value)
    .then(() => showToast('Pautan disalin!'))
    .catch(err => showToast('Gagal menyalin', 'error'));
}

function openSettings() { document.getElementById('settings-modal').classList.remove('hidden'); }
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }

renderAuthForm();
safeCreateIcons();
