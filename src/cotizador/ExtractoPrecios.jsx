// ══════════════════════════════════════════════════════════════════
//  Cotizador — Extracto de Precios (Iter 4)
//  El corazón visual: 3 precios triangulados + zona + precio cliente.
// ══════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { cotizarService, precioFinalCliente, zonaDePrecio } from "./engine.js";
import { getKitIndex, getSkuIndex, getAceiteIndex } from "./dataLoader.js";

const ZONE_COLORS = {
  rojo:    { hex: "#e53935", label: "Perdés plata en la venta",           icon: "🔴" },
  amarillo:{ hex: "#f5b301", label: "Ganás, pero por debajo del target",  icon: "🟡" },
  verde:   { hex: "#43a047", label: "Zona ideal — rentable y competitivo",icon: "🟢" },
  naranja: { hex: "#fb8c00", label: "Rentable pero el oficial cobra menos",icon: "🟠" },
};

const fmt$ = (n) => n == null || Number.isNaN(n) ? "—" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

// Nivel de confianza del techo (precio oficial)
const TECHO_NIVEL = {
  exacto:     { hex: "#43a047", icon: "🎯", label: "Oficial exacto" },
  aproximado: { hex: "#f5b301", icon: "≈",  label: "Aproximado" },
  estimado:   { hex: "#fb8c00", icon: "~",  label: "Estimado" },
};

export default function ExtractoPrecios({
  fitment, aceite, litros, trabajo = "service_full", config,
  precioOficialSinIva = null, concesionarias = null, presentacionAceite = null, role = "dueño",
  onClose, onGuardar, onWhatsApp, onConvertir,
  T, fontD, card, btnPrimary, inputStyle,
}) {
  const ownerView = role === "dueño";
  const [extracto, setExtracto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [precioFinalConIva, setPrecioFinalConIva] = useState("");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [kitIndex, setKitIndex] = useState(null);
  const [skuIndex, setSkuIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [ki, si] = await Promise.all([getKitIndex(), getSkuIndex()]);
        if (!mounted) return;
        setKitIndex(ki); setSkuIndex(si);
        const e = await cotizarService({
          fitment, aceite, litros, trabajo,
          config: config?.cotizador || config,        // sub-config del cotizador (margen, factor techo, etc.)
          presentacionAceite,
          precioOficialSinIva: precioOficialSinIva,   // si vino explícito por prop → exacto
          concesionarias: concesionarias || [],       // si no, la cascada estima con nivel
          kitIndex: ki, skuIndex: si,
          ivaRate: (config?.ivaRate ?? 21) / 100,
        });
        if (!mounted) return;
        setExtracto(e);
        setPrecioFinalConIva(String(Math.round(e.ventaOptimaConIva)));
      } catch (err) { if (mounted) setError(err.message || String(err)); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [fitment, aceite, litros, trabajo, config, presentacionAceite, precioOficialSinIva, concesionarias]);

  if (loading) return <div style={{ ...card, padding: 40, textAlign: "center", color: T.gray, fontSize: 14 }}>⏳ Calculando extracto…</div>;
  if (error) return <div style={{ ...card, padding: 20, borderColor: T.red, background: T.red + "10", color: T.red, fontSize: 13 }}>⚠️ {error}</div>;
  if (!extracto) return null;

  const precioConIva = parseFloat(precioFinalConIva) || 0;
  const efectivoMonto = parseFloat(montoEfectivo) || 0;
  const cliente = precioFinalCliente({ precioBaseConIva: precioConIva, metodo: metodoPago, montoEfectivo: efectivoMonto, config: extracto.config });
  const ivaFactor = 1 + extracto.ivaRate;
  const precioSinIva = precioConIva / ivaFactor;
  const zona = zonaDePrecio({ precioSinIva, ventaMinima: extracto.ventaMinima, ventaOptima: extracto.ventaOptima, techoCompetitivo: extracto.techoCompetitivo });
  const zonaConf = ZONE_COLORS[zona.color] || ZONE_COLORS.verde;
  const margen = precioSinIva > 0 ? Math.round(((precioSinIva - extracto.ventaMinima) / precioSinIva) * 1000) / 10 : 0;
  const kit = extracto.materiales.filtros?.modo === "kit" && kitIndex ? kitIndex[extracto.materiales.filtros.kitCode] : null;
  const presentacion = extracto.materiales.aceite?.presentacion || "—";
  const trabajoLabel = trabajo === "service_full" ? "Service Full" : "Service Base";
  const vehiculoDesc = fitment.kit_nombre || fitment.descripcion_completa || `${fitment.marca} ${fitment.modelo}`;

  const Row = ({ label, value, muted, big, bold, color, subtext }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: subtext ? "flex-start" : "center", padding: "6px 0" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: big ? 16 : 13, fontWeight: bold ? 700 : 500, color: muted ? T.gray : (color || T.text) }}>{label}</span>
        {subtext && <span style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{subtext}</span>}
      </div>
      <span style={{ fontSize: big ? 20 : 14, fontWeight: bold ? 800 : 600, fontFamily: fontD, color: color || T.text, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );

  const ClickPrice = ({ icon, label, valueSinIva, valueConIva, showSinIva, onClick, color, highlight }) => (
    <div onClick={onClick}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: highlight ? color + "12" : T.bg, border: `1px solid ${highlight ? color : T.border}`, marginTop: 8, transition: "all .15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = highlight ? color : T.border; }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? color : T.grayLight }}>{icon} {label}</span>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: T.gray, fontFamily: fontD }}>💵 {fmt$(valueSinIva)} <span style={{ fontSize: 9 }}>efvo</span></div>
        <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: fontD }}>{fmt$(valueConIva)} <span style={{ fontSize: 9, color: T.gray }}>tarj</span></div>
      </div>
    </div>
  );

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}08)`, borderBottom: `2px solid ${T.accent}`, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800 }}>🧮 Extracto — {trabajoLabel}</div>
            <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{vehiculoDesc}</div>
          </div>
          {onClose && <button onClick={onClose} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 20, padding: "4px 12px", color: T.gray }}>×</button>}
        </div>
      </div>

      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>📦 Materiales {ownerView ? "(con IVA)" : ""}</div>
        {extracto.materiales.filtros?.modo === "base_aire_aceite" ? (
          <div style={{ marginBottom: 8 }}>
            <Row label="Aire + Aceite (Service Base)" value={ownerView ? fmt$(extracto.materiales.filtros?.precio) : "✓"} bold />
            {skuIndex && (
              <div style={{ paddingLeft: 20, marginTop: 4 }}>
                {(extracto.materiales.filtros?.skus || []).map(s => {
                  const art = skuIndex[s.sku];
                  const tipoShort = ({ filtro_aire: "aire", filtro_aceite: "aceite" })[art?.tipo] || art?.tipo || "";
                  return <div key={s.sku} style={{ fontSize: 11, color: T.grayLight, padding: "2px 0" }}>· <span style={{ fontWeight: 700 }}>{s.sku}</span> ({tipoShort})</div>;
                })}
              </div>
            )}
          </div>
        ) : kit ? (
          <div style={{ marginBottom: 8 }}>
            <Row label={`KIT ${kit.kitCode} (${kit.skusIncluidos?.length || 0} filtros)`} value={ownerView ? fmt$(extracto.materiales.filtros?.precio) : "✓"} bold />
            {kitIndex && skuIndex && (
              <div style={{ paddingLeft: 20, marginTop: 4 }}>
                {(kit.skusIncluidos || []).map(s => {
                  const art = skuIndex[s.sku];
                  const tipoShort = ({ filtro_aire: "aire", filtro_aceite: "aceite", filtro_combustible: "combustible", filtro_habitaculo: "habitáculo" })[art?.tipo] || art?.tipo || "";
                  return <div key={s.sku} style={{ fontSize: 11, color: T.grayLight, padding: "2px 0" }}>· <span style={{ fontWeight: 700 }}>{s.sku}</span> ({tipoShort})</div>;
                })}
              </div>
            )}
          </div>
        ) : <Row label="Filtros sueltos (4)" value={ownerView ? fmt$(extracto.materiales.filtros?.precio) : "✓"} />}
        <Row label={`Aceite ${aceite?.nombre || ""}`}
          subtext={`${presentacion} × ${litros}L${ownerView && extracto.materiales.aceite?.precio_por_litro ? ` @ ${fmt$(extracto.materiales.aceite.precio_por_litro)}/L` : ""}`}
          value={ownerView ? fmt$(extracto.materiales.aceite?.total) : `${litros}L`} />
        <div style={{ borderTop: `1px dashed ${T.border}`, marginTop: 10, paddingTop: 10 }}>
          <Row label={ownerView ? "Subtotal" : "Total materiales"} value={ownerView ? fmt$(extracto.materiales.subtotal_sin_iva) : "—"} bold muted={!ownerView} />
        </div>
      </div>

      {ownerView && (
        <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>🔧 Mano de obra</div>
          <Row label={`${fitment.categoria === "alta_gama" ? "Alta gama" : "Auto estándar"} × ${extracto.manoObra.horas}h`} value={fmt$(extracto.manoObra.total)} bold />
        </div>
      )}

      <div style={{ padding: 20, background: T.bg3, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🎯 Precios sugeridos (efectivo / tarjeta)</div>
        <ClickPrice icon="🔻" label={ownerView ? "Venta mínima (repuestos ×2 + M.O.)" : "Venta mínima"}
          valueSinIva={extracto.ventaMinima} valueConIva={extracto.ventaMinimaConIva} showSinIva={ownerView}
          onClick={() => setPrecioFinalConIva(String(Math.round(extracto.ventaMinimaConIva)))} color={T.red} />
        <ClickPrice icon="🎯" label={ownerView ? `Venta óptima (piso ${Math.round((extracto.config.margenMinimoFull || 0.5) * 100)}%)` : "Venta óptima"}
          valueSinIva={extracto.ventaOptima} valueConIva={extracto.ventaOptimaConIva} showSinIva={ownerView}
          onClick={() => setPrecioFinalConIva(String(Math.round(extracto.ventaOptimaConIva)))} color={T.green} highlight />
        {/* Techo (comparativa con concesionaria) — SOLO Service Full */}
        {trabajo === "service_full" && (extracto.techoCompetitivo != null && TECHO_NIVEL[extracto.techoNivel] ? (() => {
          const nv = TECHO_NIVEL[extracto.techoNivel];
          return (
            <>
              <ClickPrice icon={nv.icon} label={`Techo — ${nv.label}`}
                valueSinIva={extracto.techoCompetitivo} valueConIva={extracto.techoConIva} showSinIva={ownerView}
                onClick={() => setPrecioFinalConIva(String(Math.round(extracto.techoConIva)))} color={nv.hex} />
              <div style={{ fontSize: 11, color: nv.hex, marginTop: 6, textAlign: "center", lineHeight: 1.5 }}>
                {nv.icon} <b>{nv.label}</b>{extracto.techoFuente ? ` · ${extracto.techoFuente}` : ""}
                {ownerView && extracto.oficialSinIva != null &&
                  <span style={{ color: T.gray }}> · Oficial {fmt$(Math.round(extracto.oficialSinIva * (1 + extracto.ivaRate)))} × {Math.round((extracto.config.factorTechoCompetitivo || 0.85) * 100)}% = techo</span>}
                {(extracto.techoNivel === "aproximado" || extracto.techoNivel === "estimado") &&
                  <span style={{ color: T.gray }}> · cargá el oficial en Config → Concesionarias para mayor precisión</span>}
              </div>
            </>
          );
        })() : (
          <div style={{ padding: "8px 12px", borderRadius: 8, background: T.bg, border: `1px dashed ${T.border}`, fontSize: 12, color: T.gray, marginTop: 8 }}>
            🔺 Sin precio oficial de referencia — cotizá por costo + margen. Cargá el oficial en Config → Concesionarias.
          </div>
        ))}
      </div>

      <div style={{ padding: 20, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>💰 Precio al cliente</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["tarjeta", "efectivo", "mixto"].map(m => (
            <button key={m} onClick={() => setMetodoPago(m)}
              style={{ ...btnPrimary(metodoPago === m ? T.accent : T.bg3), border: `1px solid ${metodoPago === m ? T.accent : T.border}`,
                color: metodoPago === m ? "#fff" : T.grayLight, flex: 1, fontSize: 12, padding: "8px 4px" }}>
              {m === "tarjeta" ? "💳 Tarjeta" : m === "efectivo" ? "💵 Efectivo" : "🔀 Mixto"}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Precio con IVA (tipeá o tocá uno de arriba)</div>
          <input type="text" inputMode="numeric" value={precioFinalConIva}
            onChange={(e) => setPrecioFinalConIva(e.target.value.replace(/[^0-9]/g, ""))}
            style={{ ...inputStyle, fontSize: 20, fontWeight: 800, textAlign: "center", fontFamily: fontD }} />
        </div>
        {metodoPago === "mixto" && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Parte en efectivo</div>
            <input type="text" inputMode="numeric" value={montoEfectivo}
              onChange={(e) => setMontoEfectivo(e.target.value.replace(/[^0-9]/g, ""))}
              style={{ ...inputStyle, fontSize: 16 }} />
          </div>
        )}
        <div style={{ background: T.bg3, borderRadius: 10, padding: 14, border: `1px solid ${T.border}` }}>
          <Row label={metodoPago === "tarjeta" ? "💳 Total con tarjeta" : metodoPago === "efectivo" ? `💵 Total efectivo (−${Math.round((extracto.config.descuentoEfectivo || 0.15) * 100)}%)` : "🔀 Total mixto"}
            value={fmt$(cliente.total)} big bold color={T.green} />
          {cliente.ahorro > 0 && <div style={{ fontSize: 11, color: T.green, textAlign: "right", marginTop: 2 }}>Ahorro vs. tarjeta: {fmt$(cliente.ahorro)}</div>}
        </div>
        {precioSinIva > 0 && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: zonaConf.hex + "15", border: `1px solid ${zonaConf.hex}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{zonaConf.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: zonaConf.hex }}>{zonaConf.label}</span>
            </div>
            {ownerView && <span style={{ fontSize: 13, fontWeight: 800, fontFamily: fontD, color: zonaConf.hex }}>Margen: {margen}%</span>}
          </div>
        )}
      </div>

      {(onGuardar || onWhatsApp || onConvertir) && (
        <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {onGuardar && <button onClick={() => onGuardar({ extracto, precioFinalConIva: precioConIva, metodoPago, montoEfectivo: efectivoMonto, cliente })}
            style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, minWidth: 140, fontSize: 12 }}>💾 Guardar cotización</button>}
          {onWhatsApp && <button onClick={() => onWhatsApp({ extracto, precioFinalConIva: precioConIva, metodoPago, montoEfectivo: efectivoMonto, cliente })}
            style={{ ...btnPrimary(T.green), flex: 1, minWidth: 140, fontSize: 12 }}>📱 WhatsApp PDF</button>}
          {onConvertir && <button onClick={() => onConvertir({ extracto, precioFinalConIva: precioConIva, metodoPago, montoEfectivo: efectivoMonto, cliente })}
            style={{ ...btnPrimary(T.accent), flex: 1, minWidth: 140, fontSize: 12 }}>→ Abrir orden</button>}
        </div>
      )}
    </div>
  );
}
