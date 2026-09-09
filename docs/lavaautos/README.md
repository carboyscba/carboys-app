# Proyecto Lavaautos Automáticos — CARWASH by CARBOYS

Informe de trabajo (septiembre 2026): análisis de mercado de máquinas rollover con cepillos y secado
(17 fichas de 16 fabricantes de Europa, China, USA y Brasil), costos de importación y operación en Córdoba,
propuesta de app de monitoreo (CARWASH Control), análisis de marca y nombres, marketing, análisis crítico
y plan de acción.

- `Informe_CARWASH_by_CARBOYS_Proyecto_Lavaautos.pdf` — el informe completo (53 páginas).
- `investigacion/` — los siete cuadernos de investigación en Markdown con todas las fuentes (URLs).
- `fuente/` — el código fuente del informe (HTML por secciones + CSS + datos de fichas) y el script de armado.

## Regenerar el PDF

Requiere Python 3 con `pymupdf` y un Chromium/Chrome headless.

```bash
cd docs/lavaautos/fuente
# editar CHROME en build.py si hace falta
python3 build.py informe            # genera informe.html, informe.pdf y preview/*.png
```

Las fichas de máquinas se editan en `models_data.py`; las secciones de texto en `parts/*.html`.
