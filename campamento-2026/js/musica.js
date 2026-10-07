// musica.js — la cancion lema, con el reproductor oficial de YouTube.
//
// No se descarga ni se aloja el audio: suena desde YouTube, embebido. Sus
// politicas no permiten un reproductor oculto que solo suene de fondo, asi que
// mientras suena el recuadro siempre esta a la vista; cerrarlo quita el
// reproductor y detiene la musica.
//
// Ningun navegador deja sonar audio al abrir la pagina sin que la persona
// haya tocado algo. Lo mas cercano: el reproductor se abre con el primer
// toque o tecla en cualquier parte. Si la persona lo cierra, se recuerda en
// su telefono y no vuelve a abrirse solo hasta que toque el boton otra vez.

export const VIDEO_ID = "lkhZ5ndtcpQ";
const TITULO = "Yo navegaré — Jose Realpe (cover)";
const CLAVE_CERRADA = "ungidos:musica-cerrada";

/** true si la musica debe abrirse sola con el primer toque. */
export function debeAbrirseSola(almacen = globalThis.localStorage) {
  try {
    return almacen?.getItem(CLAVE_CERRADA) !== "1";
  } catch {
    return true;
  }
}

/** Guarda si la persona cerro la musica (true) o la volvio a abrir (false). */
export function recordarCerrada(cerrada, almacen = globalThis.localStorage) {
  try {
    if (cerrada) almacen?.setItem(CLAVE_CERRADA, "1");
    else almacen?.removeItem(CLAVE_CERRADA);
  } catch {
    // Almacenamiento bloqueado: solo se pierde el recuerdo de la preferencia.
  }
}

/** URL del reproductor en modo de privacidad mejorada, arrancando al abrirlo. */
export function urlReproductor(videoId = VIDEO_ID) {
  const parametros = new URLSearchParams({ autoplay: "1", rel: "0", playsinline: "1" });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${parametros}`;
}

export function iniciar(contenedor) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "musica__boton";
  boton.setAttribute("aria-label", "Escuchar la canción lema");
  boton.setAttribute("aria-expanded", "false");
  boton.append(crearIconoNota());

  const panel = document.createElement("div");
  panel.className = "musica__panel";
  panel.hidden = true;

  const cabecera = document.createElement("div");
  cabecera.className = "musica__cabecera";
  const titulo = document.createElement("span");
  titulo.className = "musica__titulo";
  titulo.textContent = TITULO;
  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "musica__cerrar";
  cerrar.setAttribute("aria-label", "Cerrar y detener la música");
  cerrar.textContent = "✕";
  cabecera.append(titulo, cerrar);

  const marco = document.createElement("div");
  marco.className = "musica__marco";
  panel.append(cabecera, marco);

  // `desdeBoton`: la persona lo pidio; si se abre solo, no se le roba el foco.
  function abrir(desdeBoton) {
    dejarDeEsperarToque();
    if (!panel.hidden) return;
    const reproductor = document.createElement("iframe");
    reproductor.className = "musica__reproductor";
    reproductor.src = urlReproductor();
    reproductor.title = TITULO;
    reproductor.allow = "autoplay; encrypted-media; picture-in-picture";
    reproductor.referrerPolicy = "strict-origin-when-cross-origin";
    marco.replaceChildren(reproductor);
    panel.hidden = false;
    boton.hidden = true;
    boton.setAttribute("aria-expanded", "true");
    if (desdeBoton) {
      recordarCerrada(false);
      cerrar.focus();
    }
  }

  function cerrarPanel() {
    recordarCerrada(true);
    // Quitar el iframe es lo que detiene la musica.
    marco.replaceChildren();
    panel.hidden = true;
    boton.hidden = false;
    boton.setAttribute("aria-expanded", "false");
    boton.focus();
  }

  // click y keydown son los eventos que el navegador acepta como permiso
  // para reproducir con sonido (deslizar la pantalla no cuenta).
  const EVENTOS_DE_TOQUE = ["click", "keydown"];
  function alPrimerToque(evento) {
    // Los botones del propio reproductor ya hacen lo suyo.
    if (contenedor.contains(evento.target)) return;
    abrir(false);
  }
  function dejarDeEsperarToque() {
    EVENTOS_DE_TOQUE.forEach((tipo) => document.removeEventListener(tipo, alPrimerToque, true));
  }

  boton.addEventListener("click", () => abrir(true));
  cerrar.addEventListener("click", cerrarPanel);

  contenedor.append(boton, panel);

  if (debeAbrirseSola()) {
    EVENTOS_DE_TOQUE.forEach((tipo) => document.addEventListener(tipo, alPrimerToque, true));
  }
}

/** Nota musical en SVG: el emoji cambia de color y forma segun el telefono. */
function crearIconoNota() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "musica__icono");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const trazo = document.createElementNS(ns, "path");
  trazo.setAttribute("d", "M9 18.5a3 3 0 1 1-2-2.83V5.6l12-2.6v12.5a3 3 0 1 1-2-2.83V6.1l-8 1.73V18.5Z");
  svg.append(trazo);
  return svg;
}
