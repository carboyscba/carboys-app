# F — Software, IoT y telemetría para una cadena de lavaderos rollover (CARBOYS)

*Investigación técnica — septiembre 2026. Fuentes citadas al final de cada sección y en el anexo. Los precios en USD son referencias internacionales (fabricante/distribuidor); para Argentina estimar ×1,5–2,5 por impuestos/importación salvo que se indique lo contrario. Lo marcado como "(estimación)" o "(no verificado)" no pudo confirmarse en fuentes primarias durante esta investigación.*

---

## 0. Resumen ejecutivo (lo que importa para decidir)

1. **La elección del fabricante del rollover define el 60 % de la arquitectura de monitoreo.** Hoy solo **Istobal** publica abiertamente un portfolio de 4 APIs (Accounting, Telemetry, Operation —estado + arranque remoto—, Ticket Management) y **WashTec** tiene `mywashtec.api` (REST + GraphQL, datos de máquina/IoT, configuración, ticketing digital) abierta a terceros. **Christ** (CIS NEXT), **Kärcher** (K!Connect / Charlie Fleet), **Ceccato**, **Aquarama** (Aquacontrol), **Tammermatic** (TammerCloud) y las marcas chinas (Leisuwash Cloud) tienen portales/apps propios pero **no documentan API pública**; hay que negociarla en el contrato de compra.
2. **Si la máquina no expone API, la vía práctica es leer el PLC** (S7-1200 vía S7comm/Snap7 o OPC UA; Mitsubishi vía MC Protocol/Modbus; Delta vía Modbus RTU) con un gateway barato (Raspberry Pi + Node-RED, Teltonika TRB245, Siemens IoT2050) **o, si el PLC está bloqueado, instrumentar en paralelo**: optoacopladores sobre las salidas 24 V de bombas dosificadoras y contactores, pinzas de corriente en motores, fotocélula de entrada, contadores de pulsos. Esto es independiente de la marca y no toca la garantía.
3. **Químicos**: los rollovers dosifican con bombas electromagnéticas/peristálticas (Seko, Etatron, Lutz-Jesco, Grundfos) o inyectores proporcionales (Dosatron). El consumo real se mide mejor **contando tiempo/pulsos de bomba × caudal calibrado** que con sensores de nivel. Para nivel de bidones/IBC: **celdas de carga** (mejor con shampoo espumoso), **ultrasónico a través de pared** (Dragino LDDS20, LoRaWAN, AU915) o **JSN‑SR04T + ESP32** (US$ 5–10 por punto, con reservas por espuma/vapor).
4. **Agua/energía**: medidor de agua a pulsos (1 L/pulso) por línea (red, reciclada) + **Eastron SDM630 Modbus** o **Shelly Pro 3EM** en el tablero. Atribución por lavado = integrar entre evento "inicio" y "fin" de ciclo. Los sistemas de reciclado (WashTec AquaPur ~100 %, AquaBio 95 %; Istobal Hidro Cyclone/MBBR) ya traen sensores; para unidades genéricas, agregar EC/TDS + pH + turbidez.
5. **Cámaras**: cámaras PoE RTSP (Hikvision/Dahua, que son las de mayor disponibilidad local) → **go2rtc** o **MediaMTX** en el edge → **WebRTC** al navegador/app (con TURN) y HLS de respaldo; grabación local con **Frigate** (detección de vehículos y **LPR integrado**). Para LPR de acceso a suscripciones: cámara ANPR Hikvision/Dahua (reconoce en el borde y puede cerrar un relé) o **Plate Recognizer** (soporta región `ar`; gratis hasta 2.500 lecturas/mes; Stream US$ 35/cámara/mes).
6. **Legal (Argentina)**: video + patente asociada a cliente = base de datos personal (Ley 25.326; Res. AAIP 4/2019 lo dice explícitamente). Cartelería visible, inscripción en el RNBD, finalidad limitada, medidas de seguridad, consentimiento en el alta de suscripción por LPR, y cláusulas contractuales para transferencia internacional si los datos van a nube en EE. UU. (Firebase, Plate Recognizer).
7. **Pagos**: en Argentina el pago **no atendido** más viable es **QR dinámico interoperable** (Transferencias 3.0, BCRA Com. "A" 7153: comisión máxima 0,8 % al comercio, acreditación inmediata) vía Mercado Pago (Orders API + webhooks), Getnet (Get QR) o Payway; además **suscripciones** (Mercado Pago Suscripciones) para planes ilimitados con validación por LPR/QR en pista. Terminales EMV para exterior tipo Nayax VPOS: verificar disponibilidad local. El arranque de la máquina se hace con un **relé seco** sobre la entrada de "impulso de crédito"/"inicio de programa" del PLC o vía la Operation API (Istobal).
8. **Arquitectura recomendada**: edge por sucursal (Raspberry Pi 5 o mini‑PC N100 con Docker: Node‑RED + Mosquitto + go2rtc/Frigate + agente Python/Node con buffer SQLite) → **Firebase** (Firestore = estado/eventos/agregados, Cloud Functions = reglas y alertas, FCM = push, extensión Firestore→BigQuery = analítica) + opcionalmente **InfluxDB Cloud Serverless** para series crudas. React existente como dashboard; PWA primero, Expo después. Alertas por **Telegram/FCM** (operación) y **WhatsApp Business API** (clientes). **Claude API** (Sonnet 5 U$S 2/10 por MTok; Opus 5 U$S 5/25) para explicar anomalías y bot de soporte con tool‑use sobre Firestore; el costo de IA es despreciable (< U$S 10/mes/sucursal).
9. **Costo orientativo por sucursal**: hardware básico U$S 900–1.800 (gateway, UPS, router 4G, 3 medidores, 4–6 nodos de nivel, 2 cámaras); con ANPR + caja Frigate + LoRaWAN U$S 2.500–3.500. Nube U$S 15–60/mes/sucursal.

---

## 1. Telemetría y nube de los fabricantes de rollovers

### 1.1 Tabla comparativa

| Fabricante | Plataforma / app | Métricas expuestas (según fuentes) | Control remoto | API abierta / export | Pago de terceros | Fuente |
|---|---|---|---|---|---|---|
| **Istobal** (ES) | Smartwash (Manager desktop, App Remote, POS, ISTOBAL App consumidor, ISTOBALCard) | Estado en tiempo real, contadores por programa, errores, **consumo de agua/energía/químicos y nivel de productos (plan Premium)**, disponibilidad, estadísticas históricas | Sí: arranque de programa, parada de emergencia, reconocer errores, reiniciar programas, streaming de cámara integrado (M'WASH) | **Sí, 4 APIs**: Accounting, Telemetry, Operation (estado + arranque remoto), Ticket Management. Integración con apps de terceros en plan Premium. IEC 62443 | Pago in‑app propio; Ticket API para POS de terceros | istobal.com/inter/connectivity; blog plan gratuito |
| **WashTec** (DE) | mywashtec.com, SmartSite (app), CarWash Assist (soporte remoto), EasyCarWash PRO (app cliente con LPR), WashNow (marketplace), CashManager 2.0 | Estado de máquina, rentabilidad, consumo y utilización (reporte mensual por email en SmartSite), KPIs de ventas/comportamiento (EasyCarWash PRO), AquaPur: consumo de agua y nivel de lodos | Sí: SmartSite control remoto de portales y SB; CarWash Assist: WashTec interviene en el control | **Sí: `mywashtec.api`** (REST + GraphQL, event‑driven; datos de máquina/IoT, configuración, contrato, ticketing digital; usada por terceros: apps, POS, webshops, infotainment) | EasyCarWash PRO / WashNow; ticketing digital por API | washtec.com digital‑solutions; xitaso.com/mywashtec-api |
| **Otto Christ** (DE) | CIS NEXT (web), Christ Cloud, CHRIST WASH APP "Wwwash", terminales TOUCH POS / VENDOR / CST | **Estado actual, niveles de químicos, historial de errores, cantidad de lavados por programa**, análisis de utilización; alerta por email al fallar | Sí: módulo de mantenimiento remoto, configuración y actualización de software remotas; arranque automático desde la app | **No documentada públicamente** (solo "interfaz al sistema de caja" y tarjetas de flota) | App propia (tarjeta, crédito de lavado), RFID, tarjetas de flota, terminal bancario en VENDOR/TOUCH POS | christ-ag.com operating-terminals; mobilityplaza.com/news/30154 |
| **Kärcher** (DE) | K!Connect (gestión), Charlie Fleet (nube) y Charlie Pay (pago), Pay&Wash (app), RDS (diagnóstico remoto) | Estado por sitio, facturación por máquina, **comparación de consumo agua/electricidad y throughput**, tiempos de operación, mensajes de error, correlación con clima | Sí: parámetros remotos, reinicio remoto, ajuste de horarios y precios | **No documentada** | Charlie Pay (débito/crédito, QR, smartphone), Pay&Wash | kaercher.com k-connect; mobilityplaza.com/news/30564 |
| **Ceccato** (IT) | "App for remote management" (Hyperion Tech 3.0), app smartphone/tablet + puerto ADSL (Aries), comunicación bidireccional con cualquier dispositivo | Parámetros del sistema, troubleshooting, clonado de programación entre máquinas ("TEST PLC") | Sí (bidireccional) | **No documentada** | Chip card / llave; terminales | Folleto Hyperion Tech 3.0 (Kroma PDF) |
| **Aquarama** (IT) | Aquacontrol (smartphone/tablet/PC) | Control y monitoreo remoto (sitio devolvió 503 en las 2 consultas; detalle no verificado) | Sí | No documentada | — | aquarama.it/en/aquacontrol |
| **Tammermatic** (FI) | TammerCloud, TammerGuard 24/7 | Vista en tiempo real de la máquina, diagnóstico en fallas, actualizaciones de software, datos de negocio | Sí | No documentada | — | tammermatic.com |
| **Autoequip** (IT) | — | Nada publicado sobre conectividad | — | — | — | autoequip.it |
| **Ryko/PDQ (OPW)** (US) | PDQ Access (powered by ICS), WALS (loyalty web), NCS Lens (Ryko/MacNeil) | Reportes completos, alertas en tiempo real, programación remota, loyalty multi‑sitio | Sí | No pública (ICS WashConnect como capa de gestión) | Tarjetas, POS, WALS | opwvws.com; washaccess.com |
| **Leisuwash** (CN) | Leisuwash Cloud Platform / APP (4G/Wi‑Fi de serie en SG) | **Conteo de transacciones, alertas de químicos, reporte de ingresos, diagnóstico de salud, multi‑sitio**; en 380 PLUS: reportes, arranque/parada remotos, ajuste de presión/ventilador | Sí (start/stop, parámetros, upgrade OTA) | No documentada (verificar si exponen WebSocket/HTTP del PLC) | QR (WeChat/Alipay en China; en export, integrador local) | leisuwash.com; leisuwasher.com review SG |
| **Shinewash / Autobase / Risense / Sino Star / CBK** (CN) | Apps genéricas de "monitoreo, diagnóstico y control remoto"; Risense: arranque por QR desde el auto | Estado, upgrade remoto | Sí | No documentada | QR local | shinewashtec.com S1; made‑in‑china |

### 1.2 Detalle por marca (lo verificado)

**Istobal — Smartwash.** Plan **gratuito** (requiere paquete básico de conectividad): gestión multi‑instalación, datos contables (ingresos, promociones), base de usuarios, app de consumidor con pago in‑app y activación por código, ISTOBALCard (fidelización), estado de equipos en tiempo real, conteo de lavados/programas/errores. Plan **Premium** (mensual, precio no publicado): activación y parada desde la app sin bajarse del auto, campañas ilimitadas, estadísticas históricas, **integración API con apps de terceros**, **monitoreo de consumibles y niveles**, **consumo de agua y energía**, control remoto, Smartwash Fleets. La App Remote (Android 12+/iOS 17+) es compatible con la gama M'WASH y permite resolver incidencias con cámara integrada. Istobal declara cumplimiento **IEC 62443**. → *Para CARBOYS es la opción con menor riesgo de integración: Telemetry API para el dashboard, Operation API para arranque desde la app propia, Ticket API para vender desde el POS propio.*

**WashTec — mywashtec.api.** Desarrollada con XITASO: REST + GraphQL, backend C#/.NET y Spring Boot, Kubernetes/AWS, RabbitMQ (event‑driven: inicio de lavado, notificaciones de fallas). Expone "todos los datos relevantes de máquina y estado (IoT), datos de configuración y de contrato" y ticketing digital; casos de uso declarados: portales de servicio, integración en software del cliente, apps móviles, POS, webshops, infotainment. **SmartCare Connect** (portal de gama alta) integra con mywashtec.com y CarWash Assist; sensor 3D, FlexControl 2.0, "Smart Dosing" (mezcla de químico/agua adaptada al contorno). **AquaPur Modular**: reciclado cercano al 100 % con sensores en tiempo real (consumo de agua, nivel de lodos) integrados a myWashTec. **EasyCarWash PRO**: planes flat‑rate con **arranque por reconocimiento de patente (LPR)** y dashboard de KPIs.

**Christ — CIS NEXT.** Acceso web en tiempo real a "estado actual, niveles de químicos, historial de errores y número de lavados, desglosado por programa"; módulo de mantenimiento remoto, configuración y updates remotos, email al producirse un error. App Wwwash: pago contactless, facturación directa, flat‑rate con gestión de flota, "arranque automático". Terminales VENDOR/TOUCH POS con RFID, NFC, terminal bancario, tarjetas de flota, pago móvil. **No hay API pública documentada**; el pedido concreto a Christ debe ser: acceso a CIS NEXT vía API/export CSV y especificación de la entrada de arranque externo.

**Kärcher — K!Connect + Charlie.** K!Connect: gestión multi‑sitio, roles de usuario, comparación de consumo agua/electricidad y throughput, facturación por máquina, parámetros y reinicio remotos, avisos de falla por email; integra Pay&Wash (promos, happy hour, fidelización, push). Charlie Fleet: estado y producción de portales y SB, ajuste de parámetros; Charlie Pay: débito/crédito, QR, smartphone, display táctil de 10". Sin API pública documentada.

**Ceccato — Hyperion Tech 3.0.** Folleto: touch screen, "APP for remote management", "comunicación bidireccional remota con cualquier dispositivo (teléfono, tablet, PC)", reproducción de la programación en otra máquina o en el "PLC de TEST" mediante un código; dosificación autorregulada por velocidad y temperatura. Activación por chip card o llave. Sin API.

**Chinos (Leisuwash, Shinewash, Autobase, Risense, Sino Star).** Leisuwash SG: **PLC Siemens S7‑1200**, HMI táctil, 4G/Wi‑Fi de serie, Leisuwash Cloud (transacciones, alertas de químicos, ingresos, diagnóstico, multi‑sitio), 60–75 L/lavado, 22–28 kW, 3,5–5 min, precio EXW US$ 31.500–33.000 (+US$ 4.200 ósmosis, +US$ 6.800 reciclado). Leisuwash S90: PLC Siemens, 380 V/16 kW, 120–220 L/lavado, consumo químico pre‑soak 20–50 mL, shampoo 50–100 mL, cera 20–40 mL por auto. Shinewash S1: **PLC Mitsubishi**, 60–80 L y 0,6 kWh por auto, ~10 cc shampoo + ~10 cc cera, "monitoreo, diagnóstico y control remoto". Las apps chinas suelen ser un servidor del fabricante en China (WeChat mini‑program o app Android); **pedir el protocolo del módulo 4G/DTU (normalmente Modbus RTU sobre el puerto serie del PLC → MQTT a su nube)**: si el DTU es genérico (USR‑IoT, Four‑Faith), se puede reapuntar a un broker propio.

### 1.3 Qué pedir en el pliego de compra (cualquier marca)

1. Acceso a API/export (JSON/CSV) de: contadores por programa, errores con timestamp, tiempos de ciclo, niveles de químicos, consumos.
2. Marca/modelo de PLC y HMI; si tiene Ethernet; si el bloque de datos de estado está documentado o si aceptan habilitar **OPC UA** o **Modbus TCP** con un mapa de registros.
3. Especificación eléctrica de la **entrada de arranque externo** (impulso de crédito, selección de programa) y de la salida "máquina ocupada / fin de lavado".
4. Salidas de las sondas de nivel de químicos (contacto seco de "bidón vacío") y de las bombas dosificadoras (24 V).
5. Puerto de red libre en el gabinete y permiso para un gateway propio.

---

## 2. Integración a nivel PLC

### 2.1 PLCs habituales en rollovers

| Marca de máquina | PLC (evidencia) | Protocolo nativo | Comentario |
|---|---|---|---|
| Leisuwash SG / S90 | Siemens S7‑1200 / "PLC Siemens" (fichas oficiales y review) | S7comm (ISO‑on‑TCP :102), OPC UA (con licencia runtime), Modbus TCP si está programado | Mejor caso para integración de bajo costo |
| Shinewash S1 y muchas chinas | Mitsubishi (ficha oficial); también Delta DVP, Xinje, Siemens S7‑200 SMART (no verificado, habitual en la industria china) | Mitsubishi: MC Protocol/SLMP (FX5U Ethernet integrado), Modbus RTU/TCP; Delta: Modbus RTU RS‑485 nativo | Node‑RED tiene nodos `mcprotocol` y `modbus` |
| WashTec, Christ, Kärcher, Istobal, Ceccato | No publicado. Foros y manuales de servicio refieren controladores Siemens (S7) en portales europeos modernos y electrónica propia en modelos antiguos (**no verificado**; confirmar en la placa del gabinete) | S7comm / OPC UA / propietario | En Istobal/WashTec conviene la API antes que el PLC |
| Otras opciones industriales | Beckhoff (ADS), Omron (FINS/EtherNet‑IP), Allen‑Bradley (EtherNet/IP) | — | Poco frecuentes en rollovers |

### 2.2 Cómo leer el PLC con un gateway barato

- **Siemens S7‑1200/1500 con Node‑RED (`node-red-contrib-s7`)**: ISO‑on‑TCP puerto 102; requiere en TIA Portal "Permitir acceso PUT/GET desde socios remotos", protección de acceso en "full access" y **DB sin "acceso optimizado"** (el protocolo S7 usa offsets fijos). Direccionamiento tipo `DB5,X0.1`, `DB13,WORD4`; se recomienda empaquetar booleanos en palabras. Si el fabricante no quiere desoptimizar DBs, **OPC UA** lee por nombre simbólico sin modificar el programa (S7‑1200 desde FW 4.4 con licencia "OPC UA S7‑1200 Basic", ~€200 (estimación); S7‑1500 desde FW 2.0). En Python: `python-snap7` o `opcua-asyncio`.
- **Siemens IoT2050** (Linux Yocto, Node‑RED preinstalado, 2 puertos Ethernet para separar red OT de IT): el ejemplo oficial *IOT2050‑NodeRed‑DataCollector* lee un S7‑1500 por **S7, Modbus TCP y OPC UA**, bufferiza 3.600 valores en un ring buffer y sincroniza con MariaDB al recuperar red. Precio ~US$ 550–800 (estimación).
- **Teltonika TRB245** (gateway 4G industrial con RS‑232/RS‑485 y Ethernet): Modbus TCP cliente/servidor y RTU (300–230.400 bps), 50+ registros internos, **alarmas por condición sobre valores Modbus → SMS/email/MQTT/salida digital**, *Data to Server* y **MQTT Modbus Gateway** (JSON, TLS), puente TCP→serie. Sirve como gateway + conectividad 4G en una sola caja (~US$ 250–300, estimación). RUT956 similar con Wi‑Fi y 4 puertos.
- **Raspberry Pi 5 + Node‑RED/Python**: opción más barata y flexible (8 GB: ~US$ 80 la placa; 16 GB US$ 305 oficial). Añadir conversor USB‑RS485 (US$ 5–10) para Modbus RTU.
- **Weidmüller u‑link / Moxa / Advantech**: mismas funciones con soporte industrial y precio 3–6× superior; solo si el integrador lo exige.
- **ESP32 con Modbus RTU**: adecuado como *nodo de campo* (medidores, sensores) hablando con el Pi por MQTT; **no** como cliente S7.

### 2.3 Si el PLC está bloqueado o sin documentación: instrumentación paralela (agnóstica de marca)

| Señal deseada | Método no invasivo | Hardware | Costo aprox. |
|---|---|---|---|
| Inicio/fin de lavado y tiempo de ciclo | Optoacoplador 24 V sobre la señal "programa en curso"/semáforo "avance‑stop"; o pinza de corriente en el motor de traslación del portal (arranque = inicio) | Módulo optoacoplador PC817/ HY‑M158 (US$ 2), SCT‑013‑030 + ESP32 (US$ 8) | US$ 10–20 |
| Conteo de lavados por programa | Combinación de entradas: pulsos de selección del terminal de pago + inicio de ciclo; o lectura de la salida "crédito aceptado" | Optoacopladores en las salidas del terminal | US$ 5–10 |
| Actividad de bombas dosificadoras (químicos) | Optoacoplador en la alimentación 230/24 V de cada bomba (Etatron PKX "opera sobre un relé"; Lutz‑Jesco: 4–5 bombas por instalación) → tiempo ON × caudal calibrado = mL por lavado | 1 opto por bomba + ESP32 | US$ 15–30 |
| Códigos de error | Sin PLC no se leen; alternativa: cámara sobre el HMI + OCR (Frigate/Claude vision) para leer el mensaje de error del panel; o contacto de la baliza de fallo | Cámara IP barata | US$ 40–80 |
| Motores (cepillos, ventiladores de secado): salud | Pinzas SCT‑013 por motor → firma de corriente por ciclo (mantenimiento predictivo) | 4–6 pinzas + ESP32 con ADS1115 | US$ 40–70 |
| Vehículo presente / conteo de autos | Fotocélula propia o zona de detección en cámara (Frigate) | Fotocélula reflectiva 24 V (US$ 15–30) | US$ 30 |

*ControlByWeb* propone exactamente este enfoque con módulos X‑410 (US$ 330–430) para puertas, parada de emergencia y protección anticongelante, sin nube ni cuotas; el equivalente con ESP32/Pi cuesta una fracción.

---

## 3. Sensado de niveles y consumo de químicos

### 3.1 Cómo dosifican los rollovers

- **Bombas dosificadoras electromagnéticas (solenoide) o peristálticas** comandadas por relé del PLC: Etatron PKX MA/A ("ideal para car wash… opera sobre un relé"), eOne MF (por pulsos de contador de agua o timer); Lutz‑Jesco: bombas de membrana sin fugas, **4 o 5 bombas por instalación** (detergente y cera con materiales distintos), con drenaje de fugas al tanque; Seko (línea Tekna/Kompact, muy usada en Europa; su web redirigió y no pudo verificarse el detalle); Grundfos SMART Digital DDA (con salidas de relé y E‑Box fieldbus; página no accesible en esta consulta).
- **Inyectores proporcionales hidráulicos** (Dosatron): dosifican en proporción al caudal de agua, sin electricidad; el consumo de químico = agua que pasa × relación (1:50–1:500). Venturi: método antiguo, sensible a la presión, imprecisión de dilución.
- **Dosificación inteligente**: WashTec "Smart Dosing" y Ceccato ajustan la cantidad según velocidad del portal/temperatura; Leisuwash "proporción de alta precisión ajustable".
- **Sondas de nivel de fábrica**: lanzas de succión con **flotante de bajo nivel** (contacto seco) → el PLC alarma "bidón vacío"; por eso CIS NEXT/Smartwash muestran "niveles" (a menudo binario o por bidón, no continuo). Etatron: "las bombas pueden equiparse con un interruptor de nivel… para avisar al operador cuando el aditivo se agota".
- **Consumos típicos** (fuentes de fabricantes chinos; los europeos son similares): pre‑soak 20–50 mL, shampoo 10–100 mL, cera 10–40 mL por lavado. Un bidón de 20 L dura 200–1.000 lavados → **el nivel continuo importa menos que el "días restantes" calculado por consumo**.

### 3.2 Opciones de sensado y costo

| Tecnología | Cómo | Pros | Contras | Costo por punto |
|---|---|---|---|---|
| **Conteo de actividad de bomba** (opto en la bomba o pulso de carrera) | tiempo ON × mL/min calibrado (o carreras × cc/carrera) | Precisión 5–10 % tras calibrar, mide **consumo por lavado**, no toca el líquido | Requiere recalibrar si cambia el ajuste de la bomba | US$ 3–8 |
| **Celda de carga bajo el bidón/IBC** (HX711 + 4 celdas 50 kg; plataforma 200–500 kg para IBC) | peso → litros (densidad conocida) | Inmune a espuma/vapor/color, bidón de 20 L: resolución ~50 g | Deriva térmica; IBC necesita plataforma (US$ 60–150); recalibrar al cambiar el envase | US$ 12–25 (bidón) / US$ 80–180 (IBC) |
| **Ultrasónico a través de pared** (Dragino LDDS20, LoRaWAN, AU915, 20–2.000 mm, ±5 mm+0,5 %, batería ≤10 años) | pegado bajo el envase plástico; sin contacto con el químico | Sin apertura del bidón, inalámbrico, industrial IP67 | Requiere fondo plano y pared uniforme; precio | US$ 60–90 (estimación) + gateway LoRaWAN |
| **Ultrasónico desde arriba** JSN‑SR04T (IP67, 1 mm, 20–450 cm, haz 75°) + ESP32 | en la tapa ventilada | Baratísimo | **Espuma y vapor de shampoo dan ecos falsos**; zona ciega 20 cm; ambientes químicos | US$ 4–6 sensor + US$ 5–8 ESP32 |
| **Ultrasónico industrial** MaxBotix MB7389 (IP67, opción F IP68 química, 30–500 cm, 1 mm, analógico/PWM/serie) | ídem | Filtrado avanzado para tanques | US$ 110 | US$ 110 |
| **LoRaWAN industrial** Milesight EM500‑UDL (0,25–10 m, ±1 % FS, IP67, batería 10 años, AU915) | tapa del tanque | Certificado, multi‑sonda | Precio; mismos problemas con espuma | US$ 150–200 (estimación) |
| **Hidrostático sumergible 4–20 mA** (cuerpo PP/PTFE) | dentro del bidón | Exacto, sin efecto de espuma | Compatibilidad química, cable, ADC | US$ 40–90 |
| **Flotantes multipunto** (3–4 niveles) | en la tapa | Simplísimo, contacto seco | Discreto, se pega con cera | US$ 5–15 |
| **Caudalímetro en línea de dosificación** (engranajes ovalados/turbina micro) | en la manguera | Consumo directo | Caudales de mL/min → sensores caros (US$ 150–400) o imprecisos | US$ 150+ |

**Recomendación**: (1) opto sobre cada bomba para consumo por lavado; (2) celda de carga en shampoo/espuma (espumosos) y JSN‑SR04T o LDDS20 en cera/abrillantador; (3) conservar el flotante de fábrica como alarma de respaldo. Presentar "% nivel + litros + días restantes + mL por lavado vs. objetivo" (desviación = fuga, bomba desajustada o químico diluido).

### 3.3 Conectividad de los nodos

- **Wi‑Fi (ESP32 + ESPHome/MicroPython → MQTT local)**: la sala de máquinas suele estar a < 20 m del gateway; US$ 5–8 por nodo; alimentado por 5 V. Es la opción por defecto.
- **LoRaWAN privado**: si los bidones están lejos o sin Wi‑Fi. Gateway Dragino LPS8v2 o Milesight UG65 (US$ 120–300, estimación) + ChirpStack en el Pi o The Things Stack. Banda AU915 (Argentina). Solo justifica si hay > 6–8 sensores dispersos o varias sucursales pequeñas sin gateway.
- **4G**: solo para el gateway del sitio (Teltonika TRB245/RUT956 o router comercial con SIM M2M, US$ 10–20/mes).

---

## 4. Medición de agua y energía, reciclado y calidad de agua

### 4.1 Agua

- **Medidor a pulsos** (reed) en la alimentación de red y en la línea de agua reciclada (y opcionalmente ósmosis): DN25–DN40 con 1 L/pulso (existen 0,5/10/25 L/pulso; elegir 1 L). ESPHome `pulse_meter` (mide tiempo entre pulsos → caudal instantáneo fiable a bajo caudal) con `internal_filter: 20 ms`; caudal = pulsos/min × L/pulso. Costo US$ 40–120 por medidor (estimación local) + ESP32 compartido.
- **Alternativa Modbus**: medidores ultrasónicos DN15–DN40 con RS‑485/M‑Bus/LoRa (US$ 80–200).
- **Consumo de referencia por lavado**: 60–80 L (chinos compactos) a 120–220 L (S90); europeos 100–150 L de agua fresca sin reciclado (estimación). Alarmar cuando un ciclo supera +30 % de su promedio (válvula pegada, fuga, programa mal configurado).

### 4.2 Energía

- **Eastron SDM630 Modbus**: trifásico 100 A directo, clase 1, MID B+D, Modbus RTU 9600 bps + 2 salidas de pulso, 22 parámetros; ESPHome `sdm_meter` (fase A/B/C: V, I, W, VA, VAR, FP; totales: kWh import/export). US$ 60–90 (estimación). Para > 100 A usar SDM630MCT con TIs.
- **Shelly Pro 3EM**: DIN, pinzas 120 A, ±1 %, Ethernet + Wi‑Fi + BLE, **MQTT / HTTP‑RPC / webhooks / scripting**, 45 días de datos a 1 min, export CSV/JSON, sin relé. Más simple de integrar (no necesita RS‑485). US$ 120–150 (estimación).
- **Por lavado**: 0,6 kWh (Shinewash S1) a ~1,5–2 kWh en portales con secado de 15–25 kW (estimación). Integrar kWh entre inicio y fin de ciclo; separar consumo base (calefacción, iluminación, bombas de recirculación).

### 4.3 Reciclado de agua y su monitoreo

- **WashTec**: AquaPur Modular (≈100 % reciclado, sensores en tiempo real de consumo y nivel de lodos integrados a myWashTec, AntiSmell), AquaBio (biológico, hasta 95 %), filtro de grava (hasta 85 %, 10–80 m³/h, opción Bio+); ahorro declarado > 1 millón de litros/año y ≈€4.600/año.
- **Istobal**: Hidro Cyclone Pro / 4RH1000, MBBR Biological Plus, biológico 4R2D2, físico 4RC2000, separador de hidrocarburos clase I, tanques de decantación, panel de cloro proporcional, desmineralizadores 4DA500/600.
- **Christ**: línea de reciclado (página no accesible en esta consulta).
- **Chinos**: módulos de reciclado como opción (Leisuwash +US$ 6.800) y ósmosis (+US$ 4.200).
- **Qué monitorear en un reciclador genérico**: nivel de tanques (flotante/ultrasónico), horas de bomba y de soplador (opto/pinza), presión diferencial de filtros (transmisor 4–20 mA, US$ 30–60), **conductividad/TDS** (DFRobot Gravity TDS US$ 10–15 para orientación; sonda industrial 4–20 mA US$ 100–200), **pH** (Gravity pH US$ 30; industrial US$ 150+), **turbidez** (Gravity US$ 10; industrial US$ 300+). Reglas: TDS del agua de enjuague > 1.500–2.000 ppm → manchas; pH fuera de 6,5–8,5 → reponer/ajustar; turbidez alta → filtros saturados.

---

## 5. Cámaras en vivo, LPR y marco legal

### 5.1 Cámaras y streaming

- **Cámaras**: PoE cableadas con H.264 y substream (Frigate desaconseja Wi‑Fi). Hikvision y Dahua/Amcrest son las más compatibles y las más disponibles en Argentina; Reolink (máx. 5 MP recomendado en Frigate; RTSP en modelos PoE, no en los a batería), UniFi Protect (RTSP/RTSPS debe habilitarse por cámara), TP‑Link VIGI/Tapo (RTSP con cuenta local). Colocar 2–3 por sucursal: portal (vista de proceso y del HMI), entrada de pista (LPR), playa/general.
- **Edge streaming**: **go2rtc** (binario único; entradas RTSP/ONVIF/Hikvision/Dahua/Reolink/Tapo; salidas **WebRTC, HLS, MSE, MJPEG**; puerto 8555 TCP/UDP para WebRTC externo; integra con Frigate y Home Assistant) o **MediaMTX** (RTSP/WebRTC/HLS/SRT/RTMP, autenticación interna/HTTP/**JWT**, grabación fMP4, API de control, métricas Prometheus, ICE/TURN). Ambos corren en Raspberry Pi.
- **Cómo verlo desde la app**: WebRTC (latencia < 1 s) con servidor **TURN** propio (coturn en un VPS de US$ 5/mes) para atravesar NAT/4G; HLS (5–15 s de latencia) como fallback. Acceso vía Cloudflare Tunnel/Access o Tailscale; **nunca** exponer RTSP/puertos de cámara a Internet. Vincular el visor al login de Firebase (token corto firmado por Cloud Function → JWT que valida MediaMTX).
- **Ancho de banda**: substream 640×360 @ 10 fps ≈ 300–500 kbps por cámara para vivo; main 1080p ≈ 2–4 Mbps. Con 3 cámaras y 2 espectadores simultáneos: 3 Mbps de subida; la grabación queda **local** (SSD/HDD 1–2 TB, 7–30 días), y a la nube solo eventos/clips (Firebase Storage).
- **NVR nube vs local**: Hik‑Connect/Reolink Cloud/UniFi Protect resuelven el "ver desde el celular" pero no se integran bien en una app propia (SDKs cerrados o P2P). Recomendación: **local (Frigate + go2rtc) con eventos a la nube**.
- **Frigate** (NVR open source): detección de vehículos/personas; hardware recomendado mini‑PC **Beelink EQ13 (Intel N100)** con doble Ethernet (US$ 200–250), aceleradores Hailo‑8L (M.2/Pi), Coral USB, Intel OpenVINO (iGPU/NPU), Nvidia; **LPR integrado** (detector YOLOv9 + PaddleOCR; ≥4 GB RAM y CPU con AVX2; GPU casi no ayuda); modo cámara dedicada `type: lpr`; `known_plates` con regex y `match_distance`; eventos por **MQTT** (`frigate/events`, `sub_label`, `recognized_license_plate`).

### 5.2 Reconocimiento de patentes (ANPR/LPR) para clientes y suscripciones

| Opción | Qué hace | Costo | Notas |
|---|---|---|---|
| **Cámara ANPR Hikvision (iDS‑2CD7A26G0/P‑IZHS, 7A46) / Dahua ITC215/ITC415** | Reconoce en el borde, listas blanca/negra, **salida de relé** para barrera/entrada del PLC, push HTTP/ISAPI con patente + foto | US$ 500–1.000 (estimación) | Pedir firmware/región "Latin America" y probar con patentes Mercosur AR (`AA123BB`) y viejas (`ABC123`) antes de comprar |
| **Plate Recognizer** (nube o SDK on‑premise) | API Snapshot: **gratis 2.500/mes; US$ 50/50k; US$ 150/250k; US$ 250/500k**; Stream: US$ 35/cámara/mes (US$ 45 con marca/modelo/color); on‑premise sin límite de velocidad | ver tabla | **Región `ar` soportada** (predicción y filtrado por país) |
| **Frigate LPR** | Gratis, local, MQTT | 0 | Necesita cámara con buen ángulo/zoom, IR, patente ≥ 80–100 px de ancho; validar en pista |
| Rekor/OpenALPR (Scout) | SaaS/ on‑prem | No consultado | Alternativa comercial |

**Flujo de acceso por suscripción**: cámara LPR en la entrada → patente → función en Firestore (`vehicles/{plate}` con plan activo, cuota diaria, estado de pago) → si OK, comando de arranque (Operation API o relé) y notificación push "Tu lavado empieza"; si falla la lectura, QR dinámico del cliente desde la app (fallback) o tag RFID UHF (lector US$ 150–300 + tags US$ 1–2; menos privacidad‑sensible).

**Conteo de vehículos**: zonas de Frigate (`car` entrando/saliendo) o fotocélula; conciliar con contador del PLC para detectar lavados no cobrados.

### 5.3 Marco legal en Argentina

- **Ley 25.326**: consentimiento libre, expreso e informado (art. 5), deber de información previa (art. 6: finalidad, destinatarios, existencia de la base, carácter obligatorio/facultativo, derechos), calidad y proporcionalidad (art. 4), seguridad (art. 9), **inscripción de la base en el RNBD** (art. 21), acceso/rectificación (arts. 14–16; 10 días / 5 días hábiles), transferencia internacional solo a países con protección adecuada (art. 12).
- **Res. AAIP 4/2019**: "los registros de imágenes captados por sistemas de videovigilancia constituyen una base de datos"; define datos biométricos y el derecho de acceso frente a decisiones automatizadas.
- **Disp. DNPDP 10/2015** (recolección por videocámaras; no se pudo descargar el texto): exige **cartel visible** que informe la existencia de cámaras y el responsable, finalidad limitada (seguridad/operación), plazo de conservación acotado, inscripción de la base (no verificado en el texto original; criterio ampliamente aplicado).
- **Implicancias prácticas**: (1) cartelería en cada sucursal ("Zona videovigilada — Responsable: CARBOYS S.A.S. — Finalidad… — Ley 25.326"); (2) inscribir en el RNBD la base "videovigilancia" y la base "clientes/vehículos" (patente = dato personal cuando se asocia a una persona); (3) consentimiento en el alta de la suscripción por LPR, con términos claros; (4) retención de video ≤ 30 días salvo incidente; (5) para nube en EE. UU. (Firebase us‑central, Plate Recognizer, Claude API) usar **cláusulas contractuales tipo** (Disp. 60‑E/2016) o consentimiento expreso; preferir región `southamerica-east1` de Firestore para latencia (Brasil tampoco es "adecuado", así que las cláusulas siguen aplicando); (6) Res. AAIP 47/2018 medidas de seguridad recomendadas (cifrado, logs de acceso, roles); (7) verificar el estado del proyecto de nueva ley de datos personales (tramitaba en el Congreso en 2023–2024).

---

## 6. Plataformas de gestión de lavaderos (benchmark de features)

| Plataforma | Foco | Features verificadas | Precio |
|---|---|---|---|
| **DRB Patheon** (US) | POS multi‑sitio para túneles | Planes de lavado ilimitado, **LPR + RFID**, dashboards en tiempo real, historial de alertas de 7 días por sitio, integración TunnelWatch y controladores de terceros, app Beacon, SMS/email transaccionales (bienvenida, fallo de pago, recibo, vencimiento), sincronización multi‑sitio | No público (industria: U$S 400–800/sitio/mes + hardware, estimación) |
| **Washify** (ahora DRB) | POS nube para 1 sitio / pequeños | Membresías con renovación automática, **actualizador de tarjetas cada 3 días**, alta por web/app/POS/paystation, RFID y LPR, descuentos de flota por cliente, apps iOS/Android, SMS/MMS, email marketing, automatización, reportes en tiempo real, CRM, inventario, asistencia, turnos de detailing, X Station/Xelerator | No público (estimación U$S 300–500/mes) |
| **Rinsed** | CRM de membresías sobre el POS | 10 M de miembros gestionados, −15 % churn promedio, +16 % ingresos de membresía, Salespath (+43 % conversión en pista), agente de soporte IA 24/7 en 16 idiomas; se integra con POS (DRB, Sonny's… según industria) | No público |
| **EverWash** | Marketplace de suscripciones | App de miembros, validación por **QR escaneado a través del vidrio** (sin sticker), Attendant App, "3× crecimiento de membresías", "−46 % churn"; ingresos compartidos con el operador | Revenue share (no público) |
| **Sonny's Controls** (Tunnel Master WBC, POS, LPR) | Control de túnel + POS | Sitio bloqueado (403); referencia de industria: controlador WBC, memberships, LPR, reportes, diagnóstico remoto | No público |
| **ICS (Innovative Control Systems)** | POS multi‑sitio + kioscos | WashConnect (nube, app de operador), Auto Sentry flex HD / Petro / CPT / Max, **Auto Passport LPR y RFID**, señalética digital, WashNow app/tienda online, WashPad/Touch IT POS; PDQ Access es "powered by ICS" | No público |
| **Unitec** (ahora DRB) | Kioscos para in‑bay automatics | Wash Select II, Portal TI, Sentinel, WashPay (gestión remota); redirige a drb.com | No público |
| **PDQ Access / WALS** | Kioscos y loyalty para LaserWash | Kits de conversión, POS, tarjetas, reportes completos, loyalty y cuentas de regalo multi‑sitio vía web, programación remota | No público |
| **NCS Lens** (Ryko/MacNeil) | App nube de monitoreo de equipos | Sitio bloqueado (403); título: "gestión de lavadero en la nube" | — |
| **Hamilton** | Kioscos/entry systems | Sitio sin contenido accesible; Gold Line/CCX + nube (referencia de industria) | — |
| **Nayax** (VPOS Touch, Onyx) | Cobro sin efectivo en pista + telemetría | Sitio bloqueado (403); referencia: lector EMV/NFC no atendido con telemetría (Nayax Core) y loyalty (Monyx); presencia LATAM (BR, MX, CL, CO); **disponibilidad en Argentina a confirmar** | Equipo U$S 300–600 + U$S 10–15/mes + % (estimación) |
| **CryptoPay** (US) | Tarjeta en bahías self‑service | Swipe/tap MagTek, AES‑256, portal MyCryptoPay, PCI; sin fees publicados | Fees por transacción (no público) |
| **Fabricantes europeos (equivalentes)** | — | WashTec EasyCarWash PRO (flat‑rate con LPR, KPIs), Christ Wwwash (flat‑rate, flota, arranque automático), Kärcher Pay&Wash + Charlie Pay (happy hour, loyalty, QR), Istobal App + ISTOBALCard + Smartwash Fleets | Incluidos/planes |
| AutoCarWash (ES), Ecowash | — | No se encontró información verificable en esta investigación | — |

**Checklist de features a replicar en la app CARBOYS** (todas están en ≥ 2 plataformas): planes ilimitados con cobro recurrente y reintento de cobro; identificación por LPR + QR (+ RFID opcional); cuentas de flota con descuentos por cliente; precios dinámicos (happy hour, clima); loyalty por puntos; gestión remota de kioscos/precios; dashboard en tiempo real por sitio con alertas y su historial; mensajería transaccional (WhatsApp/SMS/email); CRM anti‑churn (uso mensual, avisos de tarjeta vencida); tienda online de vales; app de asistente en pista.

---

## 7. Pagos en Argentina para una bahía no atendida

### 7.1 Marco: Transferencias 3.0 (BCRA Com. "A" 7153, 30/10/2020 y normas complementarias)

- Crea la **Interfaz Estandarizada de Pagos** con reglas de **interoperabilidad**; los **códigos QR** de solicitudes de pago (activas y pasivas) deben poder leerse desde cualquier billetera/banco "sin discriminación" (puntos 3.2.4, 3.3.3, 4.1, 7.2.4).
- **Comisión máxima al comercio: 0,8 %** para "Pagos con transferencia" (punto 6.3.1 y tabla de tasas de intercambio), acreditación inmediata en la cuenta del comercio.
- Actores: "aceptadores" (Mercado Pago, Getnet, Payway/Prisma, Fiserv/Posnet, Naranja X, Ualá Bis, bancos) emiten el QR; cualquier billetera (MODO, Mercado Pago, Ualá, apps bancarias) paga.

### 7.2 Proveedores

| Proveedor | Producto para no atendido | Integración | Verificado |
|---|---|---|---|
| **Mercado Pago** | **QR dinámico** (uno por transacción; "apto para escenarios atendidos y no atendidos"), QR estático, QR híbrido (monto sobre QR reutilizable); **Point Smart 1/2** (chip/NFC/banda + QR) con **API de integración**: `POST /point/integration-api/devices/{deviceid}/payment-intents` (monto en centavos, `external_reference`, `print_on_terminal`; 409 si el dispositivo ya tiene una intención en cola; resultado por webhook); **Suscripciones** (preapproval) para planes; Checkout API/Bricks in‑app | Orders API unificada + **webhooks en tiempo real** (validar `x-signature`); las páginas de webhooks y costos devolvieron 404/403 en esta consulta | QR y Point: sí; costos: no (consultar costs‑section) |
| **MODO** | QR interoperable de +30 bancos; "sin comisiones ni costos extra" (mensaje al comercio en su web) | No hay portal de desarrolladores público; se integra a través del aceptador/adquirente del comercio (Payway, Fiserv, Getnet, banco) | Parcial |
| **Getnet (Santander)** | Get QR, Get Smart POS, Get Link and Pay, Get Checkout, integraciones (Tiendanube, WooCommerce, Magento, VTEX, **Getnet SEP API**), **suscripciones** vía Getnet Portal | API de e‑commerce; QR vía aceptador | Sí |
| **Payway (Prisma)** | Terminales Lapos, QR, Decidir (API e‑commerce con tokenización) | Sitio 503 en esta consulta; referencia de industria | No |
| **Fiserv / Clover / Posnet** | Clover Flex/Mini, QR; Clover tiene REST API y app market en otros países | Página AR sin contenido accesible | No |
| **Nayax / terminales EMV exteriores** | VPOS Touch (unattended EMV con telemetría) | Confirmar adquirencia local y homologación | No |

### 7.3 Flujo recomendado para arrancar la máquina con el pago

1. **Cliente en app (preferido)**: elige sucursal y programa → paga con Mercado Pago (Checkout Bricks/preferencia) o usa su plan → Cloud Function recibe webhook `payment.approved` → escribe `commands/{siteId}` en Firestore → el agente edge (listener en tiempo real) valida la patente (LPR) o el QR mostrado en pantalla de pista → **pulso de relé** (24 V, contacto seco, 300–500 ms) a la entrada "impulso de crédito / programa N" del PLC/terminal (o `Operation API` de Istobal) → el edge confirma inicio (señal "en curso") y la app muestra el estado y la cámara.
2. **Cliente sin app**: pantalla de pista (Raspberry Pi + touch 7–10" en caja IP65, US$ 150–250, o tablet Android en gabinete) muestra programas y genera **QR dinámico** (Orders API); el usuario lo paga con cualquier billetera (0,8 % si es transferencia) → webhook → mismo arranque. Fallback estático: QR híbrido impreso con el monto ingresado.
3. **Tarjeta física**: Point Smart en gabinete anti‑vandálico bajo techo (requiere login de la app de MP; no está diseñado para intemperie) o terminal EMV no atendido si Nayax/adquirente local lo homologa.
4. **Hardware de arranque**: módulo de relés optoaislado (US$ 3–10) en el GPIO del Pi o en un ESP32 dedicado; jamás conectar 230 V; usar la entrada de 24 V del PLC prevista para el terminal de pago (pedir su especificación al fabricante, §1.3). Instalar un **watchdog**: si el edge cae, la máquina sigue aceptando el terminal original.

---

## 8. Arquitectura recomendada y costos

### 8.1 Diagrama lógico

```
[Rollover]──S7/Modbus/OPC UA──┐
[Bombas/contactores]──opto/ESP32──┤   Edge por sucursal (Docker, RPi 5 8GB o mini‑PC N100)
[Bidones]──HX711/JSN‑SR04T/ESP32──┤   ├─ Mosquitto (MQTT local)
[SDM630 / Shelly 3EM]──RS485/WiFi─┤   ├─ Node‑RED (drivers PLC, normalización → MQTT)
[Medidores de agua]──pulsos/ESP32─┤   ├─ go2rtc (+ Frigate: NVR, detección, LPR)
[Cámaras PoE RTSP]────────────────┘   ├─ site‑agent (Python/Node): buffer SQLite, reglas locales,
                                      │     relés de arranque, sync a Firebase (HTTPS/Firestore SDK)
                                      └─ Router 4G failover + UPS
                 │ TLS (internet / 4G)
                 ▼
Firebase (proyecto existente, multi‑tenant por sucursal)
  ├─ Firestore: sites/{id}/state (doc "live"), events, washes, alerts, commands, aggregates/hourly
  ├─ Cloud Functions: ingest, reglas de alerta, webhooks de pago, tokens de video, jobs de agregación
  ├─ Storage: clips/fotos de eventos y patentes (retención 30 días)
  ├─ FCM: push a operadores y clientes;   Auth: roles por sucursal
  ├─ Extensión Firestore → BigQuery: analítica/histórico (gratis 10 GB + 1 TB consulta/mes)
  └─ (opcional) InfluxDB Cloud Serverless o TimescaleDB en VPS para series crudas de 1 s
Front: React (dashboard multi‑sitio, onSnapshot en tiempo real, visor WebRTC) → PWA → Expo/RN
Alertas: Telegram bot + FCM (operación) · WhatsApp Business API (clientes) · email
IA: Claude API (explicación de anomalías, resumen diario, bot de soporte con tool‑use sobre Firestore)
```

### 8.2 Decisiones y justificación

- **Edge obligatorio**: la máquina, el pago y las cámaras deben funcionar si se cae Internet; el edge bufferiza (ring buffer/SQLite, como hace el ejemplo del IoT2050) y sincroniza después. Raspberry Pi 5 8 GB (US$ 80 + fuente/caja/SSD ≈ US$ 140) alcanza para Node‑RED + Mosquitto + go2rtc + agente; si se quiere **Frigate con detección/LPR**, usar mini‑PC N100 (US$ 200–250) o Pi 5 + Hailo‑8L.
- **MQTT**: broker **local** (Mosquitto) para los nodos ESP32; hacia la nube conviene que el agente escriba **directo a Firestore** (SDK Admin con service account por sitio, o HTTPS a Cloud Functions) — menos piezas que un broker cloud. Si más adelante hay > 20 sitios o se quiere comando pub/sub, **EMQX Cloud Serverless** (gratis hasta 1.000 conexiones y cuota mensual; luego pago por uso; Dedicated desde US$ 234/mes) es la opción; HiveMQ self‑managed arranca en US$ 299/mes (no justifica).
- **Series temporales**: Firestore no es TSDB (50k lecturas/20k escrituras gratis/día; luego precio por operación). Estrategia: **estado "live" en 1 documento por sitio** (actualizado cada 5–10 s → ~10k escrituras/día/sitio), **eventos** (lavado, alarma, cambio de nivel) como documentos, **agregados por hora** y **BigQuery** vía extensión para históricos. Series crudas (corriente de motores a 1 s) quedan 90 días en el edge (SQLite/Parquet) o van a **InfluxDB Cloud Serverless** (US$ 0,0025/MB escrito, US$ 0,012/100 consultas, US$ 0,002/GB‑h; ~US$ 5–15/mes por sitio) con Grafana.
- **Video**: go2rtc/MediaMTX en el edge + coturn en VPS (US$ 5/mes compartido por toda la cadena) + JWT emitido por Cloud Function; clips de eventos a Storage.
- **Mobile**: **PWA** primero (push FCM funciona en Android e iOS ≥ 16.4 instalada en pantalla de inicio); **Expo/React Native** cuando se sume LPR/QR de cliente y pagos in‑app.
- **Alertas**: WhatsApp Business Platform cobra **por mensaje de plantilla** (marketing siempre; utility/auth gratis dentro de la ventana de servicio de 24 h; conversaciones de servicio gratis desde nov‑2024; Argentina en tarjeta propia, descuento por volumen). Para operación interna usar **Telegram** (gratis) + FCM; WhatsApp para clientes (plantillas utility: "tu lavado terminó", "tu plan vence").
- **Mantenimiento predictivo (realista)**: no requiere ML al inicio. Reglas y estadística en Cloud Functions/BigQuery: (a) contadores → mantenimiento por uso (cepillos cada N lavados, rodamientos, correas); (b) **deriva del tiempo de ciclo** por programa (EWMA/z‑score); (c) **firma de corriente** de motores por fase del ciclo vs. baseline; (d) **mL/lavado** por bomba vs. objetivo (bomba desajustada, manguera rota, químico agotado); (e) agua/lavado y kWh/lavado por programa; (f) tasa de errores por código y hora. **Claude** explica, prioriza y redacta la orden de trabajo.
- **IA con Claude API** (precios vigentes: Opus 5 US$ 5/25 por MTok entrada/salida; Sonnet 5 US$ 2/10; Haiku 4.5 US$ 1/5): casos: (1) "explicá esta anomalía" con contexto de 24 h (≈ 5k tokens) → < US$ 0,05 por explicación; (2) resumen diario por sucursal; (3) bot de soporte WhatsApp con **tool‑use** (consultar lavados, plan, reintentar cobro, abrir ticket) usando el SDK oficial (`@anthropic-ai/sdk`) desde Cloud Functions; (4) lectura del HMI por visión cuando no hay PLC. Con 5 sucursales, < US$ 20/mes en total.
- **Seguridad**: red OT separada (VLAN/2.º puerto Ethernet), sin puertos entrantes, actualizaciones OTA de ESP32 (ESPHome), secretos en Secret Manager, roles por sucursal en Firestore Rules, logs de comandos de arranque.

### 8.3 Costo orientativo por sucursal (USD, referencias internacionales; ver nota inicial)

| Ítem | Básico | Completo |
|---|---|---|
| Gateway edge (RPi 5 8 GB + SSD + caja + UPS) / mini‑PC N100 + UPS | 200 | 350 |
| Router 4G failover (comercial / Teltonika RUT956) + switch PoE 8p | 120 | 400 |
| Interfaz PLC (cable/RS485) o licencia OPC UA / opto‑módulos + ESP32 ×2 | 40 | 250 |
| Medidor energía (SDM630 o Shelly Pro 3EM) + medidores de agua ×2 con pulsos | 200 | 350 |
| Nivel de químicos: 4–6 puntos (HX711/JSN‑SR04T + ESP32) / LoRaWAN (LDDS20 ×5 + gateway) | 80 | 600 |
| Pinzas de corriente ×4 + ADC | 40 | 70 |
| Cámaras PoE ×2–3 (Hikvision/Dahua 4 MP) | 200 | 350 |
| Cámara ANPR (Hikvision/Dahua) o cámara LPR + Frigate | 0 | 800 |
| Pantalla de pista + relés de arranque (RPi + touch IP65) | 60 | 250 |
| Instalación/cableado (estimación local) | 200 | 400 |
| **Total hardware** | **~1.100** | **~3.800** |

| Nube y servicios por sucursal / mes | USD |
|---|---|
| Firebase Blaze (Firestore, Functions, Storage, FCM) — 5 sitios comparten proyecto | 5–20 |
| InfluxDB Cloud Serverless (opcional) | 5–15 |
| VPS TURN/coturn + Grafana (compartido) | 1–2 |
| SIM 4G M2M | 10–20 |
| Plate Recognizer Stream (opcional, 1 cámara) | 0–35 |
| WhatsApp Business API (plantillas a clientes) | 5–30 |
| Claude API | 1–5 |
| Istobal Smartwash Premium / WashTec myWashTec (si aplica) | a cotizar |
| **Total** | **~15–60 (+ suscripción del fabricante)** |

### 8.4 Plan de implementación sugerido

1. **Semana 0–2**: definir marca del rollover; enviar el checklist §1.3 a 2–3 proveedores; decidir "API del fabricante" vs "PLC" vs "instrumentación paralela".
2. **Piloto (1 sucursal, 6–8 semanas)**: edge + energía + agua + 2 bombas con opto + 2 niveles + 2 cámaras con go2rtc; documento `sites/{id}/live` en Firestore y panel React con estado, lavados del día, consumos por lavado y video; alertas Telegram.
3. **Fase 2**: LPR (Frigate o ANPR) + QR dinámico Mercado Pago + relé de arranque + planes ilimitados con Suscripciones; cartelería y RNBD.
4. **Fase 3**: BigQuery + reglas predictivas + Claude para explicación/soporte; réplica a las siguientes sucursales con imagen de Docker y `docker compose` estandarizados.

---

## 9. Riesgos y cómo mitigarlos

| Riesgo | Mitigación |
|---|---|
| Fabricante niega acceso al PLC o cobra la API en plan premium | Contrato: "acceso a datos de telemetría por API/export incluido"; plan B de instrumentación paralela (§2.3) |
| Garantía: tocar el PLC | No modificar el programa; solo lectura (S7 PUT/GET u OPC UA); relé sobre la entrada prevista para terminal de pago |
| Espuma/vapor en sensores ultrasónicos | Celdas de carga en shampoo/espuma; ultrasónico solo en cera/abrillantador; conteo de bomba como fuente primaria |
| Compatibilidad química (pH alcalino de pre‑lavado, solventes de cera) | Sensores sin contacto (peso, a través de pared); cuerpos PP/PTFE si son sumergibles |
| Conectividad rural/4G | Edge autónomo con buffer; reglas y arranque locales; 4G failover |
| Datos personales (video/patente) | Cartelería, RNBD, consentimiento, retención 30 días, cláusulas de transferencia internacional, roles y logs |
| LPR con patentes sucias/mojadas o de noche | Cámara con IR y zoom dedicada, altura/ángulo correctos, QR y RFID como fallback |
| Costos de Firestore por escrituras de alta frecuencia | Documento "live" con throttling (≥ 5 s), agregados, BigQuery/Influx para series |

---

## Anexo — Fuentes consultadas

**Fabricantes**
- Istobal Connectivity (APIs, Smartwash Manager, App Remote, POS): https://istobal.com/inter/connectivity
- Istobal — plan gratuito/Premium de Smartwash: https://istobal.com/inter/blog/istobal-facilitates-digital-transformation-wash-facilities-with-free-subscription-plan-to-smartwash/
- Istobal Smartwash (US): https://us.istobal.com/usa/smartwash · Tratamiento de agua: https://istobal.com/inter/complements/water-treatment.html
- WashTec soluciones digitales: https://www.washtec.com/en/uk/digital-solutions/ · SmartSite: https://www.washtec.com/en/uk/digital-solutions/smartsite/ · CarWash Assist: https://www.washtec.com/en/uk/digital-solutions/carwash-assist/ · EasyCarWash PRO: https://www.washtec.com/en/uk/digital-solutions/easycarwash-pro/ · SmartCare Connect: https://www.washtec.com/en/uk/products/car-washes/gantry-car-washes/smartcare-connect/ · Reciclado (AquaPur/AquaBio): https://www.washtec.com/en/uk/products/water-recycling/ · mywashtec.com: https://www.washtec.com/en/uk/services/mywashteccom/
- mywashtec.api (XITASO): https://xitaso.com/en/projects/mywashtec-api/ · EasyCarWash (XITASO): https://xitaso.com/en/projects/washtec-easycarwash/
- Christ — terminales y CIS NEXT: https://www.christ-ag.com/en/wash-systems/operating-terminals/ · https://www.christ-ag.com/en/products/operating-devices/ · MobilityPlaza (UNITI 2022): https://www.mobilityplaza.com/news/30154
- Kärcher K!Connect: https://www.kaercher.com/int/professional/vehicle-wash-systems/digital-solutions-for-vehicle-wash/k-connect.html · Charlie Fleet/Pay: https://www.mobilityplaza.org/news/30564
- Ceccato Hyperion Tech 3.0 (folleto Kroma): https://kromacarwash.com/wp-content/uploads/2021/06/automatska-autopraonica-osobna-vozila-ceccato-hyperion-tech.pdf · Kroma/Ceccato Aries: https://kromacarwash.com/en/automatske-autopraonice-osobna-vozila-ceccato/
- Aquarama Aquacontrol: https://www.aquarama.it/en/aquacontrol/ · Tammermatic: https://www.tammermatic.com/ · Autoequip: https://www.autoequip.it/en/
- PDQ Access: https://www.opwvws.com/products/pdq-products/payment-terminals.html · WALS: https://washaccess.com/ · NCS Lens: https://ncswash.com/ncs-lens-powerful-cloud-based-car-wash-management/
- Leisuwash S90: https://www.leisuwash.com/product/leisuwash-s90-car-wash-machine/ · Leisuwash SG review 2026: https://leisuwasher.com/2026/05/28/leisuwash-sg-complete-review-specifications-buyer-s-guide-2026/ · Leisuwash 360: https://www.leisuwash.com/product/leisuwash-360-automatic-car-wash-system-touchless/
- Shinewash S1 (PLC Mitsubishi, consumos): https://www.shinewashtec.com/gantry-car-washing-equipment-S1.html · Autobase: https://autobasecarwash.en.made-in-china.com/ · Risense: https://risense.en.made-in-china.com · Sino Star: https://sinostarcarwash.com/

**PLC / gateways**
- FlowFuse — S7 con Node‑RED (PUT/GET, DB no optimizados, OPC UA): https://flowfuse.com/blog/2025/01/integrating-siemens-s7-plcs-with-node-red-guide/
- Siemens IOT2050 Node‑RED DataCollector (S7/Modbus/OPC UA, ring buffer): https://github.com/SIMATICmeetsLinux/IOT2050-NodeRed-DataCollector
- IOT2050 configuración de red: https://industrialmonitordirect.com/blogs/knowledgebase/how-to-connect-a-siemens-iot2050-to-internet-and-s7-1500-plc · S7 → OPC UA/MQTT: https://industrialmonitordirect.com/blogs/knowledgebase/connecting-siemens-s7-plcs-to-web-apps-via-opc-ua-and-mqtt
- Teltonika TRB245 Modbus/MQTT gateway: https://wiki.teltonika-networks.com/view/TRB245_Modbus · RUT956: https://wiki.teltonika-networks.com/view/RUT956_Modbus
- Ubidots — PLC → Node‑RED → MQTT: https://ubidots.com/blog/plc-data/
- ControlByWeb — controlador para car wash: https://controlbyweb.com/blog/car-wash-controller/
- Tutorial car wash con S7‑1200 (referencia didáctica): https://github.com/MessingWithTech/CarWashTutorial

**Dosificación y sensores**
- Lutz‑Jesco dosificación en lavaderos: https://www.lutz-jesco.com/at-EN/applications/dosing-of-chemicals/dosing-of-cleaning-agents-in-washing-and-cleaning-systems/ · Etatron vehicle wash: https://etatron.co.uk/vehicle-wash/ · Dosatron car wash: https://www.dosatron.com/en-us/chemical-dilution-dispensers-for-car-washes · Kleen‑Rite Dosatron: https://www.kleen-ritecorp.com/c-908-dosatron.aspx
- Dragino LDDS20: https://www.dragino.com/products/distance-level-sensor/item/164-ldds20.html · Milesight EM500‑UDL: https://www.milesight.com/iot/product/lorawan-sensor/em500-udl · MaxBotix MB7389: https://maxbotix.com/products/mb7389
- JSN‑SR04T + ESP32/ESPHome: https://gist.github.com/PrasadRD/04e046b799741bf33d85e87246280f38 · https://componentindex.net/components/jsn-sr04t/ · https://arduinoyard.com/esp32-jsn-sr04t/
- ESPHome SDM meter: https://esphome.io/components/sensor/sdm_meter/ · Eastron SDM630 Modbus: https://www.eastroneurope.com/products/view/sdm630modbus · Mapa de registros: https://www.modbuscloud.com/knowledge-base/eastron-sdm630-modbus-register-map
- Shelly Pro 3EM: https://kb.shelly.cloud/knowledge-base/shelly-pro-3em
- Medidor de agua a pulsos con ESP32: https://esp32.co.uk/esp32-water-meter-home-assistant-esphome/ · Medidor DN25 con emisor: https://www.mecafluid.eu/en/catalog/water-meter-with-pulser-dn25-114m-nominal-flow-35-mh-25lpulse~e9981b8c-4503-4f57-bea2-fd703e7ce432
- Raspberry Pi 5: https://www.raspberrypi.com/products/raspberry-pi-5/

**Cámaras / LPR / legal**
- go2rtc: https://github.com/AlexxIT/go2rtc · MediaMTX: https://github.com/bluenviron/mediamtx · Frigate hardware: https://docs.frigate.video/frigate/hardware · Frigate LPR: https://docs.frigate.video/configuration/license_plate_recognition
- Plate Recognizer precios: https://platerecognizer.com/pricing/ · Países (`ar`): https://guides.platerecognizer.com/docs/other/country-codes · API: https://guides.platerecognizer.com/docs/snapshot/api-reference
- Ley 25.326 (texto): https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto · Res. AAIP 4/2019: https://www.argentina.gob.ar/normativa/nacional/resolucion-4-2019-318874/texto · AAIP datos personales: https://www.argentina.gob.ar/aaip/datospersonales

**Plataformas de gestión**
- DRB Patheon: https://drb.com/tunnel_solutions/point-of-sale/patheon · Washify: https://drb.com/tunnel_solutions/point-of-sale/washify · Rinsed: http://www.rinsed.com/ · EverWash: https://everwash.com/ · EverWash partners: https://www.everwashpartners.com/ · ICS: https://icscarwashsystems.com/ · CryptoPay: https://www.getcryptopay.com/ · Nayax (blog): https://www.nayax.com/blog/top-18-self-car-wash-companies/ · Unitec → DRB: https://drb.com/

**Pagos Argentina**
- Mercado Pago QR (modelos estático/dinámico/híbrido): https://www.mercadopago.com.ar/developers/es/docs/qr-code/landing · Point (Smart 1/2, PDV): https://www.mercadopago.com.ar/developers/es/docs/mp-point/landing · Point payment‑intents API: https://www.mercadopago.com.ar/developers/es/reference/integrations_api/_point_integration-api_devices_deviceid_payment-intents/post
- MODO comercios: https://www.modo.com.ar/ · Getnet Argentina: https://www.getnet.net/ar/
- BCRA Com. "A" 7153 (Transferencias 3.0, tope 0,8 %, QR interoperable): https://www.bcra.gob.ar/Pdfs/comytexord/A7153.pdf

**Nube / mensajería / IA**
- Firebase precios: https://firebase.google.com/pricing · InfluxDB Cloud precios: https://www.influxdata.com/influxdb-pricing/ · EMQX precios: https://www.emqx.com/en/pricing · HiveMQ precios: https://www.hivemq.com/pricing/ · WhatsApp Business Platform precios: https://developers.facebook.com/docs/whatsapp/pricing
- Claude API precios (skill `claude-api`, tabla vigente jun‑2026): Opus 5 US$ 5/25, Sonnet 5 US$ 2/10, Haiku 4.5 US$ 1/5 por MTok.

*Páginas que no pudieron consultarse (403/404/503) y cuyos datos figuran como "referencia de industria/estimación": sonnysdirect.com, nayax.com (car wash), ncswash.com, hamiltonmfg.com, payway.com.ar, clover.com/ar, mercadopago.com.ar/costs-section y docs de webhooks, help.ui.com (UniFi RTSP), reolink.com (RTSP), hikvision.com (ANPR), seko.com, grundfos.com, christ-ag.com (reciclado), aquarama.it, Disposición DNPDP 10/2015, listados de Mercado Libre.*
