// ══════════════════════════════════════════════════════════════════
//  Cotizador — helpers Firestore (Iter 3+)
//  Chunks paralelos + guarda meta/cotizador_seed con stats.
// ══════════════════════════════════════════════════════════════════

const CHUNK_SIZE = 15;
const chunk = (arr, size) => { const out = []; for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size)); return out; };

export async function cargarSemillaInicial({ fsSave, catalogoWega, catalogoMobil, fitment, onProgress }) {
  const stats = { articulos: 0, kits: 0, aceites: 0, fitments: 0, errores: [], iniciado: new Date().toISOString() };
  const notify = (pct, msg) => onProgress && onProgress(pct, msg);

  notify(0, "Creando ficha proveedor BORUR…");
  try {
    await fsSave("catalogoProveedor", "borur", {
      nombre: "BORUR", icono: "📦",
      telefono: "03564-462000", email: "info@borursrl.com",
      direccion: "Bv. 25 de Mayo 784, Freyre, Córdoba",
      formatoLista: "xls_borur",
      rubros: ["filtros", "aceites_motor"],
      marcas_por_rubro: { filtros: ["Wega"], aceites_motor: ["Mobil"] },
      ultima_actualizacion: catalogoWega.fechaLista_articulos || null,
      activo: true,
    });
  } catch (e) { stats.errores.push(`ficha borur: ${e.message}`); }

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

  await uploadCollection("Artículos Wega", "catalogoProveedor/borur/articulos", catalogoWega.articulos || [], "sku", 45);
  await uploadCollection("Kits Wega", "catalogoProveedor/borur/kits", catalogoWega.kits || [], "kitCode", 15);
  await uploadCollection("Aceites Mobil", "catalogoProveedor/borur/aceites", catalogoMobil.aceites || [], "id", 5);
  await uploadCollection("Fitments", "fitment", fitment.fitments || [], "fitment_id", 30);

  stats.terminado = new Date().toISOString();
  try {
    await fsSave("meta", "cotizador_seed", {
      cargado: true,
      articulos: stats.articulos, kits: stats.kits, aceites: stats.aceites, fitments: stats.fitments,
      errores_count: stats.errores.length, errores_primeros: stats.errores.slice(0, 10),
      fecha_carga: stats.terminado,
    });
  } catch (e) { stats.errores.push(`meta save: ${e.message}`); }

  notify(100, `✅ ${stats.articulos} artículos, ${stats.kits} kits, ${stats.aceites} aceites, ${stats.fitments} fitments`);
  return stats;
}

export async function getSeedStatus({ fsGetDoc }) {
  try {
    const doc = await fsGetDoc("meta", "cotizador_seed");
    return doc && doc.cargado ? doc : null;
  } catch (e) { return null; }
}

export async function guardarCotizacion({ fsSave }, cotizacion) {
  const id = cotizacion.id || `cot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const data = { ...cotizacion, id, fecha: cotizacion.fecha || new Date().toISOString(), estado: cotizacion.estado || "abierta" };
  await fsSave("cotizaciones", id, data);
  return data;
}

export async function marcarCotizacionConvertida({ fsSave, fsGetDoc }, cotId, orderId) {
  const cot = await fsGetDoc("cotizaciones", cotId);
  if (!cot) return null;
  cot.estado = "convertida"; cot.orderId = orderId; cot.fechaConversion = new Date().toISOString();
  await fsSave("cotizaciones", cotId, cot);
  return cot;
}
