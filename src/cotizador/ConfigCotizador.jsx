// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config panel (Iter 2)
//  Solo visible al rol "dueño" desde Configuración → Cotizador.
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { DEFAULT_COTIZADOR_CONFIG } from "./engine.js";
import { loadFitment, loadCatalogoMobil } from "./dataLoader.js";
import ExtractoPrecios from "./ExtractoPrecios.jsx";

// Field afuera del componente para que React no lo re-cree en cada render
// (si estaba adentro, cada setState desmontaba el input y perdía el foco).
function Field({ label, value, onChange, suffix, hint, T, labelStyle, inputStyle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="text" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))}
          style={{ ...inputStyle, paddingRight: suffix ? 52 : 12 }} />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.gray, fontSize: 12, fontWeight: 700, pointerEvents: "none" }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function ConfigCotizador({
  config, setConfig, T, fontD, card, btnPrimary, inputStyle, labelStyle,
}) {
  const cotConfig = { ...DEFAULT_COTIZADOR_CONFIG, ...(config?.cotizador || {}) };

  const [form, setForm] = useState({
    activo: !!cotConfig.activo,
    manoObraEstandar: String(cotConfig.manoObraEstandar),
    manoObraAltaGama: String(cotConfig.manoObraAltaGama),
    margenMinimoFull: String(Math.round(cotConfig.margenMinimoFull * 100)),
    margenMinimoBase: String(Math.round(cotConfig.margenMinimoBase * 100)),
    factorTechoCompetitivo: String(Math.round(cotConfig.factorTechoCompetitivo * 100)),
    descuentoEfectivo: String(Math.round(cotConfig.descuentoEfectivo * 100)),
    alertaMoMeses: String(cotConfig.alertaMoMeses),
  });

  useEffect(() => {
    const c = { ...DEFAULT_COTIZADOR_CONFIG, ...(config?.cotizador || {}) };
    setForm({
      activo: !!c.activo,
      manoObraEstandar: String(c.manoObraEstandar),
      manoObraAltaGama: String(c.manoObraAltaGama),
      margenMinimoFull: String(Math.round(c.margenMinimoFull * 100)),
      margenMinimoBase: String(Math.round(c.margenMinimoBase * 100)),
      factorTechoCompetitivo: String(Math.round(c.factorTechoCompetitivo * 100)),
      descuentoEfectivo: String(Math.round(c.descuentoEfectivo * 100)),
      alertaMoMeses: String(c.alertaMoMeses),
    });
  }, [config?.cotizador]);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [probando, setProbando] = useState(null);
  const [testError, setTestError] = useState("");

  const openTestAmarok = async () => {
    setTestError("");
    try {
      const [fit, mob] = await Promise.all([loadFitment(), loadCatalogoMobil()]);
      const fitAmarok = (fit.fitments || []).find(f => f.kit_code === "WKU-2001");
      const aceite = (mob.aceites || []).find(a => a.id === "mobil_super2000_10w40");
      if (!fitAmarok || !aceite) throw new Error("No se encontraron datos de prueba.");
      setProbando({ fitment: fitAmarok, aceite, litros: 7, trabajo: "service_full", presentacionAceite: "granel" });
    } catch (e) { setTestError(e.message); }
  };

  const upd = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); setError(""); };

  const handleSave = () => {
    setError("");
    try {
      const parsed = {
        activo: form.activo,
        manoObraEstandar: parseFloat(form.manoObraEstandar) || 0,
        manoObraAltaGama: parseFloat(form.manoObraAltaGama) || 0,
        margenMinimoFull: (parseFloat(form.margenMinimoFull) || 0) / 100,
        margenMinimoBase: (parseFloat(form.margenMinimoBase) || 0) / 100,
        factorTechoCompetitivo: (parseFloat(form.factorTechoCompetitivo) || 0) / 100,
        descuentoEfectivo: (parseFloat(form.descuentoEfectivo) || 0) / 100,
        alertaMoMeses: parseInt(form.alertaMoMeses, 10) || 6,
      };
      if (parsed.manoObraEstandar <= 0) throw new Error("M.O. estándar debe ser mayor a 0");
      if (parsed.manoObraAltaGama <= 0) throw new Error("M.O. alta gama debe ser mayor a 0");
      if (parsed.margenMinimoFull < 0 || parsed.margenMinimoFull >= 1) throw new Error("Margen Full 0%-99%");
      if (parsed.margenMinimoBase < 0 || parsed.margenMinimoBase >= 1) throw new Error("Margen Base 0%-99%");
      if (parsed.factorTechoCompetitivo <= 0 || parsed.factorTechoCompetitivo > 1) throw new Error("Factor techo 1%-100%");
      if (parsed.descuentoEfectivo < 0 || parsed.descuentoEfectivo >= 1) throw new Error("Descuento efectivo 0%-99%");
      setConfig({ ...(config || {}), cotizador: parsed });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
  };

  // Field vive afuera del componente. Le pasamos T/labelStyle/inputStyle explícitos
  // en cada uso (usar un wrapper acá adentro también lo re-crearía por render).
  const themeProps = { T, labelStyle, inputStyle };

  return (
    <div>
      <div style={{ ...card, padding: 20, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>{form.activo ? "🟢 Cotizador activo" : "⚫ Cotizador desactivado"}</div>
          <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>
            {form.activo ? "El módulo está encendido. Los botones aparecen en Nueva Orden." : "Módulo apagado. UI del cotizador oculta."}
          </div>
        </div>
        <div onClick={() => upd("activo", !form.activo)}
          style={{ width: 54, height: 30, borderRadius: 15, background: form.activo ? T.green : T.bg3, border: `1px solid ${T.border}`, position: "relative", cursor: "pointer", transition: "background .2s" }}>
          <div style={{ position: "absolute", top: 2, left: form.activo ? 26 : 2, width: 24, height: 24, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
        </div>
      </div>

      <div style={{ ...card, padding: 24 }}>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>🧮 Parámetros del cotizador</div>
        <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>Todos los valores sin IVA (la UI muestra con IVA al cliente).</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>💼 Mano de obra (por hora)</div>
            <Field {...themeProps} label="Auto estándar" value={form.manoObraEstandar} onChange={(v) => upd("manoObraEstandar", v)} suffix="ARS" hint="Default: $120.000 (sin IVA)" />
            <Field {...themeProps} label="Alta gama" value={form.manoObraAltaGama} onChange={(v) => upd("manoObraAltaGama", v)} suffix="ARS" hint="Audi, BMW, Mercedes-Benz, Porsche, etc." />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 Márgenes</div>
            <Field {...themeProps} label="Margen Service Full" value={form.margenMinimoFull} onChange={(v) => upd("margenMinimoFull", v)} suffix="%" hint="50% = venta óptima 2× costo." />
            <Field {...themeProps} label="Margen Service Base" value={form.margenMinimoBase} onChange={(v) => upd("margenMinimoBase", v)} suffix="%" hint="Mismo cálculo (sin techo)." />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🎯 Techo competitivo</div>
            <Field {...themeProps} label="Factor sobre precio oficial" value={form.factorTechoCompetitivo} onChange={(v) => upd("factorTechoCompetitivo", v)} suffix="%" hint="85% = 15% más barato que el oficial." />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>💵 Descuento efectivo</div>
            <Field {...themeProps} label="Descuento al cash" value={form.descuentoEfectivo} onChange={(v) => upd("descuentoEfectivo", v)} suffix="%" hint="15% default. 17,36% equivale a quitar IVA." />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🔔 Alertas</div>
            <Field {...themeProps} label="Revisar M.O. cada" value={form.alertaMoMeses} onChange={(v) => upd("alertaMoMeses", v)} suffix="meses" />
          </div>
        </div>

        {error && <div style={{ padding: 12, background: "rgba(229,57,53,0.1)", border: `1px solid ${T.red}`, borderRadius: 8, color: T.red, marginTop: 20, fontSize: 13 }}>⚠️ {error}</div>}
        {saved && <div style={{ padding: 12, background: "rgba(67,160,71,0.1)", border: `1px solid ${T.green}`, borderRadius: 8, color: T.green, marginTop: 20, fontSize: 13 }}>✅ Configuración guardada</div>}
        <button onClick={handleSave} style={{ ...btnPrimary(T.accent), marginTop: 24, padding: "12px 32px", fontSize: 15 }}>💾 Guardar cambios</button>

        <div style={{ marginTop: 32, padding: 16, background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>ℹ️ Cómo se calculan los tres precios</div>
          <div style={{ fontSize: 12, color: T.grayLight, lineHeight: 1.7 }}>
            <div>• <b>Venta mínima</b> = materiales + M.O. (costo total sin IVA)</div>
            <div>• <b>Venta óptima</b> = venta mínima ÷ (1 − margen).</div>
            <div>• <b>Techo competitivo</b> = precio oficial × factor techo.</div>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 20, marginTop: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 800, marginBottom: 6 }}>🧪 Probar Extracto de Precios</div>
        <div style={{ fontSize: 12, color: T.gray, marginBottom: 14 }}>Amarok 2.0 TD 180cv 2016+ + 7L Super 2000 granel.</div>
        <button onClick={openTestAmarok} style={{ ...btnPrimary(T.accent), padding: "10px 24px", fontSize: 13 }}>🧮 Ver ejemplo — Amarok Service Full</button>
        {testError && <div style={{ padding: 10, background: T.red + "15", border: `1px solid ${T.red}`, borderRadius: 8, color: T.red, marginTop: 12, fontSize: 12 }}>⚠️ {testError}</div>}
      </div>

      {probando && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setProbando(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "auto" }}>
          <div style={{ maxWidth: 560, width: "100%" }}>
            <ExtractoPrecios fitment={probando.fitment} aceite={probando.aceite} litros={probando.litros}
              trabajo={probando.trabajo} presentacionAceite={probando.presentacionAceite} config={config} role="dueño"
              onClose={() => setProbando(null)} T={T} fontD={fontD} card={card} btnPrimary={btnPrimary} inputStyle={inputStyle} />
          </div>
        </div>
      )}
    </div>
  );
}
