// carta.js — portada y sobre animado. No conoce ninguna otra seccion.

import { cargarJSON, montarSeccion } from "./util/datos.js";

export function iniciar(contenedor) {
  return montarSeccion(
    contenedor,
    () => cargarJSON("datos/carta.json"),
    pintarPortada
  );
}

function pintarPortada(contenedor, carta) {
  // El fondo con resplandor y las brasas ocupan toda la seccion, no solo el contenedor centrado.
  contenedor.classList.add("portada-escena");
  contenedor.append(construirBrasas());

  const envoltorio = document.createElement("div");
  envoltorio.className = "portada contenedor";
  envoltorio.append(construirLlama());

  const lema = document.createElement("h1");
  lema.className = "portada__lema";
  // El lema grande y, debajo, la frase que lo completa en letra menor.
  const palabra = document.createElement("span");
  palabra.textContent = "UNGIDOS";
  const frase = document.createElement("span");
  frase.className = "portada__sublema";
  frase.textContent = "Por el poder del Espíritu Santo";
  lema.append(palabra, frase);

  const marca = document.createElement("p");
  marca.className = "portada__marca";
  marca.textContent = "CAMP 2026";

  // El boton pill del boceto: lleva directo a la seccion de habitaciones.
  const aHabitacion = document.createElement("a");
  aHabitacion.className = "pill portada__pill";
  aHabitacion.href = "#habitaciones";
  aHabitacion.textContent = "Conoce tu habitación";

  envoltorio.append(lema, marca, construirSobre(carta), aHabitacion);
  contenedor.append(envoltorio);
}

/** Reparte un rotulo en dos lineas: la primera palabra arriba, el resto abajo. */
function partirEnDosLineas(texto) {
  const [primera, ...resto] = texto.split(" ");
  return [primera, resto.join(" ")];
}

function construirSobre(carta) {
  const bloque = document.createElement("div");
  bloque.className = "sobre";

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "sobre__tapa";
  boton.id = "sobre";
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", "sobre-contenido");

  const interior = document.createElement("span");
  interior.className = "sobre__interior";

  const vista = document.createElement("span");
  vista.className = "sobre__carta-vista";

  const linea1 = document.createElement("span");
  linea1.className = "sobre__linea";
  const linea2 = document.createElement("span");
  linea2.className = "sobre__linea";
  const [primeraLinea, segundaLinea] = partirEnDosLineas(carta.titulo || "Carta para ti");
  linea1.textContent = primeraLinea;
  linea2.textContent = segundaLinea;
  vista.append(linea1, linea2);

  const cuerpo = document.createElement("span");
  cuerpo.className = "sobre__cuerpo";

  const pliegue = document.createElement("span");
  pliegue.className = "sobre__pliegue";
  pliegue.setAttribute("aria-hidden", "true");

  const sello = document.createElement("span");
  sello.className = "sobre__sello";
  sello.textContent = "UNGIDOS";

  cuerpo.append(pliegue, sello);
  interior.append(vista, cuerpo);
  boton.append(interior);

  const hoja = document.createElement("div");
  hoja.className = "sobre__hoja";
  hoja.id = "sobre-contenido";
  hoja.hidden = true;

  const titulo = document.createElement("h2");
  titulo.className = "sobre__titulo";
  titulo.textContent = carta.titulo || "Carta para ti";
  hoja.append(titulo);

  // Cada parrafo es texto, o { cita, referencia } para un versiculo destacado.
  for (const parrafo of carta.parrafos || []) {
    if (parrafo && typeof parrafo === "object") {
      hoja.append(construirCita(parrafo));
      continue;
    }
    const p = document.createElement("p");
    p.textContent = parrafo;
    hoja.append(p);
  }

  if (carta.firma) {
    const firma = document.createElement("p");
    firma.className = "sobre__firma";
    firma.textContent = carta.firma;
    hoja.append(firma);
  }

  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    bloque.classList.toggle("sobre--abierto", !abierto);
    hoja.hidden = abierto;
    const [nuevaPrimera, nuevaSegunda] = partirEnDosLineas(
      abierto ? (carta.titulo || "Carta para ti") : "Cerrar la carta"
    );
    linea1.textContent = nuevaPrimera;
    linea2.textContent = nuevaSegunda;
  });

  bloque.append(boton, hoja);
  return bloque;
}

/** Versiculo destacado de la carta: la cita en negrita y, debajo, su referencia. */
function construirCita({ cita, referencia }) {
  const bloque = document.createElement("blockquote");
  bloque.className = "sobre__cita";

  const texto = document.createElement("p");
  texto.className = "sobre__cita-texto";
  texto.textContent = cita || "";
  bloque.append(texto);

  if (referencia) {
    const pie = document.createElement("p");
    pie.className = "sobre__cita-referencia";
    pie.textContent = `— ${referencia}`;
    bloque.append(pie);
  }
  return bloque;
}

const SVG = "http://www.w3.org/2000/svg";

/** La llama dorada sobre el lema. Decorativa: el lector de pantalla la ignora. */
function construirLlama() {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "portada__llama");
  svg.setAttribute("viewBox", "0 0 24 28");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const exterior = document.createElementNS(SVG, "path");
  exterior.setAttribute("class", "portada__llama-exterior");
  exterior.setAttribute(
    "d",
    "M12 1C13.5 6 19 9.5 19 17c0 5.5-3.1 9-7 9s-7-3.5-7-8.5c0-4 2.5-6.5 4-8.5.3 2.5 1.3 4 2.6 4.6C11 9.5 11.3 5 12 1Z"
  );
  const interior = document.createElementNS(SVG, "path");
  interior.setAttribute("class", "portada__llama-interior");
  interior.setAttribute(
    "d",
    "M12 14c1 2.5 3.5 4 3.5 7 0 2.3-1.6 4-3.5 4s-3.5-1.7-3.5-3.8c0-2.2 1.5-3.7 2.3-4.8.4 1.2.9 1.8 1.5 2.1-.4-1.5-.4-3 .7-4.5Z"
  );
  svg.append(exterior, interior);
  return svg;
}

// Posicion horizontal (%), retraso (s), duracion (s) y tamaño (px) de cada brasa.
// Fijas en vez de aleatorias: la portada se ve igual en cada visita.
const BRASAS = [
  [8, 0, 9, 4], [17, 3.5, 11, 3], [26, 6, 8, 5], [34, 1.5, 12, 3],
  [43, 7.5, 10, 4], [51, 2.5, 9, 3], [59, 5, 11, 5], [67, 0.8, 10, 3],
  [75, 4.2, 12, 4], [83, 6.8, 9, 3], [91, 2, 11, 4], [97, 8.5, 10, 3],
];

/** Brasas que suben despacio por la portada. Decorativas. */
function construirBrasas() {
  const capa = document.createElement("div");
  capa.className = "portada__brasas";
  capa.setAttribute("aria-hidden", "true");
  for (const [x, retraso, duracion, tamano] of BRASAS) {
    const brasa = document.createElement("span");
    brasa.className = "portada__brasa";
    brasa.style.setProperty("--x", `${x}%`);
    brasa.style.setProperty("--retraso", `${retraso}s`);
    brasa.style.setProperty("--duracion", `${duracion}s`);
    brasa.style.setProperty("--tam", `${tamano}px`);
    capa.append(brasa);
  }
  return capa;
}
