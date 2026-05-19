// app.js

import { auth, db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAttendanceStatus,
  getTodayDate,
  getLocation
} from "./utils.js";

import {
  saveOffline,
  getOfflineRecords,
  clearOfflineRecords
} from "./sync.js";

// ==========================================
// 📷 Capture Camera Image
// ==========================================

export function captureImage(videoElement) {

  const canvas = document.createElement("canvas");

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(videoElement, 0, 0);

  return canvas.toDataURL("image/jpeg");

}

// ==========================================
// 🎥 Start Camera
// ==========================================

export async function startCamera(videoElement) {

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  videoElement.srcObject = stream;

}

// ==========================================
// 🔥 CHECK-IN ENGINE
// ==========================================

export async function checkIn({
  videoElement = null,
  method = "mobile"
}) {

  try {

    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not logged in");
    }

    const status = getAttendanceStatus();

    // 🚫 Too late
    if (status === "blocked") {
      throw new Error("Check-in blocked after 9:00 AM");
    }

    const today = getTodayDate();

    const attendanceRef = doc(
      db,
      "attendance",
      `${user.uid}_${today}`
    );

    // Prevent duplicate check-in
    const existing = await getDoc(attendanceRef);

    if (existing.exists()) {
      throw new Error("Already checked in today");
    }

    // 🌍 GPS
    let location = null;

    try {
      location = await getLocation();
    } catch (err) {
      console.warn("GPS unavailable");
    }

    // 📷 Selfie
    let selfieUrl = "";

    if (videoElement) {
      selfieUrl = captureImage(videoElement);
    }

    const payload = {

      userId: user.uid,

      date: today,

      checkInTime: new Date().toISOString(),

      status,

      method,

      location,

      selfieUrl,

      offline: !navigator.onLine,

      synced: navigator.onLine,

      overridden: false

    };

    // ==========================================
    // 🌐 ONLINE MODE
    // ==========================================

    if (navigator.onLine) {

      await setDoc(attendanceRef, payload);

      return {
        success: true,
        message: "Checked in successfully"
      };

    }

    // ==========================================
    // 📡 OFFLINE MODE
    // ==========================================

    saveOffline(payload);

    return {
      success: true,
      message: "Saved offline. Will sync automatically."
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ==========================================
// 🚪 CHECK-OUT ENGINE
// ==========================================

export async function checkOut() {

  try {

    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not logged in");
    }

    const now = new Date();

    const totalMinutes =
      now.getHours() * 60 + now.getMinutes();

    // 🚫 Too early
    if (totalMinutes < 990) {
      throw new Error("Cannot check out before 4:30 PM");
    }

    // 🚫 Too late
    if (totalMinutes > 1110) {
      throw new Error("Check-out closed after 6:30 PM");
    }

    const today = getTodayDate();

    const attendanceRef = doc(
      db,
      "attendance",
      `${user.uid}_${today}`
    );

    const attendanceSnap =
      await getDoc(attendanceRef);

    if (!attendanceSnap.exists()) {
      throw new Error("No check-in found");
    }

    const existingData = attendanceSnap.data();

    await setDoc(attendanceRef, {

      ...existingData,

      checkOutTime: now.toISOString()

    });

    return {
      success: true,
      message: "Checked out successfully"
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ==========================================
// 🔄 OFFLINE AUTO SYNC
// ==========================================

export async function syncOfflineAttendance() {

  // No internet
  if (!navigator.onLine) return;

  const records = getOfflineRecords();

  if (!records.length) return;

  try {

    for (const record of records) {

      const attendanceRef = doc(
        db,
        "attendance",
        `${record.userId}_${record.date}`
      );

      await setDoc(attendanceRef, {

        ...record,

        synced: true,
        offline: true

      });

    }

    clearOfflineRecords();

    console.log("Offline sync completed");

  } catch (error) {

    console.error("Sync failed", error);

  }

}

// ==========================================
// 🌐 AUTO INTERNET LISTENER
// ==========================================

window.addEventListener("online", () => {

  console.log("Internet restored");

  syncOfflineAttendance();

});

// ==========================================
// 🔐 BIOMETRIC AUTH (WebAuthn)
// ==========================================

export async function verifyBiometric() {

  try {

    await navigator.credentials.get({

      publicKey: {

        challenge: new Uint8Array(32),

        timeout: 60000,

        userVerification: "required"

      }

    });

    return {
      success: true,
      message: "Biometric verified"
    };

  } catch (error) {

    return {
      success: false,
      message: "Biometric verification failed"
    };

  }

}