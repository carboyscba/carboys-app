// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config → Concesionarias (Iter 9)
//
//  Precios oficiales de las concesionarias, para alimentar el
//  "techo competitivo" (precio oficial × factor techo).
//
//  Cada fila = { id, marca, marcaIcono, modelo, motor,
//                precioServiceFull, precioServiceBase, conIva,
//                fechaActualizacion, actualizadoPor, historial }
//  Se persiste con setConcesionarias (FS + IDB, patrón de la app).
//
//  Alertas de antigüedad: verde <60d, amarillo 60-120d, rojo >120d.
// ══════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";

const fmt$ = (n) => {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(n));
};

const diasDesde = (iso) => {
  if (!iso) return 9999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
};

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Estado de antigüedad
function antiguedad(iso, T) {
  const d = diasDesde(iso);
  if (d > 120) return { color: T.red, label: `${d}d — dato viejo`, dot: "🔴" };
  if (d > 60) return { color: T.orange, label: `${d}d — revisar pronto`, dot: "🟡" };
  return { color: T.green, label: `${d}d`, dot: "🟢" };
}

const ICONOS = ["🏢", "🚗", "🏭", "⭐", "🔵", "🔴", "🟢", "🟡", "🟠", "🟣", "⚫", "🏁"];

export default function ConfigConcesionarias({
  concesionarias = [],
  setConcesionarias,
  usuarioNombre,
  T, fontD, card, btnPrimary, inputStyle, selectStyle, labelStyle,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return {
      marca: "", marcaIcono: "🏢", modelo: "", motor: "",
      precioServiceFull: "", precioServiceBase: "", conIva: true,
    };
  }

  // Agrupar por marca
  const grupos = useMemo(() => {
    const g = {};
    concesionarias.forEach(c => {
      const key = c.marca || "—";
      if (!g[key]) g[key] = { marca: key, icono: c.marcaIcono || "🏢", items: [] };
      g[key].items.push(c);
    });
    return Object.values(g).sort((a, b) => a.marca.localeCompare(b.marca));
  }, [concesionarias]);

  const openNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({
      marca: c.marca || "", marcaIcono: c.marcaIcono || "🏢", modelo: c.modelo || "", motor: c.motor || "",
      precioServiceFull: c.precioServiceFull != null ? String(c.precioServiceFull) : "",
      precioServiceBase: c.precioServiceBase != null ? String(c.precioServiceBase) : "",
      conIva: c.conIva !== false,
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.marca.trim() || !form.modelo.trim()) return;
    const pFull = form.precioServiceFull ? parseFloat(form.precioServiceFull) : null;
    const pBase = form.precioServiceBase ? parseFloat(form.precioServiceBase) : null;
    const ahora = new Date().toISOString();

    if (editId) {
      setConcesionarias(prev => prev.map(c => {
        if (c.id !== editId) return c;
        // Guardar histórico si cambió el precio Full
        const histNew = [...(c.historial || [])];
        if (pFull != null && pFull !== c.precioServiceFull) {
          histNew.push({ precioServiceFull: pFull, precioServiceBase: pBase, fecha: ahora });
        }
        return {
          ...c,
          marca: form.marca.trim(), marcaIcono: form.marcaIcono, modelo: form.modelo.trim(), motor: form.motor.trim(),
          precioServiceFull: pFull, precioServiceBase: pBase, conIva: form.conIva,
          fechaActualizacion: ahora, actualizadoPor: usuarioNombre || null,
          historial: histNew,
        };
      }));
    } else {
      const nuevo = {
        id: "conc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        marca: form.marca.trim(), marcaIcono: form.marcaIcono, modelo: form.modelo.trim(), motor: form.motor.trim(),
        precioServiceFull: pFull, precioServiceBase: pBase, conIva: form.conIva,
        fechaActualizacion: ahora, actualizadoPor: usuarioNombre || null,
        historial: pFull != null ? [{ precioServiceFull: pFull, precioServiceBase: pBase, fecha: ahora }] : [],
      };
      setConcesionarias(prev => [...prev, nuevo]);
    }
    setShowForm(false);
    setForm(emptyForm());
    setEditId(null);
  };

  const eliminar = (c) => {
    setConcesionarias(prev => prev.filter(x => x.id !== c.id));
    setConfirmDel(null);
  };

  return (
    <div>
      <div style={{ ...card, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: T.grayLight, lineHeight: 1.6 }}>
            Precios del service oficial de cada concesionaria. Alimentan el <b>techo competitivo</b> del cotizador (precio oficial × factor techo).
          </div>
        </div>
        <button onClick={openNew} style={{ ...btnPrimary(T.accent), fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>+ Nuevo precio</button>
      </div>

      {concesionarias.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: T.gray }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏢</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Sin precios oficiales cargados</div>
          <div style={{ fontSize: 12 }}>Agregá el precio del service oficial de cada modelo para calcular el techo competitivo.</div>
        </div>
      ) : (
        grupos.map(g => (
          <div key={g.marca} style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{g.icono}</span> {g.marca}
            </div>
            {g.items.map(c => {
              const ant = antiguedad(c.fechaActualizacion, T);
              return (
                <div key={c.id} style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, marginBottom: 8, borderLeft: `3px solid ${ant.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{c.modelo}{c.motor ? ` — ${c.motor}` : ""}</div>
                      <div style={{ fontSize: 12, color: T.grayLight, marginTop: 4 }}>
                        Full: <b style={{ color: T.text }}>{fmt$(c.precioServiceFull)}</b>
                        {c.precioServiceBase != null && <> · Base: <b style={{ color: T.text }}>{fmt$(c.precioServiceBase)}</b></>}
                        <span style={{ color: T.gray }}> · {c.conIva !== false ? "c/IVA" : "s/IVA"}</span>
                      </div>
                      <div style={{ fontSize: 11, color: ant.color, marginTop: 4 }}>
                        {ant.dot} {fmtFecha(c.fechaActualizacion)} · {ant.label}
                        {c.actualizadoPor ? ` · ${c.actualizadoPor}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ background: `${T.orange}18`, border: `1px solid ${T.orange}40`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: T.orange }} title="Editar">✏️</button>
                      <button onClick={() => setConfirmDel(c)} style={{ background: `${T.red}18`, border: `1px solid ${T.red}40`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: T.red }} title="Eliminar">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflow: "auto" }}>
          <div style={{ ...card, padding: 0, maxWidth: 460, width: "100%", marginTop: 30, overflow: "hidden" }}>
            <div style={{ background: `${T.accent}18`, borderBottom: `2px solid ${T.accent}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>{editId ? "✏️ Editar precio oficial" : "+ Nuevo precio oficial"}</div>
              <button onClick={() => setShowForm(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 18, padding: "2px 10px", color: T.gray }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Icono</label>
                  <select value={form.marcaIcono} onChange={e => upd("marcaIcono", e.target.value)} style={{ ...selectStyle, fontSize: 18, padding: "8px" }}>
                    {ICONOS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Marca *</label>
                  <input type="text" value={form.marca} onChange={e => upd("marca", e.target.value)} style={inputStyle} placeholder="Volkswagen" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Modelo *</label>
                  <input type="text" value={form.modelo} onChange={e => upd("modelo", e.target.value)} style={inputStyle} placeholder="Amarok" />
                </div>
                <div>
                  <label style={labelStyle}>Motor / Variante</label>
                  <input type="text" value={form.motor} onChange={e => upd("motor", e.target.value)} style={inputStyle} placeholder="2.0 TDI 180cv" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Precio Service Full *</label>
                  <input type="text" inputMode="numeric" value={form.precioServiceFull} onChange={e => upd("precioServiceFull", e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} placeholder="780000" />
                </div>
                <div>
                  <label style={labelStyle}>Precio Service Base</label>
                  <input type="text" inputMode="numeric" value={form.precioServiceBase} onChange={e => upd("precioServiceBase", e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} placeholder="(opcional)" />
                </div>
              </div>

              <div onClick={() => upd("conIva", !form.conIva)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, marginBottom: 16 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${form.conIva ? T.accent : T.gray}`, background: form.conIva ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>
                  {form.conIva ? "✓" : ""}
                </div>
                <div style={{ fontSize: 13 }}>El precio oficial <b>incluye IVA</b> (así lo cobra la concesionaria)</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowForm(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
                <button onClick={guardar} disabled={!form.marca.trim() || !form.modelo.trim()} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: (form.marca.trim() && form.modelo.trim()) ? 1 : 0.4 }}>💾 Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminación ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¿Eliminar precio?</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>{confirmDel.marca} {confirmDel.modelo}{confirmDel.motor ? " " + confirmDel.motor : ""}</div>
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
