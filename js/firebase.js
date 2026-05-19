// firebase.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAnalytics, isSupported }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// ==========================================
// 🔥 FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

  apiKey: "AIzaSyAABdE2oCqWmQrEcT-FoMlveJFMgGjYmL0",

  authDomain: "attendance-mgt-797d8.firebaseapp.com",

  projectId: "attendance-mgt-797d8",

  storageBucket: "attendance-mgt-797d8.firebasestorage.app",

  messagingSenderId: "1084366071006",

  appId: "1:1084366071006:web:37b8cbd1b07cd9b1570e4f",

  measurementId: "G-2RQC388JQ7"

};

// ==========================================
// 🚀 INITIALIZE APP
// ==========================================

export const app =
  initializeApp(firebaseConfig);

// ==========================================
// 🔐 FIREBASE SERVICES
// ==========================================

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

// ==========================================
// 📊 ANALYTICS (SAFE)
// ==========================================

let analytics = null;

isSupported().then((supported)=>{

  if(supported){

    analytics =
      getAnalytics(app);

  }

}).catch((err)=>{

  console.warn(
    "Analytics unavailable",
    err
  );

});

export { analytics };