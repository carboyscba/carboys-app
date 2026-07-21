// ══════════════════════════════════════════════════════════════════
//  Cotizador — helpers Firestore
//
//  Usa las mismas colecciones REST helper que App.jsx (fsSave, fsGetDoc,
//  fsGetCol). NO importa fsSave directamente porque App.jsx no las
//  exporta — este archivo expone funciones que RECIBEN el helper como
//  parámetro, para ser llamadas desde componentes que sí tienen acceso.
//
//  Colecciones nuevas (por sucursal):
//    catalogoProveedor/{provId}                      ficha del proveedor
//    catalogoProveedor/{provId}/articulos/{sku}      SKU individual
//    catalogoProveedor/{provId}/kits/{kitCode}       kit pre-armado
//    fitment/{fitmentId}                             vehículo → filtros
//    cotizaciones/{cotId}                            cotización emitida
//    concesionarias/{marcaId}                        marca con icono
//    concesionarias/{marcaId}/modelos/{modeloId}     precio oficial por modelo
//
//  En Fase 1 este archivo solo tiene las funciones — la persistencia
//  real se dispara desde Config → Lista Proveedores (iteración futura).
// ══════════════════════════════════════════════════════════════════

/**
 * Carga la semilla inicial (JSON estáticos) a Firestore de la sucursal activa.
 * Recibe `fsHelpers = { fsSave }` para no acoplarse a App.jsx.
 * Devuelve resumen de qué se cargó.
 */
export async function cargarSemillaInicial({ fsSave, catalogoWega, catalogoMobil, fitment, onProgress }) {
  const stats = { articulos: 0, kits: 0, aceites: 0, fitments: 0, errores: [] };
  const notify = (msg) => onProgress && onProgress(msg);

  // 1) Ficha del proveedor BORUR
  notify("Creando ficha proveedor BORUR…");
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

  // 2) Artículos Wega
  const arts = catalogoWega.articulos || [];
  notify(`Cargando ${arts.length} artículos Wega…`);
  for (let i = 0; i < arts.length; i++) {
    const a = arts[i];
    try {
      await fsSave(`catalogoProveedor/borur/articulos`, a.sku, a);
      stats.articulos++;
      if (i % 100 === 0) notify(`Artículos: ${i}/${arts.length}…`);
    } catch (e) { stats.errores.push(`articulo ${a.sku}: ${e.message}`); }
  }

  // 3) Kits Wega
  const kits = catalogoWega.kits || [];
  notify(`Cargando ${kits.length} kits Wega…`);
  for (const k of kits) {
    try {
      await fsSave(`catalogoProveedor/borur/kits`, k.kitCode, k);
      stats.kits++;
    } catch (e) { stats.errores.push(`kit ${k.kitCode}: ${e.message}`); }
  }

  // 4) Aceites Mobil (como items del proveedor)
  const aceites = catalogoMobil.aceites || [];
  notify(`Cargando ${aceites.length} aceites Mobil…`);
  for (const ac of aceites) {
    try {
      await fsSave(`catalogoProveedor/borur/aceites`, ac.id, ac);
      stats.aceites++;
    } catch (e) { stats.errores.push(`aceite ${ac.id}: ${e.message}`); }
  }

  // 5) Fitments
  const fits = fitment.fitments || [];
  notify(`Cargando ${fits.length} fitments…`);
  for (let i = 0; i < fits.length; i++) {
    const f = fits[i];
    try {
      await fsSave("fitment", f.fitment_id, f);
      stats.fitments++;
      if (i % 25 === 0) notify(`Fitments: ${i}/${fits.length}…`);
    } catch (e) { stats.errores.push(`fitment ${f.fitment_id}: ${e.message}`); }
  }

  notify(`✅ Semilla cargada: ${stats.articulos} artículos, ${stats.kits} kits, ${stats.aceites} aceites, ${stats.fitments} fitments`);
  return stats;
}

/**
 * Guarda una cotización nueva.
 * Cotización mínima: { fecha, cliente?, vehiculo, trabajo, precios, estado }.
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
