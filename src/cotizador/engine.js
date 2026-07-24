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
  factorOficialEstimado: 2.5,        // cuando no hay precio oficial cargado: oficial ≈ costo_interno × este factor
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
 * Costo materiales SIN IVA.
 *
 * REGLAS (Nacho, iter B):
 *   • Service Full + hay kit Wega → precio del kit.
 *   • Service Full + NO hay kit → suma de los 4 filtros sueltos (aire, aceite, comb, hab).
 *   • Service Base → SOLO filtro de aire + filtro de aceite (NUNCA kit, NUNCA los 4).
 *
 * Al costo de los filtros se le suma aceite líquido (litros × precio_por_litro).
 *
 * IMPORTANTE (Iter B — regla del dueño): el COSTO de referencia es el precio
 * CON IVA de las listas (kit / filtros / aceite) — es lo que realmente se paga
 * a Borur. Por eso multiplicamos cada precio de lista (que viene sin IVA) por
 * (1 + ivaRate). La mano de obra NO lleva IVA (se suma aparte en cotizarService).
 */
export function costoMateriales({ fitment, kitIndex, skuIndex, aceite, litros, presentacionAceite, trabajo = "service_full", ivaRate = 0.21 }) {
  const ivaFactor = 1 + ivaRate;
  const conIva = (n) => round((n || 0) * ivaFactor);   // precio de lista (sin IVA) → costo con IVA
  let costoFiltros = 0;
  let detalleFiltros = null;

  if (trabajo === "service_base") {
    // ── SERVICE BASE ── solo aire + aceite (nunca kit, nunca combustible ni habitáculo)
    const skus = [fitment.sku_aire, fitment.sku_aceite].filter(Boolean);
    const detalleSueltos = [];
    for (const s of skus) {
      const a = skuIndex[s];
      if (a) {
        const p = conIva(a.costoNeto);
        costoFiltros += p;
        detalleSueltos.push({ sku: s, precio: p });
      }
    }
    detalleFiltros = { modo: "base_aire_aceite", skus: detalleSueltos, precio: round(costoFiltros) };
  } else if (fitment.kit_recomendado && kitIndex[fitment.kit_recomendado]) {
    // ── SERVICE FULL + KIT ── usar precio del kit (con IVA)
    const kit = kitIndex[fitment.kit_recomendado];
    costoFiltros = conIva(kit.precio);
    detalleFiltros = { modo: "kit", kitCode: kit.kitCode, precio: costoFiltros, skus: kit.skusIncluidos };
  } else {
    // ── SERVICE FULL + SUELTOS ── suma de los 4 filtros (con IVA)
    const skus = [
      fitment.sku_aire, fitment.sku_aceite, fitment.sku_combustible, fitment.sku_habitaculo
    ].filter(Boolean);
    const detalleSueltos = [];
    for (const s of skus) {
      const a = skuIndex[s];
      if (a) {
        const p = conIva(a.costoNeto);
        costoFiltros += p;
        detalleSueltos.push({ sku: s, precio: p });
      }
    }
    detalleFiltros = { modo: "sueltos", skus: detalleSueltos, precio: round(costoFiltros) };
  }
  const info = precioPorLitroDeAceite(aceite, presentacionAceite);
  const costoAceite = info ? conIva(info.precio_por_litro * litros) : 0;
  const detalleAceite = info ? {
    aceite_id: aceite.id,
    nombre: aceite.nombre,
    litros,
    precio_por_litro: conIva(info.precio_por_litro),
    presentacion: info.presentacion.envase,
    total: round(costoAceite),
  } : null;
  return {
    filtros: detalleFiltros,
    aceite: detalleAceite,
    // subtotal de materiales CON IVA (costo real que paga el taller)
    subtotal_sin_iva: round(costoFiltros + costoAceite),  // nombre histórico; ahora es CON IVA
    subtotal_con_iva: round(costoFiltros + costoAceite),
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
  concesionarias = null,          // si viene, se estima el oficial con la cascada
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

  const materiales = costoMateriales({ fitment, kitIndex, skuIndex, aceite, litros, presentacionAceite, trabajo, ivaRate });

  // Mano de obra según categoría del fitment (SIN IVA — se suma al costo con-IVA de materiales)
  const tarifaHora = fitment.categoria === "alta_gama" ? cfg.manoObraAltaGama : cfg.manoObraEstandar;
  const manoObra = round(tarifaHora * moHoras);

  // Costo base = materiales CON IVA + M.O. sin IVA. Este es el precio EFECTIVO
  // (lo que sale de verdad). El "con IVA" de abajo agrega el IVA de venta (TARJETA).
  const ventaMinima = round(materiales.subtotal_con_iva + manoObra);
  const margen = trabajo === "service_full" ? cfg.margenMinimoFull : cfg.margenMinimoBase;
  const ventaOptima = round(ventaMinima / (1 - margen));
  const ivaFactor = 1 + ivaRate;

  // ── Precio oficial (techo competitivo) — cascada con nivel de confianza ──
  // Si viene precioOficialSinIva directo (llamada legacy) → exacto.
  // Si vienen las concesionarias → cascada (exacto/aproximado/estimado) usando
  // el costo interno (ventaMinima) como base de la fórmula.
  let oficial = { precioSinIva: precioOficialSinIva, nivel: precioOficialSinIva ? "exacto" : null, fuente: null, fecha: null };
  if (precioOficialSinIva == null && concesionarias) {
    oficial = estimarOficial({
      concesionarias,
      marca: fitment.marca, modelo: fitment.modelo, motor: fitment.motor_hint,
      trabajo, ivaRate, costoInterno: ventaMinima,
      factorOficialEstimado: cfg.factorOficialEstimado,
    });
  }
  // Techo competitivo (capa efectivo, igual que ventaOptima). techoConIva = tarjeta.
  const techoCompetitivo = oficial.precioSinIva != null
    ? round(oficial.precioSinIva * cfg.factorTechoCompetitivo)
    : null;

  // Versiones con IVA de venta = precio TARJETA (efectivo × (1+IVA)).
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
    // Techo: nivel de confianza para la UI ('exacto'|'aproximado'|'estimado'|null)
    techoNivel: oficial.nivel,
    techoFuente: oficial.fuente,
    techoFecha: oficial.fecha,
    oficialSinIva: oficial.precioSinIva,
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
 * Estima el precio oficial de concesionaria para un vehículo, con una CASCADA
 * de fallback que SIEMPRE devuelve algo (salvo guardrail), marcando el nivel
 * de confianza para que la UI lo muestre con color:
 *
 *   'exacto'      🎯 verde   — cargado a mano para ese modelo (motor exacto o "todos los motores")
 *   'aproximado'  ≈ amarillo — mismo modelo otro motor, o promedio de la marca
 *   'estimado'    ~ naranja  — fórmula: costo interno × factorOficialEstimado
 *   null          — sin dato confiable (o el estimado quedó por debajo del costo)
 *
 * Devuelve { precioSinIva, nivel, fuente, fecha }. Precio siempre SIN IVA.
 */
export function estimarOficial({ concesionarias, marca, modelo, motor, trabajo = "service_full", ivaRate = 0.21, costoInterno = null, factorOficialEstimado = 2.5 }) {
  const norm = (s) => String(s || "").toLowerCase().trim();
  const ivaF = 1 + ivaRate;
  const campo = trabajo === "service_base" ? "precioServiceBase" : "precioServiceFull";
  const round2 = (n) => Math.round(n * 100) / 100;
  const precioSinIvaDe = (c) => {
    const p = c[campo];
    if (p == null || p === "") return null;
    return (c.conIva !== false) ? Number(p) / ivaF : Number(p);
  };
  const median = (arr) => {
    const a = arr.filter(x => x != null && !Number.isNaN(x)).sort((x, y) => x - y);
    if (!a.length) return null;
    const m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  };
  const out = (precio, nivel, fuente, fecha = null) => {
    if (precio == null) return { precioSinIva: null, nivel: null, fuente: null, fecha: null };
    // Guardrail: un techo por debajo del costo interno no sirve → mejor sin dato.
    if (costoInterno != null && precio < costoInterno) return { precioSinIva: null, nivel: null, fuente: "bajo_costo", fecha: null };
    return { precioSinIva: round2(precio), nivel, fuente, fecha };
  };

  const list = Array.isArray(concesionarias) ? concesionarias : [];
  const marcaN = norm(marca), modeloN = norm(modelo), motorN = norm(motor);

  // ── Mismo marca + modelo ──
  const mismoModelo = list.filter(c => norm(c.marca) === marcaN && modeloN &&
    (norm(c.modelo).includes(modeloN) || modeloN.includes(norm(c.modelo))) && precioSinIvaDe(c) != null);

  if (mismoModelo.length) {
    // N0: motor exacto
    if (motorN) {
      const conMotor = mismoModelo.find(c => norm(c.motor) && (norm(c.motor).includes(motorN) || motorN.includes(norm(c.motor))));
      if (conMotor) return out(precioSinIvaDe(conMotor), "exacto", `${conMotor.modelo}${conMotor.motor ? " " + conMotor.motor : ""}`, conMotor.fechaActualizacion);
    }
    // N1: entrada "sin motor" = precio general del modelo (aplica a todos los motores)
    const sinMotor = mismoModelo.find(c => !norm(c.motor));
    if (sinMotor) return out(precioSinIvaDe(sinMotor), "exacto", `${sinMotor.modelo} (todos los motores)`, sinMotor.fechaActualizacion);
    // N2: mismo modelo, otro motor → aproximado (mediana)
    return out(median(mismoModelo.map(precioSinIvaDe)), "aproximado", `${modelo} (otra versión)`, mismoModelo[0].fechaActualizacion);
  }

  // N3: misma marca, cualquier modelo → aproximado (mediana de la marca)
  const mismaMarca = list.filter(c => norm(c.marca) === marcaN && precioSinIvaDe(c) != null);
  if (mismaMarca.length) {
    return out(median(mismaMarca.map(precioSinIvaDe)), "aproximado", `promedio ${marca}`, null);
  }

  // N4: fórmula — costo interno × factor (cuando no hay nada parecido cargado)
  if (costoInterno != null && costoInterno > 0) {
    return out(costoInterno * factorOficialEstimado, "estimado", `fórmula (costo × ${factorOficialEstimado})`, null);
  }

  return out(null, null, null);
}

/**
 * Compat: devuelve solo el precio SIN IVA (o null). Usa la cascada nueva.
 */
export function buscarPrecioOficialSinIva(concesionarias, opts) {
  return estimarOficial({ concesionarias, ...opts }).precioSinIva;
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
