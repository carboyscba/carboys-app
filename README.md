# CarBoys — App (Fase 1 con módulo Cotizador embebido)

Sistema de gestión de taller mecánico, multi-tenant (una nube Firebase por sucursal).
Esta versión incluye el módulo **Cotizador** cargado como data + motor de cálculo,
sin UI todavía (la UI llega en iteraciones siguientes, archivo por archivo).

## Estructura

```
carboys-app/
├── public/
│   ├── favicon.svg
│   └── data/                      ← JSON semilla del Cotizador (servidos como estáticos)
│       ├── catalogo_wega.json     (3.142 SKUs + 122 kits Wega, 944 KB)
│       ├── catalogo_mobil.json    (6 aceites Mobil, 8 KB)
│       └── fitment.json           (122 fitments vehículo↔filtros, 113 KB)
├── src/
│   ├── App.jsx                    ← app monolítica original + 2 cambios mínimos (defaults del cotizador)
│   ├── main.jsx                   ← importa el módulo cotizador
│   └── cotizador/                 ← NUEVO — módulo aislado
│       ├── dataLoader.js          carga lazy de los JSON con cache en memoria
│       ├── engine.js              motor de cálculo (3 precios triangulados, IVA, descuento efectivo)
│       ├── firestoreCotizador.js  helpers para persistir cotizaciones/semilla en Firestore
│       ├── amarokTest.js          test manual del ejercicio Amarok (Anexo A del doc)
│       └── index.js               API pública del módulo
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                    ← rewrite SPA para Vercel
└── .gitignore
```

## Estado del módulo Cotizador

- ✅ Datos semilla (Fase 0) cargados y accesibles.
- ✅ Motor de cálculo funcional y validado contra el ejercicio Amarok.
- ✅ Config default (`config.cotizador.*` en INITIAL_CONFIG de App.jsx).
- ⏳ UI: Config → Cotizador, Config → Lista Proveedores, Extracto de Precios, Path 1.A/B, Pantalla Cotizaciones — en iteraciones siguientes.

Para verificar que el motor funciona correctamente, abrir la consola del navegador y ejecutar:

```js
window.__cotizador.test()
```

Debe imprimir el ejercicio Amarok completo con "✅ TEST PASADO".

---

## Paso a paso — subir a GitHub y desplegar en Vercel

### 1. Crear repo en GitHub (5 min)

1. Andá a https://github.com/new
2. **Repository name**: `carboys-app` (o el nombre que quieras).
3. **Private** (recomendado — hay claves de Firebase adentro).
4. NO tildes "Add a README" ni ".gitignore" ni "license" (ya vienen en el zip).
5. Click en **Create repository**.
6. En la pantalla que sigue, GitHub te muestra dos opciones. Buscá la sección "…or push an existing repository from the command line" y copiá los comandos — vas a necesitar la URL (`https://github.com/TU_USUARIO/carboys-app.git`).

### 2. Subir el código (10 min)

Necesitás Git instalado. Si no lo tenés: https://git-scm.com/download/win

1. Descomprimí el zip que te mandé. Vas a ver la carpeta `carboys-app`.
2. Abrí PowerShell / CMD y navegá adentro:
   ```
   cd C:\ruta\a\carboys-app
   ```
3. Inicializá git y subí todo:
   ```
   git init
   git add .
   git commit -m "Fase 1: base app + módulo cotizador embebido"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/carboys-app.git
   git push -u origin main
   ```
4. Recargá la página del repo en GitHub — deberías ver todos los archivos.

### 3. Conectar Vercel (5 min)

1. Andá a https://vercel.com/new
2. Loggeate con tu cuenta de GitHub (si no tenés, creá una).
3. Click en **Import Git Repository**.
4. Buscá `carboys-app` y click en **Import**.
5. Vercel detecta automáticamente Vite. Los defaults están bien:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click en **Deploy**.
7. Esperá 1-2 minutos. Cuando termine, Vercel te da una URL tipo `https://carboys-app-abc123.vercel.app`.

### 4. Verificar

1. Abrí la URL en el navegador.
2. Debería aparecer la pantalla de login de Google, igual que la app actual.
3. Loggeate con `carboys.cba@gmail.com`.
4. Abrí la consola del navegador (F12 → pestaña "Console").
5. Ejecutá:
   ```js
   window.__cotizador.test()
   ```
6. Debería imprimir el ejercicio Amarok completo con "✅ TEST PASADO".

Si ves ese "✅", el módulo cotizador está cargado y funcionando en producción.

### 5. Dominio custom (opcional, después)

En el dashboard del proyecto en Vercel → Settings → Domains, podés apuntar tu dominio propio.

---

## Cómo va a funcionar de acá en adelante

Ya con esto en producción, cada mejora del cotizador te llega como:

1. Un archivo nuevo (o el archivo modificado).
2. La ruta exacta donde va (ej: `src/cotizador/ExtractoPrecios.jsx`).
3. El link directo de GitHub donde pegarlo (ej: `https://github.com/TU_USUARIO/carboys-app/edit/main/src/cotizador/ExtractoPrecios.jsx`).

Vos pegás el contenido, apretás "Commit changes", y Vercel redepliega solo en 1-2 minutos.

---

## Próximas iteraciones (roadmap)

- **Iter 2**: Config → Cotizador (parámetros editables por el dueño).
- **Iter 3**: Config → Lista Proveedores + botón "Cargar semilla inicial" a Firestore.
- **Iter 4**: Componente Extracto de Precios (el corazón visual del cotizador).
- **Iter 5**: Path 1.A — botón COTIZACIÓN en Nueva Orden sin dominio.
- **Iter 6**: Path 1.B — botón COTIZACIÓN al lado de NUEVA VISITA.
- **Iter 7**: Path 2 — mini-extracto en Nueva Orden normal + snapshot en orden.
- **Iter 8**: Pantalla Cotizaciones + PDF + WhatsApp + conversión automática.
- **Iter 9**: Config → Concesionarias (precios oficiales para el techo competitivo).
