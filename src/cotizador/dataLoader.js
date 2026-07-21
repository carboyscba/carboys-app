// ══════════════════════════════════════════════════════════════════
//  Cotizador — dataLoader
//  Carga los JSON semilla desde /data/ (public/) bajo demanda.
//  Cachea el resultado en memoria.
//  Cuando se implemente Config → Lista Proveedores, este loader
//  fallback-eará a Firestore si el catálogo está persistido allí.
// ══════════════════════════════════════════════════════════════════

let _cachedCatalogoWega = null;
let _cachedCatalogoMobil = null;
let _cachedFitment = null;

const BASE = "/data";

/** Carga catalogo_wega.json (SKUs Wega + KITS). ~950 KB. */
export async function loadCatalogoWega() {
  if (_cachedCatalogoWega) return _cachedCatalogoWega;
  const r = await fetch(`${BASE}/catalogo_wega.json`);
  if (!r.ok) throw new Error(`No se pudo cargar catalogo_wega.json (${r.status})`);
  _cachedCatalogoWega = await r.json();
  return _cachedCatalogoWega;
}

/** Carga catalogo_mobil.json (aceites Mobil con presentaciones). ~8 KB. */
export async function loadCatalogoMobil() {
  if (_cachedCatalogoMobil) return _cachedCatalogoMobil;
  const r = await fetch(`${BASE}/catalogo_mobil.json`);
  if (!r.ok) throw new Error(`No se pudo cargar catalogo_mobil.json (${r.status})`);
  _cachedCatalogoMobil = await r.json();
  return _cachedCatalogoMobil;
}

/** Carga fitment.json (vehículo → filtros). ~113 KB. */
export async function loadFitment() {
  if (_cachedFitment) return _cachedFitment;
  const r = await fetch(`${BASE}/fitment.json`);
  if (!r.ok) throw new Error(`No se pudo cargar fitment.json (${r.status})`);
  _cachedFitment = await r.json();
  return _cachedFitment;
}

/** Carga los 3 JSON en paralelo. Devuelve { catalogoWega, catalogoMobil, fitment }. */
export async function loadAllSeedData() {
  const [catalogoWega, catalogoMobil, fitment] = await Promise.all([
    loadCatalogoWega(),
    loadCatalogoMobil(),
    loadFitment(),
  ]);
  return { catalogoWega, catalogoMobil, fitment };
}

/** Invalida el cache — usar cuando el catálogo se actualiza vía Config → Lista Proveedores. */
export function invalidateCache() {
  _cachedCatalogoWega = null;
  _cachedCatalogoMobil = null;
  _cachedFitment = null;
}

// ── Índices helpers (se construyen la primera vez que se pide algo) ──
let _skuIndex = null;
let _kitIndex = null;
let _aceiteIndex = null;
let _fitmentByKit = null;

/** { sku: articulo } para lookup O(1). */
export async function getSkuIndex() {
  if (_skuIndex) return _skuIndex;
  const cat = await loadCatalogoWega();
  _skuIndex = Object.fromEntries((cat.articulos || []).map(a => [a.sku, a]));
  return _skuIndex;
}

/** { kitCode: kit } para lookup O(1). */
export async function getKitIndex() {
  if (_kitIndex) return _kitIndex;
  const cat = await loadCatalogoWega();
  _kitIndex = Object.fromEntries((cat.kits || []).map(k => [k.kitCode, k]));
  return _kitIndex;
}

/** { aceiteId: aceite } para lookup O(1). */
export async function getAceiteIndex() {
  if (_aceiteIndex) return _aceiteIndex;
  const cat = await loadCatalogoMobil();
  _aceiteIndex = Object.fromEntries((cat.aceites || []).map(a => [a.id, a]));
  return _aceiteIndex;
}

/** { kitCode: fitment } para encontrar el fitment que usa un kit dado. */
export async function getFitmentByKit() {
  if (_fitmentByKit) return _fitmentByKit;
  const fit = await loadFitment();
  _fitmentByKit = Object.fromEntries((fit.fitments || []).map(f => [f.kit_code, f]));
  return _fitmentByKit;
}
