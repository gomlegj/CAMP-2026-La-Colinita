// principal-admin.js — pide la contraseña y monta las tres secciones del panel.

import { obtenerClaveSesion, guardarClaveSesion, borrarClaveSesion, llamarApi } from "./clave.js";

async function iniciarPanel() {
  const contenedorClave = document.querySelector("#admin-clave");
  const contenedorSecciones = document.querySelector("#admin-secciones");

  /**
   * Verifica la clave y, si es valida, monta el panel. Devuelve null si entro,
   * o el codigo del problema: "clave_incorrecta" solo cuando el servidor lo
   * dice; cualquier otro fallo (red, pagina de error de Google) es otro codigo.
   */
  async function intentarConClave(clave) {
    try {
      await llamarApi("verificarClave", null, clave);
    } catch (error) {
      return error.message;
    }
    guardarClaveSesion(clave);
    // La clave ya es valida: un fallo al montar un panel no es culpa de la clave.
    await montarSecciones(clave).catch((error) => console.error("No se pudo montar el panel:", error));
    return null;
  }

  async function montarSecciones(clave) {
    contenedorClave.hidden = true;
    contenedorSecciones.hidden = false;

    const [habitacionesPanel, programacionPanel, cancionesPanel, experienciasPanel] = await Promise.all([
      import("./habitaciones-panel.js"),
      import("./programacion-panel.js"),
      import("./canciones-panel.js"),
      import("./experiencias-panel.js"),
    ]);

    const seccionHabitaciones = document.createElement("section");
    seccionHabitaciones.className = "admin-seccion";
    const seccionProgramacion = document.createElement("section");
    seccionProgramacion.className = "admin-seccion";
    const seccionCanciones = document.createElement("section");
    seccionCanciones.className = "admin-seccion";
    const seccionExperiencias = document.createElement("section");
    seccionExperiencias.className = "admin-seccion";

    contenedorSecciones.append(seccionHabitaciones, seccionProgramacion, seccionCanciones, seccionExperiencias);

    await habitacionesPanel.iniciar(seccionHabitaciones, clave);
    await programacionPanel.iniciar(seccionProgramacion, clave);
    await cancionesPanel.iniciar(seccionCanciones, clave);
    await experienciasPanel.iniciar(seccionExperiencias, clave);
  }

  const formulario = document.querySelector("#admin-clave-formulario");
  const campoClave = document.querySelector("#admin-clave-campo");
  const errorClave = document.querySelector("#admin-clave-error");

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorClave.textContent = "Verificando…";
    const problema = await intentarConClave(campoClave.value);
    if (problema === "clave_incorrecta") {
      errorClave.textContent = "Contraseña incorrecta.";
      borrarClaveSesion();
    } else if (problema) {
      errorClave.textContent = "No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.";
    }
  });

  const claveGuardada = obtenerClaveSesion();
  if (claveGuardada) {
    const problema = await intentarConClave(claveGuardada);
    if (problema === "clave_incorrecta") borrarClaveSesion();
  }
}

iniciarPanel().catch((error) => {
  console.error("No se pudo iniciar el panel:", error);
});
