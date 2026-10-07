// musica.js — la cancion lema, con el reproductor oficial de YouTube.
//
// No se descarga ni se aloja el audio: suena desde YouTube, embebido. Sus
// politicas no permiten un reproductor oculto que solo suene de fondo, asi que
// mientras suena el recuadro siempre esta a la vista; cerrarlo quita el
// reproductor y detiene la musica. Nada de YouTube se carga hasta que la
// persona toca el boton.

export const VIDEO_ID = "lkhZ5ndtcpQ";
const TITULO = "Yo navegaré — Jose Realpe (cover)";

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
  boton.textContent = "🎵";

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

  function abrir() {
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
    cerrar.focus();
  }

  function cerrarPanel() {
    // Quitar el iframe es lo que detiene la musica.
    marco.replaceChildren();
    panel.hidden = true;
    boton.hidden = false;
    boton.setAttribute("aria-expanded", "false");
    boton.focus();
  }

  boton.addEventListener("click", abrir);
  cerrar.addEventListener("click", cerrarPanel);

  contenedor.append(boton, panel);
}
