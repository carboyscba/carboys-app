// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config → Lista Proveedores (Iter 3)
//  Muestra BORUR + botón "Cargar semilla inicial" a Firestore.
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { loadAllSeedData } from "./dataLoader.js";
import { cargarSemillaInicial, getSeedStatus } from "./firestoreCotizador.js";

export default function ConfigProveedores({ fsSave, fsGetDoc, T, fontD, card, btnPrimary }) {
  const [seedStatus, setSeedStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [finalStats, setFinalStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSeedStatus({ fsGetDoc });
        if (mounted) setSeedStatus(s);
      } catch (e) { if (mounted) setError(e.message); }
      finally { if (mounted) setLoadingStatus(false); }
    })();
    return () => { mounted = false; };
  }, [fsGetDoc]);

  const handleCargar = async () => {
    setConfirmOpen(false);
    setUploading(true);
    setError(""); setProgress(0); setProgressMsg("Cargando datos semilla…"); setFinalStats(null);
    try {
      const seed = await loadAllSeedData();
      setProgressMsg("Preparando upload…");
      const stats = await cargarSemillaInicial({
        fsSave, catalogoWega: seed.catalogoWega, catalogoMobil: seed.catalogoMobil, fitment: seed.fitment,
        onProgress: (pct, msg) => { setProgress(pct); setProgressMsg(msg); },
      });
      setFinalStats(stats);
      const newStatus = await getSeedStatus({ fsGetDoc });
      setSeedStatus(newStatus);
    } catch (e) { setError(e.message || String(e)); }
    finally { setUploading(false); }
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const StatCard = ({ label, value, accent }) => (
    <div style={{ ...card, padding: 14, textAlign: "center" }}>
      <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: accent }}>{value?.toLocaleString("es-AR") ?? 0}</div>
      <div style={{ fontSize: 11, color: T.gray, textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 44 }}>📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 800 }}>BORUR</div>
            <div style={{ fontSize: 12, color: T.gray }}>Distribuidor autorizado — Freyre, Córdoba</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 8, background: T.green + "20", color: T.green, fontSize: 11, fontWeight: 700 }}>ACTIVO</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
          <div><div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Teléfono</div><div style={{ fontSize: 13 }}>03564-462000</div></div>
          <div><div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Email</div><div style={{ fontSize: 13 }}>info@borursrl.com</div></div>
          <div><div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Formato</div><div style={{ fontSize: 13 }}>Excel (parser BORUR)</div></div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Rubros que provee</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <div style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, fontSize: 12, border: `1px solid ${T.border}` }}>📋 Filtros · <b>Wega</b></div>
            <div style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, fontSize: 12, border: `1px solid ${T.border}` }}>🛢 Aceites · <b>Mobil</b></div>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>🌱 Catálogo maestro</div>
        <div style={{ fontSize: 12, color: T.gray, marginBottom: 20 }}>La semilla trae 3.142 artículos + 122 kits + 6 aceites + 122 fitments.</div>

        {loadingStatus && <div style={{ padding: 20, textAlign: "center", color: T.gray, fontSize: 13 }}>Consultando Firestore…</div>}

        {!loadingStatus && !seedStatus && !uploading && (
          <div style={{ padding: 16, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.grayLight, marginBottom: 12 }}>⚠️ Todavía no cargaste la semilla en esta sucursal.</div>
            <button onClick={() => setConfirmOpen(true)} style={{ ...btnPrimary(T.accent), padding: "12px 24px", fontSize: 14, fontWeight: 700, width: "100%" }}>🌱 Cargar semilla inicial a Firestore</button>
          </div>
        )}

        {!loadingStatus && seedStatus && !uploading && (
          <div>
            <div style={{ padding: 16, background: T.green + "12", border: `1px solid ${T.green}`, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 8 }}>✅ Semilla cargada</div>
              <div style={{ fontSize: 11, color: T.gray }}>Última carga: {fmtDate(seedStatus.fecha_carga)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
              <StatCard label="Artículos" value={seedStatus.articulos} accent={T.accent} />
              <StatCard label="Kits" value={seedStatus.kits} accent={T.orange} />
              <StatCard label="Aceites" value={seedStatus.aceites} accent={T.green} />
              <StatCard label="Fitments" value={seedStatus.fitments} accent={T.red} />
            </div>
            <button onClick={() => setConfirmOpen(true)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, padding: "10px 20px", fontSize: 13 }}>🔄 Recargar semilla</button>
          </div>
        )}

        {uploading && (
          <div style={{ padding: 20, background: T.bg3, borderRadius: 10, border: `1px solid ${T.accent}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⏳ Subiendo a Firestore…</div>
            <div style={{ height: 8, background: T.bg, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: T.accent, transition: "width .3s" }} />
            </div>
            <div style={{ fontSize: 12, color: T.gray }}>{progressMsg}</div>
            <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>{Math.round(progress)}%</div>
          </div>
        )}

        {finalStats && !uploading && (
          <div style={{ padding: 12, background: T.green + "15", border: `1px solid ${T.green}`, borderRadius: 8, marginTop: 12, fontSize: 13, color: T.green, fontWeight: 700 }}>
            ✅ {finalStats.articulos} artículos, {finalStats.kits} kits, {finalStats.aceites} aceites, {finalStats.fitments} fitments
          </div>
        )}

        {error && <div style={{ padding: 12, background: T.red + "15", border: `1px solid ${T.red}`, borderRadius: 8, marginTop: 12, fontSize: 13, color: T.red }}>⚠️ {error}</div>}
      </div>

      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 420, width: "100%" }}>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 12 }}>🌱 Confirmar carga</div>
            <div style={{ fontSize: 13, color: T.grayLight, marginBottom: 20, lineHeight: 1.6 }}>
              {seedStatus ? "Vas a SOBRESCRIBIR la semilla actual. ¿Continuar?" : "Se van a subir 3.142 artículos + 122 kits + 6 aceites + 122 fitments. 1-3 min."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13, color: T.grayLight }}>Cancelar</button>
              <button onClick={handleCargar} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13 }}>Sí, cargar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
