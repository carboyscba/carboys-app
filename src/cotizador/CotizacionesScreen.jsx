// ══════════════════════════════════════════════════════════════════
//  Cotizador — Pantalla Cotizaciones (Iter 8, CRM)
//
//  Lista todas las cotizaciones emitidas, agrupadas en:
//    · Abiertas (esperando decisión, < 30 días)
//    · Convertidas en orden
//    · Perdidas / Vencidas (> 30 días sin convertir)
//
//  + Métricas del mes (emitidas, convertidas, %, perdidas, abiertas)
//  + Botón 📱 Contactar → WhatsApp con mensaje pre-armado
//
//  Recibe cotizaciones + setCotizaciones (persisten FS+IDB), config,
//  normalizePhone, onNavigate.
// ══════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";

const DIAS_PERDIDA = 30;

const fmt$ = (n) => {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
};

const diasDesde = (iso) => {
  if (!iso) return 0;
  const then = new Date(iso).getTime();
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
};

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Estado efectivo: abierta que pasó los 30 días → "perdida"
function estadoEfectivo(cot) {
  if (cot.estado === "convertida") return "convertida";
  if (cot.estado === "perdida") return "perdida";
  // abierta
  if (diasDesde(cot.fecha) > DIAS_PERDIDA) return "perdida";
  return "abierta";
}

export default function CotizacionesScreen({
  cotizaciones = [],
  setCotizaciones,
  config,
  normalizePhone,
  onNavigate,
  T, fontD, card, btnPrimary, inputStyle,
}) {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  // Agrupar
  const { abiertas, convertidas, perdidas, metricas } = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();
    const match = (c) => {
      if (!q) return true;
      const veh = c.vehiculo || {};
      const cli = c.cliente || {};
      return [veh.marca, veh.modelo, veh.dominio, cli.nombre, cli.telefono]
        .filter(Boolean).some(x => String(x).toLowerCase().includes(q));
    };
    const list = cotizaciones.filter(match);

    const ab = [], cv = [], pd = [];
    list.forEach(c => {
      const est = estadoEfectivo(c);
      if (est === "convertida") cv.push(c);
      else if (est === "perdida") pd.push(c);
      else ab.push(c);
    });

    // ordenar por fecha desc
    const byFecha = (a, b) => (b.fecha || "").localeCompare(a.fecha || "");
    ab.sort(byFecha); cv.sort(byFecha); pd.sort(byFecha);

    // Métricas del mes en curso
    const now = new Date();
    const mesActual = now.getMonth(), anioActual = now.getFullYear();
    const delMes = cotizaciones.filter(c => {
      if (!c.fecha) return false;
      const d = new Date(c.fecha);
      return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });
    const mConv = delMes.filter(c => c.estado === "convertida").length;
    const mPerd = delMes.filter(c => estadoEfectivo(c) === "perdida").length;
    const mAbier = delMes.filter(c => estadoEfectivo(c) === "abierta").length;
    const mEmit = delMes.length;
    const convPct = mEmit > 0 ? Math.round((mConv / mEmit) * 1000) / 10 : 0;

    return {
      abiertas: ab, convertidas: cv, perdidas: pd,
      metricas: { emitidas: mEmit, convertidas: mConv, perdidas: mPerd, abiertas: mAbier, convPct },
    };
  }, [cotizaciones, filtroTexto]);

  // WhatsApp
  const contactar = (cot) => {
    const cli = cot.cliente || {};
    const veh = cot.vehiculo || {};
    const tel = cli.telefono ? (normalizePhone ? normalizePhone(cli.telefono) : cli.telefono.replace(/[^0-9]/g, "")) : "";
    if (!tel) { alert("Esta cotización no tiene teléfono cargado."); return; }
    const trabajoLabel = cot.trabajo === "service_base" ? "Service Base" : "Service Full";
    const precio = cot.precioAcordado || cot.precios?.precioFinalTarjeta || 0;
    const msg =
      `Hola${cli.nombre ? " " + cli.nombre : ""}! Te paso la cotización de CarBoys:\n\n` +
      `🚗 ${veh.marca || ""} ${veh.modelo || ""}${veh.año ? " " + veh.año : ""}\n` +
      `🔧 ${trabajoLabel}\n` +
      `💰 ${fmt$(precio)}\n\n` +
      `Cualquier consulta quedamos a disposición. Saludos, CarBoys 🔧`;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const marcarPerdida = (cot) => {
    setCotizaciones(prev => prev.map(c => c.id === cot.id ? { ...c, estado: "perdida" } : c));
    setDetalle(null);
  };
  const reabrir = (cot) => {
    setCotizaciones(prev => prev.map(c => c.id === cot.id ? { ...c, estado: "abierta" } : c));
    setDetalle(null);
  };
  const eliminar = (cot) => {
    setCotizaciones(prev => prev.filter(c => c.id !== cot.id));
    setConfirmDel(null);
    setDetalle(null);
  };

  const CotRow = ({ cot, tone }) => {
    const cli = cot.cliente || {};
    const veh = cot.vehiculo || {};
    const est = estadoEfectivo(cot);
    const dias = diasDesde(cot.fecha);
    const nombre = cli.nombre || "Anónima";
    const trabajoLabel = cot.trabajo === "service_base" ? "Base" : "Full";
    const precio = cot.precioAcordado || cot.precios?.precioFinalTarjeta || 0;
    const dot = est === "convertida" ? "✅" : est === "perdida" ? "❌" : "🟡";
    return (
      <div
        onClick={() => setDetalle(cot)}
        style={{ ...card, padding: 12, marginBottom: 8, cursor: "pointer", borderLeft: `3px solid ${tone}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {dot} {nombre}
          </div>
          <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>
            {veh.marca} {veh.modelo}{veh.año ? " " + veh.año : ""} · {trabajoLabel} · {fmtFecha(cot.fecha)}
            {est === "abierta" && dias > 0 ? ` · ${dias}d` : ""}
          </div>
        </div>
        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: fontD, color: tone }}>{fmt$(precio)}</div>
          {cli.telefono ? (
            <button
              onClick={(e) => { e.stopPropagation(); contactar(cot); }}
              style={{ ...btnPrimary(T.green), fontSize: 10, padding: "3px 8px", marginTop: 2 }}
            >📱</button>
          ) : (
            <div style={{ fontSize: 10, color: T.gray }}>sin tel</div>
          )}
        </div>
      </div>
    );
  };

  const Section = ({ title, items, tone, emptyMsg }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: tone, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: T.gray, padding: "8px 0" }}>{emptyMsg}</div>
      ) : items.map(c => <CotRow key={c.id} cot={c} tone={tone} />)}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span onClick={() => onNavigate("back")} style={{ cursor: "pointer", fontSize: 20, color: T.gray }}>←</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 800 }}>📄 Cotizaciones</div>
          <div style={{ fontSize: 12, color: T.gray }}>Seguimiento de precios enviados</div>
        </div>
      </div>

      {/* Métricas del mes */}
      <div style={{ ...card, padding: 16, marginBottom: 20, background: `${T.accent}08`, borderColor: T.accent }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 Métricas del mes</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
          <Metric label="Emitidas" value={metricas.emitidas} color={T.text} fontD={fontD} T={T} />
          <Metric label="Convertidas" value={metricas.convertidas} color={T.green} fontD={fontD} T={T} sub={`${metricas.convPct}%`} />
          <Metric label="Abiertas" value={metricas.abiertas} color={T.orange} fontD={fontD} T={T} />
          <Metric label="Perdidas" value={metricas.perdidas} color={T.red} fontD={fontD} T={T} />
        </div>
      </div>

      {/* Filtro */}
      <input
        type="text"
        value={filtroTexto}
        onChange={e => setFiltroTexto(e.target.value)}
        placeholder="🔍 Buscar por cliente, vehículo, dominio…"
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      {cotizaciones.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: T.gray }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Todavía no hay cotizaciones</div>
          <div style={{ fontSize: 12 }}>Cuando guardes una desde el botón 🧮 COTIZACIÓN, aparece acá.</div>
        </div>
      ) : (
        <>
          <Section title="🟡 Abiertas — esperando decisión" items={abiertas} tone={T.orange} emptyMsg="Sin cotizaciones abiertas." />
          <Section title="✅ Convertidas en orden" items={convertidas} tone={T.green} emptyMsg="Ninguna convertida aún." />
          <Section title="❌ Perdidas / Vencidas (>30 días)" items={perdidas} tone={T.red} emptyMsg="Sin cotizaciones perdidas." />
        </>
      )}

      {/* Detalle modal */}
      {detalle && (() => {
        const cli = detalle.cliente || {};
        const veh = detalle.vehiculo || {};
        const est = estadoEfectivo(detalle);
        const p = detalle.precios || {};
        const trabajoLabel = detalle.trabajo === "service_base" ? "Service Base" : "Service Full";
        return (
          <div onClick={(e) => { if (e.target === e.currentTarget) setDetalle(null); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "auto" }}>
            <div style={{ ...card, padding: 0, maxWidth: 440, width: "100%", overflow: "hidden" }}>
              <div style={{ background: `${T.accent}18`, borderBottom: `2px solid ${T.accent}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>
                  {est === "convertida" ? "✅" : est === "perdida" ? "❌" : "🟡"} {cli.nombre || "Anónima"}
                </div>
                <button onClick={() => setDetalle(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 18, padding: "2px 10px", color: T.gray }}>×</button>
              </div>
              <div style={{ padding: 20 }}>
                <DetRow label="Vehículo" value={`${veh.marca || ""} ${veh.modelo || ""}${veh.año ? " " + veh.año : ""}`} T={T} />
                {veh.dominio && <DetRow label="Dominio" value={veh.dominio} T={T} />}
                <DetRow label="Trabajo" value={trabajoLabel} T={T} />
                {cli.telefono && <DetRow label="Teléfono" value={cli.telefono} T={T} />}
                <DetRow label="Fecha" value={fmtFecha(detalle.fecha)} T={T} />
                <div style={{ height: 1, background: T.border, margin: "12px 0" }} />
                {p.ventaMinima != null && <DetRow label="Venta mínima" value={fmt$(p.ventaMinima)} T={T} muted />}
                {p.ventaOptima != null && <DetRow label="Venta óptima" value={fmt$(p.ventaOptima)} T={T} muted />}
                <DetRow label="Precio acordado" value={fmt$(detalle.precioAcordado || p.precioFinalTarjeta)} T={T} bold color={T.green} />
                {detalle.metodoPago && <DetRow label="Método" value={detalle.metodoPago} T={T} />}
                {detalle.orderId && <DetRow label="Orden vinculada" value={"#" + detalle.orderId} T={T} />}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {cli.telefono && (
                    <button onClick={() => contactar(detalle)} style={{ ...btnPrimary(T.green), flex: 1, minWidth: 120, fontSize: 12 }}>📱 Contactar</button>
                  )}
                  {est === "abierta" && (
                    <button onClick={() => marcarPerdida(detalle)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, minWidth: 120, fontSize: 12 }}>Marcar perdida</button>
                  )}
                  {est === "perdida" && (
                    <button onClick={() => reabrir(detalle)} style={{ ...btnPrimary(T.orange), flex: 1, minWidth: 120, fontSize: 12 }}>Reabrir</button>
                  )}
                  <button onClick={() => setConfirmDel(detalle)} style={{ ...btnPrimary(T.red), fontSize: 12, padding: "8px 14px" }}>🗑</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirmar eliminación */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¿Eliminar cotización?</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>No se puede deshacer.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDel(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel)} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color, sub, fontD, T }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: T.gray, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.3px" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 700 }}>{sub}</div>}
    </div>
  );
}

function DetRow({ label, value, muted, bold, color, T }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: 12, color: muted ? T.gray : T.grayLight, fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 600, color: color || T.text }}>{value}</span>
    </div>
  );
}
