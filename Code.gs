const KONFIGURASI = {
  SHEET_ID: "1dA1w-oRIrl29QMCjSRcVyk1_pNRVadB5khl3zvUU-Vw",
  FOLDER_ID: "1kXQAm4nxj8hd_SxtGVqN609vUnB3pWI2",

  // Domain Lock (Soft Lock)
  // ⇩⇩⇩ SUIS INDUK: tukar DOMAIN_LOCK_ENABLED ke `true` untuk aktifkan semula. ⇩⇩⇩
  DOMAIN_LOCK_ENABLED: false,
  ALLOWED_ORIGINS: ["https://kba1008.github.io"],
  ALLOWED_PATH_PREFIX: "/MAP/"
};

function isClientAllowed_(origin, path) {
  try {
    if (KONFIGURASI.DOMAIN_LOCK_ENABLED === false) return true; // suis induk OFF → benarkan semua
    if (!origin || !path) return false;
    var okOrigin = KONFIGURASI.ALLOWED_ORIGINS.indexOf(String(origin)) !== -1;
    var okPath = String(path).indexOf(KONFIGURASI.ALLOWED_PATH_PREFIX) === 0;
    return okOrigin && okPath;
  } catch (e) {
    return false;
  }
}

function getSpreadsheet() {
  if (KONFIGURASI.SHEET_ID) {
    return SpreadsheetApp.openById(KONFIGURASI.SHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#3b82f6").setFontColor("white");
  }
  // Jika sheet sudah wujud (versi lama), pastikan lajur header mencukupi
  // supaya data seperti "Plain Password" tidak hilang/tersembunyi.
  if (headers && headers.length) {
    const lastCol = sheet.getLastColumn();
    // Tambah kolum yang kurang di hujung
    if (lastCol < headers.length) {
      const missing = headers.slice(lastCol);
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
      sheet.getRange(1, lastCol + 1, 1, missing.length).setFontWeight("bold").setBackground("#3b82f6").setFontColor("white");
    }
    // Isi header yang kosong dalam julat yang sepatutnya (tanpa overwrite yang sudah ada)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    const current = headerRange.getValues()[0];
    let changed = false;
    for (let i = 0; i < headers.length; i++) {
      if (!current[i]) {
        current[i] = headers[i];
        changed = true;
      }
    }
    if (changed) {
      headerRange.setValues([current]);
      headerRange.setFontWeight("bold").setBackground("#3b82f6").setFontColor("white");
    }
  }
  return sheet;
}

function setupSettings(ss) {
  const sheet = ensureSheet(ss, 'SETTINGS', ['Key', 'Value', 'Updated At']);
  const data = sheet.getDataRange().getValues();
  let hasLiveTracking = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'live_tracking') {
      hasLiveTracking = true;
      break;
    }
  }
  if (!hasLiveTracking) {
    sheet.appendRow(['live_tracking', true, new Date()]);
  }
}

function setupMaster(ss) {
  const sheet = ensureSheet(ss, 'MASTER_ADMIN', ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password']);
  const data = sheet.getDataRange().getValues();
  let hasMilokopi = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === 'milokopi') {
      hasMilokopi = true;
      break;
    }
  }
  
  if (!hasMilokopi) {
    let hash = 0;
    const str = "admin123";
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    } 
    const generatedHash = Math.abs(hash).toString(36);
    
    sheet.appendRow(['master_' + Date.now().toString(36), 'milokopi', 'admin@system.com', generatedHash, new Date(), str]);
  }
}

function updateLiveTracking(ss, payload) {
    const sheet = ensureSheet(ss, 'LIVE_TRACKING', ['Event ID', 'Nama Peserta', 'Latitud', 'Longitud', 'Kadar Nadi (HR)', 'SpO2', 'Kelajuan (km/j)', 'Timestamp', 'Ikon']);
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == payload.event_id && data[i][1] == payload.participant_name) {
            rowIndex = i + 1;
            break;
        }
    }
    
    const now = new Date();
    if (rowIndex > -1) {
        sheet.getRange(rowIndex, 3, 1, 7).setValues([[payload.lat, payload.lng, payload.hr || '', payload.spo2 || '', payload.speed || '0.0', now.toISOString(), payload.icon || '🏃']]);
    } else {
        sheet.appendRow([payload.event_id, payload.participant_name, payload.lat, payload.lng, payload.hr || '', payload.spo2 || '', payload.speed || '0.0', now.toISOString(), payload.icon || '🏃']);
    }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Tiada payload diterima.");
    }

    const data = JSON.parse(e.postData.contents);

    // Domain lock (soft) — blok permintaan dari luar domain yang dibenarkan
    if (!isClientAllowed_(data.origin, data.path)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Akses disekat (domain tidak dibenarkan).'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.type === 'upload_media') {
       const folder = DriveApp.getFolderById(KONFIGURASI.FOLDER_ID);
       const decoded = Utilities.base64Decode(data.base64);
       const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
       const file = folder.createFile(blob);
       file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
       
       return ContentService.createTextOutput(JSON.stringify({
          status: 'ok',
          id: file.getId(),
          mimeType: file.getMimeType()
       })).setMimeType(ContentService.MimeType.JSON);
    }

    // Padam media dari Drive (admin boleh buang gambar/video checkpoint)
    if (data.type === 'delete_media' && data.media_id) {
       try {
         var f = DriveApp.getFileById(String(data.media_id));
         // Guna trash supaya boleh recover kalau tersalah (lebih selamat)
         f.setTrashed(true);
         return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
       } catch (err) {
         return ContentService.createTextOutput(JSON.stringify({
           status: 'error',
           message: 'Gagal padam media: ' + err
         })).setMimeType(ContentService.MimeType.JSON);
       }
    }

    const ss = getSpreadsheet();
    setupMaster(ss);
    
    if (data.type === 'update_setting') {
      const sheet = ensureSheet(ss, 'SETTINGS', ['Key', 'Value', 'Updated At']);
      const sData = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] === data.key) {
          sheet.getRange(i + 1, 2, 1, 2).setValues([[data.value, new Date()]]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([data.key, data.value, new Date()]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.type === 'live_update') {
       updateLiveTracking(ss, data);
       return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.type === 'user') {
      if (data.role === 'master') {
        const sheet = ensureSheet(ss, 'MASTER_ADMIN', ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password']);
        sheet.appendRow([data.user_id || "", data.username || "", data.email || "", data.password_hash || "", new Date(), data.plain_password || ""]);
      } else {
        const sheet = ensureSheet(ss, 'ADMIN_EVENT', ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password']);
        sheet.appendRow([data.user_id || "", data.username || "", data.email || "", data.password_hash || "", new Date(), data.plain_password || ""]);
        // Auto-generate trial license 7 hari untuk admin event baru
        try { createLicenseFor_(ss, data.user_id || "", data.username || "", data.email || "", 7, 'trial', 'Auto-trial 7 hari (pendaftaran)', 'SYSTEM'); } catch(eL){}
      }
    } 
    else if (data.type === 'delete_event') {
      const trekHeaders = ['ID_Rekod', 'Nama Event', 'Nama Trek', 'Warna', 'Koordinat JSON', 'Nama Checkpoint', 'Latitud', 'Longitud', 'Jenis', 'Tarikh Ciptaan', 'Dicipta Oleh', 'Jarak', 'Ikon', 'Media_ID', 'Media_Type', 'Media_Images', 'Media_Video_ID', 'Media_Video_Type'];
      const sheet = ensureSheet(ss, 'Trek Data', trekHeaders);
      const rows = sheet.getDataRange().getValues();
      let newData = [trekHeaders];
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length > 0 && String(rows[i][0]).trim() !== "") {
          if (String(rows[i][0]) !== String(data.event_id)) {
            let cleanRow = [...rows[i]];
            while (cleanRow.length < trekHeaders.length) cleanRow.push("");
            newData.push(cleanRow.slice(0, trekHeaders.length));
          }
        }
      }
      
      sheet.clearContents();
      if (newData.length > 0) {
        sheet.getRange(1, 1, newData.length, trekHeaders.length).setValues(newData);
      }
    }
    else if (data.type === 'bulk_event') {
      const trekHeaders = ['ID_Rekod', 'Nama Event', 'Nama Trek', 'Warna', 'Koordinat JSON', 'Nama Checkpoint', 'Latitud', 'Longitud', 'Jenis', 'Tarikh Ciptaan', 'Dicipta Oleh', 'Jarak', 'Ikon', 'Media_ID', 'Media_Type', 'Media_Images', 'Media_Video_ID', 'Media_Video_Type'];
      const sheet = ensureSheet(ss, 'Trek Data', trekHeaders);
      const rows = sheet.getDataRange().getValues();
      
      let newData = [trekHeaders];
      const targetIds = [String(data.event_id)];
      if (data.old_event_id) {
        targetIds.push(String(data.old_event_id));
      }

      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length > 0 && String(rows[i][0]).trim() !== "") {
          const rowEventId = String(rows[i][0]);
          if (!targetIds.includes(rowEventId)) {
            let cleanRow = [...rows[i]];
            while (cleanRow.length < trekHeaders.length) cleanRow.push("");
            newData.push(cleanRow.slice(0, trekHeaders.length));
          }
        }
      }

      if (data.payloads && data.payloads.length > 0) {
        data.payloads.forEach(row => {
          newData.push([
            row.event_id || "", 
            row.event_name || "", 
            row.trek_name || "", 
            row.trek_color || "", 
            row.coordinates || "", 
            row.checkpoint_name || "", 
            row.lat || "", 
            row.lng || "", 
            row.type || "", 
            new Date(), 
            row.created_by || "", 
            row.distance || "", 
            row.icon || "",
            row.media_id || "",
            row.media_type || "",
            row.media_images || "",
            row.media_video_id || "",
            row.media_video_type || ""
          ]);
        });
      }

      sheet.clearContents();
      if (newData.length > 0) {
        sheet.getRange(1, 1, newData.length, trekHeaders.length).setValues(newData);
      }
    }


    // ============ LICENSE HANDLERS ============
    if (data.type === 'check_license') {
      const info = checkLicenseStatus_(ss, data.user_id || '');
      return ContentService.createTextOutput(JSON.stringify({ status:'ok', license: info })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.type === 'apply_license_key') {
      // Admin masukkan key dari master. Ikat key kepada user_id mereka jika belum diikat.
      const res = applyLicenseKey_(ss, String(data.key||'').trim().toUpperCase(), data.user_id||'', data.username||'', data.email||'');
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.type === 'master_license') {
      // Verifikasi master sebelum sebarang tindakan
      const auth = verifyMaster_(ss, data.master_username||'', data.master_password||'');
      if (!auth.ok) return ContentService.createTextOutput(JSON.stringify({ status:'error', message:'Master auth gagal' })).setMimeType(ContentService.MimeType.JSON);
      const act = data.action||'list';
      if (act === 'list') {
        return ContentService.createTextOutput(JSON.stringify({ status:'ok', licenses: listLicenses_(ss) })).setMimeType(ContentService.MimeType.JSON);
      }
      if (act === 'generate') {
        const r = createLicenseFor_(ss, data.user_id||'', data.username||'', data.email||'', Number(data.days)||30, 'active', data.note||'', auth.username);
        return ContentService.createTextOutput(JSON.stringify({ status:'ok', license: r })).setMimeType(ContentService.MimeType.JSON);
      }
      if (act === 'extend') {
        const r = extendLicense_(ss, String(data.key||'').toUpperCase(), Number(data.days)||30);
        return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
      }
      if (act === 'revoke') {
        const r = revokeLicense_(ss, String(data.key||'').toUpperCase());
        return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status:'error', message:'Tindakan tidak dikenali' })).setMimeType(ContentService.MimeType.JSON);
    }
    // ============ END LICENSE HANDLERS ============

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Rekod berjaya disimpan di Google Sheets'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    // Domain lock (soft) — semak parameter client
    var origin = (e && e.parameter) ? (e.parameter.origin || '') : '';
    var path = (e && e.parameter) ? (e.parameter.path || '') : '';
    if (!isClientAllowed_(origin, path)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Akses disekat (domain tidak dibenarkan).'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (e && e.parameter && e.parameter.action === 'ping') {
        const lock = LockService.getScriptLock();
        lock.waitLock(5000);
        try {
            const props = PropertiesService.getScriptProperties();
            let presence = {};
            try {
                presence = JSON.parse(props.getProperty('PRESENCE_MAP') || '{}');
            } catch(ex) { presence = {}; }
            
            const now = Date.now();
            const sessionId = e.parameter.session_id || 'anon_' + now;
            
            presence[sessionId] = now;
            
            let activeCount = 0;
            let newPresence = {};
            for (let id in presence) {
                if (now - presence[id] <= 90000) {
                    newPresence[id] = presence[id];
                    activeCount++;
                }
            }
            
            props.setProperty('PRESENCE_MAP', JSON.stringify(newPresence));
            return ContentService.createTextOutput(JSON.stringify({status: 'ok', count: activeCount})).setMimeType(ContentService.MimeType.JSON);
        } catch(err) {
            return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
        } finally {
            lock.releaseLock();
        }
    }

    if (e && e.parameter && e.parameter.action === 'get_media' && e.parameter.media_id) {
        try {
          var file = DriveApp.getFileById(e.parameter.media_id);
          var mimeType = file.getMimeType();
          var bytes = file.getBlob().getBytes();
          var base64 = Utilities.base64Encode(bytes);
          return ContentService.createTextOutput(JSON.stringify({
              status: 'ok',
              mimeType: mimeType,
              base64: base64
          })).setMimeType(ContentService.MimeType.JSON);
        } catch (err) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: 'Media tidak dijumpai atau telah dipadam.'
          })).setMimeType(ContentService.MimeType.JSON);
        }
    }

    const ss = getSpreadsheet();

    if (e && e.parameter && e.parameter.action === 'get_live' && e.parameter.event_id) {
        const sheet = ss.getSheetByName('LIVE_TRACKING');
        let liveData = [];
        if (sheet) {
            const data = sheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
                if (data[i][0] == e.parameter.event_id) {
                    liveData.push({
                        participant_name: data[i][1],
                        lat: data[i][2],
                        lng: data[i][3],
                        hr: data[i][4],
                        spo2: data[i][5],
                        speed: data[i][6],
                        timestamp: data[i][7],
                        icon: data[i][8] || '🏃'
                    });
                }
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: 'ok', live_data: liveData })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (e && e.parameter && e.parameter.action === 'getSharedEvent' && e.parameter.event_id) {
        const trekSheet = ss.getSheetByName('Trek Data');
        let trekData = [];
        if (trekSheet && trekSheet.getLastRow() > 1) {
            const data = trekSheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
                if (String(data[i][0]) === String(e.parameter.event_id)) {
                    trekData.push({
                        event_id: String(data[i][0]), event_name: String(data[i][1]), trek_name: String(data[i][2]), 
                        trek_color: String(data[i][3]), coordinates: String(data[i][4]), checkpoint_name: String(data[i][5]), 
                        lat: String(data[i][6]), lng: String(data[i][7]), type: String(data[i][8]), created_by: String(data[i][10]),
                        distance: String(data[i][11] || ""), icon: String(data[i][12] || ""), 
                        media_id: String(data[i][13] || ""), media_type: String(data[i][14] || ""),
                        media_images: String(data[i][15] || ""),
                        media_video_id: String(data[i][16] || ""),
                        media_video_type: String(data[i][17] || "")
                    });
                }
            }
        }
        
        const settingsSheet = ss.getSheetByName('SETTINGS');
        let settingsObj = { live_tracking: true };
        if (settingsSheet) {
          const sData = settingsSheet.getDataRange().getValues();
          for (let i = 1; i < sData.length; i++) {
            if (sData[i][0] === 'live_tracking') {
              settingsObj.live_tracking = sData[i][1] === true || sData[i][1] === 'true' || sData[i][1] === 'TRUE';
            }
          }
        }
        
        return ContentService.createTextOutput(JSON.stringify({
            status: 'ok', 
            data: { trekData: trekData, settings: settingsObj }
        })).setMimeType(ContentService.MimeType.JSON);
    }

    let responseData = { users: [], trekData: [] };
    
    setupMaster(ss);
    setupSettings(ss);

    const masterSheet = ensureSheet(ss, 'MASTER_ADMIN', ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password']);
    const adminSheet = ensureSheet(ss, 'ADMIN_EVENT', ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password']);
    const trekHeaders = ['ID_Rekod', 'Nama Event', 'Nama Trek', 'Warna', 'Koordinat JSON', 'Nama Checkpoint', 'Latitud', 'Longitud', 'Jenis', 'Tarikh Ciptaan', 'Dicipta Oleh', 'Jarak', 'Ikon', 'Media_ID', 'Media_Type', 'Media_Images', 'Media_Video_ID', 'Media_Video_Type'];
    const trekSheet = ensureSheet(ss, 'Trek Data', trekHeaders);
    const settingsSheet = ss.getSheetByName('SETTINGS');

    let settingsObj = { live_tracking: true };
    if (settingsSheet) {
      const sData = settingsSheet.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] === 'live_tracking') {
          settingsObj.live_tracking = sData[i][1] === true || sData[i][1] === 'true' || sData[i][1] === 'TRUE';
        }
      }
    }
    responseData.settings = settingsObj;

    if (masterSheet && masterSheet.getLastRow() > 1) {
      const data = masterSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        responseData.users.push({ 
          type: 'user', role: 'master', user_id: String(data[i][0]), 
          username: String(data[i][1]), email: String(data[i][2]), password_hash: String(data[i][3]), plain_password: String(data[i][5] || "")
        });
      }
    }

    if (adminSheet && adminSheet.getLastRow() > 1) {
      const data = adminSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        responseData.users.push({ 
          type: 'user', role: 'admin', user_id: String(data[i][0]), 
          username: String(data[i][1]), email: String(data[i][2]), password_hash: String(data[i][3]), plain_password: String(data[i][5] || "")
        });
      }
    }

    if (trekSheet && trekSheet.getLastRow() > 1) {
      const data = trekSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if(String(data[i][0]).trim() !== "") {
            responseData.trekData.push({
              event_id: String(data[i][0]), event_name: String(data[i][1]), trek_name: String(data[i][2]), 
              trek_color: String(data[i][3]), coordinates: String(data[i][4]), checkpoint_name: String(data[i][5]), 
              lat: String(data[i][6]), lng: String(data[i][7]), type: String(data[i][8]), created_by: String(data[i][10]),
              distance: String(data[i][11] || ""), icon: String(data[i][12] || ""), 
              media_id: String(data[i][13] || ""), media_type: String(data[i][14] || ""),
              media_images: String(data[i][15] || ""),
              media_video_id: String(data[i][16] || ""),
              media_video_type: String(data[i][17] || "")
            });
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok', 
      data: responseData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
     return ContentService.createTextOutput(JSON.stringify({
       status: 'error', 
       message: err.toString()
     })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// Gabungan daripada macros.gs (boleh guna 1 fail sahaja: Code.gs)
// ============================================================

/**
 * Makro Automasi Sheet - SMART EVENT MAP
 *
 * Fungsi ini dipanggil secara automatik apabila Google Sheet dibuka.
 * Ia membina menu khas untuk membolehkan penganjur atau admin mengesahkan
 * pautan storan fail di dalam Google Drive (seperti imej dan video checkpoint).
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ SMART EVENT MAP')
      .addItem('🔐 Sahkan Akses Fail (Drive) & Mulakan Sistem', 'authorizeDrive')
      .addSeparator()
      .addItem('🔑 Reset Kata Laluan Admin', 'resetAdminPassword')
      .addSeparator()
      .addItem('🧹 Bersihkan Cache / Data Tertunggak', 'cleanUpData')
      .addToUi();
}

/**
 * Memaksa Apps Script meminta kebenaran Drive dan semak folder media wujud.
 * (Master/Admin yang buka Sheet akan nampak prompt authorization).
 */
function authorizeDrive() {
  var ui = SpreadsheetApp.getUi();
  try {
    var folderId = (typeof KONFIGURASI !== 'undefined' && KONFIGURASI.FOLDER_ID) ? KONFIGURASI.FOLDER_ID : '';
    if (!folderId) {
      ui.alert('Ralat', 'FOLDER_ID belum diset dalam KONFIGURASI (Code.gs).', ui.ButtonSet.OK);
      return;
    }
    var folder = DriveApp.getFolderById(folderId);
    ui.alert('Berjaya', 'Akses Drive OK. Folder media: ' + folder.getName(), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Ralat', 'Gagal akses Drive: ' + e, ui.ButtonSet.OK);
  }
}

/**
 * Hash ringkas (mesti sama dengan app.js) untuk simpan Password Hash.
 */
function simpleHash_(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Reset kata laluan admin terus dari Google Sheet.
 * Nota: Password lama yang hanya ada hash TIDAK boleh dipulihkan.
 * Cara ini akan set password baru + kemaskini hash dan "Plain Password".
 */
function resetAdminPassword() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ADMIN_EVENT');
  if (!sheet) {
    ui.alert('Ralat', 'Sheet ADMIN_EVENT tidak dijumpai.', ui.ButtonSet.OK);
    return;
  }

  // Pastikan ada kolum "Plain Password" (F)
  var headers = sheet.getRange(1, 1, 1, Math.max(6, sheet.getLastColumn())).getValues()[0];
  if (!headers[5]) {
    sheet.getRange(1, 6).setValue('Plain Password').setFontWeight('bold').setBackground('#3b82f6').setFontColor('white');
  }

  var respUser = ui.prompt('Reset Kata Laluan Admin', 'Masukkan Username atau Email admin:', ui.ButtonSet.OK_CANCEL);
  if (respUser.getSelectedButton() !== ui.Button.OK) return;
  var key = String(respUser.getResponseText() || '').trim();
  if (!key) return ui.alert('Ralat', 'Username/Email tidak boleh kosong.', ui.ButtonSet.OK);

  var respPass = ui.prompt('Reset Kata Laluan Admin', 'Masukkan kata laluan baru:', ui.ButtonSet.OK_CANCEL);
  if (respPass.getSelectedButton() !== ui.Button.OK) return;
  var newPass = String(respPass.getResponseText() || '');
  if (!newPass) return ui.alert('Ralat', 'Kata laluan tidak boleh kosong.', ui.ButtonSet.OK);

  var data = sheet.getDataRange().getValues();
  var rowToUpdate = -1;
  for (var r = 1; r < data.length; r++) {
    var username = String(data[r][1] || '').trim();
    var email = String(data[r][2] || '').trim();
    if (username === key || email === key) {
      rowToUpdate = r + 1; // 1-based
      break;
    }
  }

  if (rowToUpdate < 0) {
    ui.alert('Tidak jumpa', 'Admin dengan username/email tersebut tidak dijumpai.', ui.ButtonSet.OK);
    return;
  }

  var newHash = simpleHash_(newPass);
  // Kolum: D = Password Hash (4), F = Plain Password (6)
  sheet.getRange(rowToUpdate, 4).setValue(newHash);
  sheet.getRange(rowToUpdate, 6).setValue(newPass);

  ui.alert('Berjaya', 'Kata laluan admin telah ditetapkan semula.\nUsername/Email: ' + key, ui.ButtonSet.OK);
}

/**
 * Membersihkan data lama / sampah dari Sheet secara manual (Opsional)
 */
function cleanUpData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Pembersihan Automatik', 'Mahu memadam log Live Tracking lama?', ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('LIVE_TRACKING');
    if (sheet) {
      if (sheet.getLastRow() > 1) {
        // Lapangkan rekod lama untuk mengelakkan berat
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
        ui.alert('Status', 'Berjaya dipadam.', ui.ButtonSet.OK);
      } else {
        ui.alert('Status', 'Tiada rekod lama untuk dipadam.', ui.ButtonSet.OK);
      }
    } else {
      ui.alert('Status', 'Sheet tidak dijumpai.', ui.ButtonSet.OK);
    }
  }
}


// ====================================================================
// LICENSE SYSTEM — auto trial 7 hari, master generate/extend/revoke
// ====================================================================
const LICENSE_HEADERS = ['License Key','User ID','Username','Email','Tarikh Mula','Tarikh Tamat','Hari Valid','Status','Nota','Created By','Created At'];

function ensureLicenseSheet_(ss) {
  return ensureSheet(ss, 'LICENSE', LICENSE_HEADERS);
}

function genLicenseKey_() {
  const part = () => Math.random().toString(36).slice(2,6).toUpperCase();
  return 'LIC-' + part() + '-' + part() + '-' + part();
}

function createLicenseFor_(ss, userId, username, email, days, status, note, createdBy) {
  const sheet = ensureLicenseSheet_(ss);
  // Jika trial untuk user yang dah ada license aktif, jangan duplicate trial
  if (status === 'trial' && userId) {
    const existing = findActiveLicenseByUser_(ss, userId);
    if (existing) return { key: existing.key, already: true };
  }
  const key = genLicenseKey_();
  const now = new Date();
  const expiry = new Date(now.getTime() + (Number(days)||7) * 86400000);
  sheet.appendRow([key, userId||'', username||'', email||'', now, expiry, Number(days)||7, status||'active', note||'', createdBy||'', now]);
  return { key: key, start: now.toISOString(), expiry: expiry.toISOString(), days: Number(days)||7, status: status, already: false };
}

function findActiveLicenseByUser_(ss, userId) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  let latest = null;
  for (let i=1;i<data.length;i++) {
    if (String(data[i][1]) === String(userId)) {
      const row = { key:String(data[i][0]), userId:String(data[i][1]), username:String(data[i][2]), email:String(data[i][3]),
        start:new Date(data[i][4]), expiry:new Date(data[i][5]), days:Number(data[i][6])||0, status:String(data[i][7]), note:String(data[i][8]), row:i+1 };
      if (row.status === 'revoked') continue;
      if (!latest || row.expiry > latest.expiry) latest = row;
    }
  }
  return latest;
}

function checkLicenseStatus_(ss, userId) {
  if (!userId) return { valid:false, status:'no_user', days_left:0 };
  const lic = findActiveLicenseByUser_(ss, userId);
  if (!lic) return { valid:false, status:'none', days_left:0 };
  const now = new Date();
  const msLeft = lic.expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / 86400000);
  const expired = msLeft <= 0;
  // Auto-update status jika expired
  if (expired && lic.status !== 'expired') {
    const sheet = ensureLicenseSheet_(ss);
    sheet.getRange(lic.row, 8).setValue('expired');
  }
  return {
    valid: !expired && lic.status !== 'revoked',
    status: expired ? 'expired' : lic.status,
    key: lic.key,
    days_left: Math.max(0, daysLeft),
    expiry: lic.expiry.toISOString(),
    start: lic.start.toISOString(),
    note: lic.note
  };
}

function applyLicenseKey_(ss, key, userId, username, email) {
  if (!key) return { status:'error', message:'Key kosong' };
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i=1;i<data.length;i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      const boundUser = String(data[i][1]||'').trim();
      if (boundUser && boundUser !== userId) {
        return { status:'error', message:'Key ini telah diikat pada akaun lain' };
      }
      const status = String(data[i][7]);
      if (status === 'revoked') return { status:'error', message:'Key telah dibatalkan' };
      const expiry = new Date(data[i][5]);
      if (expiry.getTime() < Date.now()) return { status:'error', message:'Key telah tamat tempoh' };
      // Ikat ke user
      if (!boundUser) {
        sheet.getRange(i+1, 2, 1, 3).setValues([[userId, username, email]]);
      }
      return { status:'ok', message:'License aktif', license: checkLicenseStatus_(ss, userId) };
    }
  }
  return { status:'error', message:'Key tidak dijumpai' };
}

function listLicenses_(ss) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  const out = [];
  for (let i=1;i<data.length;i++) {
    const expiry = new Date(data[i][5]);
    const status = String(data[i][7]);
    const expired = expiry.getTime() < now;
    out.push({
      key:String(data[i][0]), user_id:String(data[i][1]), username:String(data[i][2]), email:String(data[i][3]),
      start: new Date(data[i][4]).toISOString(), expiry: expiry.toISOString(),
      days: Number(data[i][6])||0, status: expired && status !== 'revoked' ? 'expired' : status,
      note:String(data[i][8]), created_by:String(data[i][9]),
      days_left: Math.max(0, Math.ceil((expiry.getTime()-now)/86400000))
    });
  }
  return out;
}

function extendLicense_(ss, key, addDays) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i=1;i<data.length;i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      const oldExpiry = new Date(data[i][5]);
      const base = oldExpiry.getTime() > Date.now() ? oldExpiry.getTime() : Date.now();
      const newExpiry = new Date(base + addDays*86400000);
      sheet.getRange(i+1, 6).setValue(newExpiry);
      sheet.getRange(i+1, 7).setValue((Number(data[i][6])||0) + addDays);
      sheet.getRange(i+1, 8).setValue('active');
      return { status:'ok', new_expiry: newExpiry.toISOString() };
    }
  }
  return { status:'error', message:'Key tidak dijumpai' };
}

function revokeLicense_(ss, key) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i=1;i<data.length;i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      sheet.getRange(i+1, 8).setValue('revoked');
      return { status:'ok' };
    }
  }
  return { status:'error', message:'Key tidak dijumpai' };
}

function verifyMaster_(ss, username, password) {
  const sheet = ensureSheet(ss, 'MASTER_ADMIN', ['User ID','Username','Email','Password Hash','Tarikh Daftar','Plain Password']);
  const data = sheet.getDataRange().getValues();
  const hash = simpleHash_(String(password||''));
  for (let i=1;i<data.length;i++) {
    if (String(data[i][1]) === String(username) && String(data[i][3]) === hash) {
      return { ok:true, username:String(data[i][1]), userId:String(data[i][0]) };
    }
  }
  return { ok:false };
}
