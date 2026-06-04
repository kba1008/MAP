const KONFIGURASI = {
  SHEET_ID: "1dA1w-oRIrl29QMCjSRcVyk1_pNRVadB5khl3zvUU-Vw",
  FOLDER_ID: "1kXQAm4nxj8hd_SxtGVqN609vUnB3pWI2",

  // Domain Lock (Soft Lock)
  // ⇩⇩⇩ SUIS INDUK: tukar DOMAIN_LOCK_ENABLED ke `true` untuk aktifkan semula. ⇩⇩⇩
  DOMAIN_LOCK_ENABLED: false,
  ALLOWED_ORIGINS: ["https://kba1008.github.io"],
  ALLOWED_PATH_PREFIX: "/MAP/"
};

// Header standard (dengan kolum "Last Seen At" di hujung)
const USER_HEADERS = ['User ID', 'Username', 'Email', 'Password Hash', 'Tarikh Daftar', 'Plain Password', 'Last Seen At'];
const TREK_HEADERS = ['ID_Rekod', 'Nama Event', 'Nama Trek', 'Warna', 'Koordinat JSON', 'Nama Checkpoint', 'Latitud', 'Longitud', 'Jenis', 'Tarikh Ciptaan', 'Dicipta Oleh', 'Jarak', 'Ikon', 'Media_ID', 'Media_Type', 'Media_Images', 'Media_Video_ID', 'Media_Video_Type'];
const EVENT_ACTIVITY_HEADERS = ['Event ID', 'Nama Event', 'Dicipta Oleh', 'Tarikh Cipta', 'Last Seen At', 'Last Updated At'];

function isClientAllowed_(origin, path) {
  try {
    if (KONFIGURASI.DOMAIN_LOCK_ENABLED === false) return true;
    if (!origin || !path) return false;
    var okOrigin = KONFIGURASI.ALLOWED_ORIGINS.indexOf(String(origin)) !== -1;
    var okPath = String(path).indexOf(KONFIGURASI.ALLOWED_PATH_PREFIX) === 0;
    return okOrigin && okPath;
  } catch (e) { return false; }
}

function getSpreadsheet() {
  if (KONFIGURASI.SHEET_ID) return SpreadsheetApp.openById(KONFIGURASI.SHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ===== Helper tarikh selamat (elak RangeError: Invalid time value) =====
function safeDate_(v) {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  try {
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) { return null; }
}
function safeIso_(v) {
  var d = safeDate_(v);
  return d ? d.toISOString() : '';
}
function safeTime_(v) {
  var d = safeDate_(v);
  return d ? d.getTime() : 0;
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#3b82f6").setFontColor("white");
  }
  if (headers && headers.length) {
    const lastCol = sheet.getLastColumn();
    if (lastCol < headers.length) {
      const missing = headers.slice(lastCol);
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
      sheet.getRange(1, lastCol + 1, 1, missing.length).setFontWeight("bold").setBackground("#3b82f6").setFontColor("white");
    }
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    const current = headerRange.getValues()[0];
    let changed = false;
    for (let i = 0; i < headers.length; i++) {
      if (!current[i]) { current[i] = headers[i]; changed = true; }
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
    if (data[i][0] === 'live_tracking') { hasLiveTracking = true; break; }
  }
  if (!hasLiveTracking) sheet.appendRow(['live_tracking', true, new Date()]);
}

function setupMaster(ss) {
  const sheet = ensureSheet(ss, 'MASTER_ADMIN', USER_HEADERS);
  const data = sheet.getDataRange().getValues();
  let hasMilokopi = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === 'milokopi') { hasMilokopi = true; break; }
  }
  if (!hasMilokopi) {
    const generatedHash = simpleHash_("admin123");
    sheet.appendRow(['master_' + Date.now().toString(36), 'milokopi', 'admin@system.com', generatedHash, new Date(), "admin123", new Date()]);
  }
}

function updateLiveTracking(ss, payload) {
  const sheet = ensureSheet(ss, 'LIVE_TRACKING', ['Event ID', 'Nama Peserta', 'Latitud', 'Longitud', 'Kadar Nadi (HR)', 'SpO2', 'Kelajuan (km/j)', 'Timestamp', 'Ikon']);
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == payload.event_id && data[i][1] == payload.participant_name) {
      rowIndex = i + 1; break;
    }
  }
  const now = new Date();
  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 3, 1, 7).setValues([[payload.lat, payload.lng, payload.hr || '', payload.spo2 || '', payload.speed || '0.0', now.toISOString(), payload.icon || '🏃']]);
  } else {
    sheet.appendRow([payload.event_id, payload.participant_name, payload.lat, payload.lng, payload.hr || '', payload.spo2 || '', payload.speed || '0.0', now.toISOString(), payload.icon || '🏃']);
  }
}

// ============================================================
// AKTIVITI: jejak last-seen untuk USER dan EVENT
// ============================================================
function touchUser_(ss, userId) {
  if (!userId) return;
  ['MASTER_ADMIN', 'ADMIN_EVENT'].forEach(function (name) {
    const sh = ensureSheet(ss, name, USER_HEADERS);
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(userId)) {
        sh.getRange(i + 1, 7).setValue(new Date());
        return;
      }
    }
  });
}

function touchEvent_(ss, eventId, eventName, createdBy, isUpdate) {
  if (!eventId) return;
  const sh = ensureSheet(ss, 'EVENT_ACTIVITY', EVENT_ACTIVITY_HEADERS);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(eventId)) {
      sh.getRange(i + 1, 5).setValue(now); // Last Seen
      if (isUpdate) sh.getRange(i + 1, 6).setValue(now); // Last Updated
      if (eventName) sh.getRange(i + 1, 2).setValue(eventName);
      return;
    }
  }
  sh.appendRow([eventId, eventName || '', createdBy || '', now, now, now]);
}

function removeEventActivity_(ss, eventId) {
  const sh = ss.getSheetByName('EVENT_ACTIVITY');
  if (!sh) return;
  const data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(eventId)) sh.deleteRow(i + 1);
  }
}

// ============================================================
// DELETE handlers (user + event penuh)
// ============================================================
function deleteEventFully_(ss, eventId) {
  const sheet = ensureSheet(ss, 'Trek Data', TREK_HEADERS);
  const rows = sheet.getDataRange().getValues();
  let newData = [TREK_HEADERS];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length > 0 && String(rows[i][0]).trim() !== "") {
      if (String(rows[i][0]) !== String(eventId)) {
        let r = [...rows[i]];
        while (r.length < TREK_HEADERS.length) r.push("");
        newData.push(r.slice(0, TREK_HEADERS.length));
      }
    }
  }
  sheet.clearContents();
  sheet.getRange(1, 1, newData.length, TREK_HEADERS.length).setValues(newData);
  removeEventActivity_(ss, eventId);
  // Padam juga live tracking yang berkaitan
  const lt = ss.getSheetByName('LIVE_TRACKING');
  if (lt) {
    const ld = lt.getDataRange().getValues();
    for (let i = ld.length - 1; i >= 1; i--) {
      if (String(ld[i][0]) === String(eventId)) lt.deleteRow(i + 1);
    }
  }
}

function deleteUserAndEvents_(ss, userId, role) {
  if (!userId) return { status: 'error', message: 'user_id kosong' };
  const sheetName = role === 'master' ? 'MASTER_ADMIN' : 'ADMIN_EVENT';
  const sh = ensureSheet(ss, sheetName, USER_HEADERS);
  const data = sh.getDataRange().getValues();
  let username = '';
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(userId)) {
      username = String(data[i][1] || '');
      sh.deleteRow(i + 1);
    }
  }
  // Padam semua event yang dicipta oleh user ini
  const trek = ensureSheet(ss, 'Trek Data', TREK_HEADERS);
  const rows = trek.getDataRange().getValues();
  const deletedEventIds = new Set();
  let newData = [TREK_HEADERS];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length > 0 && String(rows[i][0]).trim() !== "") {
      const creator = String(rows[i][10] || '');
      if (creator && (creator === userId || creator === username)) {
        deletedEventIds.add(String(rows[i][0]));
        continue;
      }
      let r = [...rows[i]];
      while (r.length < TREK_HEADERS.length) r.push("");
      newData.push(r.slice(0, TREK_HEADERS.length));
    }
  }
  trek.clearContents();
  trek.getRange(1, 1, newData.length, TREK_HEADERS.length).setValues(newData);
  deletedEventIds.forEach(function (id) { removeEventActivity_(ss, id); });

  // Padam license yang diikat pada user ini
  const lic = ensureLicenseSheet_(ss);
  const ldata = lic.getDataRange().getValues();
  for (let i = ldata.length - 1; i >= 1; i--) {
    if (String(ldata[i][1]) === String(userId)) lic.deleteRow(i + 1);
  }
  return { status: 'ok', deleted_events: Array.from(deletedEventIds) };
}

// ============================================================
// SENARAI untuk Master Admin (dengan last-seen)
// ============================================================
function listAllUsers_(ss) {
  const out = [];
  ['MASTER_ADMIN', 'ADMIN_EVENT'].forEach(function (name) {
    const sh = ensureSheet(ss, name, USER_HEADERS);
    const data = sh.getDataRange().getValues();
    const role = name === 'MASTER_ADMIN' ? 'master' : 'admin';
    for (let i = 1; i < data.length; i++) {
      if (!String(data[i][0]).trim()) continue;
      const lastSeen = safeDate_(data[i][6]);
      out.push({
        user_id: String(data[i][0]),
        username: String(data[i][1] || ''),
        email: String(data[i][2] || ''),
        role: role,
        registered: safeIso_(data[i][4]),
        last_seen: lastSeen ? lastSeen.toISOString() : '',
        days_since_seen: lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 86400000) : null,
        hours_since_seen: lastSeen ? Math.floor((Date.now() - lastSeen.getTime()) / 3600000) : null
      });
    }
  });
  return out;
}

function listAllEvents_(ss) {
  const trek = ensureSheet(ss, 'Trek Data', TREK_HEADERS);
  const act = ensureSheet(ss, 'EVENT_ACTIVITY', EVENT_ACTIVITY_HEADERS);
  const trekData = trek.getDataRange().getValues();
  const actData = act.getDataRange().getValues();
  const actMap = {};
  for (let i = 1; i < actData.length; i++) {
    actMap[String(actData[i][0])] = {
      last_seen: safeDate_(actData[i][4]),
      last_updated: safeDate_(actData[i][5])
    };
  }
  const events = {};
  for (let i = 1; i < trekData.length; i++) {
    const id = String(trekData[i][0] || '').trim();
    if (!id) continue;
    if (!events[id]) {
      events[id] = {
        event_id: id,
        event_name: String(trekData[i][1] || ''),
        created_by: String(trekData[i][10] || ''),
        created_at: safeIso_(trekData[i][9]),
        rows: 0
      };
    }
    events[id].rows++;
  }
  const now = Date.now();
  return Object.keys(events).map(function (id) {
    const e = events[id];
    const a = actMap[id] || {};
    const last = a.last_seen || safeDate_(e.created_at);
    e.last_seen = last ? last.toISOString() : '';
    e.last_updated = a.last_updated ? a.last_updated.toISOString() : '';
    e.days_since_seen = last ? Math.floor((now - last.getTime()) / 86400000) : null;
    e.hours_since_seen = last ? Math.floor((now - last.getTime()) / 3600000) : null;
    return e;
  });
}

// ============================================================
// doPost
// ============================================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error("Tiada payload diterima.");
    const data = JSON.parse(e.postData.contents);

    if (!isClientAllowed_(data.origin, data.path)) {
      return jsonOut_({ status: 'error', message: 'Akses disekat (domain tidak dibenarkan).' });
    }

    if (data.type === 'upload_media') {
      const folder = DriveApp.getFolderById(KONFIGURASI.FOLDER_ID);
      const decoded = Utilities.base64Decode(data.base64);
      const blob = Utilities.newBlob(decoded, data.mimeType, data.filename);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return jsonOut_({ status: 'ok', id: file.getId(), mimeType: file.getMimeType() });
    }

    if (data.type === 'delete_media' && data.media_id) {
      try {
        DriveApp.getFileById(String(data.media_id)).setTrashed(true);
        return jsonOut_({ status: 'ok' });
      } catch (err) {
        return jsonOut_({ status: 'error', message: 'Gagal padam media: ' + err });
      }
    }

    const ss = getSpreadsheet();
    setupMaster(ss);

    // Jejak aktiviti user jika user_id dihantar
    if (data.user_id) touchUser_(ss, data.user_id);

    if (data.type === 'ping_activity') {
      // Permintaan ringan untuk update last-seen sahaja
      if (data.event_id) touchEvent_(ss, data.event_id, data.event_name || '', data.user_id || '', false);
      return jsonOut_({ status: 'ok' });
    }

    if (data.type === 'update_setting') {
      const sheet = ensureSheet(ss, 'SETTINGS', ['Key', 'Value', 'Updated At']);
      const sData = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] === data.key) {
          sheet.getRange(i + 1, 2, 1, 2).setValues([[data.value, new Date()]]);
          found = true; break;
        }
      }
      if (!found) sheet.appendRow([data.key, data.value, new Date()]);
      return jsonOut_({ status: 'ok' });
    }

    if (data.type === 'live_update') {
      updateLiveTracking(ss, data);
      if (data.event_id) touchEvent_(ss, data.event_id, '', '', false);
      return jsonOut_({ status: 'ok' });
    }

    if (data.type === 'user') {
      if (data.role === 'master') {
        const sheet = ensureSheet(ss, 'MASTER_ADMIN', USER_HEADERS);
        sheet.appendRow([data.user_id || "", data.username || "", data.email || "", data.password_hash || "", new Date(), data.plain_password || "", new Date()]);
      } else {
        const sheet = ensureSheet(ss, 'ADMIN_EVENT', USER_HEADERS);
        sheet.appendRow([data.user_id || "", data.username || "", data.email || "", data.password_hash || "", new Date(), data.plain_password || "", new Date()]);
        try { createLicenseFor_(ss, data.user_id || "", data.username || "", data.email || "", 7, 'trial', 'Auto-trial 7 hari (pendaftaran)', 'SYSTEM'); } catch (eL) { }
      }
    }
    else if (data.type === 'delete_event') {
      deleteEventFully_(ss, data.event_id);
    }
    else if (data.type === 'bulk_event') {
      const sheet = ensureSheet(ss, 'Trek Data', TREK_HEADERS);
      const rows = sheet.getDataRange().getValues();
      let newData = [TREK_HEADERS];
      const targetIds = [String(data.event_id)];
      if (data.old_event_id) targetIds.push(String(data.old_event_id));

      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length > 0 && String(rows[i][0]).trim() !== "") {
          if (!targetIds.includes(String(rows[i][0]))) {
            let r = [...rows[i]];
            while (r.length < TREK_HEADERS.length) r.push("");
            newData.push(r.slice(0, TREK_HEADERS.length));
          }
        }
      }
      if (data.payloads && data.payloads.length > 0) {
        data.payloads.forEach(function (row) {
          newData.push([
            row.event_id || "", row.event_name || "", row.trek_name || "", row.trek_color || "",
            row.coordinates || "", row.checkpoint_name || "", row.lat || "", row.lng || "",
            row.type || "", new Date(), row.created_by || "", row.distance || "", row.icon || "",
            row.media_id || "", row.media_type || "", row.media_images || "",
            row.media_video_id || "", row.media_video_type || ""
          ]);
        });
      }
      sheet.clearContents();
      sheet.getRange(1, 1, newData.length, TREK_HEADERS.length).setValues(newData);

      // Kemaskini event activity
      if (data.event_id) {
        const evName = (data.payloads && data.payloads[0]) ? (data.payloads[0].event_name || '') : '';
        const creator = (data.payloads && data.payloads[0]) ? (data.payloads[0].created_by || '') : (data.user_id || '');
        touchEvent_(ss, data.event_id, evName, creator, true);
        if (data.old_event_id && data.old_event_id !== data.event_id) removeEventActivity_(ss, data.old_event_id);
      }
    }

    // ============ LICENSE HANDLERS (admin biasa) ============
    if (data.type === 'check_license') {
      const info = checkLicenseStatus_(ss, data.user_id || '');
      return jsonOut_({ status: 'ok', license: info });
    }

    if (data.type === 'apply_license_key') {
      const res = applyLicenseKey_(ss, String(data.key || '').trim().toUpperCase(), data.user_id || '', data.username || '', data.email || '');
      return jsonOut_(res);
    }

    if (data.type === 'master_license') {
      const auth = verifyMaster_(ss, data.master_username || '', data.master_password || '');
      if (!auth.ok) return jsonOut_({ status: 'error', message: 'Master auth gagal' });
      const act = data.action || 'list';
      if (act === 'list') return jsonOut_({ status: 'ok', licenses: listLicenses_(ss) });
      if (act === 'generate') {
        const r = createLicenseFor_(ss, data.user_id || '', data.username || '', data.email || '', Number(data.days) || 30, 'active', data.note || '', auth.username);
        return jsonOut_({ status: 'ok', license: r });
      }
      if (act === 'extend') return jsonOut_(extendLicense_(ss, String(data.key || '').toUpperCase(), Number(data.days) || 30));
      if (act === 'revoke') return jsonOut_(revokeLicense_(ss, String(data.key || '').toUpperCase()));
      if (act === 'update') return jsonOut_(updateLicense_(ss, String(data.key || '').toUpperCase(), data));
      if (act === 'delete') return jsonOut_(deleteLicense_(ss, String(data.key || '').toUpperCase()));
      return jsonOut_({ status: 'error', message: 'Tindakan tidak dikenali' });
    }

    // ============ MASTER ADMIN: USERS & EVENTS ============
    if (data.type === 'master_admin') {
      const auth = verifyMaster_(ss, data.master_username || '', data.master_password || '');
      if (!auth.ok) return jsonOut_({ status: 'error', message: 'Master auth gagal' });
      const act = data.action || '';
      if (act === 'list_users') return jsonOut_({ status: 'ok', users: listAllUsers_(ss) });
      if (act === 'list_events') return jsonOut_({ status: 'ok', events: listAllEvents_(ss) });
      if (act === 'delete_user') {
        const r = deleteUserAndEvents_(ss, data.target_user_id || '', data.target_role || 'admin');
        return jsonOut_(r);
      }
      if (act === 'delete_event') {
        if (!data.target_event_id) return jsonOut_({ status: 'error', message: 'event_id kosong' });
        deleteEventFully_(ss, data.target_event_id);
        return jsonOut_({ status: 'ok' });
      }
      if (act === 'cleanup_inactive') {
        // Padam user + event yang last-seen melebihi `days_threshold`
        const threshold = Number(data.days_threshold) || 90;
        const cutoff = Date.now() - threshold * 86400000;
        const removedUsers = [];
        const removedEvents = [];
        listAllUsers_(ss).forEach(function (u) {
          if (u.role === 'master') return; // jangan padam master
          const t = u.last_seen ? new Date(u.last_seen).getTime() : 0;
          if (!t || t < cutoff) { deleteUserAndEvents_(ss, u.user_id, u.role); removedUsers.push(u.user_id); }
        });
        listAllEvents_(ss).forEach(function (ev) {
          const t = ev.last_seen ? new Date(ev.last_seen).getTime() : 0;
          if (!t || t < cutoff) { deleteEventFully_(ss, ev.event_id); removedEvents.push(ev.event_id); }
        });
        return jsonOut_({ status: 'ok', removed_users: removedUsers, removed_events: removedEvents });
      }
      return jsonOut_({ status: 'error', message: 'Tindakan tidak dikenali' });
    }

    return jsonOut_({ status: 'ok', message: 'Rekod berjaya disimpan di Google Sheets' });

  } catch (err) {
    return jsonOut_({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// doGet
// ============================================================
function doGet(e) {
  try {
    var origin = (e && e.parameter) ? (e.parameter.origin || '') : '';
    var path = (e && e.parameter) ? (e.parameter.path || '') : '';
    if (!isClientAllowed_(origin, path)) {
      return jsonOut_({ status: 'error', message: 'Akses disekat (domain tidak dibenarkan).' });
    }

    if (e && e.parameter && e.parameter.action === 'ping') {
      const lock = LockService.getScriptLock();
      lock.waitLock(5000);
      try {
        const props = PropertiesService.getScriptProperties();
        let presence = {};
        try { presence = JSON.parse(props.getProperty('PRESENCE_MAP') || '{}'); } catch (ex) { presence = {}; }
        const now = Date.now();
        const sessionId = e.parameter.session_id || 'anon_' + now;
        presence[sessionId] = now;
        let activeCount = 0;
        let newPresence = {};
        for (let id in presence) {
          if (now - presence[id] <= 90000) { newPresence[id] = presence[id]; activeCount++; }
        }
        props.setProperty('PRESENCE_MAP', JSON.stringify(newPresence));
        // Jejak last-seen user jika user_id dihantar dalam ping
        if (e.parameter.user_id) {
          try { touchUser_(getSpreadsheet(), e.parameter.user_id); } catch (ex2) { }
        }
        return jsonOut_({ status: 'ok', count: activeCount });
      } catch (err) {
        return jsonOut_({ status: 'error', message: err.toString() });
      } finally { lock.releaseLock(); }
    }

    if (e && e.parameter && e.parameter.action === 'get_media' && e.parameter.media_id) {
      try {
        var file = DriveApp.getFileById(e.parameter.media_id);
        return jsonOut_({ status: 'ok', mimeType: file.getMimeType(), base64: Utilities.base64Encode(file.getBlob().getBytes()) });
      } catch (err) {
        return jsonOut_({ status: 'error', message: 'Media tidak dijumpai atau telah dipadam.' });
      }
    }

    const ss = getSpreadsheet();
    if (e && e.parameter && e.parameter.user_id) touchUser_(ss, e.parameter.user_id);

    if (e && e.parameter && e.parameter.action === 'get_live' && e.parameter.event_id) {
      const sheet = ss.getSheetByName('LIVE_TRACKING');
      let liveData = [];
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] == e.parameter.event_id) {
            liveData.push({
              participant_name: data[i][1], lat: data[i][2], lng: data[i][3],
              hr: data[i][4], spo2: data[i][5], speed: data[i][6],
              timestamp: data[i][7], icon: data[i][8] || '🏃'
            });
          }
        }
      }
      return jsonOut_({ status: 'ok', live_data: liveData });
    }

    if (e && e.parameter && e.parameter.action === 'getSharedEvent' && e.parameter.event_id) {
      const trekSheet = ss.getSheetByName('Trek Data');
      let trekData = [];
      let evName = '';
      if (trekSheet && trekSheet.getLastRow() > 1) {
        const data = trekSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]) === String(e.parameter.event_id)) {
            if (!evName) evName = String(data[i][1] || '');
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
      // Update last-seen event apabila ada yang buka
      try { touchEvent_(ss, e.parameter.event_id, evName, '', false); } catch (exE) { }

      const settingsSheet = ss.getSheetByName('SETTINGS');
      let settingsObj = { live_tracking: true };
      if (settingsSheet) {
        const sData = settingsSheet.getDataRange().getValues();
        for (let i = 1; i < sData.length; i++) {
          if (sData[i][0] === 'live_tracking') settingsObj.live_tracking = sData[i][1] === true || sData[i][1] === 'true' || sData[i][1] === 'TRUE';
        }
      }
      return jsonOut_({ status: 'ok', data: { trekData: trekData, settings: settingsObj } });
    }

    let responseData = { users: [], trekData: [] };
    setupMaster(ss);
    setupSettings(ss);

    const masterSheet = ensureSheet(ss, 'MASTER_ADMIN', USER_HEADERS);
    const adminSheet = ensureSheet(ss, 'ADMIN_EVENT', USER_HEADERS);
    const trekSheet = ensureSheet(ss, 'Trek Data', TREK_HEADERS);
    ensureSheet(ss, 'EVENT_ACTIVITY', EVENT_ACTIVITY_HEADERS);
    const settingsSheet = ss.getSheetByName('SETTINGS');

    let settingsObj = { live_tracking: true };
    if (settingsSheet) {
      const sData = settingsSheet.getDataRange().getValues();
      for (let i = 1; i < sData.length; i++) {
        if (sData[i][0] === 'live_tracking') settingsObj.live_tracking = sData[i][1] === true || sData[i][1] === 'true' || sData[i][1] === 'TRUE';
      }
    }
    responseData.settings = settingsObj;

    function pushUser(role, sh) {
      if (!sh || sh.getLastRow() <= 1) return;
      const data = sh.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        responseData.users.push({
          type: 'user', role: role,
          user_id: String(data[i][0]), username: String(data[i][1]), email: String(data[i][2]),
          password_hash: String(data[i][3]), plain_password: String(data[i][5] || ""),
          last_seen: safeIso_(data[i][6])
        });
      }
    }
    pushUser('master', masterSheet);
    pushUser('admin', adminSheet);

    if (trekSheet && trekSheet.getLastRow() > 1) {
      const data = trekSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() !== "") {
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

    return jsonOut_({ status: 'ok', data: responseData });

  } catch (err) {
    return jsonOut_({ status: 'error', message: err.toString() });
  }
}

// ============================================================
// MENU SHEET
// ============================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ SMART EVENT MAP')
    .addItem('🔐 Sahkan Akses Fail (Drive) & Mulakan Sistem', 'authorizeDrive')
    .addSeparator()
    .addItem('🔑 Reset Kata Laluan Admin', 'resetAdminPassword')
    .addSeparator()
    .addItem('🧹 Bersihkan Cache / Data Tertunggak', 'cleanUpData')
    .addItem('🗑️ Padam User & Event Tidak Aktif (>90 hari)', 'cleanInactiveUsersMenu')
    .addToUi();
}

function authorizeDrive() {
  var ui = SpreadsheetApp.getUi();
  try {
    var folderId = KONFIGURASI.FOLDER_ID || '';
    if (!folderId) { ui.alert('Ralat', 'FOLDER_ID belum diset.', ui.ButtonSet.OK); return; }
    var folder = DriveApp.getFolderById(folderId);
    ui.alert('Berjaya', 'Akses Drive OK. Folder media: ' + folder.getName(), ui.ButtonSet.OK);
  } catch (e) { ui.alert('Ralat', 'Gagal akses Drive: ' + e, ui.ButtonSet.OK); }
}

function simpleHash_(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function resetAdminPassword() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ADMIN_EVENT');
  if (!sheet) { ui.alert('Ralat', 'Sheet ADMIN_EVENT tidak dijumpai.', ui.ButtonSet.OK); return; }
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
    if (String(data[r][1] || '').trim() === key || String(data[r][2] || '').trim() === key) { rowToUpdate = r + 1; break; }
  }
  if (rowToUpdate < 0) { ui.alert('Tidak jumpa', 'Admin tidak dijumpai.', ui.ButtonSet.OK); return; }
  sheet.getRange(rowToUpdate, 4).setValue(simpleHash_(newPass));
  sheet.getRange(rowToUpdate, 6).setValue(newPass);
  ui.alert('Berjaya', 'Kata laluan telah ditetapkan semula.', ui.ButtonSet.OK);
}

function cleanUpData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Pembersihan Automatik', 'Mahu memadam log Live Tracking lama?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LIVE_TRACKING');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      ui.alert('Status', 'Berjaya dipadam.', ui.ButtonSet.OK);
    } else ui.alert('Status', 'Tiada rekod lama.', ui.ButtonSet.OK);
  }
}

function cleanInactiveUsersMenu() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Pembersihan', 'Padam user (bukan master) & event yang tidak aktif melebihi berapa hari?', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var days = Number(r.getResponseText()) || 90;
  var ss = getSpreadsheet();
  var removedU = [], removedE = [];
  var cutoff = Date.now() - days * 86400000;
  listAllUsers_(ss).forEach(function (u) {
    if (u.role === 'master') return;
    var t = u.last_seen ? new Date(u.last_seen).getTime() : 0;
    if (!t || t < cutoff) { deleteUserAndEvents_(ss, u.user_id, u.role); removedU.push(u.username); }
  });
  listAllEvents_(ss).forEach(function (ev) {
    var t = ev.last_seen ? new Date(ev.last_seen).getTime() : 0;
    if (!t || t < cutoff) { deleteEventFully_(ss, ev.event_id); removedE.push(ev.event_name || ev.event_id); }
  });
  ui.alert('Selesai', 'Dipadam ' + removedU.length + ' user dan ' + removedE.length + ' event.', ui.ButtonSet.OK);
}

// ====================================================================
// LICENSE SYSTEM
// ====================================================================
const LICENSE_HEADERS = ['License Key', 'User ID', 'Username', 'Email', 'Tarikh Mula', 'Tarikh Tamat', 'Hari Valid', 'Status', 'Nota', 'Created By', 'Created At'];

function ensureLicenseSheet_(ss) { return ensureSheet(ss, 'LICENSE', LICENSE_HEADERS); }

function genLicenseKey_() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'LIC-' + part() + '-' + part() + '-' + part();
}

function createLicenseFor_(ss, userId, username, email, days, status, note, createdBy) {
  const sheet = ensureLicenseSheet_(ss);
  if (status === 'trial' && userId) {
    const existing = findActiveLicenseByUser_(ss, userId);
    if (existing) return { key: existing.key, already: true };
  }
  const key = genLicenseKey_();
  const now = new Date();
  const expiry = new Date(now.getTime() + (Number(days) || 7) * 86400000);
  sheet.appendRow([key, userId || '', username || '', email || '', now, expiry, Number(days) || 7, status || 'active', note || '', createdBy || '', now]);
  return { key: key, start: now.toISOString(), expiry: expiry.toISOString(), days: Number(days) || 7, status: status, already: false };
}

function findActiveLicenseByUser_(ss, userId) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  let latest = null;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(userId)) {
      const startD = safeDate_(data[i][4]);
      const expiryD = safeDate_(data[i][5]);
      if (!expiryD) continue;
      const row = {
        key: String(data[i][0]), userId: String(data[i][1]), username: String(data[i][2]), email: String(data[i][3]),
        start: startD || new Date(0), expiry: expiryD, days: Number(data[i][6]) || 0,
        status: String(data[i][7] || ''), note: String(data[i][8] || ''), row: i + 1
      };
      if (row.status === 'revoked') continue;
      if (!latest || row.expiry > latest.expiry) latest = row;
    }
  }
  return latest;
}

function checkLicenseStatus_(ss, userId) {
  if (!userId) return { valid: false, status: 'no_user', days_left: 0 };
  const lic = findActiveLicenseByUser_(ss, userId);
  if (!lic) return { valid: false, status: 'none', days_left: 0 };
  const now = new Date();
  const msLeft = lic.expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / 86400000);
  const expired = msLeft <= 0;
  if (expired && lic.status !== 'expired') {
    ensureLicenseSheet_(ss).getRange(lic.row, 8).setValue('expired');
  }
  return {
    valid: !expired && lic.status !== 'revoked',
    status: expired ? 'expired' : lic.status,
    key: lic.key, days_left: Math.max(0, daysLeft),
    expiry: safeIso_(lic.expiry), start: safeIso_(lic.start), note: lic.note
  };
}

function applyLicenseKey_(ss, key, userId, username, email) {
  if (!key) return { status: 'error', message: 'Key kosong' };
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      const boundUser = String(data[i][1] || '').trim();
      if (boundUser && boundUser !== userId) return { status: 'error', message: 'Key ini telah diikat pada akaun lain' };
      const status = String(data[i][7] || '');
      if (status === 'revoked') return { status: 'error', message: 'Key telah dibatalkan' };
      const expiryD = safeDate_(data[i][5]);
      if (!expiryD || expiryD.getTime() < Date.now()) return { status: 'error', message: 'Key telah tamat tempoh' };
      if (!boundUser) sheet.getRange(i + 1, 2, 1, 3).setValues([[userId, username, email]]);
      return { status: 'ok', message: 'License aktif', license: checkLicenseStatus_(ss, userId) };
    }
  }
  return { status: 'error', message: 'Key tidak dijumpai' };
}

function listLicenses_(ss) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (!String(data[i][0] || '').trim()) continue;
    const startD = safeDate_(data[i][4]);
    const expiryD = safeDate_(data[i][5]);
    const status = String(data[i][7] || '');
    const expiryMs = expiryD ? expiryD.getTime() : 0;
    const expired = expiryMs > 0 && expiryMs < now;
    out.push({
      key: String(data[i][0]), user_id: String(data[i][1] || ''), username: String(data[i][2] || ''), email: String(data[i][3] || ''),
      start: startD ? startD.toISOString() : '', expiry: expiryD ? expiryD.toISOString() : '',
      days: Number(data[i][6]) || 0,
      status: expired && status !== 'revoked' ? 'expired' : (status || 'active'),
      note: String(data[i][8] || ''), created_by: String(data[i][9] || ''),
      days_left: expiryMs ? Math.max(0, Math.ceil((expiryMs - now) / 86400000)) : 0
    });
  }
  return out;
}

function extendLicense_(ss, key, addDays) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      const oldExpiry = safeDate_(data[i][5]);
      const baseMs = (oldExpiry && oldExpiry.getTime() > Date.now()) ? oldExpiry.getTime() : Date.now();
      const newExpiry = new Date(baseMs + (Number(addDays) || 0) * 86400000);
      sheet.getRange(i + 1, 6).setValue(newExpiry);
      sheet.getRange(i + 1, 7).setValue((Number(data[i][6]) || 0) + (Number(addDays) || 0));
      sheet.getRange(i + 1, 8).setValue('active');
      return { status: 'ok', new_expiry: newExpiry.toISOString() };
    }
  }
  return { status: 'error', message: 'Key tidak dijumpai' };
}

function revokeLicense_(ss, key) {
  const sheet = ensureLicenseSheet_(ss);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === key) {
      sheet.getRange(i + 1, 8).setValue('revoked');
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'Key tidak dijumpai' };
}

function updateLicense_(ss, key, data) {
  const sheet = ensureLicenseSheet_(ss);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === key) {
      const r = i + 1;
      if (data.username != null) sheet.getRange(r, 3).setValue(String(data.username));
      if (data.email != null) sheet.getRange(r, 4).setValue(String(data.email));
      if (data.start) {
        const sd = safeDate_(data.start);
        if (sd) sheet.getRange(r, 5).setValue(sd);
      }
      if (data.expiry) {
        const newExp = safeDate_(data.expiry);
        if (newExp) {
          sheet.getRange(r, 6).setValue(newExp);
          const start = safeDate_(rows[i][4]) || new Date();
          sheet.getRange(r, 7).setValue(Math.max(0, Math.ceil((newExp.getTime() - start.getTime()) / 86400000)));
        }
      } else if (data.days != null) {
        const start = safeDate_(rows[i][4]) || new Date();
        const newExp = new Date(start.getTime() + Number(data.days) * 86400000);
        sheet.getRange(r, 6).setValue(newExp);
        sheet.getRange(r, 7).setValue(Number(data.days));
      }
      if (data.status) sheet.getRange(r, 8).setValue(String(data.status));
      if (data.note != null) sheet.getRange(r, 9).setValue(String(data.note));
      if (data.user_id != null) sheet.getRange(r, 2).setValue(String(data.user_id));
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'Key tidak dijumpai' };
}

function deleteLicense_(ss, key) {
  const sheet = ensureLicenseSheet_(ss);
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]).toUpperCase() === key) {
      sheet.deleteRow(i + 1);
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'Key tidak dijumpai' };
}

function verifyMaster_(ss, username, password) {
  const sheet = ensureSheet(ss, 'MASTER_ADMIN', USER_HEADERS);
  const data = sheet.getDataRange().getValues();
  const hash = simpleHash_(String(password || ''));
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(username) && String(data[i][3]) === hash) {
      return { ok: true, username: String(data[i][1]), userId: String(data[i][0]) };
    }
  }
  return { ok: false };
}
