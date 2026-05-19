// auth.js

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================
// PAGE PROTECTION + ROLE VALIDATION
// ======================================

export function protectPage(requiredRole, callback) {

  onAuthStateChanged(auth, async (user) => {

    // Not logged in
    if (!user) {

      window.location.href = "login.html";
      return;

    }

    try {

      // Load Firestore profile
      const userRef =
        doc(db, "users", user.uid);

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {

        await signOut(auth);

        window.location.href =
          "login.html";

        return;

      }

      const userData =
        userSnap.data();

      // Wrong role
      if (
        requiredRole &&
        userData.role !== requiredRole
      ) {

        alert("Unauthorized access");

        window.location.href =
          "login.html";

        return;

      }

      callback(user, userData);

    } catch (err) {

      console.error(err);

      window.location.href =
        "login.html";

    }

  });

}

// ======================================
// LOGOUT
// ======================================

export async function logoutUser() {

  await signOut(auth);

  window.location.href =
    "login.html";

}