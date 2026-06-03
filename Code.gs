const KONFIGURASI = {
  SHEET_ID: "1dA1w-oRIrl29QMCjSRcVyk1_pNRVadB5khl3zvUU-Vw",
  FOLDER_ID: "1kXQAm4nxj8hd_SxtGVqN609vUnB3pWI2",

  // Domain Lock (Soft Lock)
  // Nota: Apps Script Web App tak boleh baca header Origin/Referer secara terus.
  // Jadi kita buat semakan berdasarkan nilai yang dihantar oleh client (app.js).
  // Ini menghalang "clone biasa", tetapi attacker mahir masih boleh spoof.
  ALLOWED_ORIGINS: ["https://kba1008.github.io"],
  ALLOWED_PATH_PREFIX: "/MAP/"
};

function isClientAllowed_(origin, path) {
  try {
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
