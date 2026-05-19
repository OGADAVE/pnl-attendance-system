// utils.js

// ==========================================
// 🏢 OFFICE LOCATION
// ==========================================

export const OFFICE_LOCATION = {

  lat: 9.0667,
  lng: 7.4833

};

// Allowed radius in meters
export const ALLOWED_RADIUS = 150;

// ==========================================
// ⏰ ATTENDANCE STATUS
// ==========================================

export function getAttendanceStatus(){

  const now = new Date();

  const totalMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  // Before 8:30 AM
  if(totalMinutes <= 510){

    return "present";

  }

  // 8:31 AM - 9:00 AM
  if(totalMinutes <= 540){

    return "late";

  }

  // After 9:00 AM
  return "blocked";

}

// ==========================================
// 📅 TODAY DATE
// ==========================================

export function getTodayDate(){

  return new Date()
    .toISOString()
    .split("T")[0];

}

// ==========================================
// 🌍 GET GPS LOCATION
// ==========================================

export async function getLocation(){

  return new Promise((resolve, reject)=>{

    if(!navigator.geolocation){

      reject(
        new Error(
          "Geolocation unsupported"
        )
      );

      return;

    }

    navigator.geolocation.getCurrentPosition(

      (position)=>{

        const coords = {

          lat:
            position.coords.latitude,

          lng:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy

        };

        // Reject poor GPS accuracy
        if(coords.accuracy > 100){

          reject(
            new Error(
              "Poor GPS signal"
            )
          );

          return;

        }

        resolve(coords);

      },

      (error)=>{

        reject(error);

      },

      {

        enableHighAccuracy:true,

        timeout:15000,

        maximumAge:0

      }

    );

  });

}

// ==========================================
// 📏 DISTANCE CALCULATOR
// Haversine Formula
// ==========================================

export function calculateDistance(

  lat1,
  lon1,
  lat2,
  lon2

){

  const R = 6371e3;

  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;

  const Δφ =
    (lat2-lat1) * Math.PI/180;

  const Δλ =
    (lon2-lon1) * Math.PI/180;

  const a =

    Math.sin(Δφ/2) *
    Math.sin(Δφ/2)

    +

    Math.cos(φ1) *
    Math.cos(φ2)

    *

    Math.sin(Δλ/2) *
    Math.sin(Δλ/2);

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    );

  return R * c;

}

// ==========================================
// 🏢 VALIDATE OFFICE LOCATION
// ==========================================

export function isWithinOfficeRadius(
  userLocation
){

  const distance =
    calculateDistance(

      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng,

      userLocation.lat,
      userLocation.lng

    );

  return distance <= ALLOWED_RADIUS;

}