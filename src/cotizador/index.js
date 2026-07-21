// ══════════════════════════════════════════════════════════════════
//  Cotizador — API pública del módulo
//
//  Este es el punto de entrada oficial. App.jsx y componentes futuros
//  importan desde acá:
//     import { cotizarService, loadFitment, ... } from "./cotizador";
//
//  Nada de acá se ejecuta al importar; todo es lazy (los JSON se cargan
//  con fetch() la primera vez que se piden).
// ══════════════════════════════════════════════════════════════════

export {
  loadCatalogoWega,
  loadCatalogoMobil,
  loadFitment,
  loadAllSeedData,
  getSkuIndex,
  getKitIndex,
  getAceiteIndex,
  getFitmentByKit,
  invalidateCache,
} from "./dataLoader.js";

export {
  DEFAULT_COTIZADOR_CONFIG,
  precioPorLitroDeAceite,
  costoMateriales,
  cotizarService,
  precioFinalCliente,
  zonaDePrecio,
  buildCotizadorSnapshot,
  findFitment,
} from "./engine.js";

export {
  cargarSemillaInicial,
  guardarCotizacion,
  marcarCotizacionConvertida,
} from "./firestoreCotizador.js";

export { runAmarokTest } from "./amarokTest.js";

// ── Dev helper: exponer el motor en window para probar desde consola ──
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-undef
  window.__cotizador = {
    async test() {
      const { runAmarokTest } = await import("./amarokTest.js");
      return runAmarokTest();
    },
    async data() {
      const { loadAllSeedData } = await import("./dataLoader.js");
      return loadAllSeedData();
    },
  };
}
