// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config panel (Iter 2)
//
//  Se renderiza como un tab dentro de AdminScreen. Solo visible al
//  rol "dueño". Recibe theme/style constants por props para respetar
//  el look de la app existente sin duplicar constantes.
//
//  Guarda cambios en config.cotizador vía setConfig (que persiste a
//  Firestore por el flujo existente de la app).
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { DEFAULT_COTIZADOR_CONFIG } from "./engine.js";

export default function ConfigCotizador({
  config,
  setConfig,
  T,
  fontD,
  card,
  btnPrimary,
  inputStyle,
  labelStyle,
}) {
  const cotConfig = { ...DEFAULT_COTIZADOR_CONFIG, ...(config?.cotizador || {}) };

  // Estado local (strings para inputs)
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

  // Re-sync si config cambia externamente
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

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
    setError("");
  };

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
      if (parsed.margenMinimoFull < 0 || parsed.margenMinimoFull >= 1) throw new Error("Margen Full debe estar entre 0% y 99%");
      if (parsed.margenMinimoBase < 0 || parsed.margenMinimoBase >= 1) throw new Error("Margen Base debe estar entre 0% y 99%");
      if (parsed.factorTechoCompetitivo <= 0 || parsed.factorTechoCompetitivo > 1) throw new Error("Factor techo debe estar entre 1% y 100%");
      if (parsed.descuentoEfectivo < 0 || parsed.descuentoEfectivo >= 1) throw new Error("Descuento efectivo debe estar entre 0% y 99%");

      const newConfig = { ...(config || {}), cotizador: parsed };
      setConfig(newConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    }
  };

  const Field = ({ label, value, onChange, suffix, hint, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder || ""}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))}
          style={{ ...inputStyle, paddingRight: suffix ? 52 : 12 }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.gray, fontSize: 12, fontWeight: 700, pointerEvents: "none" }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>{hint}</div>}
    </div>
  );

  return (
    <div>
      {/* Toggle activo por sucursal */}
      <div style={{ ...card, padding: 20, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800 }}>
            {form.activo ? "🟢 Cotizador activo" : "⚫ Cotizador desactivado"}
          </div>
          <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>
            {form.activo
              ? "El módulo está encendido. Los botones de Cotización aparecen en Nueva Orden (cuando se implementen)."
              : "El módulo está apagado en esta sucursal. La UI del cotizador no aparece en Nueva Orden."}
          </div>
        </div>
        <div
          onClick={() => upd("activo", !form.activo)}
          style={{
            width: 54, height: 30, borderRadius: 15,
            background: form.activo ? T.green : T.bg3,
            border: `1px solid ${T.border}`,
            position: "relative", cursor: "pointer", transition: "background .2s",
          }}
        >
          <div style={{
            position: "absolute", top: 2, left: form.activo ? 26 : 2,
            width: 24, height: 24, borderRadius: "50%",
            background: "#fff", transition: "left .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        </div>
      </div>

      <div style={{ ...card, padding: 24 }}>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 6 }}>🧮 Parámetros del cotizador</div>
        <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>
          Ajustes del motor de precios. Todos los valores se manejan sin IVA (la UI muestra con IVA al cliente).
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>💼 Mano de obra gremial (por hora)</div>
            <Field label="Auto estándar" value={form.manoObraEstandar} onChange={(v) => upd("manoObraEstandar", v)} suffix="ARS" hint="Default: $120.000 (sin IVA)" />
            <Field label="Alta gama" value={form.manoObraAltaGama} onChange={(v) => upd("manoObraAltaGama", v)} suffix="ARS" hint="Audi, BMW, Mercedes-Benz, Porsche, Land Rover, Volvo, Jaguar, Mini." />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 Márgenes</div>
            <Field label="Margen mínimo Service Full" value={form.margenMinimoFull} onChange={(v) => upd("margenMinimoFull", v)} suffix="%" hint="50% = venta óptima es 2× costo total." />
            <Field label="Margen mínimo Service Base" value={form.margenMinimoBase} onChange={(v) => upd("margenMinimoBase", v)} suffix="%" hint="Mismo cálculo que Service Full (sin techo)." />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🎯 Techo competitivo</div>
            <Field label="Factor sobre precio oficial" value={form.factorTechoCompetitivo} onChange={(v) => upd("factorTechoCompetitivo", v)} suffix="%" hint="85% = techo es 15% más barato que la concesionaria oficial." />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>💵 Descuento por efectivo</div>
            <Field label="Descuento aplicado al cash" value={form.descuentoEfectivo} onChange={(v) => upd("descuentoEfectivo", v)} suffix="%" hint="15% default. 17,36% equivale exacto a quitar el IVA. 21% regala plata." />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>🔔 Alertas</div>
            <Field label="Revisar M.O. cada" value={form.alertaMoMeses} onChange={(v) => upd("alertaMoMeses", v)} suffix="meses" hint="La app te avisa cuando corresponde revisar tarifas." />
          </div>
        </div>

        {error && (
          <div style={{ padding: 12, background: "rgba(229,57,53,0.1)", border: `1px solid ${T.red}`, borderRadius: 8, color: T.red, marginTop: 20, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{ padding: 12, background: "rgba(67,160,71,0.1)", border: `1px solid ${T.green}`, borderRadius: 8, color: T.green, marginTop: 20, fontSize: 13 }}>
            ✅ Configuración guardada
          </div>
        )}

        <button onClick={handleSave} style={{ ...btnPrimary(T.accent), marginTop: 24, padding: "12px 32px", fontSize: 15 }}>
          💾 Guardar cambios
        </button>

        {/* Info del motor */}
        <div style={{ marginTop: 32, padding: 16, background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.gray, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>ℹ️ Cómo se calculan los tres precios</div>
          <div style={{ fontSize: 12, color: T.grayLight, lineHeight: 1.7 }}>
            <div>• <b>Venta mínima</b> = materiales + M.O. (costo total sin IVA)</div>
            <div>• <b>Venta óptima</b> = venta mínima ÷ (1 − margen). Con 50% margen, es 2× el costo.</div>
            <div>• <b>Techo competitivo</b> = precio oficial de la concesionaria × factor techo.</div>
            <div style={{ marginTop: 6 }}>
              Todos los cálculos internos son SIN IVA. La UI muestra CON IVA al cliente. El descuento efectivo se aplica solo sobre la parte pagada en cash (los pagos mixtos lo hacen automáticamente).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
