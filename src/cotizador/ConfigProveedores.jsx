// ══════════════════════════════════════════════════════════════════
//  Cotizador — Config → Lista Proveedores (Iter 3)
//
//  Muestra el proveedor BORUR (único en V1) con datos de contacto,
//  rubros que cubre, y botón para cargar la semilla inicial de
//  catálogo (3.142 SKUs Wega + 122 kits + 6 aceites Mobil + 122 fits)
//  desde /public/data/*.json a Firestore.
//
//  Recibe fsSave y fsGetDoc como props (definidos en App.jsx).
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { loadAllSeedData } from "./dataLoader.js";
import { cargarSemillaInicial, getSeedStatus } from "./firestoreCotizador.js";

export default function ConfigProveedores({
  fsSave,
  fsGetDoc,
  T,
  fontD,
  card,
  btnPrimary,
}) {
  const [seedStatus, setSeedStatus] = useState(null);      // {cargado, articulos, kits, aceites, fitments, fecha_carga}
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [finalStats, setFinalStats] = useState(null);
  const [error, setError] = useState("");

  // Chequear estado al montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSeedStatus({ fsGetDoc });
        if (mounted) setSeedStatus(s);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoadingStatus(false);
      }
    })();
    return () => { mounted = false; };
  }, [fsGetDoc]);

  const handleCargar = async () => {
    setConfirmOpen(false);
    setUploading(true);
    setError("");
    setProgress(0);
    setProgressMsg("Cargando datos semilla…");
    setFinalStats(null);
    try {
      const seed = await loadAllSeedData();
      setProgressMsg("Preparando upload a Firestore…");
      const stats = await cargarSemillaInicial({
        fsSave,
        catalogoWega: seed.catalogoWega,
        catalogoMobil: seed.catalogoMobil,
        fitment: seed.fitment,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setProgressMsg(msg);
        },
      });
      setFinalStats(stats);
      // Refrescar status
      const newStatus = await getSeedStatus({ fsGetDoc });
      setSeedStatus(newStatus);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    } catch (e) { return iso; }
  };

  return (
    <div>
      {/* ── Header proveedor BORUR ── */}
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
          <div>
            <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Teléfono</div>
            <div style={{ fontSize: 13 }}>03564-462000</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 13 }}>info@borursrl.com</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Formato de lista</div>
            <div style={{ fontSize: 13 }}>Excel (parser BORUR)</div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.gray, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Rubros que provee</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <div style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, fontSize: 12, border: `1px solid ${T.border}` }}>📋 Filtros · <b>Wega</b></div>
            <div style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, fontSize: 12, border: `1px solid ${T.border}` }}>🛢 Aceites · <b>Mobil</b></div>
          </div>
        </div>
      </div>

      {/* ── Card de estado de semilla ── */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          🌱 Catálogo maestro
        </div>
        <div style={{ fontSize: 12, color: T.gray, marginBottom: 20 }}>
          La semilla inicial trae 3.142 artículos Wega + 122 kits + 6 aceites Mobil + 122 fitments a la nube de esta sucursal. Se puede recargar si BORUR actualiza los precios (subiendo un XLS nuevo — próximo paso).
        </div>

        {loadingStatus && (
          <div style={{ padding: 20, textAlign: "center", color: T.gray, fontSize: 13 }}>
            Consultando Firestore…
          </div>
        )}

        {!loadingStatus && !seedStatus && !uploading && (
          <div style={{ padding: 16, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: T.grayLight, marginBottom: 12 }}>
              ⚠️ Todavía no cargaste la semilla en esta sucursal. Los datos están en <code>/data/</code> pero no en Firestore.
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              style={{ ...btnPrimary(T.accent), padding: "12px 24px", fontSize: 14, fontWeight: 700, width: "100%" }}
            >
              🌱 Cargar semilla inicial a Firestore
            </button>
          </div>
        )}

        {!loadingStatus && seedStatus && !uploading && (
          <div>
            <div style={{ padding: 16, background: T.green + "12", border: `1px solid ${T.green}`, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 8 }}>✅ Semilla cargada</div>
              <div style={{ fontSize: 11, color: T.gray }}>Última carga: {fmtDate(seedStatus.fecha_carga)}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
              <StatCard label="Artículos" value={seedStatus.articulos} accent={T.accent} card={card} fontD={fontD} T={T} />
              <StatCard label="Kits" value={seedStatus.kits} accent={T.orange} card={card} fontD={fontD} T={T} />
              <StatCard label="Aceites" value={seedStatus.aceites} accent={T.green} card={card} fontD={fontD} T={T} />
              <StatCard label="Fitments" value={seedStatus.fitments} accent={T.red} card={card} fontD={fontD} T={T} />
            </div>

            {seedStatus.errores_count > 0 && (
              <div style={{ padding: 12, background: T.orange + "15", border: `1px solid ${T.orange}`, borderRadius: 8, marginBottom: 12, fontSize: 12, color: T.orange }}>
                ⚠️ {seedStatus.errores_count} errores durante la carga. Los primeros: {(seedStatus.errores_primeros || []).slice(0, 3).join(", ")}
              </div>
            )}

            <button
              onClick={() => setConfirmOpen(true)}
              style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, color: T.grayLight, padding: "10px 20px", fontSize: 13 }}
            >
              🔄 Recargar semilla (sobrescribe lo actual)
            </button>
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
            ✅ Carga completa: {finalStats.articulos} artículos, {finalStats.kits} kits, {finalStats.aceites} aceites, {finalStats.fitments} fitments
            {finalStats.errores?.length > 0 && (
              <div style={{ fontSize: 11, color: T.orange, marginTop: 4, fontWeight: 600 }}>
                ({finalStats.errores.length} errores — ver detalle en consola)
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: 12, background: T.red + "15", border: `1px solid ${T.red}`, borderRadius: 8, marginTop: 12, fontSize: 13, color: T.red }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* ── Confirmación ── */}
      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ ...card, padding: 24, maxWidth: 420, width: "100%" }}>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
              🌱 Confirmar carga
            </div>
            <div style={{ fontSize: 13, color: T.grayLight, marginBottom: 20, lineHeight: 1.6 }}>
              {seedStatus
                ? "Vas a SOBRESCRIBIR la semilla actual con la data de /data/. Cualquier cambio manual que hayas hecho a artículos/kits/fitments en Firestore se pierde. ¿Continuar?"
                : "Se van a subir a Firestore:"}
              {!seedStatus && (
                <ul style={{ marginTop: 8, paddingLeft: 20, color: T.grayLight }}>
                  <li>3.142 artículos Wega</li>
                  <li>122 kits Wega</li>
                  <li>6 aceites Mobil</li>
                  <li>122 fitments vehículo↔filtros</li>
                </ul>
              )}
              {!seedStatus && <div style={{ marginTop: 8, fontSize: 12 }}>Tarda entre 1 y 3 minutos. No cierres la pestaña durante la carga.</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13, color: T.grayLight }}>
                Cancelar
              </button>
              <button onClick={handleCargar} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13 }}>
                Sí, cargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, card, fontD, T }) {
  return (
    <div style={{ ...card, padding: 14, textAlign: "center" }}>
      <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: accent }}>
        {value?.toLocaleString("es-AR") ?? 0}
      </div>
      <div style={{ fontSize: 11, color: T.gray, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
