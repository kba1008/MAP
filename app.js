// Global Error Handler
window.addEventListener('error', function(event) {
  console.error('[Pengesan Ralat]', event.error || event.message);
  showToast('Maaf, berlaku sedikit gangguan: ' + (event.message || 'Sila cuba sekali lagi sebentar lagi.'), 'error');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => console.log('ServiceWorker didaftarkan'))
      .catch(error => console.error('ServiceWorker gagal:', error));
  });
}

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz33NAyxib5gU3YFTyLzCfzmDXRnjRiYS1d-BZFjlHuf0-RMI7ukNBeLpTMTE2soKJD/exec";

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

// ============================================================
// IKON NAVIGASI (50 Jenis) — untuk siaran GPS pengguna
// ============================================================
const NAV_ICONS = [
  {id:'panah-biru',     label:'Anak Panah Biru',        bg:'#3b82f6', fg:'#fff',    shape:'arrow'},
  {id:'panah-merah',    label:'Anak Panah Merah',       bg:'#ef4444', fg:'#fff',    shape:'arrow'},
  {id:'panah-hijau',    label:'Anak Panah Hijau',       bg:'#10b981', fg:'#fff',    shape:'arrow'},
  {id:'panah-kuning',   label:'Anak Panah Kuning',      bg:'#f59e0b', fg:'#1e293b', shape:'arrow'},
  {id:'panah-ungu',     label:'Anak Panah Ungu',        bg:'#8b5cf6', fg:'#fff',    shape:'arrow'},
  {id:'panah-oren',     label:'Anak Panah Oren',        bg:'#f97316', fg:'#fff',    shape:'arrow'},
  {id:'panah-pink',     label:'Anak Panah Pink',        bg:'#ec4899', fg:'#fff',    shape:'arrow'},
  {id:'panah-cyan',     label:'Anak Panah Cyan',        bg:'#06b6d4', fg:'#fff',    shape:'arrow'},
  {id:'panah-gelap',    label:'Anak Panah Gelap',       bg:'#334155', fg:'#e2e8f0', shape:'arrow'},
  {id:'panah-putih',    label:'Anak Panah Putih',       bg:'#f1f5f9', fg:'#1e293b', shape:'arrow'},
  {id:'kereta-biru',    label:'Kereta Biru',            bg:'#3b82f6', fg:'#fff',    shape:'car'},
  {id:'kereta-merah',   label:'Kereta Merah',           bg:'#ef4444', fg:'#fff',    shape:'car'},
  {id:'kereta-hijau',   label:'Kereta Hijau',           bg:'#10b981', fg:'#fff',    shape:'car'},
  {id:'kereta-kuning',  label:'Kereta Kuning',          bg:'#f59e0b', fg:'#1e293b', shape:'car'},
  {id:'kereta-ungu',    label:'Kereta Ungu',            bg:'#8b5cf6', fg:'#fff',    shape:'car'},
  {id:'moto-biru',      label:'Motosikal Biru',         bg:'#3b82f6', fg:'#fff',    shape:'motorcycle'},
  {id:'moto-merah',     label:'Motosikal Merah',        bg:'#ef4444', fg:'#fff',    shape:'motorcycle'},
  {id:'moto-hijau',     label:'Motosikal Hijau',        bg:'#10b981', fg:'#fff',    shape:'motorcycle'},
  {id:'moto-kuning',    label:'Motosikal Kuning',       bg:'#f59e0b', fg:'#1e293b', shape:'motorcycle'},
  {id:'moto-ungu',      label:'Motosikal Ungu',         bg:'#8b5cf6', fg:'#fff',    shape:'motorcycle'},
  {id:'basikal-biru',   label:'Basikal Biru',           bg:'#3b82f6', fg:'#fff',    shape:'bicycle'},
  {id:'basikal-merah',  label:'Basikal Merah',          bg:'#ef4444', fg:'#fff',    shape:'bicycle'},
  {id:'basikal-hijau',  label:'Basikal Hijau',          bg:'#10b981', fg:'#fff',    shape:'bicycle'},
  {id:'basikal-kuning', label:'Basikal Kuning',         bg:'#f59e0b', fg:'#1e293b', shape:'bicycle'},
  {id:'basikal-ungu',   label:'Basikal Ungu',           bg:'#8b5cf6', fg:'#fff',    shape:'bicycle'},
  {id:'bot-biru',       label:'Bot / Kayak Biru',       bg:'#3b82f6', fg:'#fff',    shape:'boat'},
  {id:'bot-merah',      label:'Bot / Kayak Merah',      bg:'#ef4444', fg:'#fff',    shape:'boat'},
  {id:'bot-hijau',      label:'Bot / Kayak Hijau',      bg:'#10b981', fg:'#fff',    shape:'boat'},
  {id:'bot-kuning',     label:'Bot / Kayak Kuning',     bg:'#f59e0b', fg:'#1e293b', shape:'boat'},
  {id:'bot-ungu',       label:'Bot / Kayak Ungu',       bg:'#8b5cf6', fg:'#fff',    shape:'boat'},
  {id:'kapal-biru',     label:'Kapal Terbang Biru',     bg:'#3b82f6', fg:'#fff',    shape:'airplane'},
  {id:'kapal-merah',    label:'Kapal Terbang Merah',    bg:'#ef4444', fg:'#fff',    shape:'airplane'},
  {id:'kapal-hijau',    label:'Kapal Terbang Hijau',    bg:'#10b981', fg:'#fff',    shape:'airplane'},
  {id:'kapal-kuning',   label:'Kapal Terbang Kuning',   bg:'#f59e0b', fg:'#1e293b', shape:'airplane'},
  {id:'kapal-ungu',     label:'Kapal Terbang Ungu',     bg:'#8b5cf6', fg:'#fff',    shape:'airplane'},
  {id:'lari-biru',      label:'Pelari Biru',            bg:'#3b82f6', fg:'#fff',    shape:'runner'},
  {id:'lari-merah',     label:'Pelari Merah',           bg:'#ef4444', fg:'#fff',    shape:'runner'},
  {id:'lari-hijau',     label:'Pelari Hijau',           bg:'#10b981', fg:'#fff',    shape:'runner'},
  {id:'lari-kuning',    label:'Pelari Kuning',          bg:'#f59e0b', fg:'#1e293b', shape:'runner'},
  {id:'lari-ungu',      label:'Pelari Ungu',            bg:'#8b5cf6', fg:'#fff',    shape:'runner'},
  {id:'jalan-biru',     label:'Pejalan Biru',           bg:'#3b82f6', fg:'#fff',    shape:'walker'},
  {id:'jalan-merah',    label:'Pejalan Merah',          bg:'#ef4444', fg:'#fff',    shape:'walker'},
  {id:'jalan-hijau',    label:'Pejalan Hijau',          bg:'#10b981', fg:'#fff',    shape:'walker'},
  {id:'mendaki',        label:'Pendaki / Hiker',        bg:'#78350f', fg:'#fff',    shape:'hiker'},
  {id:'berenang',       label:'Perenang',               bg:'#0ea5e9', fg:'#fff',    shape:'swimmer'},
  {id:'ambulans',       label:'Ambulans / Kecemasan',   bg:'#fff',    fg:'#ef4444', shape:'cross'},
  {id:'polis',          label:'Polis / Keselamatan',    bg:'#1e3a8a', fg:'#fbbf24', shape:'badge'},
  {id:'kompas',         label:'Kompas',                 bg:'#0f172a', fg:'#f59e0b', shape:'compass'},
  {id:'bintang-biru',   label:'Bintang Biru',           bg:'#3b82f6', fg:'#fff',    shape:'star'},
  {id:'bintang-merah',  label:'Bintang Merah',          bg:'#dc2626', fg:'#fbbf24', shape:'star'},
];

function getNavIconShape_(shape, fg) {
  const c = fg || '#fff';
  switch(shape) {
    case 'arrow':
      return `<path d="M12 2L5 20l7-3.5L19 20z" fill="${c}"/>`;
    case 'car':
      return `<g fill="${c}"><path d="M7.5 10.5l1.8-4.5h5.4l1.8 4.5H7.5z"/><rect x="5.5" y="10.5" width="13" height="6" rx="1.5"/><circle cx="8.5" cy="17.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/><rect x="9" y="12" width="6" height="2.5" rx="0.5"/></g>`;
    case 'motorcycle':
      return `<g fill="${c}"><circle cx="6.5" cy="16" r="3"/><circle cx="17.5" cy="16" r="3"/><path d="M9 13.5l2.5-7 3 3.5h4" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/><path d="M14 10l-1-3h3" fill="none" stroke="${c}" stroke-width="1.5"/></g>`;
    case 'bicycle':
      return `<g fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M10 16l4-9 2 5.5H10"/><path d="M14 7V4h3"/></g>`;
    case 'boat':
      return `<g fill="${c}"><path d="M4 18.5l8 2.5 8-2.5-3.5-7H7.5L4 18.5z"/><path d="M12 11.5V3"/><path d="M9 6.5l3-3.5 3 3.5"/></g>`;
    case 'airplane':
      return `<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${c}"/>`;
    case 'runner':
      return `<g fill="${c}"><circle cx="13" cy="4.5" r="2"/><path d="M9.5 19.5l2-6.5 2.5 2.5v5h2v-6l-3-3 1-3.5c1.2 1.3 2.9 2 4.5 2V8c-1.7 0-3.2-.9-4-2.2L13.5 4.5c-.4-.6-1-1-1.8-1-.2 0-.5.1-.7.1L6 6v5h2V7.5l1.5-.6-2 9.5 2.5.5-1 3h1z"/></g>`;
    case 'walker':
      return `<g fill="${c}"><circle cx="12" cy="4" r="2"/><path d="M10.5 21l1.2-6-1.2 1V19H8.5v-5l3-3 1.2 5.5L16 19h-2l-1-4-.5 1.5H11V21h-0.5z"/><path d="M9.5 12l1-3.5 3.5 3-2 2"/></g>`;
    case 'hiker':
      return `<g fill="${c}"><circle cx="13" cy="4" r="2"/><path d="M7 4h2v4H7z"/><path d="M10 19.5l1.5-6.5 2 2.5v5.5h2v-7l-2-2.5 1-3.5c1 1.2 2.5 2 4.2 2V8c-1.8 0-3.3-1-4.1-2.5l-1-1.5c-.4-.6-1-1-1.7-1-.2 0-.5.1-.7.1L6 5.5V9h2V7l1.5-.5L8 19.5h2z"/></g>`;
    case 'swimmer':
      return `<g fill="${c}"><circle cx="12" cy="4" r="2"/><path d="M12 6.5l4.5 3.5-4.5 3-4.5-3 4.5-3.5z"/><path d="M4 15.5c2 1.5 4 1.5 4 0s2-1.5 4 0 2 1.5 4 0 2-1.5 4 0" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M4 18.5c2 1.5 4 1.5 4 0s2-1.5 4 0 2 1.5 4 0 2-1.5 4 0" fill="none" stroke="${c}" stroke-width="1.5"/></g>`;
    case 'cross':
      return `<g fill="${c}"><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/></g>`;
    case 'badge':
      return `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5-1.1-2.5-2.5S10.6 7 12 7zm5 8H7v-.5c0-1.4 2.3-2 3.5-2h3c1.2 0 3.5.6 3.5 2V15z" fill="${c}"/>`;
    case 'compass':
      return `<g fill="${c}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M16.24 7.76L14.12 14.12 7.76 16.24l2.12-6.36 6.36-2.12z"/></g>`;
    case 'star':
      return `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="${c}"/>`;
    default:
      return `<path d="M12 2L5 20l7-3.5L19 20z" fill="${c}"/>`;
  }
}

function buildNavMarkerHtml_(iconId, headingDeg) {
  const ico = NAV_ICONS.find(i => i.id === iconId) || {bg:'#3b82f6', fg:'#fff', shape:'arrow'};
  const rot = (!isNaN(parseFloat(headingDeg))) ? parseFloat(headingDeg) : 0;
  const inner = getNavIconShape_(ico.shape, ico.fg);
  return `<div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">` +
    `<div style="position:absolute;width:44px;height:44px;border-radius:50%;background:${ico.bg};opacity:0.22;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>` +
    `<div style="transform:rotate(${rot}deg);width:36px;height:36px;border-radius:50%;background:${ico.bg};border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 2px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">` +
      `<svg viewBox="0 0 24 24" width="20" height="20">${inner}</svg>` +
    `</div></div>`;
}

function getOrCreateParticipantId_() {
  try {
    let id = localStorage.getItem('sem_nav_pid');
    if (!id) { id = 'P-' + Math.random().toString(36).substr(2,5).toUpperCase(); localStorage.setItem('sem_nav_pid', id); }
    return id;
  } catch(e) { return 'P-' + Math.random().toString(36).substr(2,5).toUpperCase(); }
}

function calcBearing_(lat1, lng1, lat2, lng2) {
  const r = Math.PI / 180;
  const dL = (lng2 - lng1) * r;
  const la1 = lat1 * r, la2 = lat2 * r;
  const y = Math.sin(dL) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dL);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function buildNavIconDropdownHtml_() {
  const pid = getOrCreateParticipantId_();
  const groups = [
    { label: '🏹 Anak Panah',         shapes: ['arrow'] },
    { label: '🚗 Kereta & Motosikal', shapes: ['car','motorcycle','bicycle'] },
    { label: '⛵ Bot & Kapal',        shapes: ['boat'] },
    { label: '✈️ Udara',              shapes: ['airplane','helicopter'] },
    { label: '🏃 Pejalan Kaki',       shapes: ['runner','walker','hiker','swimmer'] },
    { label: '🛡️ Ikon Khas',          shapes: ['cross','badge','compass','star','shield','diamond','triangle','circle-dot','hexagon','target'] },
  ];
  let optionsHtml = '<option value="">— Pilih ikon navigasi anda —</option>';
  groups.forEach(g => {
    const list = NAV_ICONS.filter(ico => g.shapes.includes(ico.shape));
    if (!list.length) {
      // fallback: show any icons not yet in other groups if no match
      return;
    }
    optionsHtml += `<optgroup label="${g.label}">`;
    list.forEach(ico => { optionsHtml += `<option value="${ico.id}">${ico.label}</option>`; });
    optionsHtml += '</optgroup>';
  });
  // Remaining icons not matched by groups
  const groupedShapes = ['arrow','car','motorcycle','bicycle','boat','airplane','helicopter','runner','walker','hiker','swimmer','cross','badge','compass','star','shield','diamond','triangle','circle-dot','hexagon','target'];
  const remaining = NAV_ICONS.filter(ico => !groupedShapes.includes(ico.shape));
  if (remaining.length) {
    optionsHtml += '<optgroup label="🔷 Lain-lain">';
    remaining.forEach(ico => { optionsHtml += `<option value="${ico.id}">${ico.label}</option>`; });
    optionsHtml += '</optgroup>';
  }

  return `<div style="margin-bottom:6px;">` +
    `<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">` +
      `<span style="font-size:10px;color:#94a3b8;font-weight:600;letter-spacing:.04em;">IKON NAVIGASI</span>` +
      `<span style="font-size:9px;color:#475569;background:#0f172a;border-radius:4px;padding:1px 6px;font-family:monospace;">ID: ${pid}</span>` +
    `</div>` +
    `<div style="display:flex;align-items:center;gap:7px;">` +
      `<div id="nav-icon-preview" style="width:36px;height:36px;border-radius:50%;background:#334155;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid #475569;"></div>` +
      `<select id="nav-icon-select" onchange="selectNavIcon_(this.value)" ` +
        `style="flex:1;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:7px 10px;font-size:11px;outline:none;cursor:pointer;appearance:auto;">` +
        optionsHtml +
      `</select>` +
    `</div>` +
    `<div id="nav-icon-selected-label" style="font-size:9px;color:#64748b;margin-top:4px;min-height:13px;text-align:center;">Pilih ikon sebelum mula siaran</div>` +
  `</div>`;
}

window.selectNavIcon_ = function(id) {
  window._selectedNavIconId = id;
  const ico = NAV_ICONS.find(i => i.id === id);
  const lbl = document.getElementById('nav-icon-selected-label');
  if (lbl) lbl.innerHTML = ico ? `<span style="color:#10b981;font-weight:600;">✓ ${ico.label} dipilih</span>` : 'Pilih ikon sebelum mula siaran';
  const preview = document.getElementById('nav-icon-preview');
  if (preview && ico) {
    const svgInner = getNavIconShape_(ico.shape, ico.fg);
    preview.style.background = ico.bg;
    preview.style.borderColor = ico.bg;
    preview.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20">${svgInner}</svg>`;
  }
  if (isLiveBroadcasting && viewerBroadcastMarker && id) {
    const h = window._lastNavHeading || 0;
    viewerBroadcastMarker.setIcon(L.divIcon({ html: buildNavMarkerHtml_(id, h), className: 'live-marker', iconSize:[44,44], iconAnchor:[22,22] }));
  }
};

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
  allowedOrigins: [],
  allowedPathPrefix: '/',
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
            <p style="margin:0 0 14px 0;opacity:0.9;font-size:13px;line-height:1.5;">
              Aplikasi ini hanya boleh diakses melalui pautan rasmi. Sila hubungi pentadbir sistem untuk mendapatkan pautan yang betul.
            </p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button onclick="(function(){try{var u=new URL(location.href);u.searchParams.set('domain_lock','off');location.href=u.toString();}catch(e){location.href=location.href + (location.search?'&':'?') + 'domain_lock=off';}})()"
                style="flex:1;min-width:180px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(16,185,129,0.2);color:#fff;cursor:pointer;font-weight:600;">
                Buka untuk sesi ini
              </button>
              <button onclick="(function(){try{localStorage.setItem('domain_lock','off');}catch(e){} try{var u=new URL(location.href);u.searchParams.set('domain_lock','off');location.href=u.toString();}catch(e){location.href=location.href + (location.search?'&':'?') + 'domain_lock=off';}})()"
                style="flex:1;min-width:180px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(59,130,246,0.2);color:#fff;cursor:pointer;font-weight:600;">
                Buka & ingat peranti
              </button>
            </div>
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
let currentLicense = null; // {valid, status, days_left, expiry, key}
let licenseReadOnly = false; // true bila admin expired/revoked
function requireWriteAccess(){
  if (currentUser && currentUser.role === 'master') return true;
  if (currentUser && currentUser.role === 'admin') {
    if (licenseReadOnly || !currentLicense || !currentLicense.valid) {
      showToast('Lesen anda telah tamat tempoh. Aplikasi kini dalam mod baca sahaja — sila masukkan lesen baharu apabila bersedia.', 'error');
      try { openLicenseModal(); } catch(e){}
      return false;
    }
  }
  return true;
}

// ============================================================
// Notifikasi Hubungi Master Admin via WhatsApp
// ============================================================
function showContactMasterAdminWhatsApp(reason) {
  var existing = document.getElementById('master-wa-notif');
  if (existing) existing.remove();
  var uname = (currentUser && currentUser.username) ? currentUser.username : '-';
  var reasonText = reason || 'Lesen bermasalah / telah tamat tempoh';
  var waMsg = encodeURIComponent(
    'Assalamualaikum Naim, lesen saya ' + reasonText +
    '. Nama pengguna: ' + uname +
    '. Mohon bantuan untuk lesen baharu. Terima kasih.'
  );
  var waLink = 'https://wa.me/601110661077?text=' + waMsg;
  var div = document.createElement('div');
  div.id = 'master-wa-notif';
  div.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,0.88);backdrop-filter:blur(12px);';
  div.innerHTML =
    '<div style="width:100%;max-width:420px;background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(239,68,68,0.4);border-radius:20px;padding:24px;box-shadow:0 0 50px rgba(239,68,68,0.15),0 20px 40px rgba(0,0,0,0.5);">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
        '<div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '</div>' +
        '<div>' +
          '<p style="margin:0 0 2px 0;font-size:11px;color:#fca5a5;font-weight:600;text-transform:uppercase;">Lesen Bermasalah</p>' +
          '<h2 style="margin:0;font-size:17px;font-weight:800;color:#fff;">Hubungi Master Admin</h2>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:12px;margin-bottom:16px;">' +
        '<p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.6;">' + reasonText + ' Sila hubungi Master Admin untuk mendapatkan lesen baharu atau menyelesaikan isu ini.</p>' +
      '</div>' +
      '<div style="background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.3);border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">' +
        '<div style="font-size:22px;">\u{1F464}</div>' +
        '<div>' +
          '<p style="margin:0 0 2px 0;font-size:11px;color:#93c5fd;font-weight:600;">Master Admin</p>' +
          '<p style="margin:0;font-size:15px;font-weight:800;color:#fff;">Naim</p>' +
          '<p style="margin:0;font-size:12px;color:#93c5fd;font-family:monospace;">\u{1F4F1} 011-1066 1077</p>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;">' +
        '<a href="' + waLink + '" target="_blank" rel="noopener" style="flex:2;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:13px;font-weight:700;text-decoration:none;">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
          ' WhatsApp Naim' +
        '</a>' +
        '<button onclick="document.getElementById(\'master-wa-notif\').remove()" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#cbd5e1;font-size:13px;font-weight:600;cursor:pointer;">Tutup</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(div);
}

async function fetchMyLicense(){
  if (!currentUser || currentUser.role !== 'admin') { currentLicense=null; licenseReadOnly=false; return; }
  try {
    const res = await fetch(GAS_WEB_APP_URL, { method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ type:'check_license', user_id: currentUser.user_id, origin: location.origin, path: location.pathname })
    });
    const j = await res.json();
    currentLicense = (j && j.license) ? j.license : null;
    licenseReadOnly = !currentLicense || !currentLicense.valid;
    updateLicenseBadge();
    if (licenseReadOnly) {
      var reason2 = !currentLicense
        ? 'Anda tidak mempunyai lesen aktif.'
        : (currentLicense.status === 'expired'
            ? 'Lesen anda telah tamat tempoh pada ' + new Date(currentLicense.expiry).toLocaleDateString('ms-MY') + '.'
            : 'Lesen anda telah dibatalkan (revoked).');
      showContactMasterAdminWhatsApp(reason2);
    }
  } catch(e){ console.warn('license check failed', e); }
}
function updateLicenseBadge(){
  const el = document.getElementById('license-badge');
  if (!el) return;
  if (!currentUser || currentUser.role !== 'admin') { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  if (!currentLicense) { el.textContent = '⚠ Tiada lesen'; el.className='px-2 py-1 rounded text-[10px] bg-red-600 text-white cursor-pointer'; return; }
  if (!currentLicense.valid) { el.textContent = '⛔ Lesen tamat'; el.className='px-2 py-1 rounded text-[10px] bg-red-600 text-white cursor-pointer'; return; }
  const d = currentLicense.days_left;
  const cls = d <= 2 ? 'bg-amber-500' : (currentLicense.status==='trial'?'bg-cyan-600':'bg-emerald-600');
  el.textContent = (currentLicense.status==='trial'?'TRIAL ':'LESEN ') + d + ' hari';
  el.className = 'px-2 py-1 rounded text-[10px] text-white cursor-pointer ' + cls;
}
async function applyLicenseKeyFromInput(){
  const inp = document.getElementById('license-key-input');
  const btn = document.getElementById('apply-lic-btn');
  if (!inp) return;
  const key = inp.value.trim().toUpperCase();
  if (!key) return showToast('Mohon masukkan kunci lesen terlebih dahulu', 'error');
  btnLoad(btn, 'Mengesahkan...');
  try {
    const res = await fetch(GAS_WEB_APP_URL, { method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ type:'apply_license_key', key:key, user_id:currentUser.user_id, username:currentUser.username, email:currentUser.email, origin:location.origin, path:location.pathname })
    });
    const j = await res.json();
    if (j.status === 'ok') { showToast('Lesen aktif!', 'success'); currentLicense = j.license; licenseReadOnly = !currentLicense.valid; updateLicenseBadge(); closeLicenseModal(); }
    else {
      btnDone(btn);
      showToast(j.message || 'Maaf, permintaan tidak berjaya', 'error');
      if (j.message && (j.message.includes('diikat pada akaun lain') || j.message.includes('telah tamat tempoh') || j.message.includes('dibatalkan'))) {
        showContactMasterAdminWhatsApp(j.message);
      }
    }
  } catch(e){ btnDone(btn); showToast('Sambungan rangkaian kurang stabil. Sila cuba lagi sebentar lagi.', 'error'); }
}
function openLicenseModal(){ const m=document.getElementById('license-modal'); if(m) m.classList.remove('hidden'); renderLicenseModal(); }
function closeLicenseModal(){ const m=document.getElementById('license-modal'); if(m) m.classList.add('hidden'); }
function renderLicenseModal(){
  const body = document.getElementById('license-modal-body');
  if (!body) return;
  let html = '';
  if (currentLicense) {
    const expDate = new Date(currentLicense.expiry).toLocaleString('ms-MY');
    html += `<div class="mb-3 p-3 rounded bg-slate-800">
      <p class="text-xs text-slate-400">Status</p>
      <p class="text-sm font-bold ${currentLicense.valid?'text-emerald-400':'text-red-400'}">${currentLicense.status.toUpperCase()} — ${currentLicense.days_left} hari berbaki</p>
      <p class="text-[10px] text-slate-500 mt-1">Tamat: ${expDate}</p>
      <p class="text-[10px] text-slate-500">Key: <span class="font-mono">${currentLicense.key}</span></p>
    </div>`;
    if (!currentLicense.valid) {
      const waMsg3 = encodeURIComponent('Assalamualaikum Naim, lesen saya telah tamat tempoh. Nama pengguna: ' + (currentUser ? currentUser.username : '-') + '. Mohon bantuan lesen baharu. Terima kasih.');
      html += '<a href="https://wa.me/601110661077?text=' + waMsg3 + '" target="_blank" rel="noopener" class="mt-2 mb-3 w-full py-2.5 bg-green-600 hover:bg-green-500 rounded text-white text-sm font-semibold flex items-center justify-center gap-2" style="display:flex;text-decoration:none;">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
        ' WhatsApp Naim — 011-1066 1077</a>';
    }
  } else {
    const waMsg4 = encodeURIComponent('Assalamualaikum Naim, saya tidak mempunyai lesen aktif. Nama pengguna: ' + (currentUser ? currentUser.username : '-') + '. Mohon bantuan. Terima kasih.');
    html += '<p class="text-xs text-red-400 mb-2">Anda belum ada lesen aktif.</p>' +
      '<a href="https://wa.me/601110661077?text=' + waMsg4 + '" target="_blank" rel="noopener" class="mb-3 w-full py-2 bg-green-600 hover:bg-green-500 rounded text-white text-sm font-semibold flex items-center justify-center gap-2" style="display:flex;text-decoration:none;">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
      ' Hubungi Naim — 011-1066 1077</a>';
  }
  html += `<label class="text-xs text-slate-300">Masukkan License Key dari Master Admin:</label>
    <input id="license-key-input" placeholder="LIC-XXXX-XXXX-XXXX" class="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm font-mono" />
    <button id="apply-lic-btn" onclick="applyLicenseKeyFromInput()" class="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-sm font-semibold">Aktifkan</button>`;
  body.innerHTML = html;
}

// ---- MASTER LICENSE PANEL ----
let _masterPanelLicenses = [];
function openMasterLicensePanel(){ const m=document.getElementById('master-license-modal'); if(m){ m.classList.remove('hidden'); loadMasterLicenses(); } }
function closeMasterLicensePanel(){ const m=document.getElementById('master-license-modal'); if(m) m.classList.add('hidden'); }
async function loadMasterLicenses(){
  const btn = document.getElementById('load-lic-btn');
  const pwd = document.getElementById('master-pwd-cache')?.value || sessionStorage.getItem('master_pwd_cache') || '';
  if (!pwd) { document.getElementById('master-license-list').innerHTML = '<p class="text-xs text-amber-400">Masukkan kata laluan master di bawah & klik "Muat Senarai".</p>'; return; }
  btnLoad(btn, 'Memuat...');
  try {
    const res = await fetch(GAS_WEB_APP_URL, { method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ type:'master_license', action:'list', master_username: currentUser.username, master_password: pwd, origin:location.origin, path:location.pathname })
    });
    const j = await res.json();
    if (j.status !== 'ok') { btnDone(btn); showToast(j.message||'Pengesahan tidak berjaya', 'error'); return; }
    sessionStorage.setItem('master_pwd_cache', pwd);
    _masterPanelLicenses = j.licenses || [];
    renderMasterLicenseList();
  } catch(e){ showToast('Sambungan rangkaian kurang stabil. Sila cuba lagi sebentar lagi.', 'error'); }
  finally { btnDone(btn); }
}
function renderMasterLicenseList(){
  const el = document.getElementById('master-license-list');
  if (!el) return;
  if (!_masterPanelLicenses.length) { el.innerHTML = '<p class="text-xs text-slate-500">Tiada lesen.</p>'; return; }
  el.innerHTML = _masterPanelLicenses.map(l => {
    const badge = l.status==='active' ? 'bg-emerald-600' : (l.status==='trial'?'bg-cyan-600':(l.status==='expired'?'bg-red-600':'bg-slate-600'));
    return `<div class="p-2 mb-2 rounded bg-slate-800 text-[11px]">
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-emerald-400">${l.username||'(belum ikat)'}</p>
          <p class="text-slate-400">${l.email||''}</p>
          <p class="font-mono text-amber-300">${l.key}</p>
          <p class="text-slate-500">Tamat: ${new Date(l.expiry).toLocaleDateString('ms-MY')} (${l.days_left} hari)</p>
        </div>
        <span class="${badge} text-white px-2 py-0.5 rounded text-[9px]">${l.status.toUpperCase()}</span>
      </div>
      <div class="flex gap-1 mt-1">
        <button onclick="masterExtendLic('${l.key}')" class="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">+ Hari</button>
        <button onclick="masterRevokeLic('${l.key}')" class="text-[10px] px-2 py-1 bg-red-700 hover:bg-red-600 rounded">Batal</button>
        <button onclick="navigator.clipboard.writeText('${l.key}').then(()=>showToast('Disalin','success'))" class="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">Salin</button>
      </div>
    </div>`;
  }).join('');
}
function showLicenseSuccessModal(lic) {
  const existing = document.getElementById('lic-success-modal');
  if (existing) existing.remove();

  const expDate = lic.expiry ? new Date(lic.expiry).toLocaleDateString('ms-MY', {day:'2-digit', month:'long', year:'numeric'}) : '-';
  const statusLabel = lic.status === 'trial' ? 'PERCUBAAN' : 'AKTIF';
  const statusColor = lic.status === 'trial' ? '#06b6d4' : '#10b981';

  const modal = document.createElement('div');
  modal.id = 'lic-success-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,0.85);backdrop-filter:blur(16px);';
  modal.innerHTML = `
    <div style="width:100%;max-width:420px;background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid rgba(16,185,129,0.3);border-radius:24px;padding:28px 24px;box-shadow:0 0 60px rgba(16,185,129,0.15),0 25px 50px rgba(0,0,0,0.5);position:relative;overflow:hidden;">
      <!-- Glow effect -->
      <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:radial-gradient(circle,rgba(16,185,129,0.2),transparent 70%);pointer-events:none;"></div>
      <div style="position:absolute;bottom:-40px;left:-40px;width:120px;height:120px;background:radial-gradient(circle,rgba(6,182,212,0.15),transparent 70%);pointer-events:none;"></div>

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
        <div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(16,185,129,0.4);flex-shrink:0;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
          <p style="font-size:11px;color:#6ee7b7;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 2px 0;">Lesen Berjaya Dijana</p>
          <h2 style="margin:0;font-size:18px;font-weight:800;color:#fff;">Maklumat Lesen</h2>
        </div>
        <span style="margin-left:auto;padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1px;color:#fff;background:${statusColor};box-shadow:0 0 10px ${statusColor}60;">${statusLabel}</span>
      </div>

      <!-- License Key Box -->
      <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(16,185,129,0.4);border-radius:14px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 6px 0;font-size:10px;color:#6ee7b7;font-weight:600;letter-spacing:1px;text-transform:uppercase;">🔑 Kunci Lesen</p>
        <div style="display:flex;align-items:center;gap:10px;">
          <p id="lic-key-display" style="margin:0;font-family:monospace;font-size:17px;font-weight:700;color:#f0fdf4;letter-spacing:2px;flex:1;word-break:break-all;">${lic.key}</p>
          <button onclick="navigator.clipboard.writeText('${lic.key}').then(()=>{showToast('🔑 Kunci disalin!','success');document.getElementById('lic-copy-btn').innerHTML='✓ Disalin';})" id="lic-copy-btn"
            style="flex-shrink:0;padding:8px 14px;border-radius:10px;border:1px solid rgba(16,185,129,0.5);background:rgba(16,185,129,0.15);color:#6ee7b7;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;white-space:nowrap;">
            Salin
          </button>
        </div>
      </div>

      <!-- Details Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">📧 E-mel</p>
          <p style="margin:0;font-size:12px;color:#e2e8f0;font-weight:600;word-break:break-all;">${lic.email || '—'}</p>
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
          <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">⏳ Tempoh</p>
          <p style="margin:0;font-size:12px;color:#e2e8f0;font-weight:600;">${lic.days_left} Hari</p>
        </div>
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;grid-column:span 2;">
          <p style="margin:0 0 4px 0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">📅 Tarikh Tamat</p>
          <p style="margin:0;font-size:13px;color:#e2e8f0;font-weight:700;">${expDate}</p>
        </div>
      </div>

      <!-- Notice -->
      <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:10px 12px;margin-bottom:18px;display:flex;gap:8px;align-items:flex-start;">
        <span style="font-size:14px;margin-top:1px;">⚠️</span>
        <p style="margin:0;font-size:11px;color:#fcd34d;line-height:1.5;">Sila salin dan hantar kunci lesen ini kepada pentadbir berkenaan untuk diaktifkan.</p>
      </div>

      <!-- Buttons -->
      <div style="display:flex;gap:10px;">
        <button onclick="navigator.clipboard.writeText('${lic.key}').then(()=>showToast('🔑 Kunci disalin!','success'))"
          style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(16,185,129,0.4);background:rgba(16,185,129,0.15);color:#6ee7b7;font-size:13px;font-weight:700;cursor:pointer;">
          📋 Salin Kunci
        </button>
        <button onclick="document.getElementById('lic-success-modal').remove()"
          style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#10b981,#06b6d4);color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.3);">
          ✓ Selesai
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target === modal) modal.remove(); });
}

async function masterGenerateLic(){
  const btn = document.getElementById('gen-lic-btn');
  const days = parseInt(document.getElementById('gen-days').value)||30;
  const email = document.getElementById('gen-email').value.trim();
  const note = document.getElementById('gen-note').value.trim();
  const pwd = sessionStorage.getItem('master_pwd_cache') || document.getElementById('master-pwd-cache').value;
  if (!pwd) return showToast('Mohon masukkan kata laluan master terlebih dahulu', 'error');
  btnLoad(btn, 'Menjana...');
  try {
    const res = await fetch(GAS_WEB_APP_URL, { method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ type:'master_license', action:'generate', master_username: currentUser.username, master_password: pwd, days:days, email:email, username:'', user_id:'', note:note, origin:location.origin, path:location.pathname })
    });
    const j = await res.json();
    if (j.status === 'ok') {
      btnDone(btn);
      showLicenseSuccessModal(j.license);
      loadMasterLicenses();
    } else { btnDone(btn); showToast(j.message||'Maaf, permintaan tidak berjaya', 'error'); }
  } catch(e){ btnDone(btn); showToast('Maaf, berlaku gangguan. Sila cuba lagi.', 'error'); }
}
async function masterExtendLic(key){
  const d = parseInt(await customDialog({type:'prompt', title:'Lanjut Tempoh Lesen', msg:`Tambah berapa hari untuk lesen:<br><b style="font-family:monospace;color:#f0abfc;">${key}</b>`, defaultVal:'30'}));
  if(!d || isNaN(d)) return;
  const pwd = sessionStorage.getItem('master_pwd_cache') || document.getElementById('master-pwd-cache')?.value || '';
  if (pwd) sessionStorage.setItem('master_pwd_cache', pwd);
  const res = await fetch(GAS_WEB_APP_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ type:'master_license', action:'extend', master_username:currentUser.username, master_password:pwd, key:key, days:d, origin:location.origin, path:location.pathname })});
  const j = await res.json();
  if (j.status==='ok') { showToast('Lesen dilanjutkan '+d+' hari','success'); loadMasterLicenses(); } else showToast(j.message||'Maaf, permintaan tidak berjaya','error');
}
async function masterRevokeLic(key){
  const ok = await customDialog({type:'confirm', title:'Batalkan Lesen', msg:`Adakah anda pasti untuk membatalkan lesen berikut?<br><br><span style="font-family:monospace;color:#f87171;font-weight:700;">${key}</span><br><br><span style="color:#fca5a5;font-size:12px;">Tindakan ini tidak boleh dibatalkan.</span>`});
  if (!ok) return;
  const pwd = sessionStorage.getItem('master_pwd_cache') || document.getElementById('master-pwd-cache')?.value || '';
  if (pwd) sessionStorage.setItem('master_pwd_cache', pwd);
  const res = await fetch(GAS_WEB_APP_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({ type:'master_license', action:'revoke', master_username:currentUser.username, master_password:pwd, key:key, origin:location.origin, path:location.pathname })});
  const j = await res.json();
  if (j.status==='ok') { showToast('Lesen berjaya dibatalkan','success'); loadMasterLicenses(); } else showToast(j.message||'Maaf, permintaan tidak berjaya','error');
}

let map = null;
let layerControl = null;
let currentBaseLayer = "Google Maps";
let _pendingTrekInfo = null;
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
let viewerBroadcastMarker = null;
let lastLiveBroadcastTime = 0;
let liveParticipantMarkers = {};
let globalLiveMonitorInterval = null;

// ============================================================
// CHECKPOINT ORDER (AUTO + MANUAL OVERRIDE)
// ============================================================
// Ambang bacaan "menyentuh garisan". Jika terlalu kecil, checkpoint nampak atas garisan tapi sistem tak anggap dekat.
// Anda boleh ubah nilai ini jika perlu.
const CP_TREK_SNAP_THRESHOLD_M = 80; // meter
let checkpointOrderOverrides = {}; // { [trekName]: [cpKey1, cpKey2, ...] }
let _adminOrderSelectedTrekName = '';
let _sharedSelectedTrekIndex = 0;
let _sharedStepsPanelOpen = false;



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
  "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap' })
};

const overlays = {};



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

function toMeters_(km) { return (Number(km) || 0) * 1000; }

function cpKey_(cp) {
  const lat = (cp && cp.lat !== undefined) ? Number(cp.lat) : NaN;
  const lng = (cp && cp.lng !== undefined) ? Number(cp.lng) : NaN;
  const name = (cp && cp.name) ? String(cp.name) : '';
  if (isNaN(lat) || isNaN(lng)) return name || 'cp_unknown';
  return `cp::${name}__${lat.toFixed(6)}_${lng.toFixed(6)}`;
}

function textKey_(txt) {
  const lat = (txt && txt.lat !== undefined) ? Number(txt.lat) : NaN;
  const lng = (txt && txt.lng !== undefined) ? Number(txt.lng) : NaN;
  const text = (txt && txt.text) ? String(txt.text) : '';
  if (isNaN(lat) || isNaN(lng)) return `txt::${text || 'text_unknown'}`;
  return `txt::${text}__${lat.toFixed(6)}_${lng.toFixed(6)}`;
}

function latLngToXY_(lat, lng, lat0, lng0) {
  // Equirectangular projection (cukup tepat untuk jarak event)
  const R = 6371000;
  const rad = Math.PI / 180;
  const x = (lng - lng0) * rad * R * Math.cos(lat0 * rad);
  const y = (lat - lat0) * rad * R;
  return { x, y };
}

function projectPointToSegment_(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const vv = vx * vx + vy * vy;
  let t = 0;
  if (vv > 0) t = (wx * vx + wy * vy) / vv;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * vx;
  const cy = ay + t * vy;
  const dx = px - cx;
  const dy = py - cy;
  return { t, cx, cy, dist: Math.sqrt(dx * dx + dy * dy) };
}

function computeTrekProjection_(trek, cp) {
  // Pulangkan jarak ke garisan (meter) + jarak sepanjang trek (km & meter)
  if (!trek || trek.type === 'polygon') return null;
  if (!trek.coords || trek.coords.length < 2) return null;

  const lat0 = Number(trek.coords[0].lat);
  const lng0 = Number(trek.coords[0].lng);
  if (isNaN(lat0) || isNaN(lng0)) return null;

  const p = latLngToXY_(Number(cp.lat), Number(cp.lng), lat0, lng0);

  let best = { distToLineM: Infinity, alongM: 0, alongKm: 0 };
  let cumM = 0;
  let cumKm = 0;

  for (let i = 0; i < trek.coords.length - 1; i++) {
    const a = trek.coords[i];
    const b = trek.coords[i + 1];
    const axy = latLngToXY_(Number(a.lat), Number(a.lng), lat0, lng0);
    const bxy = latLngToXY_(Number(b.lat), Number(b.lng), lat0, lng0);
    const segLen = Math.hypot(bxy.x - axy.x, bxy.y - axy.y);
    if (segLen <= 0.001) continue;

    const segKm = getDistance(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng));

    const proj = projectPointToSegment_(p.x, p.y, axy.x, axy.y, bxy.x, bxy.y);
    const distToLine = proj.dist;
    const along = cumM + proj.t * segLen;
    const alongKm = cumKm + proj.t * (Number(segKm) || 0);
    if (distToLine < best.distToLineM) {
      best = { distToLineM: distToLine, alongM: along, alongKm: alongKm };
    }
    cumM += segLen;
    cumKm += (Number(segKm) || 0);
  }

  if (!isFinite(best.distToLineM)) return null;
  return best;
}

function computeTrekTotalGeoKm_(trek) {
  if (!trek || trek.type === 'polygon') return 0;
  if (!trek.coords || trek.coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < trek.coords.length - 1; i++) {
    const a = trek.coords[i];
    const b = trek.coords[i + 1];
    total += getDistance(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng));
  }
  return Number(total) || 0;
}

function formatDist_(meters) {
  const m = Number(meters) || 0;
  if (m < 1000) return `${Math.round(m)}m`;
  const km = m / 1000;
  if (km < 10) return `${km.toFixed(2)}km`;
  return `${km.toFixed(1)}km`;
}

function getScaledAlongMeters_(trekName, item) {
  const trek = treks.find(t => String(t.name) === String(trekName));
  if (!trek) return null;

  // cuba guna nilai yang sudah dikira
  let alongKm = (item && item.alongKm !== undefined && item.alongKm !== null) ? Number(item.alongKm) : null;
  if (alongKm === null || isNaN(alongKm)) {
    // kira semula berdasarkan lat/lng (checkpoint atau text)
    const obj = item?.cp || item?.txt;
    if (obj && obj.lat !== undefined && obj.lng !== undefined) {
      const proj = computeTrekProjection_(trek, obj);
      if (proj) alongKm = Number(proj.alongKm);
    }
  }
  if (alongKm === null || isNaN(alongKm)) return null;

  const totalGeoKm = computeTrekTotalGeoKm_(trek);
  const manualKm = Number(trek.distance) || 0;
  const factor = (manualKm > 0 && totalGeoKm > 0) ? (manualKm / totalGeoKm) : 1;
  return alongKm * factor * 1000;
}

function getAutoOrderedCheckpointsForTrek_(trekName) {
  const trek = treks.find(t => String(t.name) === String(trekName));
  if (!trek) return [];

  const items = [];
  checkpoints.forEach(cp => {
    if (!cp || cp.lat === undefined || cp.lng === undefined) return;
    const proj = computeTrekProjection_(trek, cp);
    if (!proj) return;
    if (proj.distToLineM <= CP_TREK_SNAP_THRESHOLD_M) {
      items.push({
        key: cpKey_(cp),
        cp,
        alongM: (Number(proj.alongKm) || 0) * 1000,
        alongKm: Number(proj.alongKm) || 0,
        distToLineM: proj.distToLineM
      });
    }
  });

  items.sort((a, b) => a.alongM - b.alongM);
  return items;
}

function getOrderedCheckpointsForTrek_(trekName) {
  const auto = getAutoOrderedCheckpointsForTrek_(trekName);
  const autoMap = {};
  auto.forEach(it => { autoMap[it.key] = it; });

  const override = Array.isArray(checkpointOrderOverrides[trekName]) ? checkpointOrderOverrides[trekName] : null;
  if (!override || override.length === 0) return auto;

  const used = new Set();
  const out = [];
  // 1) Masukkan item override (boleh termasuk CP atau TEKS)
  override.forEach(k => {
    const key = String(k || '');
    if (!key) return;
    const it = autoMap[key] || itemFromKey_(key);
    if (it) { out.push(it); used.add(key); }
  });
  // 2) Tambah baki auto checkpoint yang belum digunakan
  auto.forEach(it => { if (!used.has(it.key)) out.push(it); });
  return out.filter(Boolean);
}

function itemFromKey_(key) {
  const k = String(key || '');
  if (!k) return null;
  if (k.startsWith('cp::')) {
    const cp = checkpoints.find(c => cpKey_(c) === k);
    if (!cp) return null;
    return { key: k, cp, kind: 'checkpoint', alongM: null, alongKm: null, distToLineM: null };
  }
  if (k.startsWith('txt::')) {
    const txt = mapTexts.find(t => textKey_(t) === k);
    if (!txt) return null;
    return { key: k, txt, kind: 'text', alongM: null, alongKm: null, distToLineM: null };
  }
  return null;
}

function loadCheckpointOrderOverridesFromEventData_(eventData) {
  checkpointOrderOverrides = {};
  try {
    const row = eventData.find(d => d.type === 'event_metadata' && d.checkpoint_name === 'cp_order');
    if (!row || !row.icon) return;
    const parsed = JSON.parse(row.icon);
    if (parsed && typeof parsed === 'object') checkpointOrderOverrides = parsed;
  } catch (e) {
    checkpointOrderOverrides = {};
  }
}

function getTrekNames_() {
  return (treks || []).map(t => String(t.name || '').trim()).filter(Boolean);
}

function markOrderChanged_() {
  markUnsavedChanges();
  showToast('Turutan checkpoint dikemaskini. Sila klik "Simpan".', 'info');
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
             fetchMyLicense();
         } catch(e) {
             console.error("Session parse error", e);
             localStorage.removeItem('trek_mapper_session');
         }
     }
     syncFromGAS();
  }
});

async function syncFromGAS() {
  const syncBtn = document.getElementById('sync-btn');
  btnLoad(syncBtn, 'Menyegerak...');
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
    showToast(error.message || 'Data tidak dapat disegerak buat masa ini. Sila semak sambungan internet dan cuba lagi.', 'error');
  } finally {
    if(overlay) overlay.classList.add('hidden');
    btnDone(syncBtn);
  }
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-cyan-500', warning: 'bg-amber-500' };
  const div = document.createElement('div');
  const persistent = (type === 'error' || type === 'warning');
  div.className = `toast ${persistent ? '' : 'toast-auto'} px-4 py-2.5 ${colors[type] || colors.info} rounded-lg text-sm font-medium shadow-lg pointer-events-auto text-white flex items-start gap-2`;

  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : (type === 'warning' ? 'alert-triangle' : 'info'));
  div.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 mt-0.5 flex-shrink-0"></i>`
    + `<span class="flex-1">${msg}</span>`
    + (persistent
        ? `<button type="button" aria-label="Tutup" class="toast-close ml-2 -mr-1 p-1 rounded hover:bg-white/20 flex-shrink-0"><i data-lucide="x" class="w-4 h-4"></i></button>`
        : '');

  const dismiss = () => {
    if (div._dismissed) return;
    div._dismissed = true;
    div.classList.add('toast-out');
    setTimeout(() => div.remove(), 250);
  };

  container.appendChild(div);
  safeCreateIcons({ root: div });

  if (persistent) {
    const btn = div.querySelector('.toast-close');
    if (btn) btn.addEventListener('click', dismiss);
  } else {
    setTimeout(dismiss, 4000);
  }
}

// ─── Loading State Helpers ───────────────────────────────────────────────────
function btnLoad(elOrId, text) {
  text = text || 'Sila tunggu...';
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el || el.dataset.loading) return;
  el.dataset.loading = '1';
  el.dataset.origHtml = el.innerHTML;
  el.disabled = true;
  el.style.opacity = '0.7';
  el.style.cursor = 'not-allowed';
  el.style.pointerEvents = 'none';
  el.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;justify-content:center;">'
    + '<svg style="width:14px;height:14px;animation:_btnSpin 0.75s linear infinite;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round"/></svg>'
    + text + '</span>';
}
function btnDone(elOrId) {
  const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!el || !el.dataset.loading) return;
  el.innerHTML = el.dataset.origHtml || '';
  el.disabled = false;
  el.style.opacity = '';
  el.style.cursor = '';
  el.style.pointerEvents = '';
  delete el.dataset.loading;
  delete el.dataset.origHtml;
  safeCreateIcons();
}
// ─────────────────────────────────────────────────────────────────────────────


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
      <button id="auth-submit-btn" onclick="handleLogin()" class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-colors rounded-xl font-semibold text-white shadow-lg">
        <i data-lucide="log-in" class="w-5 h-5 inline mr-2"></i> Log Masuk
      </button>`;
    toggleBtn.textContent = 'Belum ada akaun? Daftar sekarang';
  } else {
    container.innerHTML = `
      <input id="register-username" type="text" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Nama pengguna">
      <input id="register-email" type="email" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Email">
      <input id="register-password" type="password" class="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 transition-colors" placeholder="Kata laluan">
      <button id="auth-submit-btn" onclick="handleRegister()" class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl font-semibold text-white shadow-lg">
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
  if (!username || !password) return showToast('Mohon lengkapkan maklumat log masuk terlebih dahulu', 'error');
  const btn = document.getElementById('auth-submit-btn');
  btnLoad(btn, 'Log Masuk...');
  try {
    if (globalUsers.length === 0) await syncFromGAS();
    const hash = simpleHash(password);
    let user = globalUsers.find(d => d.username === username && d.password_hash === hash);
    if (!user) {
      await syncFromGAS();
      user = globalUsers.find(d => d.username === username && d.password_hash === hash);
    }
    if (!user) { btnDone(btn); return showToast('Maaf, kami tidak dapat mengesahkan akaun anda. Sila semak nama pengguna dan kata laluan.', 'error'); }
    currentUser = { user_id: user.user_id, username: user.username, email: user.email, role: user.role };
    localStorage.setItem('trek_mapper_session', JSON.stringify(currentUser));
    showToast('Berjaya Log Masuk!', 'success');
    await fetchMyLicense();
    startApp(user.role);
    if (currentUser.role === 'admin' && (!currentLicense || !currentLicense.valid)) {
      setTimeout(()=>openLicenseModal(), 400);
    }
  } catch(e) { btnDone(btn); showToast('Maaf, log masuk tidak berjaya. Sila cuba sekali lagi.', 'error'); }
}

async function handleRegister() {
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  if (!username || !email || !password) return showToast('Mohon lengkapkan semua medan terlebih dahulu', 'error');
  if (globalUsers.find(d => d.username === username)) return showToast('Nama pengguna ini sudah digunakan. Sila pilih yang lain.', 'error');
  const btn = document.getElementById('auth-submit-btn');
  btnLoad(btn, 'Mendaftar...');
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
    btnDone(btn);
    showToast('Pendaftaran tidak berjaya. Sila semak maklumat anda dan cuba lagi.', 'error');
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
  // Kemas kini butang tab terapung
  const tab = document.getElementById('sidebar-float-tab');
  if (tab) {
    if (sidebarOpen) {
      tab.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      tab.title = 'Sembunyi Panel';
      tab.style.background = 'rgba(15,23,42,0.92)';
      tab.style.color = '#94a3b8';
      tab.style.borderColor = 'rgba(255,255,255,0.15)';
      tab.style.boxShadow = '2px 0 12px rgba(0,0,0,0.4)';
      tab.style.animation = 'none';
    } else {
      tab.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      tab.title = 'Buka Panel Kawalan';
      tab.style.background = 'rgba(16,185,129,0.25)';
      tab.style.color = '#6ee7b7';
      tab.style.borderColor = 'rgba(16,185,129,0.5)';
      tab.style.boxShadow = '2px 0 16px rgba(16,185,129,0.4)';
      tab.style.animation = 'sidebarTabPulse 2s infinite';
    }
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
  
  map.on('baselayerchange', function(e) {
     currentBaseLayer = e.name;
     markUnsavedChanges();
  });

  // Butang khas untuk kembali fokus pada kawasan/lokasi acara (fit bounds berdasarkan data event)
  const EventFocusControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
      const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>';
      btn.style.backgroundColor = 'white';
      btn.style.width = '34px';
      btn.style.height = '34px';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.cursor = 'pointer';
      btn.style.color = '#1e293b';
      btn.title = 'Kembali ke Tapak Event';
      btn.onclick = function(e){
        e.stopPropagation();
        centerToEventSite();
      };
      return btn;
    }
  });
  map.addControl(new EventFocusControl());

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
      btn.title = 'Lokasi Saya (GPS)';
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
    if ((mode === 'admin' || mode === 'master') && sidebarOpen && !addingCheckpoint && !addingText) {
      toggleSidebar();
    }

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
  if (!navigator.geolocation) return showToast('Maaf, peranti anda tidak menyokong GPS.', 'error');
  showToast('Mencari lokasi...', 'info');
  navigator.geolocation.getCurrentPosition(
    pos => { if (map) map.setView([pos.coords.latitude, pos.coords.longitude], 16); },
    err => showToast('Ralat lokasi: ' + err.message, 'error'), 
    { enableHighAccuracy: true }
  );
}

function centerToEventSite() {
  if (!map) return;

  const allCoords = [];

  try {
    treks.forEach(t => {
      if (t && t.coords && Array.isArray(t.coords)) {
        t.coords.forEach(c => {
          if (c && c.lat !== undefined && c.lng !== undefined) {
            allCoords.push([parseFloat(c.lat), parseFloat(c.lng)]);
          }
        });
      }
    });

    checkpoints.forEach(c => {
      if (c && c.lat !== undefined && c.lng !== undefined) {
        allCoords.push([parseFloat(c.lat), parseFloat(c.lng)]);
      }
    });

    mapTexts.forEach(t => {
      if (t && t.lat !== undefined && t.lng !== undefined) {
        allCoords.push([parseFloat(t.lat), parseFloat(t.lng)]);
      }
    });
  } catch (e) {
    console.error('Ralat kumpul koordinat event:', e);
  }

  if (allCoords.length === 0) {
    return showToast('Tiada data koordinat acara untuk difokuskan.', 'warning');
  }

  try {
    const bounds = L.latLngBounds(allCoords);
    if (!bounds.isValid()) return showToast('Koordinat acara tidak sah.', 'warning');
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
    showToast('Kembali ke tapak acara', 'info');
  } catch (e) {
    console.error('Ralat centerToEventSite:', e);
    showToast('Tidak dapat fokus ke tapak acara.', 'error');
  }
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
      "OpenTopoMap": mapLayers["OpenTopoMap"]
    }, {}).addTo(map);
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

     // Suntik butang tab terapung jika belum ada
     if (!document.getElementById('sidebar-float-tab')) {
       const tab = document.createElement('button');
       tab.id = 'sidebar-float-tab';
       tab.onclick = toggleSidebar;
       tab.title = 'Buka Panel Kawalan';
       tab.style.cssText = [
         'position:absolute',
         'left:0',
         'top:50%',
         'transform:translateY(-50%)',
         'z-index:3000',
         'background:rgba(15,23,42,0.92)',
         'border:1px solid rgba(255,255,255,0.15)',
         'border-left:none',
         'border-radius:0 10px 10px 0',
         'padding:10px 7px',
         'color:#94a3b8',
         'cursor:pointer',
         'display:flex',
         'align-items:center',
         'justify-content:center',
         'transition:background 0.2s,color 0.2s',
         'box-shadow:2px 0 12px rgba(0,0,0,0.4)',
         'backdrop-filter:blur(8px)'
       ].join(';');
       tab.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
       tab.addEventListener('mouseenter', () => { tab.style.background='rgba(16,185,129,0.25)'; tab.style.color='#6ee7b7'; });
       tab.addEventListener('mouseleave', () => { tab.style.background='rgba(15,23,42,0.92)'; tab.style.color='#94a3b8'; });
       const mapContainer = document.querySelector('#main-screen .flex-1.flex.overflow-hidden.relative');
       if (mapContainer) mapContainer.appendChild(tab);
       updateSidebarDisplay();
     }

     // Auto-sembunyi panel bila mod lakar diaktifkan (butang Geoman di peta)
     map.off('pm:drawstart');
     map.on('pm:drawstart', () => {
       if (sidebarOpen) toggleSidebar();
     });

     map.off('pm:create');
     map.on('pm:create', async (e) => {
        const layer = e.layer;
        const shapeType = e.shape;
        const latlngs = layer.getLatLngs();
        const coords = (Array.isArray(latlngs[0]) ? latlngs.flat() : latlngs).map(ll => ({lat: ll.lat, lng: ll.lng}));

        map.removeLayer(layer);

        // Gunakan nilai dari borang jika datang dari addTrek(), atau tanya pengguna
        let name, color, dashArray;
        if (_pendingTrekInfo) {
           name = _pendingTrekInfo.name;
           color = _pendingTrekInfo.color;
           dashArray = _pendingTrekInfo.dashArray;
           _pendingTrekInfo = null;
        } else {
           const namePrompt = shapeType === 'Polygon' ? 'Nama Kawasan:' : 'Nama Laluan:';
           const defaultVal = shapeType === 'Polygon' ? `Kawasan ${treks.length + 1}` : `Laluan ${treks.length + 1}`;
           name = await customDialog({type: 'prompt', title: 'Lakar Baru', msg: namePrompt, defaultVal: defaultVal});
           color = document.getElementById('trek-color').value || '#10b981';
           dashArray = '';
        }

        if (name) {
           const weight = 4;
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
        } else {
           _pendingTrekInfo = null;
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
  if (!name) return showToast('Mohon masukkan nama terlebih dahulu', 'error');
  if (!map || !map.pm) return showToast('Mod lakar tidak tersedia. Sila semak sambungan internet/cache.', 'error');

  const dashArray = style === 'dashed' ? '10, 10' : '';
  _pendingTrekInfo = { name, type, color, dashArray };

  if (type === 'polygon') {
    map.pm.enableDraw('Polygon', { pathOptions: { color, dashArray, weight: 4, fill: true, fillOpacity: 0.3 } });
    showToast('Klik peta untuk letak titik poligon. Klik titik pertama untuk selesai.', 'info');
  } else {
    map.pm.enableDraw('Line', { pathOptions: { color, dashArray, weight: 4 } });
    showToast('Klik peta untuk lakar garisan. Klik dua kali untuk selesai.', 'info');
  }

  document.getElementById('trek-name').value = '';
  // Auto-sembunyi panel supaya peta nampak lebih luas untuk melukis
  if (sidebarOpen) toggleSidebar();
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
  if (!t.polyline || !t.polyline.pm) return showToast('Maaf, mod edit tidak dapat dibuka buat masa ini.', 'error');
  
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

  // Render panel turutan (di bawah sidebar) untuk admin/master
  try { renderCpOrderSidebar_(); } catch(e){}
}

function poolItemDragStart(ev) {
  const key = ev.currentTarget?.dataset?.poolKey;
  if (!key) return;
  ev.dataTransfer.effectAllowed = 'copy';
  ev.dataTransfer.setData('text/plain', JSON.stringify({ source: 'pool', key }));
}

function adminSelectCpOrderTrek(trekName) {
  _adminOrderSelectedTrekName = String(trekName || '');
  renderCpOrderSidebar_();
  // Jika masih ada modal lama (untuk backward), refresh juga jika dibuka
  try { if (!document.getElementById('cp-order-modal')?.classList?.contains('hidden')) renderCpOrderModal_(); } catch(e){}
}

function adminResetCpOrderToAuto() {
  const trekName = _adminOrderSelectedTrekName;
  if (!trekName) return;
  const auto = getAutoOrderedCheckpointsForTrek_(trekName);
  checkpointOrderOverrides[trekName] = auto.map(it => it.key);
  renderCpOrderSidebar_();
  try { if (!document.getElementById('cp-order-modal')?.classList?.contains('hidden')) renderCpOrderModal_(); } catch(e){}
  markOrderChanged_();
}

function renderAdminCpOrderList_(containerId = 'cp-order-list-modal') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const trekName = _adminOrderSelectedTrekName;
  if (!trekName) {
    container.innerHTML = `<p class="text-[10px] text-slate-500">Tiada trek dipilih.</p>`;
    return;
  }

  const ordered = getOrderedCheckpointsForTrek_(trekName);
  if (ordered.length === 0) {
    container.innerHTML = `<p class="text-[10px] text-slate-500">Tiada checkpoint yang menyentuh garisan untuk trek ini.</p>`;
    return;
  }

  container.innerHTML = ordered.map((it, idx) => {
    const label = (idx === 0) ? 'MULA' : (idx === ordered.length - 1 ? 'TAMAT' : `STEP ${idx + 1}`);
    const badgeClass = (idx === 0)
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : (idx === ordered.length - 1 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-700/40 text-slate-300 border-white/10');

    const isText = (it.kind === 'text') || !!it.txt;
    const title = isText ? (it.txt?.text || '') : (it.cp?.name || '');
    const meters = getScaledAlongMeters_(trekName, it);
    const distLabel = meters !== null ? formatDist_(meters) : '';
    return `
      <div class="trek-item flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/40 border border-white/5"
           draggable="true"
           data-key="${escapeXml(it.key)}"
           ondragstart="adminCpDragStart(event)"
           ondragover="adminCpDragOver(event)"
           ondrop="adminCpDrop(event)"
           title="Drag untuk susun semula">
        <span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeClass} font-bold">${escapeXml(String(label))}</span>
        ${distLabel ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/40 border border-white/10 text-slate-300 font-mono">${escapeXml(distLabel)}</span>` : ''}
        ${isText
          ? `<i data-lucide="type" class="w-4 h-4 text-pink-400"></i>`
          : `<i data-lucide="map-pin" class="w-4 h-4 text-emerald-400"></i>`
        }
        <span class="text-xs flex-1 text-slate-200 truncate">${escapeXml(title)}</span>
        <button onclick="adminFocusItemByKey('${escapeXml(it.key)}')" class="p-1 hover:bg-slate-700 rounded text-cyan-300 transition-colors" title="Fokus Peta">
          <i data-lucide="crosshair" class="w-3 h-3"></i>
        </button>
        <i data-lucide="grip-vertical" class="w-4 h-4 text-slate-500"></i>
      </div>
    `;
  }).join('');

  safeCreateIcons();
}

function renderAdminCpPoolList_(containerId = 'cp-order-pool-list-modal') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const poolCp = checkpoints.map(cp => ({ kind: 'checkpoint', key: cpKey_(cp), name: cp.name || '' }));
  const poolTxt = mapTexts.map(t => ({ kind: 'text', key: textKey_(t), name: t.text || '' }));
  const poolItems = poolCp.concat(poolTxt);

  container.innerHTML = poolItems.length === 0
    ? `<p class="text-[10px] text-slate-500">Tiada checkpoint/teks untuk dipilih.</p>`
    : poolItems.map(it => `
        <div class="trek-item flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-900/30 border border-white/5"
             draggable="true"
             data-pool-key="${escapeXml(it.key)}"
             data-pool-kind="${escapeXml(it.kind)}"
             ondragstart="poolItemDragStart(event)"
             title="Drag masuk ke turutan">
          ${it.kind === 'text'
            ? `<i data-lucide="type" class="w-4 h-4 text-pink-400"></i>`
            : `<i data-lucide="map-pin" class="w-4 h-4 text-emerald-400"></i>`
          }
          <span class="text-xs flex-1 text-slate-200 truncate">${escapeXml(it.name)}</span>
          <i data-lucide="plus" class="w-4 h-4 text-slate-500"></i>
        </div>
      `).join('');

  safeCreateIcons();
}

function openCpOrderModal() {
  if (!['admin', 'master'].includes(mode)) return;
  const modal = document.getElementById('cp-order-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderCpOrderModal_();
  safeCreateIcons();
}

function closeCpOrderModal() {
  const modal = document.getElementById('cp-order-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function renderCpOrderModal_() {
  const trekNames = getTrekNames_();
  const select = document.getElementById('cp-order-trek-select-modal');
  const orderList = document.getElementById('cp-order-list-modal');
  const poolList = document.getElementById('cp-order-pool-list-modal');

  if (!select || !orderList || !poolList) return;

  if (trekNames.length === 0) {
    select.innerHTML = '';
    orderList.innerHTML = `<p class="text-[11px] text-slate-400">Sila lukis sekurang-kurangnya 1 trek dahulu.</p>`;
    poolList.innerHTML = `<p class="text-[11px] text-slate-400">Tiada checkpoint/teks untuk dipilih.</p>`;
    return;
  }

  if (!_adminOrderSelectedTrekName || !trekNames.includes(_adminOrderSelectedTrekName)) {
    _adminOrderSelectedTrekName = trekNames[0];
  }

  select.innerHTML = trekNames.map(n => `<option value="${escapeXml(n)}" ${n === _adminOrderSelectedTrekName ? 'selected' : ''}>${escapeXml(n)}</option>`).join('');
  renderAdminCpPoolList_('cp-order-pool-list-modal');
  renderAdminCpOrderList_('cp-order-list-modal');
}

function renderCpOrderSidebar_() {
  const wrap = document.getElementById('cp-order-sidebar');
  const select = document.getElementById('cp-order-trek-select-sidebar');
  const orderList = document.getElementById('cp-order-list-sidebar');
  const poolList = document.getElementById('cp-order-pool-list-sidebar');
  if (!wrap || !select || !orderList || !poolList) return;

  // Hanya untuk admin/master
  if (!['admin', 'master'].includes(mode)) {
    wrap.classList.add('hidden');
    return;
  }

  const trekNames = getTrekNames_();
  wrap.classList.remove('hidden');

  if (trekNames.length === 0) {
    select.innerHTML = '';
    orderList.innerHTML = `<p class="text-[11px] text-slate-400">Sila lukis sekurang-kurangnya 1 trek dahulu.</p>`;
    poolList.innerHTML = `<p class="text-[11px] text-slate-400">Tiada checkpoint/teks untuk dipilih.</p>`;
    return;
  }

  if (!_adminOrderSelectedTrekName || !trekNames.includes(_adminOrderSelectedTrekName)) {
    _adminOrderSelectedTrekName = trekNames[0];
  }

  select.innerHTML = trekNames
    .map(n => `<option value="${escapeXml(n)}" ${n === _adminOrderSelectedTrekName ? 'selected' : ''}>${escapeXml(n)}</option>`)
    .join('');

  renderAdminCpPoolList_('cp-order-pool-list-sidebar');
  renderAdminCpOrderList_('cp-order-list-sidebar');
}

function adminFocusItemByKey(key) {
  if (!map) return;
  const k = String(key || '');
  if (k.startsWith('cp::')) {
    const cp = checkpoints.find(c => cpKey_(c) === k);
    if (!cp) return;
    map.setView([Number(cp.lat), Number(cp.lng)], Math.max(map.getZoom() || 16, 18));
    if (cp.marker && cp.marker.openPopup) cp.marker.openPopup();
    return;
  }
  if (k.startsWith('txt::')) {
    const txt = mapTexts.find(t => textKey_(t) === k);
    if (!txt) return;
    map.setView([Number(txt.lat), Number(txt.lng)], Math.max(map.getZoom() || 16, 18));
    return;
  }
}

function adminCpDragStart(ev) {
  const key = ev.currentTarget?.dataset?.key;
  if (!key) return;
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData('text/plain', JSON.stringify({ source: 'order', key }));
}
function adminCpDragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'move';
}
function adminCpDrop(ev) {
  ev.preventDefault();
  const raw = ev.dataTransfer.getData('text/plain');
  let payload = null;
  try { payload = JSON.parse(raw); } catch(e) { payload = { source: 'order', key: raw }; }
  const srcKey = String(payload?.key || '');
  const targetEl = ev.currentTarget;
  const targetKey = targetEl?.dataset?.key;
  if (!srcKey || !targetKey || srcKey === targetKey) return;

  const container = document.getElementById('cp-order-list');
  const srcEl = container
    ? Array.from(container.children).find(el => el?.dataset?.key === srcKey)
    : null;
  if (!container) return;

  if (payload && payload.source === 'pool') {
    // Tambah item baru (copy) dari senarai pool
    const exists = Array.from(container.children).some(el => el?.dataset?.key === srcKey);
    if (!exists) {
      const newEl = document.createElement('div');
      newEl.className = 'trek-item flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800/40 border border-white/5';
      newEl.setAttribute('draggable', 'true');
      newEl.dataset.key = srcKey;
      newEl.ondragstart = adminCpDragStart;
      newEl.ondragover = adminCpDragOver;
      newEl.ondrop = adminCpDrop;
      // Isi akan dirender semula oleh renderAdminCpOrderList_()
      container.insertBefore(newEl, targetEl);
    }
  } else {
    // Susun semula (move) dalam turutan
    if (!srcEl) return;
    container.insertBefore(srcEl, targetEl);
  }

  const trekName = _adminOrderSelectedTrekName;
  checkpointOrderOverrides[trekName] = Array.from(container.children)
    .map(el => el.dataset.key)
    .filter(Boolean);

  // Render semula supaya label MULA/TAMAT dikemaskini
  renderAdminCpOrderList_();
  markOrderChanged_();
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
            // Refresh turutan (jika panel turutan sedang dibuka)
            try {
              renderCpOrderSidebar_();
              if (document.getElementById('cp-order-modal') && !document.getElementById('cp-order-modal').classList.contains('hidden')) renderCpOrderModal_();
              if (mode === 'shared-viewer' && _sharedStepsPanelOpen) renderSharedStepsPanel_();
            } catch(e2){}
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
  if (currentTrekIndex < 0) return showToast('Mohon cipta dan pilih laluan terlebih dahulu.', 'error');
  if (treks[currentTrekIndex].type !== 'line') return showToast('Mod rakaman GPS hanya tersedia untuk bentuk Laluan (Garisan).', 'error');
  if (!navigator.geolocation) return showToast('GPS tidak tersedia pada peranti ini.', 'error');
  
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
}

function addTextMode() {
  addingText = true;
  addingCheckpoint = false;
  showToast('Sentuh/Klik pada peta untuk meletakkan teks', 'info');
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
        // Refresh turutan auto jika panel turutan sedang dibuka
        try {
          renderCpOrderSidebar_();
          if (document.getElementById('cp-order-modal') && !document.getElementById('cp-order-modal').classList.contains('hidden')) renderCpOrderModal_();
          if (mode === 'shared-viewer' && _sharedStepsPanelOpen) renderSharedStepsPanel_();
        } catch(e2){}
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
  if (!navigator.geolocation) return showToast('Sistem Maaf, peranti anda tidak menyokong GPS. pada peranti anda', 'error');
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
     html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🐥</div>`,
     className: '',
     iconSize: [32, 32],
     iconAnchor: [16, 16]
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
    if (!eventId) return showToast('Sila pilih atau muat acara dahulu', 'error');

    const participantName = getOrCreateParticipantId_();
    const btn = document.getElementById('btn-broadcast-live');

    if (isLiveBroadcasting) {
        isLiveBroadcasting = false;
        window._lastNavLat = undefined;
        window._lastNavLng = undefined;
        if (liveBroadcastWatchId !== null) {
            navigator.geolocation.clearWatch(liveBroadcastWatchId);
            liveBroadcastWatchId = null;
        }
        // Padam marker ikon sendiri dari peta
        if (viewerBroadcastMarker) { map.removeLayer(viewerBroadcastMarker); viewerBroadcastMarker = null; }
        if (btn) {
            btn.classList.replace('bg-red-500', 'bg-rose-500');
            btn.classList.replace('hover:bg-red-600', 'hover:bg-rose-600');
            btn.innerHTML = '<i data-lucide="radio" class="w-4 h-4"></i> Mula Siaran GPS';
        }
        safeCreateIcons();
        showToast('Siaran lokasi GPS dihentikan.');
    } else {
        if (!navigator.geolocation) return showToast('Maaf, peranti anda tidak menyokong GPS.', 'error');
        isLiveBroadcasting = true;
        showToast('Memulakan siaran GPS... menunggu lokasi...', 'info');

        if (btn) {
            btn.classList.replace('bg-rose-500', 'bg-red-500');
            btn.classList.replace('hover:bg-rose-600', 'hover:bg-red-600');
            btn.innerHTML = '<i data-lucide="radio" class="w-4 h-4 animate-pulse"></i> Henti Siaran GPS';
        }
        safeCreateIcons();

        if (!isNavigating && connectedDevices.length === 0) startNavigation();

        liveBroadcastWatchId = navigator.geolocation.watchPosition(pos => {
            const now = Date.now();
            const speedMps = pos.coords.speed || 0;
            const speedKmh = (speedMps * 3.6).toFixed(1);
            const curLat = pos.coords.latitude;
            const curLng = pos.coords.longitude;

            // Kira arah pergerakan (heading)
            let heading = pos.coords.heading;
            if (heading === null || isNaN(heading) || heading < 0) {
                if (window._lastNavLat !== undefined && window._lastNavLng !== undefined) {
                    const dist = Math.hypot(curLat - window._lastNavLat, curLng - window._lastNavLng);
                    heading = dist > 0.00001
                        ? calcBearing_(window._lastNavLat, window._lastNavLng, curLat, curLng)
                        : (window._lastNavHeading || 0);
                } else {
                    heading = 0;
                }
            }
            window._lastNavLat = curLat;
            window._lastNavLng = curLng;
            window._lastNavHeading = heading;

            const chickenIcon = L.divIcon({
                html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">🐥</div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            // ── Tunjuk ikon 🐥 sendiri terus di peta (tanpa tunggu server) ──
            if (!viewerBroadcastMarker) {
                viewerBroadcastMarker = L.marker([curLat, curLng], {
                    icon: chickenIcon,
                    zIndexOffset: 3000
                }).addTo(map);
                viewerBroadcastMarker.bindTooltip(participantName, {
                    permanent: true, direction: 'bottom', offset: [0, 18],
                    className: 'bg-slate-800 text-white border-0 rounded px-1.5 py-0.5 text-[9px] shadow-sm'
                });
                map.setView([curLat, curLng], map.getZoom());
                showToast('📍 Lokasi GPS dikesan — ikon muncul di peta!', 'success');
            } else {
                viewerBroadcastMarker.setLatLng([curLat, curLng]);
            }

            // ── Hantar ke server setiap 8 saat ──
            if (now - lastLiveBroadcastTime > 8000) {
                const payload = {
                    type: 'live_update',
                    event_id: eventId,
                    participant_name: participantName,
                    lat: curLat, lng: curLng,
                    hr: '', spo2: '', speed: speedKmh,
                    icon: '🐥'
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
        }, err => {
            showToast('Ralat GPS: ' + (err.message || 'Lokasi tidak dapat dikesan'), 'error');
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
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

         const iconEmoji = p.icon || '🐥';

         if (now - ts > 300000) return;

         let popupHtml = `<div class="text-center min-w-[120px]">
              <p class="font-bold text-slate-800 text-sm mb-1 border-b pb-1">${escapeXml(participantId)}</p>
              <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-left text-[10px] text-slate-600 mt-1">
                  <div>❤️ HR: <span class="font-bold text-red-500">${p.hr || '--'}</span></div>
                  <div>⚡ SpO2: <span class="font-bold text-blue-500">${p.spo2 || '--'}%</span></div>
                  <div class="col-span-2">🏃 Laju: <span class="font-bold text-emerald-600">${p.speed || '0.0'} km/j</span></div>
              </div>
         </div>`;

         const emojiMarkerHtml = `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));">${iconEmoji}</div>`;
         const emojiIcon = L.divIcon({ html: emojiMarkerHtml, className: '', iconSize:[32,32], iconAnchor:[16,16] });

         if (liveParticipantMarkers[participantId]) {
             liveParticipantMarkers[participantId].marker.setLatLng([lat, lng]);
             liveParticipantMarkers[participantId].marker.setPopupContent(popupHtml);
             liveParticipantMarkers[participantId].lastSeen = ts;
         } else {
             const marker = L.marker([lat, lng], {icon: emojiIcon, zIndexOffset: 2000}).addTo(map);
             marker.bindPopup(popupHtml, {className: 'custom-modern-popup'});
             marker.bindTooltip(participantId, { permanent: true, direction: 'bottom', offset: [0, 18], className: 'bg-rose-600 text-white border-0 rounded px-1.5 py-0.5 text-[9px] shadow-sm' });
             liveParticipantMarkers[participantId] = { marker, lastSeen: ts };
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
  if (!requireWriteAccess()) return;
  const saveBtn = document.getElementById('save-btn');
  const eventName = document.getElementById('event-name').value.trim();
  if (!eventName) return showToast('Sila tulis nama acara', 'error');
  if (treks.length === 0 && checkpoints.length === 0 && mapTexts.length === 0) {
    return showToast('Tiada maklumat untuk disimpan', 'error');
  }

  // --- Semak nama event pendua dalam pangkalan data ---
  const normNewName = eventName.toLowerCase().trim();
  const duplicateName = allData.find(d =>
    d.event_name &&
    d.event_name.toLowerCase().trim() === normNewName &&
    d.event_id !== currentEventId
  );
  if (duplicateName) {
    return showToast('Nama acara "' + eventName + '" sudah wujud dalam pangkalan data. Sila gunakan nama lain.', 'error');
  }

  // --- Semak Custom Link ID pendua dalam pangkalan data ---
  const rawSlug = document.getElementById('event-slug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (rawSlug && rawSlug !== currentEventId) {
    const duplicateSlug = allData.find(d => d.event_id === rawSlug);
    if (duplicateSlug) {
      return showToast('Custom Link ID "' + rawSlug + '" sudah digunakan oleh acara lain. Sila pilih ID yang berbeza.', 'error');
    }
  }

  btnLoad(saveBtn, 'Menyimpan...');

  treks.forEach((t, idx) => {
     if (t.isEditingShape) toggleEditTrekShape(idx);
  });

  let slugInput = rawSlug;
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

  // Metadata: override turutan checkpoint (untuk paparan step-by-step)
  payloads.push({
      type: 'event_metadata',
      event_id: eventId,
      event_name: eventName,
      trek_name: '',
      trek_color: '',
      coordinates: '',
      checkpoint_name: 'cp_order',
      lat: '',
      lng: '',
      created_by: eventOwner,
      distance: '',
      icon: JSON.stringify(checkpointOrderOverrides || {}),
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

  const saved = await saveToGAS(masterPayload);
  btnDone(saveBtn);
  if (saved) {
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
    if (!requireWriteAccess()) return;
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

  loadCheckpointOrderOverridesFromEventData_(eventData);
  
  const metadata = eventData.find(d => d.type === 'event_metadata' && d.checkpoint_name === 'map_layer');
  let baseLayerName = metadata ? metadata.icon : "Google Maps";
  if (baseLayerName === "USGS Imagery" || baseLayerName === "OpenStreetMap" || baseLayerName === "OSM Standard (Denai & Jalan)") {
     baseLayerName = "Google Maps";
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
         // Refresh turutan auto jika panel turutan sedang dibuka
         try {
           if (document.getElementById('cp-order-list')) renderAdminCpOrderList_();
           if (mode === 'shared-viewer' && _sharedStepsPanelOpen) renderSharedStepsPanel_();
         } catch(e2){}
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

  loadCheckpointOrderOverridesFromEventData_(eventData);
  
  const metadata = eventData.find(d => d.type === 'event_metadata' && d.checkpoint_name === 'map_layer');
  let baseLayerName = metadata ? metadata.icon : "Google Maps";
  if (baseLayerName === "USGS Imagery" || baseLayerName === "OpenStreetMap" || baseLayerName === "OSM Standard (Denai & Jalan)") {
     baseLayerName = "Google Maps";
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
         <button onclick="toggleSharedStepsPanel()" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-emerald-300 transition-colors flex-shrink-0 border border-slate-600 shadow-md" title="Senarai Step Trek">
            <i data-lucide="list-ordered" class="w-4 h-4"></i>
         </button>
         <button onclick="goHome()" class="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors flex-shrink-0 border border-slate-600 shadow-md" title="Keluar">
            <i data-lucide="home" class="w-4 h-4"></i>
         </button>
      </div>
    </div>
    <div class="mt-3 pt-3 border-t border-white/10" id="shared-panel-nav">
       <div class="flex gap-2">
          <button id="btn-broadcast-live" onclick="toggleParticipantBroadcast()" class="flex-1 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg">
              <i data-lucide="radio" class="w-3 h-3"></i> Mula Siaran GPS
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

  // Butang kekal untuk buka/tutup senarai step-by-step (walaupun panel info tersembunyi)
  let stepsToggleBtn = document.getElementById('shared-steps-toggle-btn');
  if(!stepsToggleBtn) {
     stepsToggleBtn = document.createElement('button');
     stepsToggleBtn.id = 'shared-steps-toggle-btn';
     stepsToggleBtn.className = 'absolute bottom-24 right-4 z-[1100] glass rounded-xl p-3 shadow-2xl pointer-events-auto transition-all text-emerald-300 hover:text-emerald-200 border border-white/10';
     stepsToggleBtn.innerHTML = '<i data-lucide="list-ordered" class="w-5 h-5"></i>';
     stepsToggleBtn.title = 'Senarai Step Trek';
     stepsToggleBtn.onclick = toggleSharedStepsPanel;
     document.getElementById('map').appendChild(stepsToggleBtn);
     L.DomEvent.disableClickPropagation(stepsToggleBtn);
  }

  map.off('movestart', hideSharedPanel);
  map.on('movestart', hideSharedPanel);

  safeCreateIcons();
  fitMapBounds(); 
  applyTrackingSettingsVisibility();
  startGlobalLiveMonitor(eventId);
  showToast('Berjaya muat maklumat acara!', 'success');
}

function toggleSharedStepsPanel() {
  if (mode !== 'shared-viewer') return;
  _sharedStepsPanelOpen = !_sharedStepsPanelOpen;
  ensureSharedStepsPanel_();
  renderSharedStepsPanel_();
}

function ensureSharedStepsPanel_() {
  let panel = document.getElementById('shared-steps-panel');
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'shared-steps-panel';
  panel.className = 'hidden absolute bottom-4 left-4 right-4 md:left-auto md:right-4 z-[1100] glass rounded-xl p-3 md:p-4 shadow-2xl pointer-events-auto border border-white/10 max-w-md md:w-96 max-h-[55vh] overflow-y-auto sidebar-scroll';
  document.getElementById('map').appendChild(panel);
  L.DomEvent.disableClickPropagation(panel);
  L.DomEvent.disableScrollPropagation(panel);
  return panel;
}

function sharedSelectTrekByIndex(idx) {
  _sharedSelectedTrekIndex = Math.max(0, Math.min(Number(idx) || 0, treks.length - 1));
  renderSharedStepsPanel_();
}

function sharedFocusCpByKey(key) {
  const cp = checkpoints.find(c => cpKey_(c) === String(key));
  if (!cp || !map) return;
  map.setView([Number(cp.lat), Number(cp.lng)], Math.max(map.getZoom() || 16, 18));
  if (cp.marker && cp.marker.openPopup) cp.marker.openPopup();
}

function renderSharedStepsPanel_() {
  const panel = ensureSharedStepsPanel_();
  if (!panel) return;

  if (!_sharedStepsPanelOpen) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const trekNames = getTrekNames_();
  if (trekNames.length === 0) {
    panel.innerHTML = `<p class="text-xs text-slate-300">Tiada trek untuk dipaparkan.</p>`;
    return;
  }
  if (_sharedSelectedTrekIndex >= trekNames.length) _sharedSelectedTrekIndex = 0;
  const trekName = trekNames[_sharedSelectedTrekIndex];
  const ordered = getOrderedCheckpointsForTrek_(trekName);

  const options = trekNames.map((n, i) => `<option value="${i}" ${i === _sharedSelectedTrekIndex ? 'selected' : ''}>${escapeXml(n)}</option>`).join('');

  const listHtml = (ordered.length === 0)
    ? `<p class="text-[11px] text-slate-400 mt-3">Tiada checkpoint yang menyentuh garisan untuk trek ini.</p>`
    : `<div class="mt-3 space-y-1">
        ${ordered.map((it, idx) => {
          const step = (idx === 0) ? 'Mula' : (idx === ordered.length - 1 ? 'Tamat' : `CP ${idx + 1}`);
          const meters = getScaledAlongMeters_(trekName, it);
          const distLabel = meters !== null ? formatDist_(meters) : '';
          const title = it?.cp?.name || it?.txt?.text || '';
          return `
            <button onclick="sharedFocusCpByKey('${escapeXml(it.key)}')"
              class="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 transition-colors border border-white/5">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-bold">${escapeXml(step)}</span>
              ${distLabel ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/40 border border-white/10 text-slate-300 font-mono">${escapeXml(distLabel)}</span>` : ''}
              <span class="text-xs text-slate-200 flex-1 truncate">${escapeXml(title)}</span>
              <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
            </button>
          `;
        }).join('')}
      </div>`;

  panel.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="flex-1">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step-by-Step Trek</p>
        <select class="w-full bg-slate-800 text-xs text-white p-2 rounded border border-slate-600 mt-1" onchange="sharedSelectTrekByIndex(this.value)">
          ${options}
        </select>
      </div>
      <button onclick="toggleSharedStepsPanel()" class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-600" title="Tutup">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
    <p class="text-[10px] text-slate-500 mt-2 leading-snug">Sistem automatik menyusun checkpoint yang berada dekat/menyentuh garisan trek. Jika turutan salah, admin boleh drag susun semula dan simpan.</p>
    ${listHtml}
  `;
  safeCreateIcons();
}

function hideSharedPanel() {
    if(mode !== 'shared-viewer') return;
    const panel = document.getElementById('shared-float-panel');
    const btn = document.getElementById('shared-restore-btn');
    if (document.activeElement) document.activeElement.blur();
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

// ============================================================
// ===== TAMBAHAN: Last-Seen, Padam Admin, Urus Lesen (Master) =====
// ============================================================

let globalEventLastSeen = {};   // { event_id: ISOString }  (dari syncFromGAS)
let _pingTimer = null;

function timeAgoMs(iso){
  if(!iso) return 'Tidak pernah';
  const t = new Date(iso).getTime();
  if(isNaN(t)) return 'Tidak pernah';
  const diff = Date.now() - t;
  if(diff < 0) return 'Baru sahaja';
  const m = Math.floor(diff/60000);
  if(m < 1) return 'Baru sahaja';
  if(m < 60) return m + ' minit lalu';
  const h = Math.floor(m/60);
  if(h < 24) return h + ' jam lalu';
  const d = Math.floor(h/24);
  if(d < 30) return d + ' hari lalu';
  const mo = Math.floor(d/30);
  if(mo < 12) return mo + ' bulan lalu';
  return Math.floor(mo/12) + ' tahun lalu';
}

async function pingLastSeen(kind, refId){
  try {
    if (!currentUser) return;
    await fetch(GAS_WEB_APP_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        type:'ping_seen',
        kind: kind,                          // 'user' atau 'event'
        user_id: currentUser.user_id,
        username: currentUser.username,
        event_id: refId || '',
        origin: location.origin, path: location.pathname
      })
    });
  } catch(e){ /* senyap */ }
}

// Mula ping pengguna setiap 5 minit (selepas login)
function startPresencePinger(){
  if (_pingTimer) clearInterval(_pingTimer);
  if (!currentUser) return;
  pingLastSeen('user');
  _pingTimer = setInterval(()=>pingLastSeen('user'), 5*60*1000);
}

// Hook startApp & loadEvent supaya ping automatik
(function hookPresence(){
  const _origStartApp = startApp;
  startApp = function(role){
    const r = _origStartApp.apply(this, arguments);
    startPresencePinger();
    return r;
  };
  const _origLoadEvent = loadEvent;
  loadEvent = function(eventId){
    pingLastSeen('event', eventId);
    globalEventLastSeen[eventId] = new Date().toISOString();
    return _origLoadEvent.apply(this, arguments);
  };
  // Sertakan last-seen dari pelayan apabila sync
  const _origSync = syncFromGAS;
  syncFromGAS = async function(){
    const r = await _origSync.apply(this, arguments);
    try {
      // Backend boleh hantar json.data.event_last_seen
      // Jika ada di allData, baca dari sana sebagai fallback.
      // (globalUsers sepatutnya sudah ada medan last_seen jika backend dikemaskini)
    } catch(e){}
    return r;
  };
})();

// ---------- Override renderAdminList: papar last-seen + butang padam ----------
renderAdminList = function() {
  const container = document.getElementById('admin-list');
  if (!container) return;
  const isMaster = currentUser && currentUser.role === 'master';

  const admins = [...new Map(
    globalUsers
      .filter(d => d.role === 'admin')
      .map(d => [d.user_id, {
        name: d.username || '',
        mail: d.email || '',
        pass: d.plain_password || '',
        last: d.last_seen || d.last_login || ''
      }])
  ).entries()];

  adminPasswordMap = {};
  admins.forEach(([id, a]) => { adminPasswordMap[id] = a.pass || ''; });

  const mask = (p) => p ? '••••••••' : 'Tiada (rekod lama)';

  container.innerHTML = admins.map(([id, a]) => {
    const passText = isMaster ? mask(a.pass) : 'Tersembunyi';
    const lastTxt = timeAgoMs(a.last);
    const stale = a.last && (Date.now() - new Date(a.last).getTime()) > 30*24*3600*1000;
    const lastCls = !a.last ? 'text-slate-500' : (stale ? 'text-red-400' : 'text-slate-400');

    const actionBtns = isMaster
      ? `<div class="flex flex-wrap gap-2 mt-2">
           <button onclick="toggleAdminPassword('${id}')" class="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Lihat</button>
           <button onclick="copyAdminPassword('${id}')" class="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Salin</button>
           <button onclick="masterDeleteAdmin('${id}','${escapeXml(a.name).replace(/'/g,"\\'")}')" class="text-[10px] px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white">Padam</button>
         </div>`
      : '';

    return `
      <div class="trek-item px-2 py-2 rounded-lg bg-slate-800/50 mb-1">
        <div class="flex justify-between items-start gap-2">
          <p class="text-[11px] font-semibold text-emerald-400 truncate">${escapeXml(a.name)}</p>
          <span class="text-[9px] ${lastCls} whitespace-nowrap">⏱ ${lastTxt}</span>
        </div>
        <p class="text-[10px] text-slate-400">Emel: ${escapeXml(a.mail || 'Tiada emel')}</p>
        <p class="text-[10px] text-amber-400">K.Laluan: <span id="admin-pass-${id}">${escapeXml(passText)}</span></p>
        ${actionBtns}
      </div>
    `;
  }).join('') || '<p class="text-xs text-slate-500">Tiada rekod</p>';
};

async function masterDeleteAdmin(userId, name){
  if (!currentUser || currentUser.role !== 'master') return;
  const ok = await customDialog({
    type:'confirm',
    title:'Padam Admin',
    msg:`Adakah anda pasti mahu memadam admin <b>${name}</b>?<br><br><span style="color:#fca5a5;font-size:12px;">Tindakan ini akan mengeluarkan rekod dari Google Sheet dan tidak boleh dibatalkan.</span>`
  });
  if (!ok) return;
  const pwd = sessionStorage.getItem('master_pwd_cache') ||
              document.getElementById('master-pwd-cache')?.value || '';
  if (!pwd) return showToast('Mohon masukkan kata laluan master terlebih dahulu', 'error');
  try {
    const res = await fetch(GAS_WEB_APP_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        type:'master_action', action:'delete_admin',
        master_username: currentUser.username, master_password: pwd,
        user_id: userId, origin: location.origin, path: location.pathname
      })
    });
    const j = await res.json();
    if (j.status === 'ok') {
      showToast('Admin berjaya dipadam','success');
      await syncFromGAS();
    } else {
      showToast(j.message || 'Maaf, permintaan tidak berjaya','error');
    }
  } catch(e){
    showToast('Sambungan rangkaian kurang stabil. Sila cuba lagi sebentar lagi.','error');
  }
}

// ---------- Override renderMasterEventList: papar last-opened ----------
renderMasterEventList = function() {
  const container = document.getElementById('master-event-list');
  if (!container) return;
  const events = allData.filter(d => d.type !== 'event_metadata');

  // Bina map: event_id -> { name, last }
  const map = new Map();
  events.forEach(d => {
    const cur = map.get(d.event_id) || { name: d.event_name, last: '' };
    if (!cur.name) cur.name = d.event_name;
    const ts = globalEventLastSeen[d.event_id] || d.last_opened || d.updated_at || '';
    if (ts && (!cur.last || new Date(ts) > new Date(cur.last))) cur.last = ts;
    map.set(d.event_id, cur);
  });
  const list = [...map.entries()];

  container.innerHTML = list.map(([id, info]) => {
    const lastTxt = timeAgoMs(info.last);
    const stale = info.last && (Date.now() - new Date(info.last).getTime()) > 60*24*3600*1000;
    const lastCls = !info.last ? 'text-slate-500' : (stale ? 'text-red-400' : 'text-slate-400');
    return `
      <div class="trek-item px-2 py-2 rounded-lg text-xs bg-slate-800/50 mb-1">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 cursor-pointer flex-1 truncate" onclick="handleLoadEvent('${id}')">
            <i data-lucide="map" class="w-3 h-3 text-emerald-400"></i>
            <span class="truncate text-slate-200">${escapeXml(info.name || id)}</span>
          </div>
          <span class="text-[9px] ${lastCls} whitespace-nowrap">⏱ ${lastTxt}</span>
          <button onclick="confirmDeleteEvent('${id}')" class="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Padam Acara">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>`;
  }).join('') || '<p class="text-xs text-slate-500 py-1">Tiada rekod acara tersimpan</p>';
  safeCreateIcons();
};

// ---------- Override renderMasterLicenseList: tambah Kemaskini & Padam ----------
renderMasterLicenseList = function(){
  const el = document.getElementById('master-license-list');
  if (!el) return;
  if (!_masterPanelLicenses.length) { el.innerHTML = '<p class="text-xs text-slate-500">Tiada lesen.</p>'; return; }
  el.innerHTML = _masterPanelLicenses.map(l => {
    const badge = l.status==='active' ? 'bg-emerald-600'
                : (l.status==='trial'?'bg-cyan-600'
                : (l.status==='expired'?'bg-red-600':'bg-slate-600'));
    const lastTxt = timeAgoMs(l.last_seen || l.last_used || '');
    return `<div class="p-2 mb-2 rounded bg-slate-800 text-[11px]">
      <div class="flex justify-between items-start">
        <div class="min-w-0">
          <p class="font-bold text-emerald-400 truncate">${escapeXml(l.username||'(belum ikat)')}</p>
          <p class="text-slate-400 truncate">${escapeXml(l.email||'')}</p>
          <p class="font-mono text-amber-300 break-all">${l.key}</p>
          <p class="text-slate-500">Tamat: ${new Date(l.expiry).toLocaleDateString('ms-MY')} (${l.days_left} hari)</p>
          <p class="text-slate-500 text-[9px]">⏱ Guna terakhir: ${lastTxt}</p>
        </div>
        <span class="${badge} text-white px-2 py-0.5 rounded text-[9px] flex-shrink-0">${(l.status||'').toUpperCase()}</span>
      </div>
      <div class="flex flex-wrap gap-1 mt-2">
        <button onclick="masterExtendLic('${l.key}')" class="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">+ Hari</button>
        <button onclick="masterUpdateLic('${l.key}')" class="text-[10px] px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-white">Kemaskini</button>
        <button onclick="masterRevokeLic('${l.key}')" class="text-[10px] px-2 py-1 bg-amber-700 hover:bg-amber-600 rounded text-white">Batal</button>
        <button onclick="masterDeleteLic('${l.key}')" class="text-[10px] px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-white">Padam</button>
        <button onclick="navigator.clipboard.writeText('${l.key}').then(()=>showToast('Disalin','success'))" class="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">Salin</button>
      </div>
    </div>`;
  }).join('');
};

async function masterUpdateLic(key){
  if (!currentUser || currentUser.role !== 'master') return;
  const cur = _masterPanelLicenses.find(x => x.key === key) || {};
  const newEmail = await customDialog({
    type:'prompt', title:'Kemaskini Lesen',
    msg:`Kemaskini emel untuk lesen:<br><b style="font-family:monospace;color:#f0abfc;">${key}</b><br><br><small style="color:#94a3b8;">Kosongkan jika tiada perubahan.</small>`,
    defaultVal: cur.email || ''
  });
  if (newEmail === null) return; // batal
  const newNote = await customDialog({
    type:'prompt', title:'Catatan Lesen',
    msg:`Kemaskini catatan (pilihan):`,
    defaultVal: cur.note || ''
  });
  if (newNote === null) return;
  const newStatus = await customDialog({
    type:'prompt', title:'Status Lesen',
    msg:`Tetapkan status (active / trial / expired / revoked):`,
    defaultVal: cur.status || 'active'
  });
  if (newStatus === null) return;

  const pwd = sessionStorage.getItem('master_pwd_cache') || document.getElementById('master-pwd-cache')?.value || '';
  if (pwd) sessionStorage.setItem('master_pwd_cache', pwd);
  try {
    const res = await fetch(GAS_WEB_APP_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        type:'master_license', action:'update',
        master_username: currentUser.username, master_password: pwd,
        key: key, email: newEmail, note: newNote, status: newStatus,
        origin: location.origin, path: location.pathname
      })
    });
    const j = await res.json();
    if (j.status === 'ok') {
      showToast('Lesen berjaya dikemaskini', 'success');
      loadMasterLicenses();
    } else {
      showToast(j.message || 'Maaf, permintaan tidak berjaya', 'error');
    }
  } catch(e){
    showToast('Sambungan rangkaian kurang stabil. Sila cuba lagi sebentar lagi.', 'error');
  }
}

async function masterDeleteLic(key){
  if (!currentUser || currentUser.role !== 'master') return;
  const ok = await customDialog({
    type:'confirm', title:'Padam Lesen',
    msg:`Padam lesen ini secara kekal?<br><br><span style="font-family:monospace;color:#f87171;font-weight:700;">${key}</span><br><br><span style="color:#fca5a5;font-size:12px;">Rekod akan dibuang dari Google Sheet dan tidak boleh dibatalkan.</span>`
  });
  if (!ok) return;
  const pwd = sessionStorage.getItem('master_pwd_cache') || document.getElementById('master-pwd-cache')?.value || '';
  if (pwd) sessionStorage.setItem('master_pwd_cache', pwd);
  if (!pwd) { showToast('Sila masukkan kata laluan master terlebih dahulu', 'error'); return; }
  try {
    const res = await fetch(GAS_WEB_APP_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({
        type:'master_license', action:'delete',
        master_username: currentUser.username, master_password: pwd,
        key: key, origin: location.origin, path: location.pathname
      })
    });
    const j = await res.json();
    if (j.status === 'ok') {
      showToast('Lesen berjaya dipadam', 'success');
      loadMasterLicenses();
    } else {
      showToast(j.message || 'Maaf, permintaan tidak berjaya', 'error');
    }
  } catch(e){
    showToast('Sambungan rangkaian kurang stabil. Sila cuba lagi sebentar lagi.', 'error');
  }
}

// Render semula sekarang jika sedang dalam mod master
if (currentUser && currentUser.role === 'master') {
  try { renderAdminList(); renderMasterEventList(); } catch(e){}
}

renderAuthForm();
safeCreateIcons();
