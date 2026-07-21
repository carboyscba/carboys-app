// ══════════════════════════════════════════════════════════════════
//  Cotizador — Motor de cálculo
//
//  Función principal: cotizarServiceFull({ fitment, aceite, litros, config })
//  → devuelve el objeto Extracto con los tres precios triangulados,
//    materiales, M.O., colores, IVA, descuento por efectivo.
//
//  IMPORTANTE: cálculos internos SIN IVA. La capa de UI aplica IVA
//  al mostrar (para el cliente, IVA visible; para configurar precios,
//  ver los tres números crudos).
// ══════════════════════════════════════════════════════════════════

import { getSkuIndex, getKitIndex, getAceiteIndex, getFitmentByKit } from "./dataLoader.js";

const round = (n) => Math.round(n * 100) / 100;

/**
 * Config default del cotizador — refleja INITIAL_CONFIG.cotizador.
 * Si en runtime se pasa un config con valores editados, esos priman.
 */
export const DEFAULT_COTIZADOR_CONFIG = {
  activo: false,
  manoObraEstandar: 120000,          // ARS/hora sin IVA
  manoObraAltaGama: 150000,          // ARS/hora sin IVA
  margenMinimoFull: 0.50,            // 50% margen → venta óptima = costo × 2
  margenMinimoBase: 0.50,
  factorTechoCompetitivo: 0.85,      // techo = precio_oficial × 0.85
  descuentoEfectivo: 0.15,           // 15% off al pagar en efectivo
  alertaMoMeses: 6,
};

/**
 * Determina el precio unitario de un aceite en una presentación dada.
 * Presentación default: si el fitment/aceite tiene `es_default_borur: true`
 * se usa esa; si no, se toma la primera presentación disponible.
 */
export function precioPorLitroDeAceite(aceite, presentacionId = null) {
  if (!aceite || !aceite.presentaciones || aceite.presentaciones.length === 0) {
    return null;
  }
  let p = null;
  if (presentacionId) {
    p = aceite.presentaciones.find(x => x.id === presentacionId);
  }
  if (!p) {
    p = aceite.presentaciones.find(x => x.es_default_borur) || aceite.presentaciones[0];
  }
  return { precio_por_litro: p.precio_por_litro, presentacion: p };
}

/**
 * Costo materiales SIN IVA:
 *   materiales = precio_kit + (litros × precio_por_litro_aceite)
 * Si no hay kit_recomendado en el fitment, suma los SKUs sueltos.
 */
export function costoMateriales({ fitment, kitIndex, skuIndex, aceite, litros, presentacionAceite }) {
  let costoFiltros = 0;
  let detalleFiltros = null;
  if (fitment.kit_recomendado && kitIndex[fitment.kit_recomendado]) {
    const kit = kitIndex[fitment.kit_recomendado];
    costoFiltros = kit.precio || 0;
    detalleFiltros = { modo: "kit", kitCode: kit.kitCode, precio: costoFiltros, skus: kit.skusIncluidos };
  } else {
    // Fallback: sumar SKUs sueltos
    const skus = [
      fitment.sku_aire, fitment.sku_aceite, fitment.sku_combustible, fitment.sku_habitaculo
    ].filter(Boolean);
    const detalleSueltos = [];
    for (const s of skus) {
      const a = skuIndex[s];
      if (a) {
        costoFiltros += a.costoNeto;
        detalleSueltos.push({ sku: s, precio: a.costoNeto });
      }
    }
    detalleFiltros = { modo: "sueltos", skus: detalleSueltos, precio: costoFiltros };
  }
  const info = precioPorLitroDeAceite(aceite, presentacionAceite);
  const costoAceite = info ? info.precio_por_litro * litros : 0;
  const detalleAceite = info ? {
    aceite_id: aceite.id,
    nombre: aceite.nombre,
    litros,
    precio_por_litro: info.precio_por_litro,
    presentacion: info.presentacion.envase,
    total: round(costoAceite),
  } : null;
  return {
    filtros: detalleFiltros,
    aceite: detalleAceite,
    subtotal_sin_iva: round(costoFiltros + costoAceite),
  };
}

/**
 * Motor central. Recibe:
 *   - fitment: uno de los items de fitment.json
 *   - aceite:  aceite de catalogo_mobil.json
 *   - litros:  litros a colocar
 *   - moHoras: horas de M.O. (default 1 para Service Full)
 *   - config:  config.cotizador (usa DEFAULT si no viene)
 *   - trabajo: "service_full" | "service_base"
 *   - precioOficial: opcional, para calcular techo competitivo
 *   - kitIndex, skuIndex: opcionales, si ya están cargados
 *
 * Devuelve el Extracto listo para renderizar.
 */
export async function cotizarService({
  fitment,
  aceite,
  litros,
  moHoras = 1,
  config = DEFAULT_COTIZADOR_CONFIG,
  trabajo = "service_full",
  precioOficialSinIva = null,
  presentacionAceite = null,
  ivaRate = 0.21,
  kitIndex: kitIdx,
  skuIndex: skuIdx,
}) {
  if (!fitment) throw new Error("cotizarService: falta fitment");
  if (!aceite)  throw new Error("cotizarService: falta aceite");
  if (!Number.isFinite(litros) || litros <= 0) throw new Error("cotizarService: litros inválidos");

  const cfg = { ...DEFAULT_COTIZADOR_CONFIG, ...(config || {}) };
  const kitIndex = kitIdx || await getKitIndex();
  const skuIndex = skuIdx || await getSkuIndex();

  const materiales = costoMateriales({ fitment, kitIndex, skuIndex, aceite, litros, presentacionAceite });

  // Mano de obra según categoría del fitment
  const tarifaHora = fitment.categoria === "alta_gama" ? cfg.manoObraAltaGama : cfg.manoObraEstandar;
  const manoObra = round(tarifaHora * moHoras);

  // Tres números — TODOS SIN IVA internamente
  const ventaMinima = round(materiales.subtotal_sin_iva + manoObra);
  const margen = trabajo === "service_full" ? cfg.margenMinimoFull : cfg.margenMinimoBase;
  const ventaOptima = round(ventaMinima / (1 - margen));
  const techoCompetitivo = precioOficialSinIva
    ? round(precioOficialSinIva * cfg.factorTechoCompetitivo)
    : null;

  // Versiones con IVA (capa de presentación)
  const ivaFactor = 1 + ivaRate;
  const ventaMinimaConIva = round(ventaMinima * ivaFactor);
  const ventaOptimaConIva = round(ventaOptima * ivaFactor);
  const techoConIva = techoCompetitivo ? round(techoCompetitivo * ivaFactor) : null;

  return {
    trabajo,
    fitment_id: fitment.fitment_id,
    kit_code: fitment.kit_recomendado,
    materiales,
    manoObra: { tarifaHora, horas: moHoras, total: manoObra },
    // Sin IVA
    ventaMinima,
    ventaOptima,
    techoCompetitivo,
    // Con IVA (UI)
    ventaMinimaConIva,
    ventaOptimaConIva,
    techoConIva,
    // Meta
    config: cfg,
    ivaRate,
  };
}

/**
 * Calcula precio final al cliente según método de pago.
 *   - "tarjeta": precio con IVA sin descuento.
 *   - "efectivo": precio con IVA − descuentoEfectivo.
 *   - "mixto": aplica descuento solo a la parte efectivo.
 * `precioBaseConIva` = el precio que el recepcionista tipeó (con IVA).
 */
export function precioFinalCliente({ precioBaseConIva, metodo = "tarjeta", montoEfectivo = 0, config = DEFAULT_COTIZADOR_CONFIG }) {
  const cfg = { ...DEFAULT_COTIZADOR_CONFIG, ...(config || {}) };
  if (metodo === "tarjeta") {
    return { total: round(precioBaseConIva), ahorro: 0 };
  }
  if (metodo === "efectivo") {
    const total = round(precioBaseConIva * (1 - cfg.descuentoEfectivo));
    return { total, ahorro: round(precioBaseConIva - total) };
  }
  if (metodo === "mixto") {
    const parteEfectivoConDesc = round(montoEfectivo * (1 - cfg.descuentoEfectivo));
    const parteTarjeta = round(precioBaseConIva - montoEfectivo);
    const total = round(parteEfectivoConDesc + parteTarjeta);
    return { total, ahorro: round(montoEfectivo - parteEfectivoConDesc) };
  }
  return { total: round(precioBaseConIva), ahorro: 0 };
}

/**
 * Zona de color del precio final vs. las bandas óptima/mínima/techo.
 * Se usa SIN IVA para comparar (el usuario tipea CON IVA, se convierte antes).
 */
export function zonaDePrecio({ precioSinIva, ventaMinima, ventaOptima, techoCompetitivo }) {
  if (precioSinIva < ventaMinima) return { zona: "bajo_minima", color: "rojo", label: "Perdés plata" };
  if (precioSinIva < ventaOptima) return { zona: "entre_minima_optima", color: "amarillo", label: "Ganás, pero por debajo del target" };
  if (techoCompetitivo && precioSinIva > techoCompetitivo) return { zona: "sobre_techo", color: "naranja", label: "Rentable pero el oficial cobra menos" };
  return { zona: "banda_optima", color: "verde", label: "Zona ideal — rentable y competitivo" };
}

/**
 * Snapshot de la cotización para persistir en la orden.
 * Uso: al cerrar la orden con Service Full/Base, se guarda este objeto en `order.cotizadorSnapshot`.
 */
export function buildCotizadorSnapshot({ extracto, precioFinalTarjeta, precioFinalEfectivo, metodoPago, config = DEFAULT_COTIZADOR_CONFIG }) {
  const cfg = { ...DEFAULT_COTIZADOR_CONFIG, ...(config || {}) };
  return {
    materiales: extracto.materiales,
    manoObra: extracto.manoObra.total,
    costoTotalSinIva: extracto.ventaMinima,
    ventaMinima: extracto.ventaMinima,
    ventaOptima: extracto.ventaOptima,
    techoCompetitivo: extracto.techoCompetitivo,
    precioFinalTarjeta: round(precioFinalTarjeta),
    precioFinalEfectivo: round(precioFinalEfectivo),
    descuentoEfectivoAplicado: cfg.descuentoEfectivo,
    metodoPago,
    fechaCotizacion: new Date().toISOString(),
    ivaRate: extracto.ivaRate,
  };
}

/**
 * Busca el precio oficial de concesionaria para un vehículo y trabajo dados.
 * Devuelve el precio SIN IVA (convierte si el registro está guardado con IVA),
 * o null si no hay match.
 */
export function buscarPrecioOficialSinIva(concesionarias, { marca, modelo, motor, trabajo = "service_full", ivaRate = 0.21 }) {
  if (!Array.isArray(concesionarias) || !concesionarias.length) return null;
  const norm = (s) => String(s || "").toLowerCase().trim();
  const marcaN = norm(marca), modeloN = norm(modelo), motorN = norm(motor);

  const candidatos = concesionarias.filter(c => {
    if (norm(c.marca) !== marcaN) return false;
    const cm = norm(c.modelo);
    if (!modeloN) return false;
    return cm.includes(modeloN) || modeloN.includes(cm);
  });
  if (!candidatos.length) return null;

  let elegido = candidatos[0];
  if (motorN) {
    const conMotor = candidatos.find(c => norm(c.motor) && (norm(c.motor).includes(motorN) || motorN.includes(norm(c.motor))));
    if (conMotor) elegido = conMotor;
  }

  const campo = trabajo === "service_base" ? "precioServiceBase" : "precioServiceFull";
  const precio = elegido[campo];
  if (precio == null || precio === "") return null;

  const conIva = elegido.conIva !== false;
  return conIva ? Math.round((Number(precio) / (1 + ivaRate)) * 100) / 100 : Number(precio);
}

// ── Helper de conveniencia para buscar fitment por (marca, modelo, motor, año) ──
export async function findFitment({ marca, modelo, motorHint, ano }) {
  const fit = await (await import("./dataLoader.js")).loadFitment();
  const list = fit.fitments || [];
  const norm = (s) => String(s || "").toLowerCase().trim();
  const marcaN = norm(marca), modeloN = norm(modelo), motorN = norm(motorHint);
  // Primera pass: marca + modelo + motor + año en rango
  const withMotor = list.filter(f =>
    norm(f.marca) === marcaN &&
    (modeloN && norm(f.modelo).includes(modeloN)) &&
    (motorN ? norm(f.motor_hint) === motorN : true) &&
    (!ano || !f.ano_desde || f.ano_desde <= ano) &&
    (!ano || !f.ano_hasta || f.ano_hasta >= ano)
  );
  if (withMotor.length) return withMotor[0];
  // Fallback: solo marca + modelo
  const looseModelo = list.filter(f => norm(f.marca) === marcaN && (modeloN && norm(f.modelo).includes(modeloN)));
  return looseModelo[0] || null;
}
