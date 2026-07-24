// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config → Concesionarias (Iter B — carpetas por marca)
//
//  Estructura tipo carpeta: se CREA una marca y adentro se van
//  cargando los modelos (con selectores automáticos desde fitment.json).
//
//  Cada modelo persistido = { id, marca, marcaIcono, modelo, motor,
//                precioServiceFull, precioServiceBase, conIva,
//                fechaActualizacion, actualizadoPor, historial }
//
//  Alertas de antigüedad: verde <60d, amarillo 60-120d, rojo >120d.
// ══════════════════════════════════════════════════════════════════

import React, { useMemo, useState, useEffect } from "react";
import { loadFitment } from "./dataLoader.js";

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

function antiguedad(iso, T) {
  const d = diasDesde(iso);
  if (d > 120) return { color: T.red, label: `${d}d — dato viejo`, dot: "🔴" };
  if (d > 60) return { color: T.orange, label: `${d}d — revisar pronto`, dot: "🟡" };
  return { color: T.green, label: `${d}d`, dot: "🟢" };
}

const ICONOS = ["🚗", "🏢", "🏭", "⭐", "🔵", "🔴", "🟢", "🟡", "🟠", "🟣", "⚫", "🏁"];

export default function ConfigConcesionarias({
  concesionarias = [],
  setConcesionarias,
  usuarioNombre,
  T, fontD, card, btnPrimary, inputStyle, selectStyle, labelStyle,
}) {
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDelMarca, setConfirmDelMarca] = useState(null);

  // Marcas abiertas como carpeta aunque todavía no tengan modelos (sesión).
  const [marcasAbiertas, setMarcasAbiertas] = useState([]);
  const [marcaIconos, setMarcaIconos] = useState({}); // marca -> icono elegido en sesión

  // Picker "agregar marca"
  const [pickMarca, setPickMarca] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState("");
  const [nuevaMarcaManual, setNuevaMarcaManual] = useState("");

  // Form de modelo (scopeado a una marca)
  const [formMarca, setFormMarca] = useState(null); // marca a la que agrego modelo
  const [editId, setEditId] = useState(null);
  const [manual, setManual] = useState(false);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return { modelo: "", motor: "", precioServiceFull: "", precioServiceBase: "", conIva: true };
  }

  // ── Catálogo (misma base que el cotizador) ──
  const [fitmentData, setFitmentData] = useState(null);
  useEffect(() => {
    let ok = true;
    loadFitment().then(f => { if (ok) setFitmentData(f); }).catch(() => {});
    return () => { ok = false; };
  }, []);

  const marcasCat = useMemo(() => {
    if (!fitmentData) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => { if (f.marca) s.add(f.marca); });
    return [...s].sort();
  }, [fitmentData]);

  const modelosCat = useMemo(() => {
    if (!fitmentData || !formMarca) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => { if (f.marca === formMarca && f.modelo) s.add(f.modelo); });
    return [...s].sort();
  }, [fitmentData, formMarca]);

  const motoresCat = useMemo(() => {
    if (!fitmentData || !formMarca || !form.modelo) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => {
      if (f.marca === formMarca && f.modelo === form.modelo && f.motor_hint) {
        const rango = f.ano_desde ? ` (${f.ano_desde}${f.ano_hasta ? `–${f.ano_hasta}` : "→"})` : "";
        s.add(f.motor_hint + rango);
      }
    });
    return [...s].sort();
  }, [fitmentData, formMarca, form.modelo]);

  // ── Carpetas: unión de marcas con modelos + marcas abiertas en sesión ──
  const grupos = useMemo(() => {
    const g = {};
    concesionarias.forEach(c => {
      const key = c.marca || "—";
      if (!g[key]) g[key] = { marca: key, icono: c.marcaIcono || marcaIconos[key] || "🚗", items: [] };
      g[key].items.push(c);
    });
    marcasAbiertas.forEach(m => {
      if (!g[m]) g[m] = { marca: m, icono: marcaIconos[m] || "🚗", items: [] };
    });
    return Object.values(g).sort((a, b) => a.marca.localeCompare(b.marca));
  }, [concesionarias, marcasAbiertas, marcaIconos]);

  // ── Agregar marca (carpeta) ──
  const marcasDisponibles = useMemo(
    () => marcasCat.filter(m => !grupos.some(g => g.marca === m)),
    [marcasCat, grupos]
  );
  const confirmarNuevaMarca = () => {
    const m = (nuevaMarcaManual.trim() || nuevaMarca).trim();
    if (!m) return;
    setMarcasAbiertas(prev => prev.includes(m) ? prev : [...prev, m]);
    setPickMarca(false); setNuevaMarca(""); setNuevaMarcaManual("");
    // Abrir directo el form de modelo para esa marca
    abrirModelo(m);
  };

  // ── Form de modelo ──
  const abrirModelo = (marca) => {
    setFormMarca(marca); setEditId(null); setManual(false); setForm(emptyForm());
  };
  const abrirEditar = (c) => {
    setFormMarca(c.marca);
    setForm({
      modelo: c.modelo || "", motor: c.motor || "",
      precioServiceFull: c.precioServiceFull != null ? String(c.precioServiceFull) : "",
      precioServiceBase: c.precioServiceBase != null ? String(c.precioServiceBase) : "",
      conIva: c.conIva !== false,
    });
    setManual(!!c.modelo && modelosCatDe(c.marca).length > 0 && !modelosCatDe(c.marca).includes(c.modelo));
    setEditId(c.id);
  };
  const modelosCatDe = (marca) => {
    if (!fitmentData) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => { if (f.marca === marca && f.modelo) s.add(f.modelo); });
    return [...s];
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updModelo = (v) => setForm(f => ({ ...f, modelo: v, motor: "" }));

  const cerrarForm = () => { setFormMarca(null); setEditId(null); setForm(emptyForm()); };

  const guardar = () => {
    if (!formMarca || !form.modelo.trim()) return;
    const pFull = form.precioServiceFull ? parseFloat(form.precioServiceFull) : null;
    const pBase = form.precioServiceBase ? parseFloat(form.precioServiceBase) : null;
    const ahora = new Date().toISOString();
    const icono = marcaIconos[formMarca] || (concesionarias.find(c => c.marca === formMarca)?.marcaIcono) || "🚗";

    if (editId) {
      setConcesionarias(prev => prev.map(c => {
        if (c.id !== editId) return c;
        const histNew = [...(c.historial || [])];
        if (pFull != null && pFull !== c.precioServiceFull) {
          histNew.push({ precioServiceFull: pFull, precioServiceBase: pBase, fecha: ahora });
        }
        return {
          ...c, marca: formMarca, marcaIcono: icono, modelo: form.modelo.trim(), motor: form.motor.trim(),
          precioServiceFull: pFull, precioServiceBase: pBase, conIva: form.conIva,
          fechaActualizacion: ahora, actualizadoPor: usuarioNombre || null, historial: histNew,
        };
      }));
    } else {
      const nuevo = {
        id: "conc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        marca: formMarca, marcaIcono: icono, modelo: form.modelo.trim(), motor: form.motor.trim(),
        precioServiceFull: pFull, precioServiceBase: pBase, conIva: form.conIva,
        fechaActualizacion: ahora, actualizadoPor: usuarioNombre || null,
        historial: pFull != null ? [{ precioServiceFull: pFull, precioServiceBase: pBase, fecha: ahora }] : [],
      };
      setConcesionarias(prev => [...prev, nuevo]);
    }
    cerrarForm();
  };

  const eliminar = (c) => { setConcesionarias(prev => prev.filter(x => x.id !== c.id)); setConfirmDel(null); };
  const eliminarMarca = (marca) => {
    setConcesionarias(prev => prev.filter(x => x.marca !== marca));
    setMarcasAbiertas(prev => prev.filter(m => m !== marca));
    setConfirmDelMarca(null);
  };

  return (
    <div>
      <div style={{ ...card, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 13, color: T.grayLight, lineHeight: 1.6 }}>
          Precios del service oficial por <b>marca → modelo</b>. Alimentan el <b>techo competitivo</b> del cotizador (precio oficial × factor techo).
        </div>
        <button onClick={() => { setPickMarca(true); setNuevaMarca(""); setNuevaMarcaManual(""); }}
          style={{ ...btnPrimary(T.accent), fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>+ Marca</button>
      </div>

      {grupos.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: "center", color: T.gray }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Sin marcas cargadas</div>
          <div style={{ fontSize: 12 }}>Tocá <b>+ Marca</b> para crear una carpeta y cargar sus modelos.</div>
        </div>
      ) : (
        grupos.map(g => (
          <div key={g.marca} style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{g.icono}</span> 📂 {g.marca}
                <span style={{ fontSize: 12, color: T.gray, fontWeight: 600 }}>({g.items.length})</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => abrirModelo(g.marca)} style={{ ...btnPrimary(T.accent), fontSize: 12, padding: "6px 12px" }}>+ Modelo</button>
                <button onClick={() => setConfirmDelMarca(g.marca)} style={{ background: `${T.red}18`, border: `1px solid ${T.red}40`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: T.red }} title="Eliminar marca">🗑️</button>
              </div>
            </div>

            {g.items.length === 0 ? (
              <div style={{ fontSize: 12, color: T.gray, textAlign: "center", padding: "10px 0" }}>Carpeta vacía — tocá <b>+ Modelo</b>.</div>
            ) : g.items.map(c => {
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
                        {ant.dot} {fmtFecha(c.fechaActualizacion)} · {ant.label}{c.actualizadoPor ? ` · ${c.actualizadoPor}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => abrirEditar(c)} style={{ background: `${T.orange}18`, border: `1px solid ${T.orange}40`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: T.orange }} title="Editar">✏️</button>
                      <button onClick={() => setConfirmDel(c)} style={{ background: `${T.red}18`, border: `1px solid ${T.red}40`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, color: T.red }} title="Eliminar">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* ── Picker: agregar marca ── */}
      {pickMarca && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setPickMarca(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflow: "auto" }}>
          <div style={{ ...card, padding: 0, maxWidth: 420, width: "100%", marginTop: 40, overflow: "hidden" }}>
            <div style={{ background: `${T.accent}18`, borderBottom: `2px solid ${T.accent}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>📂 Nueva marca</div>
              <button onClick={() => setPickMarca(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 18, padding: "2px 10px", color: T.gray }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <label style={labelStyle}>Elegí la marca</label>
              <select value={nuevaMarca} onChange={e => setNuevaMarca(e.target.value)} style={selectStyle}>
                <option value="">Elegí marca…</option>
                {marcasDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div style={{ fontSize: 11, color: T.gray, margin: "10px 0 6px" }}>¿No está en la lista? Escribila:</div>
              <input type="text" value={nuevaMarcaManual} onChange={e => setNuevaMarcaManual(e.target.value)} style={inputStyle} placeholder="Marca a mano" />
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => setPickMarca(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
                <button onClick={confirmarNuevaMarca} disabled={!(nuevaMarca || nuevaMarcaManual.trim())}
                  style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: (nuevaMarca || nuevaMarcaManual.trim()) ? 1 : 0.4 }}>Crear carpeta →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Form de modelo (scopeado a una marca) ── */}
      {formMarca && (
        <div onClick={(e) => { if (e.target === e.currentTarget) cerrarForm(); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflow: "auto" }}>
          <div style={{ ...card, padding: 0, maxWidth: 460, width: "100%", marginTop: 30, overflow: "hidden" }}>
            <div style={{ background: `${T.accent}18`, borderBottom: `2px solid ${T.accent}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>{editId ? "✏️ Editar" : "+ Modelo"} · 📂 {formMarca}</div>
              <button onClick={cerrarForm} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 18, padding: "2px 10px", color: T.gray }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {/* Modelo */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Modelo *</label>
                {!manual ? (
                  <>
                    <select value={form.modelo} onChange={e => updModelo(e.target.value)} style={selectStyle}>
                      <option value="">Elegí modelo…</option>
                      {modelosCat.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div onClick={() => { setManual(true); setForm(f => ({ ...f, modelo: "", motor: "" })); }} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>¿No está? Escribir a mano</div>
                  </>
                ) : (
                  <>
                    <input type="text" value={form.modelo} onChange={e => upd("modelo", e.target.value)} style={inputStyle} placeholder="Modelo a mano" />
                    <div onClick={() => { setManual(false); setForm(f => ({ ...f, modelo: "", motor: "" })); }} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>← Volver al selector</div>
                  </>
                )}
              </div>

              {/* Motor */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Motor / Variante <span style={{ color: T.gray, fontWeight: 400 }}>(opcional)</span></label>
                {!manual && motoresCat.length > 0 ? (
                  <select value={form.motor} onChange={e => upd("motor", e.target.value)} style={selectStyle} disabled={!form.modelo}>
                    <option value="">Todos / sin especificar</option>
                    {motoresCat.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.motor} onChange={e => upd("motor", e.target.value)} style={inputStyle} placeholder="Ej: 2.0 TDI 180cv (opcional)" />
                )}
              </div>

              {/* Precios */}
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
                <button onClick={cerrarForm} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
                <button onClick={guardar} disabled={!form.modelo.trim()} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: form.modelo.trim() ? 1 : 0.4 }}>💾 Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminación de modelo ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¿Eliminar modelo?</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>{confirmDel.marca} {confirmDel.modelo}{confirmDel.motor ? " " + confirmDel.motor : ""}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDel(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => eliminar(confirmDel)} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar eliminación de marca (carpeta) ── */}
      {confirmDelMarca && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📂🗑️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>¿Eliminar la marca {confirmDelMarca}?</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>Se borran todos sus modelos y precios cargados.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelMarca(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => eliminarMarca(confirmDelMarca)} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
