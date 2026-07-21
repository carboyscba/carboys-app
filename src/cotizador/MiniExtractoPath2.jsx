// ══════════════════════════════════════════════════════════════════
//  Cotizador — Mini-Extracto Path 2 (Iter 7)
//  Debajo del input de precio de Service Full/Base en Nueva Orden.
// ══════════════════════════════════════════════════════════════════

import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadFitment, loadCatalogoMobil, getKitIndex, getSkuIndex } from "./dataLoader.js";
import { cotizarService, buscarPrecioOficialSinIva } from "./engine.js";

// Mapa tipo→label corto para mostrar SKUs con su rol
const TIPO_SHORT = {
  filtro_aire: "aire", filtro_aceite: "aceite",
  filtro_combustible: "combustible", filtro_habitaculo: "habitáculo"
};

const fmt$ = (n) => n == null || Number.isNaN(n) ? "—" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

export default function MiniExtractoPath2({
  marca, modelo, ano, trabajo, config, concesionarias = null, role = "encargado",
  currentPrice, onPickPrice,
  T, fontD, card, btnPrimary, selectStyle,
}) {
  const ownerView = role === "dueño";
  const trabajoKey = trabajo === "Service Base" ? "service_base" : "service_full";

  const [loading, setLoading] = useState(true);
  const [fitList, setFitList] = useState([]);
  const [aceites, setAceites] = useState([]);
  const [kitIndex, setKitIndex] = useState(null);
  const [skuIndex, setSkuIndex] = useState(null);
  const [selMotor, setSelMotor] = useState("");
  const [selAceiteId, setSelAceiteId] = useState("");
  const [extracto, setExtracto] = useState(null);
  const [error, setError] = useState("");
  const [customConIva, setCustomConIva] = useState(""); // input Custom (con IVA)

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [fit, mob, ki, si] = await Promise.all([loadFitment(), loadCatalogoMobil(), getKitIndex(), getSkuIndex()]);
        if (!mounted) return;
        setAceites(mob.aceites || []); setKitIndex(ki); setSkuIndex(si);
        const norm = (s) => String(s || "").toLowerCase().trim();
        const marcaN = norm(marca), modeloN = norm(modelo);
        let matches = (fit.fitments || []).filter(f => norm(f.marca) === marcaN && modeloN && (norm(f.modelo).includes(modeloN) || modeloN.includes(norm(f.modelo))));
        const yr = parseInt(ano, 10);
        if (yr && matches.length > 1) {
          const inRange = matches.filter(f => (!f.ano_desde || f.ano_desde <= yr) && (!f.ano_hasta || f.ano_hasta >= yr));
          if (inRange.length) matches = inRange;
        }
        // Dedup por motor_hint: si dos filas comparten el mismo motor (ej Amarok V6 2017→
        // y 2022→), preferir la que tiene kit (más económica y con precio oficial Wega).
        const byMotor = new Map();
        for (const f of matches) {
          const key = (f.motor_hint || "").toLowerCase();
          const cur = byMotor.get(key);
          if (!cur) { byMotor.set(key, f); continue; }
          // Reemplazar si la nueva tiene kit y la existente no
          if (f.kit_recomendado && !cur.kit_recomendado) byMotor.set(key, f);
        }
        matches = Array.from(byMotor.values());

        setFitList(matches);
        // Si hay UN solo fitment, autoseleccionar. Si hay varios, forzar elección
        // manual del usuario — el motor cambia el kit y los litros.
        if (matches.length === 1) setSelMotor(matches[0].motor_hint || "");
        else setSelMotor(""); // vacío = "Elegí motor…"
      } catch (e) { if (mounted) setError(e.message); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [marca, modelo, ano]);

  const selectedFitment = useMemo(() => {
    if (!fitList.length) return null;
    if (fitList.length === 1) return fitList[0];
    // Con varios fitments no autoseleccionamos: si el usuario aún no eligió, devolvemos null.
    if (!selMotor) return null;
    return fitList.find(f => (f.motor_hint || "") === selMotor) || null;
  }, [fitList, selMotor]);

  const aceiteObj = useMemo(() => {
    if (!aceites.length || !selectedFitment) return null;
    const wantId = selAceiteId || selectedFitment.aceite_default_id || "mobil_super2000_10w40";
    return aceites.find(a => a.id === wantId) || aceites[0];
  }, [aceites, selectedFitment, selAceiteId]);

  const litros = selectedFitment?.litros_default || 5;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedFitment || !aceiteObj || !kitIndex || !skuIndex) { setExtracto(null); return; }
      try {
        const e = await cotizarService({
          fitment: selectedFitment, aceite: aceiteObj, litros, trabajo: trabajoKey, config: config?.cotizador,
          precioOficialSinIva: buscarPrecioOficialSinIva(concesionarias || [], {
            marca: selectedFitment.marca, modelo: selectedFitment.modelo, motor: selectedFitment.motor_hint,
            trabajo: trabajoKey, ivaRate: (config?.ivaRate ?? 21) / 100,
          }),
          kitIndex, skuIndex, ivaRate: (config?.ivaRate ?? 21) / 100,
        });
        if (mounted) setExtracto(e);
      } catch (e) { if (mounted) setError(e.message); }
    })();
    return () => { mounted = false; };
  }, [selectedFitment, aceiteObj, kitIndex, skuIndex, litros, trabajoKey, config, concesionarias]);

  const autoloaded = useRef(false);
  useEffect(() => {
    if (autoloaded.current) return;
    if (extracto && (!currentPrice || currentPrice === "" || currentPrice === "0")) {
      onPickPrice(Math.round(extracto.ventaOptima));
      autoloaded.current = true;
    }
  }, [extracto, currentPrice, onPickPrice]);

  if (loading) return <div style={{ ...card, padding: 12, marginTop: 8, fontSize: 12, color: T.gray, textAlign: "center" }}>⏳ Buscando precio sugerido…</div>;

  // Caso: no hay ningún fitment para el vehículo.
  if (!fitList.length) {
    return <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: T.bg, border: `1px dashed ${T.border}`, fontSize: 11, color: T.gray }}>
      🧮 Sin fitment para {marca} {modelo}{ano ? ` ${ano}` : ""} — cargá el precio a mano.
    </div>;
  }

  // Caso: hay varios motores y el usuario aún no eligió → mostrar solo el selector.
  if (!selectedFitment) {
    return (
      <div style={{ ...card, padding: 14, marginTop: 8, borderColor: T.orange, background: `${T.orange}08` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.orange, marginBottom: 8 }}>⚠️ Elegí motor — cambia el kit y los litros</div>
        <div style={{ fontSize: 11, color: T.grayLight, marginBottom: 10 }}>{marca} {modelo}{ano ? ` ${ano}` : ""} tiene {fitList.length} versiones.</div>
        <select value={selMotor} onChange={e => { autoloaded.current = false; setSelMotor(e.target.value); }}
          style={{ ...selectStyle, fontSize: 12, padding: "8px 10px", width: "100%" }}>
          <option value="">— Elegí motor…</option>
          {fitList.map((f, i) => {
            const rango = f.ano_desde ? `${f.ano_desde}${f.ano_hasta ? `–${f.ano_hasta}` : "→"}` : "";
            return <option key={i} value={f.motor_hint || ""}>{f.motor_hint || "—"}{rango ? ` · ${rango}` : ""} · kit {f.kit_recomendado}</option>;
          })}
        </select>
      </div>
    );
  }

  if (!extracto) return null;

  const kit = extracto.materiales.filtros?.modo === "kit" && kitIndex ? kitIndex[extracto.materiales.filtros.kitCode] : null;

  const Chip = ({ label, valueConIva, valueSinIva, color, highlight }) => (
    <div onClick={() => onPickPrice(Math.round(valueSinIva))}
      style={{ flex: 1, minWidth: 90, cursor: "pointer", textAlign: "center", padding: "8px 6px", borderRadius: 8,
        background: highlight ? color + "15" : T.bg, border: `1px solid ${highlight ? color : T.border}`, transition: "all .15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = highlight ? color : T.border; e.currentTarget.style.transform = "none"; }}>
      <div style={{ fontSize: 9, color: T.gray, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: fontD, marginTop: 2 }}>{fmt$(valueConIva)}</div>
      {ownerView && <div style={{ fontSize: 9, color: T.gray }}>{fmt$(valueSinIva)} s/IVA</div>}
    </div>
  );

  return (
    <div style={{ ...card, padding: 14, marginTop: 8, borderColor: T.accent, background: `${T.accent}08` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: T.accent }}>
          🧮 {selectedFitment.motor_hint || "Motor único"}{selectedFitment.ano_desde ? ` · ${selectedFitment.ano_desde}${selectedFitment.ano_hasta ? `–${selectedFitment.ano_hasta}` : "→"}` : ""}
        </div>
        {fitList.length > 1 && (
          <select value={selMotor} onChange={e => { autoloaded.current = false; setSelMotor(e.target.value); }}
            style={{ ...selectStyle, fontSize: 11, padding: "4px 8px", width: "auto", minWidth: 160 }}>
            {fitList.map((f, i) => {
              const rango = f.ano_desde ? ` ${f.ano_desde}${f.ano_hasta ? `–${f.ano_hasta}` : "→"}` : "";
              return <option key={i} value={f.motor_hint || ""}>{f.motor_hint || "—"}{rango} · {f.kit_recomendado}</option>;
            })}
          </select>
        )}
      </div>
      <div style={{ fontSize: 11, color: T.grayLight, marginBottom: 10, lineHeight: 1.6 }}>
        {extracto.materiales.filtros?.modo === "base_aire_aceite" ? (
          <div>
            <div>📦 <b>Aire + Aceite</b> (Service Base){ownerView ? ` · ${fmt$(extracto.materiales.filtros?.precio)} s/IVA` : ""}</div>
            {skuIndex && (
              <div style={{ paddingLeft: 18, fontSize: 10, color: T.gray, marginTop: 2 }}>
                {(extracto.materiales.filtros?.skus || []).map(s => (
                  <span key={s.sku} style={{ marginRight: 10 }}>
                    · <b>{s.sku}</b> ({TIPO_SHORT[skuIndex[s.sku]?.tipo] || ""})
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : kit ? (
          <div>
            <div>📦 <b>KIT {kit.kitCode}</b> — {kit.nombre || `${kit.skusIncluidos?.length || 0} filtros`}{ownerView ? ` · ${fmt$(kit.precio)} s/IVA` : ""}</div>
            {skuIndex && (
              <div style={{ paddingLeft: 18, fontSize: 10, color: T.gray, marginTop: 2 }}>
                {(kit.skusIncluidos || []).map(s => (
                  <span key={s.sku} style={{ marginRight: 10 }}>
                    · <b>{s.sku}</b> ({TIPO_SHORT[skuIndex[s.sku]?.tipo] || ""})
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div>📦 <b>Filtros sueltos</b> (4){ownerView ? ` · ${fmt$(extracto.materiales.filtros?.precio)} s/IVA` : ""}</div>
            {skuIndex && (
              <div style={{ paddingLeft: 18, fontSize: 10, color: T.gray, marginTop: 2 }}>
                {(extracto.materiales.filtros?.skus || []).map(s => (
                  <span key={s.sku} style={{ marginRight: 10 }}>
                    · <b>{s.sku}</b> ({TIPO_SHORT[skuIndex[s.sku]?.tipo] || ""})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <div>🛢 {aceiteObj?.nombre} · {extracto.materiales.aceite?.presentacion} × {litros}L{ownerView && extracto.materiales.aceite?.total ? ` · ${fmt$(extracto.materiales.aceite.total)} s/IVA` : ""}</div>
        {ownerView && <div>🔧 M.O. {selectedFitment.categoria === "alta_gama" ? "alta gama" : "estándar"} · {fmt$(extracto.manoObra.total)} s/IVA</div>}
      </div>
      {aceites.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <select value={selAceiteId || (selectedFitment.aceite_default_id || "mobil_super2000_10w40")}
            onChange={e => { autoloaded.current = false; setSelAceiteId(e.target.value); }}
            style={{ ...selectStyle, fontSize: 11, padding: "6px 8px" }}>
            {aceites.map(a => <option key={a.id} value={a.id}>🛢 {a.nombre}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Chip label="Mínima" valueConIva={extracto.ventaMinimaConIva} valueSinIva={extracto.ventaMinima} color={T.red} />
        <Chip label="Óptima" valueConIva={extracto.ventaOptimaConIva} valueSinIva={extracto.ventaOptima} color={T.green} highlight />
        {extracto.techoCompetitivo != null && <Chip label="Techo" valueConIva={extracto.techoConIva} valueSinIva={extracto.techoCompetitivo} color={T.orange} />}
        {/* Chip Custom: input inline. El GM tipea con IVA, guardamos sin IVA en la orden. */}
        <div style={{ flex: 1, minWidth: 110, padding: "6px 8px", borderRadius: 8, background: T.bg, border: `1px solid ${T.accent}`, textAlign: "center" }}>
          <div style={{ fontSize: 9, color: T.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Custom (c/IVA)</div>
          <input type="text" inputMode="numeric" value={customConIva}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setCustomConIva(raw);
              autoloaded.current = true; // freno el autopick de Óptima
              const ivaFactor = 1 + (config?.ivaRate ?? 21) / 100;
              const sinIva = raw ? Math.round(parseInt(raw, 10) / ivaFactor) : 0;
              onPickPrice(sinIva);
            }}
            placeholder="0"
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: T.accent, fontSize: 14, fontWeight: 800, fontFamily: fontD, textAlign: "center" }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: T.gray, marginTop: 8, textAlign: "center" }}>Tocá Mínima/Óptima/Techo o tipeá un Custom con IVA. Se guarda sin IVA.</div>
    </div>
  );
}
