// ══════════════════════════════════════════════════════════════════
//  Cotizador — Mini-Extracto Path 2 (Iter 7)
//
//  Se inyecta inline en Nueva Orden (flujo normal) debajo de un trabajo
//  Service Full / Service Base. Busca el fitment del vehículo por
//  marca+modelo(+año), calcula los 3 precios, y deja que el
//  recepcionista TOQUE uno para cargarlo en el precio del trabajo.
//
//  - Precio del trabajo en la app = SIN IVA (la app agrega IVA arriba).
//  - Los chips muestran CON IVA (lo que ve el cliente), pero al tocar
//    cargan el valor SIN IVA en el input del trabajo.
//  - Auto-precarga la venta óptima si el precio está vacío.
//  - Si el vehículo no tiene fitment → muestra nota discreta, precio manual.
//
//  Visibilidad por rol (según diseño):
//   · dueño → ve materiales con precios, M.O., labels con fórmulas.
//   · resto → ve QUÉ materiales (sin precios), y los 3 números pelados.
// ══════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadFitment, loadCatalogoMobil, getKitIndex, getSkuIndex } from "./dataLoader.js";
import { cotizarService } from "./engine.js";

const fmt$ = (n) => {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
};

export default function MiniExtractoPath2({
  marca,
  modelo,
  ano,
  trabajo,               // "Service Full" | "Service Base"
  config,
  role = "encargado",
  currentPrice,          // w.price actual (string, SIN IVA)
  onPickPrice,           // (valorSinIva:number) => void  → carga en w.price
  T, fontD, card, btnPrimary, selectStyle,
}) {
  const ownerView = role === "dueño";
  const trabajoKey = trabajo === "Service Base" ? "service_base" : "service_full";

  const [loading, setLoading] = useState(true);
  const [fitList, setFitList] = useState([]);
  const [aceites, setAceites] = useState([]);
  const [kitIndex, setKitIndex] = useState(null);
  const [skuIndex, setSkuIndex] = useState(null);
  const [selMotor, setSelMotor] = useState("");     // motor_hint elegido si hay varios
  const [selAceiteId, setSelAceiteId] = useState("");
  const [extracto, setExtracto] = useState(null);
  const [error, setError] = useState("");

  // Cargar datos una vez
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fit, mob, ki, si] = await Promise.all([
          loadFitment(), loadCatalogoMobil(), getKitIndex(), getSkuIndex(),
        ]);
        if (!mounted) return;
        setAceites(mob.aceites || []);
        setKitIndex(ki); setSkuIndex(si);
        // Filtrar fitments por marca+modelo (case-insensitive, modelo por inclusión)
        const norm = (s) => String(s || "").toLowerCase().trim();
        const marcaN = norm(marca), modeloN = norm(modelo);
        let matches = (fit.fitments || []).filter(f =>
          norm(f.marca) === marcaN &&
          modeloN && (norm(f.modelo).includes(modeloN) || modeloN.includes(norm(f.modelo)))
        );
        // Si hay año, filtrar por rango
        const yr = parseInt(ano, 10);
        if (yr && matches.length > 1) {
          const inRange = matches.filter(f =>
            (!f.ano_desde || f.ano_desde <= yr) && (!f.ano_hasta || f.ano_hasta >= yr)
          );
          if (inRange.length) matches = inRange;
        }
        setFitList(matches);
        if (matches.length >= 1) {
          setSelMotor(matches[0].motor_hint || "");
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [marca, modelo, ano]);

  // Fitment seleccionado según motor elegido
  const selectedFitment = useMemo(() => {
    if (!fitList.length) return null;
    if (fitList.length === 1) return fitList[0];
    return fitList.find(f => (f.motor_hint || "") === selMotor) || fitList[0];
  }, [fitList, selMotor]);

  // Aceite: default del fitment, o el elegido manualmente
  const aceiteObj = useMemo(() => {
    if (!aceites.length || !selectedFitment) return null;
    const wantId = selAceiteId || selectedFitment.aceite_default_id || "mobil_super2000_10w40";
    return aceites.find(a => a.id === wantId) || aceites[0];
  }, [aceites, selectedFitment, selAceiteId]);

  const litros = selectedFitment?.litros_default || 5;

  // Calcular extracto cuando hay fitment + aceite
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedFitment || !aceiteObj || !kitIndex || !skuIndex) { setExtracto(null); return; }
      try {
        const e = await cotizarService({
          fitment: selectedFitment,
          aceite: aceiteObj,
          litros,
          trabajo: trabajoKey,
          config: config?.cotizador,
          kitIndex, skuIndex,
          ivaRate: (config?.ivaRate ?? 21) / 100,
        });
        if (mounted) setExtracto(e);
      } catch (e) {
        if (mounted) setError(e.message);
      }
    })();
    return () => { mounted = false; };
  }, [selectedFitment, aceiteObj, kitIndex, skuIndex, litros, trabajoKey, config]);

  // Auto-precargar venta óptima si el precio del trabajo está vacío
  const autoloaded = useRef(false);
  useEffect(() => {
    if (autoloaded.current) return;
    if (extracto && (!currentPrice || currentPrice === "" || currentPrice === "0")) {
      onPickPrice(Math.round(extracto.ventaOptima));
      autoloaded.current = true;
    }
  }, [extracto, currentPrice, onPickPrice]);

  if (loading) return (
    <div style={{ ...card, padding: 12, marginTop: 8, fontSize: 12, color: T.gray, textAlign: "center" }}>
      ⏳ Buscando precio sugerido…
    </div>
  );

  // Sin fitment → nota discreta, sin bloquear
  if (!selectedFitment) {
    return (
      <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: T.bg, border: `1px dashed ${T.border}`, fontSize: 11, color: T.gray }}>
        🧮 Sin fitment para {marca} {modelo}{ano ? ` ${ano}` : ""} — cargá el precio a mano. (El catálogo se enriquece con el tiempo.)
      </div>
    );
  }

  if (!extracto) return null;

  const kit = extracto.materiales.filtros?.modo === "kit" && kitIndex
    ? kitIndex[extracto.materiales.filtros.kitCode] : null;

  const Chip = ({ label, valueConIva, valueSinIva, color, highlight }) => (
    <div
      onClick={() => onPickPrice(Math.round(valueSinIva))}
      style={{
        flex: 1, minWidth: 90, cursor: "pointer", textAlign: "center",
        padding: "8px 6px", borderRadius: 8,
        background: highlight ? color + "15" : T.bg,
        border: `1px solid ${highlight ? color : T.border}`,
        transition: "all .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = highlight ? color : T.border; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ fontSize: 9, color: T.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: fontD, marginTop: 2 }}>{fmt$(valueConIva)}</div>
      {ownerView && <div style={{ fontSize: 9, color: T.gray }}>{fmt$(valueSinIva)} s/IVA</div>}
    </div>
  );

  return (
    <div style={{ ...card, padding: 14, marginTop: 8, borderColor: T.accent, background: `${T.accent}08` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.accent }}>🧮 Precio sugerido — Cotizador</div>
        {fitList.length > 1 && (
          <select
            value={selMotor}
            onChange={e => { autoloaded.current = false; setSelMotor(e.target.value); }}
            style={{ ...selectStyle, fontSize: 11, padding: "4px 8px", width: "auto", minWidth: 120 }}
          >
            {fitList.map((f, i) => (
              <option key={i} value={f.motor_hint || ""}>
                {f.motor_hint || "—"}{f.ano_desde ? ` ${f.ano_desde}→` : ""} · {f.kit_recomendado}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Materiales (QUÉ va — sin precios para no-dueño) */}
      <div style={{ fontSize: 11, color: T.grayLight, marginBottom: 10, lineHeight: 1.6 }}>
        {kit ? (
          <div>📦 <b>KIT {kit.kitCode}</b> ({kit.skusIncluidos?.length || 0} filtros{ownerView ? ` · ${fmt$(kit.precio)} s/IVA` : ""})</div>
        ) : (
          <div>📦 Filtros sueltos{ownerView ? ` · ${fmt$(extracto.materiales.filtros?.precio)} s/IVA` : ""}</div>
        )}
        <div>🛢 {aceiteObj?.nombre} · {extracto.materiales.aceite?.presentacion} × {litros}L{ownerView && extracto.materiales.aceite?.total ? ` · ${fmt$(extracto.materiales.aceite.total)} s/IVA` : ""}</div>
        {ownerView && (
          <div>🔧 M.O. {selectedFitment.categoria === "alta_gama" ? "alta gama" : "estándar"} · {fmt$(extracto.manoObra.total)} s/IVA</div>
        )}
      </div>

      {/* Aceite selector (opcional, compacto) */}
      {aceites.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <select
            value={selAceiteId || (selectedFitment.aceite_default_id || "mobil_super2000_10w40")}
            onChange={e => { autoloaded.current = false; setSelAceiteId(e.target.value); }}
            style={{ ...selectStyle, fontSize: 11, padding: "6px 8px" }}
          >
            {aceites.map(a => <option key={a.id} value={a.id}>🛢 {a.nombre}</option>)}
          </select>
        </div>
      )}

      {/* Chips de los 3 precios (tocá para cargar) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Chip label="Mínima" valueConIva={extracto.ventaMinimaConIva} valueSinIva={extracto.ventaMinima} color={T.red} />
        <Chip label="Óptima" valueConIva={extracto.ventaOptimaConIva} valueSinIva={extracto.ventaOptima} color={T.green} highlight />
        {extracto.techoCompetitivo != null && (
          <Chip label="Techo" valueConIva={extracto.techoConIva} valueSinIva={extracto.techoCompetitivo} color={T.orange} />
        )}
      </div>
      <div style={{ fontSize: 10, color: T.gray, marginTop: 8, textAlign: "center" }}>
        Tocá un precio para cargarlo, o escribí uno propio arriba. El precio se guarda sin IVA (la app agrega el IVA).
      </div>
    </div>
  );
}
