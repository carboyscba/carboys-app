// ══════════════════════════════════════════════════════════════════
//  Cotizador — Nueva Cotización Modal (Iter 5, Path 1.A + 1.B)
//  Form (marca/modelo/motor/año/aceite/trabajo/cliente) → Extracto.
// ══════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import ExtractoPrecios from "./ExtractoPrecios.jsx";
import { loadFitment, loadCatalogoMobil } from "./dataLoader.js";

// ModalWrap afuera del componente. Definirlo adentro creaba un tipo nuevo por render
// y React desmontaba todo el árbol (inputs perdían el foco al tipear cada dígito).
function ModalWrap({ children, onClose }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, overflow: "auto" }}>
      <div style={{ maxWidth: 620, width: "100%", marginTop: 20, marginBottom: 20 }}>{children}</div>
    </div>
  );
}

export default function NuevaCotizacionModal({
  config, role = "dueño", initialForm, concesionarias = null,
  onClose, onGuardar, onWhatsApp, onConvertir,
  T, fontD, card, btnPrimary, inputStyle, selectStyle, labelStyle,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fitmentData, setFitmentData] = useState(null);
  const [mobilData, setMobilData] = useState(null);

  const [form, setForm] = useState({
    marca: initialForm?.marca || "",
    modelo: initialForm?.modelo || "",
    motor_hint: initialForm?.motor_hint || "",
    ano: initialForm?.ano || "",
    aceiteId: "", presentacionId: "", litros: 5, trabajo: "service_full",
    nombre: initialForm?.nombre || "",
    apellido: initialForm?.apellido || "",
    telefono: initialForm?.telefono || "",
    dominio: initialForm?.dominio || null,
  });

  const [step, setStep] = useState("form");
  const [selectedFitment, setSelectedFitment] = useState(null);
  const [selectedAceite, setSelectedAceite] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fit, mob] = await Promise.all([loadFitment(), loadCatalogoMobil()]);
        if (!mounted) return;
        setFitmentData(fit); setMobilData(mob);
      } catch (e) { if (mounted) setError(e.message); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const marcas = useMemo(() => {
    if (!fitmentData) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => { if (f.marca) s.add(f.marca); });
    return [...s].sort();
  }, [fitmentData]);

  const modelos = useMemo(() => {
    if (!fitmentData || !form.marca) return [];
    const s = new Set();
    (fitmentData.fitments || []).forEach(f => { if (f.marca === form.marca && f.modelo) s.add(f.modelo); });
    return [...s].sort();
  }, [fitmentData, form.marca]);

  const motoresDisponibles = useMemo(() => {
    if (!fitmentData || !form.marca || !form.modelo) return [];
    const raw = (fitmentData.fitments || []).filter(f => f.marca === form.marca && f.modelo === form.modelo);
    // Dedup por motor_hint: si hay dos filas con mismo motor (ej Amarok V6 2017→ y 2022→),
    // preferimos la que tiene kit (más económica y con precio oficial Wega).
    const byMotor = new Map();
    for (const f of raw) {
      const key = (f.motor_hint || "").toLowerCase();
      const cur = byMotor.get(key);
      if (!cur) { byMotor.set(key, f); continue; }
      if (f.kit_recomendado && !cur.kit_recomendado) byMotor.set(key, f);
    }
    return Array.from(byMotor.values()).map(f => ({
      motor_hint: f.motor_hint, ano_desde: f.ano_desde, ano_hasta: f.ano_hasta,
      kit_code: f.kit_recomendado || f.kit_code
    }));
  }, [fitmentData, form.marca, form.modelo]);

  const aceites = mobilData?.aceites || [];
  const aceiteObj = aceites.find(a => a.id === form.aceiteId);
  const presentaciones = aceiteObj?.presentaciones || [];

  const marcaFirst = useRef(true);
  useEffect(() => {
    if (marcaFirst.current) { marcaFirst.current = false; return; }
    setForm(f => ({ ...f, modelo: "", motor_hint: "", ano: "" }));
  }, [form.marca]);

  const modeloFirst = useRef(true);
  useEffect(() => {
    if (modeloFirst.current) { modeloFirst.current = false; return; }
    if (motoresDisponibles.length === 1) {
      const m = motoresDisponibles[0];
      setForm(f => ({ ...f, motor_hint: m.motor_hint || "", ano: m.ano_desde || "" }));
    } else {
      setForm(f => ({ ...f, motor_hint: "", ano: "" }));
    }
  }, [form.modelo, motoresDisponibles.length]);

  useEffect(() => {
    if (!fitmentData || !form.marca || !form.modelo) { setSelectedFitment(null); return; }
    const fit = (fitmentData.fitments || []).find(f =>
      f.marca === form.marca && f.modelo === form.modelo &&
      (form.motor_hint ? f.motor_hint === form.motor_hint : true));
    if (!fit) { setSelectedFitment(null); return; }
    setSelectedFitment(fit);
    setForm(f => ({
      ...f,
      aceiteId: f.aceiteId || fit.aceite_default_id || "mobil_super2000_10w40",
      litros: f.litros || fit.litros_default || 5,
    }));
  }, [fitmentData, form.marca, form.modelo, form.motor_hint]);

  useEffect(() => {
    if (!aceiteObj) return;
    const def = aceiteObj.presentaciones?.find(p => p.es_default_borur) || aceiteObj.presentaciones?.[0];
    if (def) setForm(f => ({ ...f, presentacionId: def.id }));
  }, [form.aceiteId, aceiteObj]);

  const puedeAvanzar = selectedFitment && aceiteObj && form.presentacionId && form.litros > 0;

  const handleVerExtracto = () => {
    if (!puedeAvanzar) { setError("Faltan datos: marca, modelo y motor son obligatorios."); return; }
    setError(""); setSelectedAceite(aceiteObj); setStep("extracto");
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <ModalWrap onClose={onClose}><div style={{ padding: 40, textAlign: "center", color: T.gray, fontSize: 14, ...card }}>⏳ Cargando catálogo…</div></ModalWrap>;

  if (step === "extracto" && selectedFitment && selectedAceite) {
    return (
      <ModalWrap onClose={onClose}>
        <ExtractoPrecios
          fitment={selectedFitment} aceite={selectedAceite} litros={parseFloat(form.litros) || 5}
          trabajo={form.trabajo} presentacionAceite={form.presentacionId}
          config={config} concesionarias={concesionarias} role={role} onClose={onClose}
          onGuardar={onGuardar ? (data) => onGuardar({ ...data, form, fitment: selectedFitment, aceite: selectedAceite }) : null}
          onWhatsApp={onWhatsApp ? (data) => onWhatsApp({ ...data, form, fitment: selectedFitment, aceite: selectedAceite }) : null}
          onConvertir={onConvertir ? (data) => onConvertir({ ...data, form, fitment: selectedFitment, aceite: selectedAceite }) : null}
          T={T} fontD={fontD} card={card} btnPrimary={btnPrimary} inputStyle={inputStyle} />
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <button onClick={() => setStep("form")} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, fontSize: 12, padding: "8px 20px" }}>← Volver al formulario</button>
        </div>
      </ModalWrap>
    );
  }

  return (
    <ModalWrap onClose={onClose}>
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(135deg, ${T.accent}22, ${T.accent}08)`, borderBottom: `2px solid ${T.accent}`, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800 }}>🧮 Nueva Cotización</div>
            <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{form.dominio ? `Dominio ${form.dominio}` : "Sin dominio — ingreso manual"}</div>
          </div>
          <button onClick={onClose} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 20, padding: "4px 12px", color: T.gray }}>×</button>
        </div>

        <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase" }}>🚗 Vehículo</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Marca *</label>
                <select value={form.marca} onChange={e => upd("marca", e.target.value)} style={selectStyle}>
                  <option value="">Elegí marca…</option>
                  {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Modelo *</label>
                <select value={form.modelo} onChange={e => upd("modelo", e.target.value)} style={selectStyle} disabled={!form.marca}>
                  <option value="">{form.marca ? "Elegí modelo…" : "Elegí marca primero"}</option>
                  {modelos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            {motoresDisponibles.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Motor / Variante *</label>
                <select value={form.motor_hint || ""}
                  onChange={e => {
                    const m = motoresDisponibles.find(x => (x.motor_hint || "") === e.target.value);
                    upd("motor_hint", e.target.value);
                    if (m?.ano_desde) upd("ano", m.ano_desde);
                  }} style={selectStyle}>
                  <option value="">Elegí motor…</option>
                  {motoresDisponibles.map((m, i) => (
                    <option key={i} value={m.motor_hint || ""}>
                      {m.motor_hint || "—"}{m.ano_desde ? ` · ${m.ano_desde}${m.ano_hasta ? "-"+m.ano_hasta : "→"}` : ""}{m.kit_code ? ` · ${m.kit_code}` : ""}
                    </option>
                  ))}
                </select>
                {selectedFitment && (
                  <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>
                    Kit: <b>{selectedFitment.kit_recomendado}</b> · <b>{selectedFitment.categoria === "alta_gama" ? "Alta gama" : "Estándar"}</b>
                  </div>
                )}
              </div>
            )}
            <div>
              <label style={labelStyle}>Año</label>
              <input type="text" inputMode="numeric" value={form.ano}
                onChange={e => upd("ano", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="2020" style={{ ...inputStyle, maxWidth: 140 }} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase" }}>🔧 Trabajo</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ key: "service_full", label: "Service Full", desc: "50+ puntos + insumos" },
                { key: "service_base", label: "Service Base", desc: "Insumos, sin revisión" }].map(t => (
                <div key={t.key} onClick={() => upd("trabajo", t.key)}
                  style={{ flex: 1, padding: 14, borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${form.trabajo === t.key ? T.accent : T.border}`,
                    background: form.trabajo === t.key ? T.accent + "15" : T.bg, transition: "all .15s" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2, color: form.trabajo === t.key ? T.accent : T.text }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: T.gray }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase" }}>🛢 Aceite</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Aceite</label>
                <select value={form.aceiteId} onChange={e => upd("aceiteId", e.target.value)} style={selectStyle}>
                  <option value="">Elegí aceite…</option>
                  {aceites.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Presentación</label>
                <select value={form.presentacionId} onChange={e => upd("presentacionId", e.target.value)} style={selectStyle} disabled={!aceiteObj}>
                  <option value="">—</option>
                  {presentaciones.map(p => <option key={p.id} value={p.id}>{p.envase}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Litros</label>
                <input type="text" inputMode="decimal" value={form.litros}
                  onChange={e => upd("litros", e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))}
                  style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase" }}>👤 Cliente (opcional)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div><label style={labelStyle}>Nombre</label><input type="text" value={form.nombre} onChange={e => upd("nombre", e.target.value)} style={inputStyle} placeholder="Juan" /></div>
              <div><label style={labelStyle}>Apellido</label><input type="text" value={form.apellido} onChange={e => upd("apellido", e.target.value)} style={inputStyle} placeholder="Pérez" /></div>
              <div><label style={labelStyle}>Teléfono</label><input type="text" inputMode="tel" value={form.telefono} onChange={e => upd("telefono", e.target.value.replace(/[^0-9+\- ]/g, ""))} style={inputStyle} placeholder="3564-..." /></div>
            </div>
            {!form.nombre && !form.telefono && <div style={{ fontSize: 11, color: T.gray, marginTop: 8 }}>Se guarda como cotización anónima.</div>}
          </div>

          {error && <div style={{ padding: 12, background: T.red + "15", border: `1px solid ${T.red}`, borderRadius: 8, color: T.red, marginBottom: 12, fontSize: 13 }}>⚠️ {error}</div>}
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", gap: 12, background: T.bg }}>
          <button onClick={onClose} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, padding: "10px 20px", fontSize: 13 }}>Cancelar</button>
          <button onClick={handleVerExtracto} disabled={!puedeAvanzar}
            style={{ ...btnPrimary(T.accent), padding: "10px 24px", fontSize: 14, fontWeight: 700,
              opacity: puedeAvanzar ? 1 : 0.4, cursor: puedeAvanzar ? "pointer" : "not-allowed" }}>
            🧮 Ver Extracto →
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}
