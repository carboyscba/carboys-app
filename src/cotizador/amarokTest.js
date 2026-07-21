// ══════════════════════════════════════════════════════════════════
//  Cotizador — Test manual del ejercicio Amarok
//
//  Uso: desde la consola del navegador ejecutar:
//    import("/src/cotizador/amarokTest.js").then(m => m.runAmarokTest())
//
//  O importar y llamar desde cualquier componente durante desarrollo.
//
//  Valida el ejercicio del documento V1 (Anexo A):
//    Amarok 2.0 TD 180cv 2016→, Service Full, 7L Super 2000 10W-40 granel
//    → Materiales $92.782, Costo total $212.782, Venta óptima $425.564.
// ══════════════════════════════════════════════════════════════════

import { loadFitment, loadCatalogoMobil, getKitIndex, getSkuIndex, getAceiteIndex } from "./dataLoader.js";
import { cotizarService, precioFinalCliente, zonaDePrecio } from "./engine.js";

export async function runAmarokTest() {
  console.log("═══════════════════════════════════════════════");
  console.log("  🧮 TEST — Ejercicio Amarok Service Full");
  console.log("═══════════════════════════════════════════════");

  const [fit, mobil, kitIdx, skuIdx, aceiteIdx] = await Promise.all([
    loadFitment(), loadCatalogoMobil(),
    getKitIndex(), getSkuIndex(), getAceiteIndex()
  ]);

  const fitAmarok = (fit.fitments || []).find(f => f.kit_code === "WKU-2001");
  if (!fitAmarok) throw new Error("No se encontró el fitment WKU-2001 (Amarok 2016+ 180cv)");

  const aceiteSuper2000 = aceiteIdx["mobil_super2000_10w40"];
  if (!aceiteSuper2000) throw new Error("No se encontró el aceite mobil_super2000_10w40");

  console.log("Fitment encontrado:", fitAmarok.kit_nombre, "→", fitAmarok.marca, fitAmarok.modelo);
  console.log("SKUs:", { aire: fitAmarok.sku_aire, aceite: fitAmarok.sku_aceite, comb: fitAmarok.sku_combustible, hab: fitAmarok.sku_habitaculo });

  const extracto = await cotizarService({
    fitment: fitAmarok,
    aceite: aceiteSuper2000,
    litros: 7,
    moHoras: 1,
    trabajo: "service_full",
    presentacionAceite: "granel",
    kitIndex: kitIdx,
    skuIndex: skuIdx,
  });

  console.log("");
  console.log("📦 MATERIALES:");
  console.log("  Filtros (KIT WKU-2001):", extracto.materiales.filtros.precio.toLocaleString("es-AR"), "sin IVA");
  console.log("  Aceite Super 2000 10W-40 granel × 7L @", extracto.materiales.aceite.precio_por_litro, "→", extracto.materiales.aceite.total.toLocaleString("es-AR"));
  console.log("  Subtotal materiales:", extracto.materiales.subtotal_sin_iva.toLocaleString("es-AR"), "sin IVA");
  console.log("");
  console.log("🔧 M.O.:", extracto.manoObra.total.toLocaleString("es-AR"), "sin IVA");
  console.log("");
  console.log("🔻 Venta mínima:", extracto.ventaMinima.toLocaleString("es-AR"), "sin IVA / ", extracto.ventaMinimaConIva.toLocaleString("es-AR"), "con IVA");
  console.log("🔻 Venta óptima:", extracto.ventaOptima.toLocaleString("es-AR"), "sin IVA / ", extracto.ventaOptimaConIva.toLocaleString("es-AR"), "con IVA");
  console.log("🔺 Techo:", extracto.techoCompetitivo || "pendiente (falta precio oficial VW)");

  // Ejemplo de precio $510k sin IVA (venta real actual)
  const precioActual = 510000;
  const precioActualConIva = precioActual * 1.21;
  const clienteTarjeta = precioFinalCliente({ precioBaseConIva: precioActualConIva, metodo: "tarjeta", config: extracto.config });
  const clienteEfectivo = precioFinalCliente({ precioBaseConIva: precioActualConIva, metodo: "efectivo", config: extracto.config });
  const zona = zonaDePrecio({ precioSinIva: precioActual, ventaMinima: extracto.ventaMinima, ventaOptima: extracto.ventaOptima, techoCompetitivo: extracto.techoCompetitivo });

  console.log("");
  console.log("💳 Con tarjeta:", clienteTarjeta.total.toLocaleString("es-AR"));
  console.log("💵 Con efectivo (15% off):", clienteEfectivo.total.toLocaleString("es-AR"), "(ahorro $", clienteEfectivo.ahorro, ")");
  console.log("🎯 Zona:", zona.zona, "color:", zona.color, "-", zona.label);

  // Validación esperada
  const esperado = { materiales: 92782, costoTotal: 212782, ventaOptima: 425564 };
  const diff = {
    materiales: Math.abs(extracto.materiales.subtotal_sin_iva - esperado.materiales),
    costoTotal: Math.abs(extracto.ventaMinima - esperado.costoTotal),
    ventaOptima: Math.abs(extracto.ventaOptima - esperado.ventaOptima),
  };
  const pass = diff.materiales < 5 && diff.costoTotal < 5 && diff.ventaOptima < 10;

  console.log("");
  console.log(pass ? "✅ TEST PASADO — diferencias son solo por redondeo." : "❌ TEST FALLIDO", diff);

  return { extracto, pass, diff };
}
