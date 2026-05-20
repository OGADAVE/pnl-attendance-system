const CACHE_NAME = "peaknova-v1";

const FILES_TO_CACHE = [

  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./admin.html",
  "./kiosk.html",

  "./js/firebase.js",
  "./js/auth.js",
  "./js/app.js",

  "./images/pln-logo.jpg"

];

// INSTALL

self.addEventListener("install", (event)=>{

  event.waitUntil(

    caches.open(CACHE_NAME)
    .then((cache)=>{

      return cache.addAll(FILES_TO_CACHE);

    })

  );

});

// ACTIVATE

self.addEventListener("activate", ()=>{

  console.log("Service Worker Activated");

});

// FETCH

self.addEventListener("fetch", (event)=>{

  event.respondWith(

    caches.match(event.request)
    .then((response)=>{

      return response || fetch(event.request);

    })

  );

});