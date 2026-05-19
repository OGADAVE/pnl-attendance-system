// sync.js

const STORAGE_KEY =
  "offlineAttendance";

// ==========================================
// 💾 SAVE OFFLINE RECORD
// ==========================================

export function saveOffline(data){

  try {

    const records =
      getOfflineRecords();

    // Prevent duplicate
    const exists =
      records.find(

        item =>

          item.userId === data.userId &&
          item.date === data.date

      );

    if(exists){

      return false;

    }

    records.push({

      ...data,

      offlineId:
        crypto.randomUUID(),

      savedAt:
        new Date().toISOString()

    });

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(records)

    );

    return true;

  } catch(err){

    console.error(
      "Offline save failed",
      err
    );

    return false;

  }

}

// ==========================================
// 📦 GET OFFLINE RECORDS
// ==========================================

export function getOfflineRecords(){

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if(!raw){

      return [];

    }

    const parsed =
      JSON.parse(raw);

    // Ensure array
    if(!Array.isArray(parsed)){

      return [];

    }

    return parsed;

  } catch(err){

    console.error(
      "Offline records corrupted",
      err
    );

    return [];

  }

}

// ==========================================
// 🧹 CLEAR ALL OFFLINE RECORDS
// ==========================================

export function clearOfflineRecords(){

  localStorage.removeItem(
    STORAGE_KEY
  );

}

// ==========================================
// ❌ REMOVE SINGLE RECORD
// ==========================================

export function removeOfflineRecord(
  offlineId
){

  try {

    const records =
      getOfflineRecords();

    const filtered =
      records.filter(

        item =>

          item.offlineId !==
          offlineId

      );

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(filtered)

    );

  } catch(err){

    console.error(
      "Failed removing offline record",
      err
    );

  }

}