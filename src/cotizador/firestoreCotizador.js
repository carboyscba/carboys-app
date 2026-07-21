// ══════════════════════════════════════════════════════════════════
//  Cotizador — helpers Firestore
//
//  Recibe { fsSave, fsGetDoc } como parámetros para no acoplarse a
//  App.jsx (que define las funciones REST inline). El componente que
//  llama tiene que tener acceso a esas y pasarlas.
//
//  Colecciones nuevas (por sucursal):
//    catalogoProveedor/{provId}                      ficha proveedor
//    catalogoProveedor/{provId}/articulos/{sku}      SKU individual
//    catalogoProveedor/{provId}/kits/{kitCode}       kit pre-armado
//    catalogoProveedor/{provId}/aceites/{aceiteId}   aceites (Mobil)
//    fitment/{fitmentId}                             vehículo → filtros
//    meta/cotizador_seed                             estado de la semilla
// ══════════════════════════════════════════════════════════════════
 
const CHUNK_SIZE = 15;
 
// Divide un array en chunks
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
 
/**
 * Carga los 3 JSON semilla a Firestore de la sucursal activa.
 * Hace chunks paralelos de 15 docs para acelerar (Firestore REST no
 * tiene batch nativo desde el cliente sin SDK).
 *
 *   fsHelpers = { fsSave, fsGetDoc? }
 *   onProgress recibe (pct, message)
 */
export async function cargarSemillaInicial({ fsSave, catalogoWega, catalogoMobil, fitment, onProgress }) {
  const stats = { articulos: 0, kits: 0, aceites: 0, fitments: 0, errores: [], iniciado: new Date().toISOString() };
  const notify = (pct, msg) => onProgress && onProgress(pct, msg);
 
  // 1) Ficha del proveedor BORUR
  notify(0, "Creando ficha proveedor BORUR…");
  try {
    await fsSave("catalogoProveedor", "borur", {
      nombre: "BORUR",
      icono: "📦",
      telefono: "03564-462000",
      email: "info@borursrl.com",
      direccion: "Bv. 25 de Mayo 784, Freyre, Córdoba",
      formatoLista: "xls_borur",
      rubros: ["filtros", "aceites_motor"],
      marcas_por_rubro: {
        filtros: ["Wega"],
        aceites_motor: ["Mobil"],
      },
      ultima_actualizacion: catalogoWega.fechaLista_articulos || null,
      activo: true,
    });
  } catch (e) { stats.errores.push(`ficha borur: ${e.message}`); }
 
  // Helper: sube array en chunks paralelos
  const uploadCollection = async (label, col, items, keyField, weight) => {
    if (!items?.length) return;
    const chunks = chunk(items, CHUNK_SIZE);
    let done = 0;
    for (const c of chunks) {
      await Promise.all(c.map(async (item) => {
        try {
          await fsSave(col, item[keyField], item);
          if (col.includes("articulos")) stats.articulos++;
          else if (col.includes("kits")) stats.kits++;
          else if (col.includes("aceites")) stats.aceites++;
          else if (col === "fitment") stats.fitments++;
        } catch (e) { stats.errores.push(`${col}/${item[keyField]}: ${e.message}`); }
      }));
      done += c.length;
      notify(weight * (done / items.length), `${label}: ${done}/${items.length}…`);
    }
  };
 
  // 2) Artículos Wega (peso 45%)
  const arts = catalogoWega.articulos || [];
  await uploadCollection("Artículos Wega", "catalogoProveedor/borur/articulos", arts, "sku", 45);
 
  // 3) Kits Wega (peso 15%)
  const kits = catalogoWega.kits || [];
  await uploadCollection("Kits Wega", "catalogoProveedor/borur/kits", kits, "kitCode", 15);
 
  // 4) Aceites Mobil (peso 5%)
  const aceites = catalogoMobil.aceites || [];
  await uploadCollection("Aceites Mobil", "catalogoProveedor/borur/aceites", aceites, "id", 5);
 
  // 5) Fitments (peso 30%)
  const fits = fitment.fitments || [];
  await uploadCollection("Fitments", "fitment", fits, "fitment_id", 30);
 
  // 6) Guardar meta con el estado final
  stats.terminado = new Date().toISOString();
  try {
    await fsSave("meta", "cotizador_seed", {
      cargado: true,
      articulos: stats.articulos,
      kits: stats.kits,
      aceites: stats.aceites,
      fitments: stats.fitments,
      errores_count: stats.errores.length,
      errores_primeros: stats.errores.slice(0, 10),
      fecha_carga: stats.terminado,
      fuentes: {
        catalogo_wega: catalogoWega.fechaLista_articulos || null,
        catalogo_kits: catalogoWega.fechaLista_kits || null,
      },
    });
  } catch (e) { stats.errores.push(`meta save: ${e.message}`); }
 
  notify(100, `✅ Semilla cargada: ${stats.articulos} artículos, ${stats.kits} kits, ${stats.aceites} aceites, ${stats.fitments} fitments`);
  return stats;
}
 
/**
 * Lee el meta/cotizador_seed para saber si la semilla ya fue cargada.
 * Devuelve el objeto con stats o null si no existe.
 */
export async function getSeedStatus({ fsGetDoc }) {
  try {
    const doc = await fsGetDoc("meta", "cotizador_seed");
    return doc && doc.cargado ? doc : null;
  } catch (e) {
    return null;
  }
}
 
/**
 * Guarda una cotización nueva.
 */
export async function guardarCotizacion({ fsSave }, cotizacion) {
  const id = cotizacion.id || `cot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const data = {
    ...cotizacion,
    id,
    fecha: cotizacion.fecha || new Date().toISOString(),
    estado: cotizacion.estado || "abierta",
  };
  await fsSave("cotizaciones", id, data);
  return data;
}
 
/**
 * Marca una cotización como convertida a orden.
 */
export async function marcarCotizacionConvertida({ fsSave, fsGetDoc }, cotId, orderId) {
  const cot = await fsGetDoc("cotizaciones", cotId);
  if (!cot) return null;
  cot.estado = "convertida";
  cot.orderId = orderId;
  cot.fechaConversion = new Date().toISOString();
  await fsSave("cotizaciones", cotId, cot);
  return cot;
}
 
