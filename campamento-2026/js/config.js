// config.js — lo unico que hay que tocar al cambiar de despliegue.

export const CONFIG = {
  urlAppsScript: "https://script.google.com/macros/s/AKfycbxhfC65WqhsSUH7f2hqStQSirJcrxP6e-38rboSAlm_TaxDrEx3c3neFQAB7ETKkjVGIQ/exec",

  // Cuantas fotos se piden por tanda al hacer scroll.
  fotosPorPagina: 30,

  // Ancho de la miniatura que se pide a Drive. Se piden miniaturas, no las
  // fotos completas, porque Drive limita las peticiones a imagenes muy solicitadas.
  anchoMiniatura: 800,
};
