// sw.js — permite abrir la pagina sin señal (en la finca la red es irregular).
//
// Red primero: si hay señal, siempre se sirve lo mas reciente (asi cada
// despliegue llega de una vez). Si la red falla o tarda mas de LIMITE_RED_MS,
// se responde con la copia guardada. No se usa "cache primero" porque los
// archivos no llevan version en el nombre: se podria mezclar JS viejo con
// HTML nuevo despues de un despliegue.
//
// Solo se tocan peticiones GET del propio sitio. Los datos del Apps Script ya
// tienen su copia en localStorage (ver js/util/datosVivos.js); fotos y mapa
// no se guardan. Los POST (panel, subida de fotos) pasan sin cambios.

const CACHE = "ungidos-v1";
const LIMITE_RED_MS = 4000;

// Todo lo que necesita la pagina publica. Si agregas un archivo, agregalo
// aqui: pruebas/casos.js falla si falta alguno.
const ARCHIVOS = [
  "./",
  "index.html",
  "css/tokens.css",
  "css/base.css",
  "css/secciones.css",
  "js/principal.js",
  "js/config.js",
  "js/carta.js",
  "js/habitaciones.js",
  "js/programacion.js",
  "js/canciones.js",
  "js/locacion.js",
  "js/experiencias.js",
  "js/galeria.js",
  "js/imagen.js",
  "js/pie.js",
  "js/navegacion.js",
  "js/musica.js",
  "js/util/datos.js",
  "js/util/datosVivos.js",
  "js/util/red.js",
  "js/util/texto.js",
  "datos/canciones.json",
  "datos/carta.json",
  "datos/contactos.json",
  "datos/habitaciones.json",
  "datos/locacion.json",
  "datos/programacion.json",
  "fuentes/Poppins-Regular.woff2",
  "fuentes/Poppins-Medium.woff2",
  "fuentes/Poppins-SemiBold.woff2",
  "fuentes/Poppins-Bold.woff2",
  "fuentes/TAN MERINGUE.woff2",
  "img/logo-pie.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;
  if (new URL(peticion.url).origin !== self.location.origin) return;
  evento.respondWith(redPrimero(peticion));
});

async function redPrimero(peticion) {
  const cache = await caches.open(CACHE);
  // Aunque se agote el limite, si la red responde despues igual se actualiza
  // la copia para la proxima vez.
  const desdeRed = fetch(peticion).then((respuesta) => {
    if (respuesta.ok) cache.put(peticion, respuesta.clone());
    return respuesta;
  });
  try {
    return await conLimite(desdeRed, LIMITE_RED_MS);
  } catch (errorRed) {
    // ignoreSearch: "?nc=..." u otros parametros no deben impedir usar la copia.
    const guardada = await cache.match(peticion, { ignoreSearch: true });
    if (guardada) return guardada;
    // Navegando a una ruta que no esta guardada: al menos la portada.
    if (peticion.mode === "navigate") {
      const portada = await cache.match("index.html");
      if (portada) return portada;
    }
    throw errorRed;
  }
}

function conLimite(promesa, ms) {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(() => rechazar(new Error("tiempo_agotado")), ms);
    promesa.then(
      (valor) => { clearTimeout(temporizador); resolver(valor); },
      (error) => { clearTimeout(temporizador); rechazar(error); }
    );
  });
}
