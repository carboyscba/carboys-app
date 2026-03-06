import React, { useState, useEffect, useRef, useCallback, useContext } from "react";

const T = {
  bg: "#080e1a", bg2: "#0d1526", bg3: "#131d33", border: "#1a2744",
  accent: "#1e88e5", red: "#e53935", green: "#43a047", orange: "#ff9800",
  white: "#f0f4f8", gray: "#7b8fad", grayLight: "#9badc4",
};

const font = "'Outfit', sans-serif";
const fontD = "'Rajdhani', sans-serif";

const VEHICLE_DB = {
  "Alfa Romeo": ["Giulia","Stelvio","Tonale","Giulietta","MiTo","4C","Brera","159"],
  "Audi": ["A1","A3","A4","A5","Q2","Q3","Q5","Q7","Q8","TT","e-tron","RS3","RS Q8","S3","A6"],
  "BMW": ["Serie 1","Serie 2","Serie 3","Serie 4","Serie 5","X1","X2","X3","X4","X5","X6","Z4","M3","M4","i3","iX3"],
  "Changan": ["CS15","CS35 Plus","CS55 Plus","CS75 Plus","Alsvin","Hunter"],
  "Chery": ["Tiggo 2","Tiggo 3","Tiggo 4","Tiggo 5X","Tiggo 7","Tiggo 8","Arrizo 5","Arrizo 6","QQ","New QQ"],
  "Chevrolet": ["Onix","Onix Plus","Tracker","Cruze","Cruze II","S10","Montana","Equinox","Spin","Bolt EV","Camaro","Trail Blazer","Prisma","Classic","Aveo","Agile","Cobalt","Sonic","Captiva"],
  "Chrysler": ["300C","PT Cruiser","Town & Country"],
  "Citroën": ["C3","C3 Aircross","C4","C4 Cactus","C4 X","C4 Lounge","C5 Aircross","Berlingo","C-Elysée","DS3","DS4","DS5","Jumpy","Jumper"],
  "Dodge": ["Journey","Durango","Charger","Challenger","Ram 1500","Ram 2500","Caliber","Neon"],
  "DS": ["DS3 Crossback","DS4","DS7 Crossback","DS9"],
  "Fiat": ["Cronos","Argo","Mobi","Strada","Toro","Pulse","Fastback","500","500X","Tipo","Ducato","Fiorino","Uno","Palio","Siena","Punto","Linea","Bravo","Grand Siena","Idea","Doblò"],
  "Ford": ["Ranger","EcoSport","Territory","Focus","Ka","Ka+","Maverick","Bronco","Bronco Sport","F-150","Transit","Kuga","Mondeo","Fiesta","S-Max","Explorer","Edge","Escape","Mustang"],
  "GWM": ["Haval H6","Haval Jolion","Haval Dargo","Ora 03","Poer","Wingle 5","Wingle 6","Wingle 7"],
  "Honda": ["HR-V","WR-V","Civic","City","CR-V","Fit","Accord","Pilot"],
  "Hyundai": ["Creta","Tucson","Santa Fe","HB20","Kona","i10","i20","i30","Veloster","Elantra","Accent","ix35","Grand Santa Fe","Ioniq 5"],
  "Iveco": ["Daily","Stralis","Tector","Vertis","Power Daily"],
  "JAC": ["S2","S3","S4","S7","T6","T8","iEV40"],
  "Jeep": ["Renegade","Compass","Commander","Wrangler","Grand Cherokee","Gladiator","Cherokee","Patriot","Liberty"],
  "Kia": ["Seltos","Sportage","Sorento","Cerato","Carnival","Rio","Picanto","Stonic","EV6","Niro","Stinger","Soul","Mohave"],
  "Land Rover": ["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Sport","Range Rover Evoque","Range Rover Velar","Freelander"],
  "Lexus": ["NX","RX","UX","ES","IS","LC","LS","LX"],
  "Lifan": ["X50","X60","X70","320","520","620"],
  "Mercedes-Benz": ["Clase A","Clase B","Clase C","Clase E","Clase S","CLA","CLS","GLA","GLB","GLC","GLE","GLS","AMG GT","Sprinter","Vito","Viano","ML","GL"],
  "Mini": ["Cooper","Cooper S","Countryman","Clubman","Cabrio","One","JCW"],
  "Mitsubishi": ["L200","Outlander","ASX","Eclipse Cross","Pajero","Lancer","Montero"],
  "Nissan": ["Kicks","Frontier","Sentra","Versa","X-Trail","Pathfinder","March","Note","Tiida","Murano","Qashqai","Navara","NP300"],
  "Peugeot": ["208","2008","308","3008","408","5008","Partner","Boxer","Expert","207","206","301","RCZ","508"],
  "Porsche": ["Cayenne","Macan","911","Panamera","Taycan","Boxster","Cayman"],
  "RAM": ["1500","2500","3500","700","1000"],
  "Renault": ["Sandero","Sandero Stepway","Logan","Duster","Koleos","Kangoo","Kwid","Captur","Arkana","Oroch","Alaskan","Fluence","Megane","Clio","Symbol","Scenic","Master","Trafic"],
  "Seat": ["Leon","Ibiza","Ateca","Arona","Toledo","Alhambra"],
  "Subaru": ["XV","Forester","Outback","WRX","Impreza","Legacy","BRZ","Levorg"],
  "Suzuki": ["Swift","Vitara","Jimny","S-Cross","Fronx","Ignis","Baleno","SX4","Grand Vitara","Alto","Celerio"],
  "Toyota": ["Hilux","Corolla","Corolla Cross","Yaris","SW4","RAV4","Camry","GR86","Land Cruiser","Prado","86","Etios","Innova","Hiace","Land Cruiser 300","GR Supra","C-HR","Fortuner"],
  "Volkswagen": ["Gol","Gol Trend","Polo","Virtus","T-Cross","Taos","Tiguan","Amarok","Vento","Golf","Saveiro","Up!","Fox","Suran","Passat","Touareg","Sharan","Caddy","Transporter","Crafter","ID.4","Nivus"],
  "Volvo": ["XC40","XC60","XC90","S60","S90","V40","V60","V90","C40"],
};

const BRANDS = Object.keys(VEHICLE_DB).sort();

const currentYear = 2026;
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const WORK_TYPES = [
  { name: "Service Full", icon: "🛠️" },
  { name: "Service Base", icon: "🔧" },
  { name: "Tren Delantero", icon: "⚙️" },
  { name: "Tren Trasero", icon: "⚙️" },
  { name: "Pastillas de Freno", icon: "🛞" },
  { name: "Mecánica", icon: "🔩" },
  { name: "Escape", icon: "💨" },
  { name: "Repro", icon: "⚡" },
  { name: "Arreglo", icon: "🪛" },
  { name: "Accesorios", icon: "🧰", isGroup: true, subItems: [
    { name: "Baterías", icon: "🔋" },
    { name: "Escobillas", icon: "🧹" },
    { name: "Aditivo", icon: "🧪" },
    { name: "Lámpara", icon: "💡" },
  ]},
  { name: "Otros", icon: "📝" },
];

const BUDGET_CATEGORIES = {
  "Tren Delantero": [
    { key: "amortiguadores", label: "Amortiguadores", hasSide: true },
    { key: "extremos", label: "Extremos de dirección", hasSide: true },
    { key: "axiales", label: "Axiales", hasSide: true },
    { key: "bieletas", label: "Bieletas", hasSide: true },
    { key: "parrilla", label: "Parrilla completa", hasSide: true },
    { key: "rotulas", label: "Rótulas", hasSide: true },
    { key: "bujes", label: "Bujes", hasSide: true },
    { key: "alineado", label: "Alineado" },
    { key: "balanceado", label: "Balanceado" },
    { key: "rotacion", label: "Rotación" },
  ],
  "Tren Trasero": [
    { key: "amortiguadores_t", label: "Amortiguadores", hasSide: true },
    { key: "bujes_t", label: "Bujes", hasSide: true },
  ],
  "Mecánica": [
    { key: "kit_distribucion", label: "Kit de distribución" },
    { key: "bomba_agua", label: "Bomba de agua" },
    { key: "correa_poliv", label: "Correa poliv" },
    { key: "tensores", label: "Tensores" },
    { key: "bujias", label: "Bujías" },
  ],
  "Escape": [
    { key: "multiple_esc", label: "Múltiple" },
    { key: "flexible", label: "Flexible" },
    { key: "catalizador_esc", label: "Catalizador" },
    { key: "silenciador_int", label: "Silenciador intermedio" },
    { key: "cano_intermedio", label: "Caño intermedio" },
    { key: "silenciador_tra", label: "Silenciador trasero" },
    { key: "soporte_esc", label: "Soporte" },
    { key: "cola_esc", label: "Cola" },
    { key: "arreglo_esc", label: "Arreglo" },
  ],
  "Escape Deportivo": [
    { key: "downpipe", label: "Downpipe" },
    { key: "medio_equipo", label: "Medio equipo" },
    { key: "equipo_completo", label: "Equipo completo" },
  ],
  "Baterías": [
    { key: "bat_45", label: "Batería 45 Amp" },
    { key: "bat_55", label: "Batería 55 Amp" },
    { key: "bat_65", label: "Batería 65 Amp" },
    { key: "bat_75", label: "Batería 75 Amp" },
    { key: "bat_90", label: "Batería 90 Amp" },
    { key: "bat_110", label: "Batería 110 Amp" },
  ],
};
const FREE_CATEGORIES = ["Arreglo", "Repro", "Otros"];
const SIMPLE_WORK_TYPES = ["Escobillas", "Aditivo", "Lámpara"];

const findWorkType = (name) => {
  for (const wt of WORK_TYPES) {
    if (wt.name === name) return wt;
    if (wt.subItems) {
      const sub = wt.subItems.find(s => s.name === name);
      if (sub) return sub;
    }
  }
  return null;
};
const ITEMS_PLUS_FREE = ["Tren Delantero", "Tren Trasero", "Mecánica", "Escape"];

const buildTrenItems = (category) => {
  const fixed = (BUDGET_CATEGORIES[category] || []).map(t => ({ ...t, selected: false, price: "", side: t.hasSide ? "ambos" : undefined }));
  if (FREE_CATEGORIES.includes(category)) return [{ key: "libre_1", label: "", selected: false, price: "", isCustom: true }];
  return [...fixed, { key: "otro", label: "Otro", selected: false, price: "", otroDesc: "", isCustom: false }];
};

const USERS = [
  { id: 1, name: "Ignacio", role: "dueño", pin: "0000", initial: "I", color: T.red },
  { id: 2, name: "Kevin", role: "encargado", pin: "0000", initial: "K", color: T.accent },
  { id: 3, name: "Chiara", role: "admin", pin: "0000", initial: "C", color: T.orange },
  { id: 4, name: "Fabricio", role: "mecánico", pin: "0000", initial: "F", color: T.green },
];

const INITIAL_CLIENTS = [
  { id: 1, name: "Carlos", lastName: "Pérez", phone: "3515551001", dni: "30555100", cuit: "20-30555100-5", vehicles: [{ domain: "AC 123 BD", brand: "Volkswagen", model: "Golf", year: 2020, km: 45000 }] },
  { id: 2, name: "María", lastName: "López", phone: "3515551002", dni: "28555200", cuit: "", vehicles: [{ domain: "AB 456 CD", brand: "Toyota", model: "Corolla", year: 2019, km: 62000 }] },
  { id: 3, name: "Juan", lastName: "García", phone: "3515551003", dni: "35555300", cuit: "20-35555300-8", vehicles: [{ domain: "AE 789 FG", brand: "Ford", model: "Ranger", year: 2022, km: 28000 }, { domain: "AE 360 ML", brand: "Volkswagen", model: "Amarok", year: 2021, km: 45000 }] },
  { id: 4, name: "Ana", lastName: "Martínez", phone: "3515551004", dni: "32555400", cuit: "", vehicles: [{ domain: "AD 012 HI", brand: "Fiat", model: "Cronos", year: 2021, km: 38000 }] },
  { id: 5, name: "Roberto", lastName: "Sánchez", phone: "3515551005", dni: "29555500", cuit: "20-29555500-3", vehicles: [{ domain: "AF 345 JK", brand: "Chevrolet", model: "Cruze", year: 2018, km: 95000 }] },
  { id: 6, name: "Laura", lastName: "Fernández", phone: "3515551006", dni: "33555600", cuit: "", vehicles: [{ domain: "AH 901 NP", brand: "Renault", model: "Sandero", year: 2020, km: 52000 }] },
  { id: 7, name: "Diego", lastName: "Romero", phone: "3515551007", dni: "31555700", cuit: "20-31555700-1", vehicles: [{ domain: "AK 234 QR", brand: "Peugeot", model: "208", year: 2022, km: 19000 }] },
  { id: 8, name: "Sofía", lastName: "Gutiérrez", phone: "3515551008", dni: "34555800", cuit: "", vehicles: [{ domain: "AL 567 ST", brand: "Hyundai", model: "Creta", year: 2023, km: 12000 }] },
  { id: 9, name: "Martín", lastName: "Díaz", phone: "3515551009", dni: "27555900", cuit: "20-27555900-6", vehicles: [{ domain: "AM 890 UV", brand: "Toyota", model: "Hilux", year: 2021, km: 67000 }, { domain: "AN 111 WX", brand: "Fiat", model: "Strada", year: 2020, km: 78000 }] },
  { id: 10, name: "Valentina", lastName: "Torres", phone: "3515551010", dni: "36555000", cuit: "", vehicles: [{ domain: "AP 222 YZ", brand: "Jeep", model: "Renegade", year: 2022, km: 25000 }] },
  { id: 11, name: "Federico", lastName: "Morales", phone: "3515551011", dni: "30555110", cuit: "20-30555110-2", vehicles: [{ domain: "AQ 333 AB", brand: "Nissan", model: "Kicks", year: 2023, km: 8000 }] },
  { id: 12, name: "Luciana", lastName: "Castro", phone: "3515551012", dni: "32555120", cuit: "", vehicles: [{ domain: "AR 444 CD", brand: "Chevrolet", model: "Tracker", year: 2022, km: 31000 }] },
];

const FULL_SS = {
  aceite:{checked:true}, filtro_aceite:{checked:true}, filtro_aire:{checked:true}, filtro_habitaculo:{checked:true}, filtro_combustible:{checked:true},
  td_amortiguadores:{status:"bien",checked:true}, td_bujes_parrilla:{status:"bien",checked:true}, td_rotulas:{status:"bien",checked:true}, td_bieletas:{status:"bien",checked:true}, td_discos:{status:"regular",checked:true}, td_pastillas:{percent:60,status:"bien",checked:true}, td_rulemanes:{fluidOk:"bien",checked:true},
  tt_amortiguadores:{status:"bien",checked:true}, tt_freno:{toggle:"Pastillas",percent:65,checked:true}, tt_bujes:{status:"bien",checked:true}, tt_rulemanes:{fluidOk:"bien",checked:true},
  liq_direccion:{fluidOk:"bien",checked:true}, liq_frenos:{fluidOk:"bien",checked:true,percent:2,added:true}, liq_refrigerante:{fluidOk:"bien",checked:true}, aceite_caja:{fluidOk:"bien",checked:true}, agua_lavaparabrisas:{fluidOk:"nivelado",checked:true},
  correa_distribucion:{status:"bien",checked:true}, bomba_agua:{fluidOk:"bien",checked:true}, correa_poliv:{status:"bien",checked:true}, tensores_poliv:{status:"bien",checked:true}, mangueras_refrig:{fluidOk:"bien",checked:true}, perdidas_aceite:{fluidOk:"bien",checked:true},
  luz_baja:{fluidOk:"funciona",checked:true}, luz_alta:{fluidOk:"funciona",checked:true}, luz_pos_del:{fluidOk:"funciona",checked:true}, luz_pos_tra:{fluidOk:"funciona",checked:true}, luz_stop:{fluidOk:"funciona",checked:true}, guinos:{fluidOk:"funciona",checked:true},
  silenciador_trasero:{status:"bien",checked:true}, silenciador_intermedio:{status:"bien",checked:true}, multiple_escape:{status:"bien",checked:true}, cano_escape:{status:"bien",checked:true}, soporte_escape:{status:"bien",checked:true}, catalizador:{status:"bien",checked:true},
  reinicio_service:{resetStatus:"realizado",checked:true}, dtc_fallos:{dtcStatus:"sin_fallos",checked:true}, bateria_control:{percent:85,checked:true}, carga_alternador:{voltage:"14.1",checked:true},
  bujias_estado:{fluidOk:"bien",checked:true}, escobillas_estado:{fluidOk:"bien",checked:true},
  rotacion_cubiertas:{toggle:"Si",checked:true}, estado_cubiertas:{checked:true,tires:{del_izq:80,del_der:75,tra_izq:85,tra_der:80}}
};

const INITIAL_ORDERS = [
  { id: 101, clientId: 1, domain: "AC 123 BD", status: "delivered", works: [{ type: "Service Full", price: 85000 }, { type: "Tren Delantero", price: 135000, desc: "Amortiguadores, Extremos, Alineado", trenItems: [{ key: "amortiguadores", label: "Amortiguadores", hasSide: true, selected: true, price: "55000", side: "ambos" }, { key: "extremos", label: "Extremos de dirección", hasSide: true, selected: true, price: "32000", side: "ambos" }, { key: "alineado", label: "Alineado", selected: true, price: "18000" }] }, { type: "Pastillas de Freno", price: 38000, desc: "Delanteras", brakeEjes: { del: true, tra: false } }, { type: "Escape", price: 98000, escapeType: "original", trenItems: [{ key: "flexible", label: "Flexible", selected: true, price: "36000" }, { key: "silenciador_tra", label: "Silenciador trasero", selected: true, price: "62000" }] }], payments: [{ method: "Transferencia", account: "1", amount: 356000, withIva: true, invoiceType: "A" }], assignedTo: "Fabricio", date: "2026-01-15", startedBy: "Fabricio", startedAt: "2026-01-15 09:00", serviceSheet: { ...FULL_SS, td_amortiguadores: { status: "cambiado", checked: true }, td_rotulas: { status: "cambiado", checked: true }, td_pastillas: { percent: 20, status: "cambiado", checked: true }, silenciador_trasero: { status: "cambiado", checked: true }, flexible_escape: { status: "cambiado", checked: true } }, techNotes: ["Discos delanteros con desgaste leve"] },
  { id: 102, clientId: 2, domain: "AB 456 CD", status: "delivered", works: [{ type: "Service Full", price: 75000 }], payments: [{ method: "Efectivo", amount: 75000, withIva: false }], assignedTo: "Fabricio", date: "2026-01-20", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 103, clientId: 3, domain: "AE 789 FG", status: "delivered", works: [{ type: "Service Full", price: 95000 }, { type: "Escape", price: 62000, escapeType: "original", trenItems: [{ key: "silenciador_tra", label: "Silenciador trasero", selected: true, price: "62000" }] }], payments: [{ method: "Tarjeta", amount: 157000, withIva: true, invoiceType: "B" }], assignedTo: "Fabricio", date: "2026-01-28", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 104, clientId: 5, domain: "AF 345 JK", status: "delivered", works: [{ type: "Service Full", price: 85000 }, { type: "Baterías", price: 65000 }], payments: [{ method: "Transferencia", account: "1", amount: 150000, withIva: true }], assignedTo: "Fabricio", date: "2026-02-03", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 105, clientId: 6, domain: "AH 901 NP", status: "delivered", works: [{ type: "Service Base", price: 45000 }], payments: [{ method: "Efectivo", amount: 45000, withIva: false }], assignedTo: "Fabricio", date: "2026-02-05", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 106, clientId: 4, domain: "AD 012 HI", status: "delivered", works: [{ type: "Tren Delantero", price: 78000, trenItems: [{ key: "bieletas", label: "Bieletas", hasSide: true, selected: true, price: "38000", side: "ambos" }, { key: "alineado", label: "Alineado", selected: true, price: "18000" }] }, { type: "Pastillas de Freno", price: 42000, desc: "Ambos ejes", brakeEjes: { del: true, tra: true } }], payments: [{ method: "Cuenta Corriente", amount: 120000 }], assignedTo: "Fabricio", date: "2026-02-10", startedBy: "Fabricio", techNotes: [] },
  { id: 107, clientId: 7, domain: "AK 234 QR", status: "delivered", works: [{ type: "Service Full", price: 75000 }, { type: "Escobillas", price: 15000 }], payments: [{ method: "Transferencia", account: "1", amount: 90000, withIva: true, invoiceType: "A" }], assignedTo: "Fabricio", date: "2026-02-14", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 108, clientId: 8, domain: "AL 567 ST", status: "delivered", works: [{ type: "Service Full", price: 70000 }], payments: [{ method: "Tarjeta", amount: 70000, withIva: true, invoiceType: "B" }], assignedTo: "Fabricio", date: "2026-02-18", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 109, clientId: 9, domain: "AM 890 UV", status: "delivered", works: [{ type: "Service Full", price: 95000 }, { type: "Tren Delantero", price: 110000, trenItems: [{ key: "amortiguadores", label: "Amortiguadores", hasSide: true, selected: true, price: "62000", side: "ambos" }, { key: "rotulas", label: "Rótulas", hasSide: true, selected: true, price: "30000", side: "ambos" }] }], payments: [{ method: "Transferencia", account: "1", amount: 205000, withIva: true, invoiceType: "A" }], assignedTo: "Fabricio", date: "2026-02-22", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: ["Revisar tren trasero próximo service"] },
  { id: 110, clientId: 10, domain: "AP 222 YZ", status: "delivered", works: [{ type: "Mecánica", price: 45000, desc: "Cambio de bujías" }], payments: [{ method: "Efectivo", amount: 45000, withIva: false }], assignedTo: "Fabricio", date: "2026-02-25", startedBy: "Fabricio", techNotes: [] },
  { id: 111, clientId: 11, domain: "AQ 333 AB", status: "delivered", works: [{ type: "Service Full", price: 70000 }, { type: "Aditivo", price: 8000 }], payments: [{ method: "Transferencia", account: "2", amount: 78000 }], assignedTo: "Fabricio", date: "2026-02-28", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 112, clientId: 12, domain: "AR 444 CD", status: "delivered", works: [{ type: "Service Full", price: 80000 }, { type: "Tren Trasero", price: 55000, trenItems: [{ key: "amortiguadores_t", label: "Amortiguadores", hasSide: true, selected: true, price: "55000", side: "ambos" }] }], payments: [{ method: "Tarjeta", amount: 135000, withIva: true, invoiceType: "B" }], assignedTo: "Fabricio", date: "2026-03-01", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 119, clientId: 8, domain: "AL 567 ST", status: "delivered", works: [{ type: "Tren Delantero", price: 92000, trenItems: [{ key: "amortiguadores", label: "Amortiguadores", hasSide: true, selected: true, price: "62000", side: "ambos" }, { key: "alineado", label: "Alineado", selected: true, price: "18000" }] }], payments: [{ method: "Transferencia", account: "1", amount: 92000, withIva: true }], assignedTo: "Fabricio", date: "2026-03-02", startedBy: "Fabricio", techNotes: [] },
  { id: 120, clientId: 10, domain: "AP 222 YZ", status: "delivered", works: [{ type: "Service Full", price: 78000 }, { type: "Escape", price: 45000, escapeType: "original", trenItems: [{ key: "flexible", label: "Flexible", selected: true, price: "45000" }] }], payments: [{ method: "Efectivo", amount: 123000, withIva: true }], assignedTo: "Fabricio", date: "2026-03-03", startedBy: "Fabricio", serviceSheet: FULL_SS, techNotes: [] },
  { id: 121, clientId: 11, domain: "AQ 333 AB", status: "delivered", works: [{ type: "Mecánica", price: 55000, desc: "Kit de embrague" }], payments: [{ method: "Tarjeta", amount: 55000, withIva: true }], assignedTo: "Fabricio", date: "2026-03-04", startedBy: "Fabricio", techNotes: [] },
    { id: 113, clientId: 3, domain: "AE 360 ML", status: "done", works: [{ type: "Service Full", price: 95000 }, { type: "Escape", price: 98000, escapeType: "original", trenItems: [{ key: "catalizador_esc", label: "Catalizador", selected: true, price: "98000" }] }], payments: [{ method: "Cuenta Corriente", amount: 193000 }], assignedTo: "Fabricio", date: "2026-03-03", startedBy: "Fabricio", startedAt: "2026-03-03 10:00", serviceSheet: FULL_SS, techNotes: ["Catalizador original agotado, se colocó compatible"] },
  { id: 114, clientId: 9, domain: "AN 111 WX", status: "working", works: [{ type: "Service Full", price: 85000 }, { type: "Pastillas de Freno", price: 38000, desc: "Delanteras", brakeEjes: { del: true, tra: false } }], payments: [{ method: "Transferencia", account: "1", amount: 123000, withIva: true, invoiceType: "A" }], assignedTo: "Fabricio", date: "2026-03-04", startedBy: "Fabricio", startedAt: "2026-03-04 08:30", serviceSheet: {}, techNotes: [] },
  { id: 115, clientId: 1, domain: "AC 123 BD", status: "working", works: [{ type: "Mecánica", price: 35000, desc: "Cambio termostato" }], payments: [{ method: "Efectivo", amount: 35000 }], assignedTo: "Fabricio", date: "2026-03-05", startedBy: "Fabricio", startedAt: "2026-03-05 09:00", techNotes: [] },
  { id: 116, clientId: 2, domain: "AB 456 CD", status: "pending", works: [{ type: "Service Full", price: 80000 }, { type: "Tren Delantero", price: 95000, trenItems: [{ key: "amortiguadores", label: "Amortiguadores", hasSide: true, selected: true, price: "62000", side: "ambos" }, { key: "alineado", label: "Alineado", selected: true, price: "18000" }] }], payments: [{ method: "Transferencia", account: "1", amount: 175000, withIva: true, invoiceType: "A" }], date: "2026-03-05", techNotes: [] },
  { id: 117, clientId: 4, domain: "AD 012 HI", status: "pending", works: [{ type: "Service Base", price: 48000 }], payments: [{ method: "Efectivo", amount: 48000 }], date: "2026-03-05", techNotes: [] },
  { id: 118, clientId: 7, domain: "AK 234 QR", status: "pending", works: [{ type: "Repro", price: 25000, desc: "Reprogramación ECU" }], payments: [{ method: "Transferencia", account: "2", amount: 25000 }], date: "2026-03-05", techNotes: [] },
];

const INITIAL_CONFIG = { surcharge3: 15, surcharge6: 25, ivaRate: 21, authMessage: "Estimado/a {nombre}, le informamos desde CarBoys que su vehículo {dominio} ({vehiculo}) requiere el siguiente trabajo adicional:\n\n🔧 *{item}*\n\n💰 Precio sin IVA: ${precio}\n💰 Precio con IVA (21%): ${precioIVA}\n💰 *TOTAL: ${total}*\n\nQuedamos a disposición para cualquier consulta.\n\nSaludos cordiales,\n*CarBoys* — Servicio Integral del Automotor 🔧" };

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }
    @keyframes slideIn { from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);} }
    @keyframes scaleIn { from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);} }
    @keyframes shake { 0%,100%{transform:translateX(0);}25%{transform:translateX(-8px);}75%{transform:translateX(8px);} }
    input::placeholder, textarea::placeholder { color: ${T.gray}; }
    select { appearance: none; }
    
    /* === TEXT INPUT AUTO-SCROLL === */
    html { scroll-behavior: smooth; }
    input:focus, textarea:focus, select:focus {
      scroll-margin-top: 100px;
      scroll-margin-bottom: 300px;
    }
    @supports (-webkit-touch-callout: none) {
      body { height: -webkit-fill-available; }
    }
    
    /* === TABLET OPTIMIZATION (12" tablets) === */
    @media (min-width: 768px) and (max-width: 1400px) and (pointer: coarse) {
      /* Touch targets - min 44px for finger tapping */
      button, [role="button"], input[type="checkbox"], input[type="radio"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Larger text for readability */
      body { font-size: 16px; }
      input, select, textarea { 
        font-size: 16px !important; 
        padding: 14px 16px !important;
        min-height: 48px;
      }
      
      /* Better spacing between interactive elements */
      button {
        padding: 14px 24px !important;
        font-size: 15px !important;
      }
      
      /* Prevent iOS zoom on focus */
      input[type="text"], input[type="password"], input[type="number"], 
      input[type="email"], input[type="tel"], textarea, select {
        font-size: 16px !important;
      }
      
      /* Larger checkboxes and radio buttons */
      input[type="range"] {
        height: 8px !important;
        -webkit-appearance: none;
        appearance: none;
      }
      input[type="range"]::-webkit-slider-thumb {
        width: 28px !important;
        height: 28px !important;
        -webkit-appearance: none;
      }
      
      /* Scrollbar for touch */
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-thumb { border-radius: 4px; }
    }
    
    /* Tablet landscape specific */
    @media (min-width: 1024px) and (max-width: 1400px) and (pointer: coarse) {
      /* Two-column layouts get more breathing room */
      .tablet-grid { gap: 16px !important; }
    }
    
    /* Print styles */
    @media print {
      body { background: white !important; }
      .no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  `}</style>
);

const card = { background: T.bg2, borderRadius: 14, border: `1px solid ${T.border}` };
const inputStyle = {
  width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10,
  padding: "12px 14px", color: T.white, fontSize: 14, outline: "none", fontFamily: font,
};
const selectStyle = { ...inputStyle, cursor: "pointer", paddingRight: 32 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: T.grayLight, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" };
const btnPrimary = (c = T.accent) => ({
  background: c, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px",
  fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font, transition: "all .15s",
});

const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtD = (d) => d ? d.replace(/\s/g, "") : "";


// ── NUMPAD COMPONENT ──
const NumPadContext = React.createContext();
const NumPadProvider = ({ children }) => {
  const [numPadState, setNumPadState] = useState({ open: false, value: "", label: "", onConfirm: null, allowDot: false });
  const openNumPad = (label, currentValue, onConfirm, allowDot = false) => {
    setNumPadState({ open: true, value: String(currentValue || ""), label, onConfirm, allowDot });
  };
  const closeNumPad = () => setNumPadState({ open: false, value: "", label: "", onConfirm: null, allowDot: false });
  const addDigit = (d) => setNumPadState(prev => ({ ...prev, value: prev.value + d }));
  const delDigit = () => setNumPadState(prev => ({ ...prev, value: prev.value.slice(0, -1) }));
  const confirm = () => {
    if (numPadState.onConfirm) numPadState.onConfirm(numPadState.value);
    closeNumPad();
  };
  return (
    <NumPadContext.Provider value={{ openNumPad }}>
      {children}
      {numPadState.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }} onClick={closeNumPad}>
          <div style={{ background: T.bg2, borderRadius: "20px 20px 0 0", padding: "20px 24px 24px", width: "100%", maxWidth: 440, border: `1px solid ${T.border}`, borderBottom: "none" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: T.gray }}>{numPadState.label}</span>
              <span style={{ fontSize: 13, color: T.grayLight, cursor: "pointer" }} onClick={closeNumPad}>✕ Cerrar</span>
            </div>
            <div style={{ background: T.bg, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", border: `2px solid ${T.accent}` }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.accent, marginRight: 6 }}>$</span>
              <span style={{ fontSize: 28, fontWeight: 800, fontFamily: fontD, color: T.text, flex: 1 }}>{numPadState.value ? Number(numPadState.value).toLocaleString("es-AR") : "0"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[1,2,3,4,5,6,7,8,9, numPadState.allowDot ? "." : "", 0, "del"].map((d, i) => {
                if (d === "") return <div key={i} />;
                if (d === "del") return (
                  <div key={i} onClick={delDigit} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 12, background: T.bg3, cursor: "pointer", fontSize: 20, color: T.gray, border: `1px solid ${T.border}` }}>⌫</div>
                );
                return (
                  <div key={i} onClick={() => addDigit(String(d))} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 12, background: T.bg, cursor: "pointer", fontSize: 22, fontWeight: 700, fontFamily: fontD, border: `1px solid ${T.border}`, color: T.text }}>{d}</div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setNumPadState(prev => ({ ...prev, value: "" }))} style={{ flex: 1, padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 14, border: `1px solid ${T.border}`, background: T.bg3, color: T.gray, cursor: "pointer", fontFamily: font }}>Borrar</button>
              <button onClick={confirm} style={{ flex: 2, padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", background: T.accent, color: "#fff", cursor: "pointer", fontFamily: font }}>✓ Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </NumPadContext.Provider>
  );
};
const useNumPad = () => React.useContext(NumPadContext);

// Helper component: clickable numeric field that opens numpad
const NumField = ({ value, onChange, placeholder, label, prefix, style: st, allowDot }) => {
  const { openNumPad } = useNumPad();
  const display = value ? (prefix === "$" ? Number(value).toLocaleString("es-AR") : value) : "";
  return (
    <div onClick={() => openNumPad(label || placeholder || "Número", value, (v) => onChange(v), allowDot)} 
      style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", minHeight: 44, userSelect: "none", ...st }}>
      {prefix && <span style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>{prefix}</span>}
      <span style={{ flex: 1, fontWeight: 700, fontFamily: fontD, fontSize: 15, color: display ? T.text : T.gray }}>{display || placeholder || "0"}</span>
      <span style={{ fontSize: 11, color: T.gray }}>⌨</span>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const tapPin = (d) => {
    if (pin.length >= 4) return;
    const np = pin + d;
    setPin(np);
    setErr(false);
    if (np.length === 4) {
      if (sel && np === sel.pin) setTimeout(() => onLogin(sel), 250);
      else { setErr(true); setShake(true); setTimeout(() => { setPin(""); setShake(false); }, 600); }
    }
  };

  return (
    <div style={{ background: `radial-gradient(ellipse at 30% 20%, #0d1f3c 0%, ${T.bg} 70%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, color: T.white, padding: 20 }}>
      <div style={{ marginBottom: 8, animation: "fadeUp .5s ease" }}>
        <span style={{ fontFamily: fontD, fontSize: 52, fontWeight: 700, letterSpacing: 2 }}>
          <span style={{ color: "#c8d6e5" }}>Car</span><span style={{ color: T.red }}>Boys</span>
        </span>
      </div>
      <div style={{ fontSize: 13, color: T.gray, letterSpacing: 3, textTransform: "uppercase", marginBottom: 40, animation: "fadeUp .5s ease .1s both" }}>Servicio Integral</div>

      {!sel ? (
        <div style={{ animation: "fadeUp .4s ease .2s both" }}>
          <div style={{ fontSize: 15, color: T.grayLight, marginBottom: 20, textAlign: "center", fontWeight: 500 }}>¿Quién sos?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 340 }}>
            {USERS.map((u, i) => (
              <div key={u.id} onClick={() => setSel(u)} style={{ ...card, padding: "20px 16px", cursor: "pointer", textAlign: "center", animation: `fadeUp .4s ease ${.15*i}s both`, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = u.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 30, margin: "0 auto 12px", fontFamily: fontD }}>{u.initial}</div>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: T.gray, textTransform: "capitalize", marginTop: 2 }}>{u.role}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", animation: "scaleIn .3s ease" }}>
          <div onClick={() => { setSel(null); setPin(""); setErr(false); }} style={{ cursor: "pointer", marginBottom: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: sel.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 36, margin: "0 auto 12px", fontFamily: fontD }}>{sel.initial}</div>
            <div style={{ fontWeight: 700, fontSize: 24 }}>{sel.name}</div>
            <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>Tocá para cambiar</div>
          </div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24, animation: shake ? "shake .4s ease" : "none" }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: i < pin.length ? (err ? T.red : sel.color) : "transparent", border: `2px solid ${err ? T.red : (i < pin.length ? sel.color : T.border)}`, transition: "all .15s" }} />
            ))}
          </div>
          {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>PIN incorrecto</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, maxWidth: 320, margin: "0 auto" }}>
            {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((n,i) => n === null ? <div key={i}/> : (
              <div key={i} onClick={() => n === "⌫" ? (setPin(pin.slice(0,-1)), setErr(false)) : tapPin(String(n))}
                style={{ ...card, padding: 16, cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 22, fontFamily: fontD, userSelect: "none", transition: "background .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.bg3; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.bg2; }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchSelect = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{ ...inputStyle, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderColor: open ? T.accent : T.border }}>
        <span style={{ color: value ? T.white : T.gray }}>{value || placeholder}</span>
        <span style={{ fontSize: 10, color: T.gray }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: T.bg2, border: `1px solid ${T.accent}`, borderRadius: 10, zIndex: 50, maxHeight: 220, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            style={{ ...inputStyle, borderRadius: 0, border: "none", borderBottom: `1px solid ${T.border}`, fontSize: 13 }} autoFocus />
          <div style={{ overflow: "auto", flex: 1 }}>
            {filtered.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false); setSearch(""); }}
                style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: o === value ? T.accent : T.white, fontWeight: o === value ? 700 : 400, transition: "background .1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.bg3; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                {o}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 14, color: T.gray, fontSize: 13 }}>Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const NewOrderScreen = (props) => {
  const { clients, setClients, orders, setOrders, config, vehicleDB, setVehicleDB, onNavigate } = props;
  const [step, setStep] = useState(1); // 1=domain, 2=client, 3=works, 4=payment, 5=confirm
  const [budgetMode, setBudgetMode] = useState(false);
  const [showAccessoryPopup, setShowAccessoryPopup] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetNote, setBudgetNote] = useState("");
  const [searchMode, setSearchMode] = useState("domain"); // "domain" or "dni"
  const [domainSearch, setDomainSearch] = useState("");
  const [dniSearch, setDniSearch] = useState("");
  const [unlinkVehicle, setUnlinkVehicle] = useState(null);
  const [dniFoundClient, setDniFoundClient] = useState(null);
  const [addingNewVehicle, setAddingNewVehicle] = useState(false);
  const [foundClient, setFoundClient] = useState(null);
  const [foundVehicle, setFoundVehicle] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({ name: "", lastName: "", dni: "", cuit: "", phone: "", brand: "", model: "", year: "", km: "", currentKm: "", lastKm: "", domain: "" });
  const [manualModel, setManualModel] = useState(false);
  const [manualBrand, setManualBrand] = useState(false);

  const [works, setWorks] = useState([]);

  const [payments, setPayments] = useState([{ method: "", amount: "", account: "", installments: 3 }]);
  const [showBrakePopup, setShowBrakePopup] = useState(false);
  const [brakeEjes, setBrakeEjes] = useState({ del: false, tra: false, delPrice: "", traPrice: "" });
  const [showEscapePopup, setShowEscapePopup] = useState(false);
  const [showKmPopup, setShowKmPopup] = useState(false);
  const [showTrenPopup, setShowTrenPopup] = useState(false);
  const searchDomain = () => {
    const d = domainSearch.toUpperCase().trim();
    if (!d) return;
    for (const c of clients) {
      const v = c.vehicles.find(v => v.domain.replace(/\s/g, "") === d.replace(/\s/g, ""));
      if (v) {
        setFoundClient(c);
        setFoundVehicle(v);
        setForm({ name: c.name, lastName: c.lastName, dni: c.dni || "", cuit: c.cuit || "", phone: c.phone || "", brand: v.brand, model: v.model, year: String(v.year), km: "", lastKm: String(v.km), domain: v.domain });
        setStep(2);
        return;
      }
    }
    setFoundClient(null);
    setFoundVehicle(null);
    setIsNew(true);
    setForm(f => ({ ...f, domain: d }));
    setStep(2);
  };

  const searchDni = () => {
    const d = dniSearch.trim();
    if (!d) return;
    const found = clients.find(c => c.dni === d || c.cuit === d);
    setDniFoundClient(found || null);
  };

  const selectVehicleFromDni = (client, vehicle) => {
    setFoundClient(client);
    setFoundVehicle(vehicle);
    setForm({ name: client.name, lastName: client.lastName, dni: client.dni || "", cuit: client.cuit || "", phone: client.phone || "", brand: vehicle.brand, model: vehicle.model, year: String(vehicle.year), km: "", lastKm: String(vehicle.km), domain: vehicle.domain });
    setStep(2);
  };

  const startAddNewVehicle = (client) => {
    setFoundClient(client);
    setAddingNewVehicle(true);
    setIsNew(false);
    setForm({ name: client.name, lastName: client.lastName, dni: client.dni || "", cuit: client.cuit || "", phone: client.phone || "", brand: "", model: "", year: "", km: "", domain: "" });
    setStep(2);
  };

  const clientFormValid = form.name && form.lastName && (form.dni || form.cuit) && form.phone && form.brand && form.model && form.year && (form.km || form.currentKm) && form.domain;

  const [kmError, setKmError] = useState("");

  const saveClient = () => {
    if (!clientFormValid) return;
    if (foundVehicle && !isNew && !form.currentKm) {
      setShowKmPopup(true);
      return;
    }
    const finalKm = parseInt(form.currentKm || form.km);
    const lastKm = parseInt(form.lastKm) || 0;
    if (foundVehicle && !isNew && finalKm < lastKm) {
      setKmError(`El kilometraje no puede ser menor al último registro (${lastKm.toLocaleString("es-AR")} km)`);
      return;
    }
    setKmError("");
    const capBrand = form.brand.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    const capModel = form.model.trim().split(" ").map(w => /^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    if (setVehicleDB && capBrand) {
      setVehicleDB(prev => {
        const db = { ...prev };
        if (!db[capBrand]) db[capBrand] = [];
        if (capModel && !db[capBrand].includes(capModel)) {
          db[capBrand] = [...db[capBrand], capModel].sort();
        }
        return db;
      });
    }
    form.brand = capBrand;
    form.model = capModel;
    if (isNew) {
      const newClient = {
        id: Date.now(),
        name: form.name,
        lastName: form.lastName,
        dni: form.dni,
        cuit: form.cuit,
        phone: form.phone,
        vehicles: [{ domain: form.domain, brand: form.brand, model: form.model, year: parseInt(form.year), km: finalKm }]
      };
      setClients(prev => [...prev, newClient]);
      setFoundClient(newClient);
      setFoundVehicle(newClient.vehicles[0]);
    } else if (addingNewVehicle) {
      const newVehicle = { domain: form.domain, brand: form.brand, model: form.model, year: parseInt(form.year), km: finalKm };
      setClients(prev => prev.map(c => c.id === foundClient.id ? { ...c, phone: form.phone || c.phone, vehicles: [...c.vehicles, newVehicle] } : c));
      setFoundVehicle(newVehicle);
      setAddingNewVehicle(false);
    } else if (editMode) {
      setClients(prev => prev.map(c => c.id === foundClient.id ? {
        ...c, name: form.name, lastName: form.lastName, dni: form.dni, cuit: form.cuit, phone: form.phone,
        vehicles: c.vehicles.map(v => v.domain === foundVehicle.domain ? { ...v, brand: form.brand, model: form.model, year: parseInt(form.year), km: finalKm } : v)
      } : c));
      setEditMode(false);
    } else {
      setClients(prev => prev.map(c => c.id === foundClient.id ? {
        ...c,
        vehicles: c.vehicles.map(v => v.domain === foundVehicle.domain ? { ...v, km: finalKm } : v)
      } : c));
    }
    setStep(3);
  };

  const addWork = () => setWorks(w => [...w, { type: "", price: "", desc: "" }]);
  const updateWork = (i, field, val) => setWorks(w => w.map((x, j) => j === i ? { ...x, [field]: val } : x));
  const removeWork = (i) => setWorks(w => w.filter((_, j) => j !== i));
  const worksValid = works.length > 0 && works.every(w => {
    if (w.trenItems) {
      const hasSelected = w.trenItems.some(ti => ti.isCustom ? ti.label : ti.selected);
      const missingPrice = w.trenItems.some(ti => (ti.isCustom ? (ti.label && !ti.price) : (ti.selected && !ti.price)));
      return hasSelected && !missingPrice && parseFloat(w.price) > 0;
    }
    return w.type && w.price && parseFloat(w.price) > 0;
  });

  const totalWorks = works.reduce((s, w) => s + (parseFloat(w.price) || 0), 0);
  const addPayment = () => setPayments(p => [...p, { method: "", amount: "", account: "", installments: 3 }]);
  const updatePayment = (i, field, val) => setPayments(p => p.map((x, j) => j === i ? { ...x, [field]: val } : x));
  const removePayment = (i) => setPayments(p => p.filter((_, j) => j !== i));
  const totalPayments = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const paymentsValid = payments.length > 0 && payments.every(p => p.method && p.amount && parseFloat(p.amount) > 0) && Math.abs(totalPayments - totalWorks) < 1;

  const getInvoiceType = (p) => {
    return p.invoiceType || (p.account === "2" ? "C" : form.cuit ? "A" : "B");
  };

  const confirmOrder = () => {
    const newOrder = {
      id: Date.now(),
      clientId: foundClient?.id || Date.now(),
      domain: form.domain,
      status: "pending",
      works: works.map(w => ({ ...w, price: parseFloat(w.price) || 0 })),
      payments: payments.map(p => ({ ...p, amount: parseFloat(p.amount) || 0 })),
      assignedTo: "",
      date: new Date().toISOString().split("T")[0],
      invoiceType: getInvoiceType(payments[0]),
      startedBy: "",
      startedAt: "",
    };
    setOrders(prev => [...prev, newOrder]);
    setStep(5);
  };

  const clientHistory = foundClient ? orders.filter(o => o.clientId === foundClient.id) : [];

  const brands = Object.keys(vehicleDB || VEHICLE_DB).sort();
  const models = form.brand ? ((vehicleDB || VEHICLE_DB)[form.brand] || []) : [];

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {["Dominio", "Cliente", "Trabajos", "Pago", "Listo"].map((s, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step > i ? T.accent : T.border, transition: "background .3s" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: T.gray, marginBottom: 20, fontWeight: 600 }}>
        PASO {step} DE 5 — {["Buscar Vehículo", "Datos del Cliente", "Trabajos", "Método de Pago", "Orden Confirmada"][step - 1]}
      </div>

      {/* ─── STEP 1: DOMAIN / DNI ─── */}
      {step === 1 && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700, marginBottom: 20 }}>🔍 Buscar Vehículo / Cliente</div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
            {[{ k: "domain", icon: "🚗", label: "Por Dominio" }, { k: "dni", icon: "👤", label: "Por DNI/CUIT" }].map(t => (
              <div key={t.k} onClick={() => { setSearchMode(t.k); setDniFoundClient(null); }}
                style={{ flex: 1, padding: "14px 0", textAlign: "center", cursor: "pointer", fontWeight: 700, fontSize: 14, background: searchMode === t.k ? T.accent : T.bg2, color: searchMode === t.k ? "#fff" : T.gray, transition: "all .2s" }}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>

          {/* Domain search */}
          {searchMode === "domain" && (
            <div style={{ display: "flex", gap: 10 }}>
              <input value={domainSearch} onChange={e => setDomainSearch(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && searchDomain()}
                placeholder="Ej: AC 123 BD" style={{ ...inputStyle, flex: 1, fontSize: 18, fontFamily: fontD, letterSpacing: 1, padding: "16px 20px" }} autoFocus />
              <button onClick={searchDomain} style={btnPrimary()}>Buscar</button>
            </div>
          )}

          {/* DNI search */}
          {searchMode === "dni" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input inputMode="numeric" value={dniSearch} onChange={e => setDniSearch(e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={e => e.key === "Enter" && searchDni()}
                  placeholder="Ingrese DNI o CUIT sin guiones" style={{ ...inputStyle, flex: 1, fontSize: 18, fontFamily: fontD, letterSpacing: 1, padding: "16px 20px" }} autoFocus />
                <button onClick={searchDni} style={btnPrimary()}>Buscar</button>
              </div>

              {/* DNI results */}
              {dniSearch.length > 3 && !dniFoundClient && (
                <div style={{ textAlign: "center", padding: 30 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🔎</div>
                  <div style={{ color: T.gray, fontSize: 14, marginBottom: 14 }}>No se encontró cliente con ese DNI/CUIT</div>
                  <button onClick={() => { setIsNew(true); const v = dniSearch; setForm(f => ({ ...f, dni: v.length <= 8 ? v : "", cuit: v.length > 8 ? v : "" })); setStep(2); }} style={btnPrimary()}>+ Crear Nuevo Cliente</button>
                </div>
              )}

              {dniFoundClient && (
                <div style={{ ...card, padding: 20, animation: "fadeUp .2s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{dniFoundClient.name} {dniFoundClient.lastName}</div>
                      <div style={{ fontSize: 12, color: T.gray }}>DNI/CUIT: {dniFoundClient.dni}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: .5 }}>Vehículos registrados</div>

                  {dniFoundClient.vehicles.map((v, i) => {
                    const activeOrder = orders.find(o => o.domain === v.domain && (o.status === "pending" || o.status === "working" || o.status === "done" || o.status === "inspection" || o.status === "budget_sent" || o.status === "budget_approved"));
                    return (
                      <div key={i} onClick={() => !activeOrder && selectVehicleFromDni(dniFoundClient, v)}
                        style={{ ...card, padding: 14, marginBottom: 8, cursor: activeOrder ? "not-allowed" : "pointer", borderColor: activeOrder ? T.orange : T.border, opacity: activeOrder ? 0.6 : 1, transition: "all .15s" }}
                        onMouseEnter={e => { if (!activeOrder) e.currentTarget.style.borderColor = T.accent; }}
                        onMouseLeave={e => { if (!activeOrder) e.currentTarget.style.borderColor = T.border; }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 22 }}>🚗</span>
                            <div>
                              <div style={{ fontFamily: fontD, fontWeight: 700, fontSize: 16, letterSpacing: .5 }}>{fmtD(v.domain)}</div>
                              <div style={{ fontSize: 12, color: T.gray }}>{v.brand} {v.model} {v.year} — {v.km.toLocaleString()} km</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {activeOrder ? (
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: `${T.orange}20`, padding: "4px 10px", borderRadius: 6 }}>EN TALLER</span>
                            ) : (
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: `${T.accent}20`, padding: "4px 10px", borderRadius: 6 }}>SELECCIONAR</span>
                            )}
                            {!activeOrder && (
                              <div onClick={e => { e.stopPropagation(); setUnlinkVehicle({ client: dniFoundClient, vehicle: v }); }}
                                style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.red}40`, background: "rgba(229,57,53,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(229,57,53,0.2)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(229,57,53,0.08)"; }}>
                                <span style={{ color: T.red, fontSize: 12, fontWeight: 800 }}>✕</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div onClick={() => startAddNewVehicle(dniFoundClient)}
                    style={{ ...card, padding: 14, marginTop: 4, cursor: "pointer", borderColor: T.green, borderStyle: "dashed", textAlign: "center", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.green}10`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.bg2; }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>➕</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.green }}>Agregar Vehículo Nuevo</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2: CLIENT DATA ─── */}
      {step === 2 && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700 }}>
              {isNew ? "👤 Nuevo Cliente" : addingNewVehicle ? "🚗 Nuevo Vehículo" : "👤 Datos del Cliente"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {foundClient && !editMode && (
                <button onClick={() => setEditMode(true)} style={{ ...btnPrimary(T.orange), padding: "8px 16px", fontSize: 12 }}>✏️ Editar</button>
              )}
              {foundClient && clientHistory.length > 0 && (
                <button onClick={() => {}} style={{ ...btnPrimary(T.bg3), padding: "8px 16px", fontSize: 12, border: `1px solid ${T.border}` }}>📋 Historial ({clientHistory.length})</button>
              )}
            </div>
          </div>

          {/* Show history if exists */}
          {foundClient && clientHistory.length > 0 && (
            <div style={{ ...card, padding: 16, marginBottom: 20, borderLeft: `3px solid ${T.accent}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 10, textTransform: "uppercase" }}>📋 Historial de visitas</div>
              {clientHistory.map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < clientHistory.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                  <div>
                    <span style={{ color: T.grayLight }}>{h.date}</span>
                    <span style={{ marginLeft: 10 }}>{h.works.map(w => w.type).join(", ")}</span>
                  </div>
                  <span style={{ color: T.accent, fontWeight: 700 }}>{fmt(h.works.reduce((s, w) => s + w.price, 0))}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={foundClient && !editMode && !isNew} style={{ ...inputStyle, opacity: foundClient && !editMode && !isNew ? 0.6 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                disabled={foundClient && !editMode && !isNew} style={{ ...inputStyle, opacity: foundClient && !editMode && !isNew ? 0.6 : 1 }} />
            </div>
            <div>
              <label style={labelStyle}>DNI {!form.cuit ? "*" : ""}</label>
              <input inputMode="numeric" value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value.replace(/[^0-9]/g, "") }))}
                disabled={foundClient && !editMode && !isNew} placeholder="Sin puntos"
                style={{ ...inputStyle, opacity: foundClient && !editMode && !isNew ? 0.6 : 1, borderColor: !form.dni && !form.cuit ? T.orange : T.border }} />
            </div>
            <div>
              <label style={labelStyle}>CUIT {!form.dni ? "*" : ""}</label>
              <input inputMode="numeric" value={form.cuit} onChange={e => setForm(f => ({ ...f, cuit: e.target.value.replace(/[^0-9]/g, "") }))}
                disabled={foundClient && !editMode && !isNew} placeholder="Sin guiones"
                style={{ ...inputStyle, opacity: foundClient && !editMode && !isNew ? 0.6 : 1, borderColor: !form.dni && !form.cuit ? T.orange : T.border }} />
              {!form.dni && !form.cuit && (
                <div style={{ fontSize: 11, color: T.orange, marginTop: 4, fontWeight: 600, gridColumn: "1 / -1" }}>⚠️ Ingresá al menos DNI o CUIT</div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Celular *</label>
              <input inputMode="numeric" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "") }))}
                disabled={foundClient && !editMode && !isNew} placeholder="Ej: 3515201053"
                style={{ ...inputStyle, opacity: foundClient && !editMode && !isNew ? 0.6 : 1 }} />
            </div>
          </div>

          <div style={{ height: 1, background: T.border, margin: "20px 0" }} />
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.grayLight }}>🚗 VEHÍCULO</div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Dominio *</label>
            <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value.toUpperCase() }))}
              disabled={!isNew && !addingNewVehicle} style={{ ...inputStyle, fontFamily: fontD, fontSize: 18, letterSpacing: 1, opacity: !isNew && !addingNewVehicle ? 0.6 : 1 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Marca *</label>
              {!manualBrand ? (
                <div>
                  <SearchSelect options={brands} value={form.brand}
                    onChange={v => { setForm(f => ({ ...f, brand: v, model: "" })); setManualModel(false); }}
                    placeholder="Seleccionar marca" />
                  <div onClick={() => { setManualBrand(true); setForm(f => ({ ...f, brand: "", model: "" })); setManualModel(true); }} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                    ¿No está? Escribir manualmente
                  </div>
                </div>
              ) : (
                <div>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                    placeholder="Escribir marca" style={inputStyle} />
                  <div onClick={() => { setManualBrand(false); setForm(f => ({ ...f, brand: "", model: "" })); setManualModel(false); }} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                    ← Volver al selector
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Modelo *</label>
              {!manualModel ? (
                <div>
                  <SearchSelect options={models} value={form.model}
                    onChange={v => setForm(f => ({ ...f, model: v }))}
                    placeholder={form.brand ? "Seleccionar modelo" : "Primero elegí marca"} />
                  <div onClick={() => setManualModel(true)} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                    ¿No está? Escribir manualmente
                  </div>
                </div>
              ) : (
                <div>
                  <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    placeholder="Escribir modelo" style={inputStyle} />
                  <div onClick={() => setManualModel(false)} style={{ fontSize: 11, color: T.accent, cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                    ← Volver al selector
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Año *</label>
              <SearchSelect options={YEARS.map(String)} value={form.year}
                onChange={v => setForm(f => ({ ...f, year: v }))}
                placeholder="Año" />
            </div>
            {foundVehicle && !isNew ? (
              <div>
                <label style={labelStyle}>Kilómetros (última visita)</label>
                <input value={form.lastKm ? Number(form.lastKm).toLocaleString("es-AR") + " km" : "—"} disabled
                  style={{ ...inputStyle, opacity: 0.6, fontFamily: fontD, fontWeight: 700 }} />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Kilómetros *</label>
                <input inputMode="numeric" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value.replace(/[^0-9]/g, "") }))}
                  placeholder="Ej: 45000" style={inputStyle} />
              </div>
            )}
          </div>

          {/* Current KM - prominent row - only for existing vehicles */}
          {foundVehicle && !isNew && (
            <div style={{ ...card, padding: "16px 20px", marginTop: 16, borderColor: kmError ? T.red : (form.currentKm && !kmError) ? T.green : T.orange, background: kmError ? "rgba(229,57,53,0.06)" : (form.currentKm && !kmError) ? "rgba(67,160,71,0.06)" : "rgba(255,152,0,0.06)", borderWidth: 2, transition: "all .2s" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: kmError ? T.red : (form.currentKm && !kmError) ? T.green : T.orange, letterSpacing: .5 }}>KILÓMETROS ACTUALES *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input value={form.currentKm ? Number(form.currentKm).toLocaleString("es-AR") : ""} onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setForm(f => ({ ...f, currentKm: val }));
                    if (val && parseInt(val) < (parseInt(form.lastKm) || 0)) {
                      setKmError(`No puede ser menor a ${Number(form.lastKm).toLocaleString("es-AR")} km`);
                    } else {
                      setKmError("");
                    }
                  }}
                    placeholder="—"
                    style={{ ...inputStyle, fontSize: 22, fontWeight: 700, fontFamily: fontD, borderColor: "transparent", background: "transparent", padding: "4px 0", flex: 1 }} />
                  <span style={{ fontSize: 13, color: T.gray, fontWeight: 600 }}>km</span>
                </div>
                {kmError && <div style={{ fontSize: 11, color: T.red, fontWeight: 600, marginTop: 2 }}>⚠️ {kmError}</div>}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button onClick={() => { setStep(1); setIsNew(false); setFoundClient(null); setEditMode(false); }}
              style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>← Volver</button>
            <button onClick={saveClient} disabled={!clientFormValid}
              style={{ ...btnPrimary(), opacity: clientFormValid ? 1 : 0.4 }}>
              {editMode ? "Guardar cambios →" : "Continuar →"}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: WORKS ─── */}
      {step === 3 && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700 }}>{budgetMode ? "🔍 Presupuesto" : "🔧 Agregar Trabajos"}</div>
            <div onClick={() => { setBudgetMode(!budgetMode); if (!budgetMode) { setWorks([]); } else { setBudgetCategory(""); setBudgetNote(""); } }}
              style={{ ...card, padding: "8px 14px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: budgetMode ? T.orange : "#9C27B0", borderColor: budgetMode ? T.orange : "#9C27B0", background: budgetMode ? "rgba(255,152,0,0.08)" : "rgba(156,39,176,0.08)" }}>
              {budgetMode ? "🔧 Cambiar a Trabajo" : "🔍 Presupuesto"}
            </div>
          </div>
          <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>{fmtD(form.domain)} — {form.brand} {form.model} {form.year}</div>

          {budgetMode ? (
            <div>
              <div style={{ ...card, padding: 16, marginBottom: 16, borderLeft: "3px solid #9C27B0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#9C27B0", marginBottom: 8 }}>El vehículo entra a inspección. Seleccioná el motivo:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { name: "Tren Delantero", icon: "⚙️" },
                    { name: "Tren Trasero", icon: "⚙️" },
                    { name: "Mecánica", icon: "🔩" },
                    { name: "Escape", icon: "💨" },
                    { name: "Arreglo", icon: "🪛" },
                    { name: "Otros", icon: "📝" },
                  ].map(cat => (
                    <div key={cat.name} onClick={() => setBudgetCategory(budgetCategory === cat.name ? "" : cat.name)}
                      style={{ ...card, padding: "14px 8px", cursor: "pointer", textAlign: "center", borderColor: budgetCategory === cat.name ? "#9C27B0" : T.border, background: budgetCategory === cat.name ? "rgba(156,39,176,0.1)" : T.bg2, transition: "all .2s" }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>{cat.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: budgetCategory === cat.name ? "#9C27B0" : T.text }}>{cat.name}</div>
                      {budgetCategory === cat.name && <div style={{ fontSize: 9, color: "#9C27B0", marginTop: 3, fontWeight: 700 }}>✓ SELECCIONADO</div>}
                    </div>
                  ))}
                </div>
                <label style={labelStyle}>Nota / Queja del cliente (opcional)</label>
                <textarea value={budgetNote} onChange={e => setBudgetNote(e.target.value)}
                  placeholder="Ej: Hace ruido en la dirección al girar..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: font }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => { setStep(2); setBudgetMode(false); }}
                  style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>← Volver</button>
                <button onClick={() => {
                  const newOrder = {
                    id: Date.now(),
                    clientId: foundClient?.id || Date.now(),
                    domain: form.domain,
                    status: "inspection",
                    budgetCategory,
                    budgetNote,
                    works: [],
                    payments: [],
                    assignedTo: "",
                    date: new Date().toISOString().split("T")[0],
                    startedBy: "",
                    startedAt: "",
                  };
                  setOrders(prev => [...prev, newOrder]);
                  setBudgetMode(false);
                  setBudgetCategory("");
                  setBudgetNote("");
                  setStep(5);
                }} disabled={!budgetCategory}
                  style={{ ...btnPrimary("#9C27B0"), opacity: budgetCategory ? 1 : 0.4, fontSize: 14 }}>
                  🔍 Crear Orden de Inspección
                </button>
              </div>
            </div>
          ) : (
            <div>

          {/* Visual Work Type Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, fontSize: 13, marginBottom: 10 }}>SELECCIONÁ EL TIPO DE TRABAJO</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {WORK_TYPES.map((wt, idx) => {
                if (wt.isGroup) {
                  const anySubAdded = wt.subItems.some(s => works.some(w => w.type === s.name));
                  const allSubAdded = wt.subItems.every(s => works.some(w => w.type === s.name));
                  return (
                    <div key={idx}
                      onClick={() => { if (!allSubAdded) setShowAccessoryPopup(true); }}
                      style={{
                        ...card, padding: "16px 8px", cursor: allSubAdded ? "default" : "pointer", textAlign: "center",
                        borderColor: anySubAdded ? T.accent : T.border,
                        background: anySubAdded ? "rgba(30,136,229,0.12)" : T.bg2,
                        opacity: allSubAdded ? 0.6 : 1,
                        transition: "all .2s",
                      }}
                      onMouseEnter={e => { if (!allSubAdded) { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                      onMouseLeave={e => { if (!allSubAdded) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; } }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 6 }}>{wt.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{wt.name}</div>
                      {anySubAdded && <div style={{ fontSize: 9, color: T.accent, marginTop: 4, fontWeight: 600 }}>{works.filter(w => wt.subItems.some(s => s.name === w.type)).length}x</div>}
                    </div>
                  );
                }
                const isAdded = works.some(w => w.type === wt.name);
                return (
                  <div key={idx}
                    onClick={() => { if (!isAdded) { if (wt.name === "Pastillas de Freno") { setShowBrakePopup(true); setBrakeEjes({ del: false, tra: false, delPrice: "", traPrice: "" }); } else if (wt.name === "Escape") { setShowEscapePopup(true); } else if (BUDGET_CATEGORIES[wt.name] || FREE_CATEGORIES.includes(wt.name)) { setWorks(w => [...w, { type: wt.name, price: 0, desc: "", trenItems: buildTrenItems(wt.name) }]); } else { setWorks(w => [...w, { type: wt.name, price: "", desc: "" }]); } } }}
                    style={{
                      ...card, padding: "16px 8px", cursor: isAdded ? "default" : "pointer", textAlign: "center",
                      borderColor: isAdded ? T.accent : T.border,
                      background: isAdded ? "rgba(30,136,229,0.12)" : T.bg2,
                      opacity: isAdded ? 0.6 : 1,
                      transition: "all .2s",
                    }}
                    onMouseEnter={e => { if (!isAdded) { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                    onMouseLeave={e => { if (!isAdded) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; } }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{wt.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>{wt.name}</div>
                    {isAdded && <div style={{ fontSize: 9, color: T.accent, marginTop: 4, fontWeight: 600 }}>✓ AGREGADO</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accessory sub-items popup */}
          {showAccessoryPopup && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowAccessoryPopup(false)}>
              <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🧰</div>
                <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Accesorios</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {WORK_TYPES.find(t => t.isGroup)?.subItems.map((sub, idx) => {
                    const isAdded = works.some(w => w.type === sub.name);
                    return (
                      <div key={idx} onClick={() => {
                        if (!isAdded) {
                          setWorks(w => [...w, SIMPLE_WORK_TYPES.includes(sub.name) ? { type: sub.name, price: "", desc: "" } : { type: sub.name, price: 0, desc: "", trenItems: buildTrenItems(sub.name) }]);
                          setShowAccessoryPopup(false);
                        }
                      }} style={{
                        ...card, padding: 16, cursor: isAdded ? "default" : "pointer", textAlign: "center",
                        borderColor: isAdded ? T.accent : T.border,
                        background: isAdded ? "rgba(30,136,229,0.12)" : T.bg2,
                        opacity: isAdded ? 0.6 : 1, transition: "all .2s",
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 6 }}>{sub.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{sub.name}</div>
                        {isAdded && <div style={{ fontSize: 9, color: T.accent, marginTop: 4, fontWeight: 600 }}>✓ AGREGADO</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Added works detail */}
          {works.map((w, i) => {
            const wt = findWorkType(w.type);
            const price = parseFloat(w.price) || 0;
            const total3 = price * (1 + config.surcharge3 / 100);
            const total6 = price * (1 + config.surcharge6 / 100);
            return (
              <div key={i} style={{ ...card, padding: 16, marginBottom: 12, borderLeft: `3px solid ${T.accent}`, animation: `fadeUp .3s ease ${i * .05}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{wt?.icon || "🔧"}</span>
                    <span style={{ fontWeight: 700, fontSize: 16, fontFamily: fontD, letterSpacing: .5 }}>{w.type}{w.escapeType ? (w.escapeType === "deportivo" ? " — Deportivo 🏎️" : " — Original") : ""}</span>
                  </div>
                  <span onClick={() => removeWork(i)} style={{ color: T.red, cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "rgba(229,57,53,0.08)" }}>✕ Quitar</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                  {w.type !== "Tren Delantero" && w.type !== "Tren Trasero" && w.type !== "Mecánica" && w.type !== "Escape" && w.type !== "Arreglo" && w.type !== "Repro" && w.type !== "Otros" && <div>
                    <label style={labelStyle}>Descripción</label>
                    <input value={w.desc} onChange={e => updateWork(i, "desc", e.target.value)}
                      placeholder="Detalles del trabajo..." style={inputStyle} />
                  </div>}
                  {w.type !== "Tren Delantero" && w.type !== "Tren Trasero" && w.type !== "Mecánica" && w.type !== "Escape" && w.type !== "Arreglo" && w.type !== "Repro" && w.type !== "Otros" && <div>
                    <label style={labelStyle}>Precio *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>$</span>
                      <input inputMode="numeric" value={w.price ? Number(w.price).toLocaleString("es-AR") : ""} onChange={e => updateWork(i, "price", e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="0" style={{ ...inputStyle, fontSize: 18, fontWeight: 700, fontFamily: fontD }} />
                    </div>
                  </div>}
                </div>

                {/* Sub-items for category-based works */}
                {w.trenItems && w.type === "Baterías" ? (
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Seleccionar amperaje</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                      {w.trenItems.filter(ti => !ti.isCustom).map((ti, j) => (
                        <div key={j} onClick={() => {
                          const newItems = w.trenItems.map((x, k) => ({ ...x, selected: k === j }));
                          updateWork(i, "trenItems", newItems);
                          updateWork(i, "desc", ti.label);
                        }} style={{ ...card, padding: "10px 8px", cursor: "pointer", textAlign: "center", borderColor: ti.selected ? T.accent : T.border, background: ti.selected ? "rgba(30,136,229,0.12)" : T.bg, transition: "all .2s" }}>
                          <div style={{ fontSize: 18, marginBottom: 2 }}>🔋</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: ti.selected ? T.accent : T.text }}>{ti.label.replace("Batería ", "")}</div>
                          {ti.selected && <div style={{ fontSize: 9, color: T.accent, marginTop: 2, fontWeight: 700 }}>✓ SELECCIONADO</div>}
                        </div>
                      ))}
                    </div>
                    {w.trenItems.some(ti => ti.selected) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                        <div>
                          <label style={labelStyle}>Descripción (marca/modelo) *</label>
                          <input value={w.extraDesc || ""} onChange={e => {
                            updateWork(i, "extraDesc", e.target.value);
                            const sel = w.trenItems.find(x => x.selected);
                            updateWork(i, "desc", (sel ? sel.label : "") + (e.target.value ? " - " + e.target.value : ""));
                          }} placeholder="Ej: Moura 12x75" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Precio *</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>$</span>
                            <input type="text" value={w.price ? Number(w.price).toLocaleString("es-AR") : ""} onChange={e => {
                              updateWork(i, "price", e.target.value.replace(/[^0-9]/g, ""));
                            }} placeholder="0" style={{ ...inputStyle, fontSize: 18, fontWeight: 700, fontFamily: fontD }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {(() => {
                      const batPrice = parseFloat(w.price) || 0;
                      const batIva = batPrice * (1 + config.ivaRate / 100);
                      const bat3 = batPrice * (1 + config.surcharge3 / 100);
                      const bat6 = batPrice * (1 + config.surcharge6 / 100);
                      return batPrice > 0 ? (
                        <div style={{ padding: "12px 14px", background: T.bg, borderRadius: 10, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: fontD }}>TOTAL BATERÍAS</span>
                            <span style={{ fontWeight: 800, fontSize: 16, color: T.accent, fontFamily: fontD }}>{fmt(batPrice)}</span>
                          </div>
                          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
                            <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(batPrice * config.ivaRate / 100)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>Total con IVA</span>
                            <span style={{ fontWeight: 700, color: T.accent }}>{fmt(batIva)}</span>
                          </div>
                          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(bat3 / 3)} c/u</span>
                              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(bat3)}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(bat6 / 6)} c/u</span>
                              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(bat6)}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ) : w.trenItems && (
                  <div style={{ marginBottom: 10 }}>
                    {w.trenItems.map((ti, j) => (
                      <div key={j} style={{ padding: "8px 10px", marginBottom: 4, background: ti.isCustom ? (ti.label ? "rgba(30,136,229,0.08)" : T.bg) : (ti.selected ? "rgba(30,136,229,0.08)" : T.bg), borderRadius: 8, border: `1px solid ${(ti.isCustom ? (ti.label || ti.price) : ti.selected) ? T.accent : T.border}`, transition: "all .2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {!ti.isCustom && (
                          <div onClick={() => {
                            const newItems = [...w.trenItems];
                            newItems[j] = { ...newItems[j], selected: !newItems[j].selected };
                            const total = newItems.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                            const desc = newItems.filter(x => x.isCustom ? (x.label) : x.selected).map(x => x.isCustom ? x.label : (x.otroDesc ? x.label + " (" + x.otroDesc + ")" : x.label)).join(", ");
                            updateWork(i, "trenItems", newItems);
                            updateWork(i, "price", total);
                            updateWork(i, "desc", desc);
                          }} style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${ti.selected ? T.accent : T.border}`, background: ti.selected ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .2s" }}>
                            {ti.selected && <span style={{ color: "#FFF", fontSize: 14, fontWeight: 800 }}>✓</span>}
                          </div>
                        )}
                        {ti.isCustom ? (
                          <input value={ti.label || ""} onChange={e => {
                            const newItems = [...w.trenItems];
                            newItems[j] = { ...newItems[j], label: e.target.value };
                            const desc = newItems.filter(x => x.isCustom ? (x.label) : x.selected).map(x => x.isCustom ? x.label : x.label).join(", ");
                            updateWork(i, "trenItems", newItems);
                            updateWork(i, "desc", desc);
                          }} placeholder="Describir item..." style={{ ...inputStyle, flex: 1, fontSize: 13, fontWeight: 600, padding: "4px 8px" }} />
                        ) : (
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: ti.selected ? T.accent : T.text, minWidth: 0 }}>{ti.label}</span>
                        )}
                        {ti.selected && !ti.isCustom && (
                          <input value={ti.otroDesc || ""} onChange={e => {
                            const newItems = [...w.trenItems];
                            newItems[j] = { ...newItems[j], otroDesc: e.target.value };
                            const desc = newItems.filter(x => x.isCustom ? x.label : x.selected).map(x => x.otroDesc ? x.label + " (" + x.otroDesc + ")" : x.label).join(", ");
                            updateWork(i, "trenItems", newItems);
                            updateWork(i, "desc", desc);
                          }} placeholder={ti.key === "otro" ? "Especificar..." : "Descripción..."} style={{ ...inputStyle, width: 100, fontSize: 11, padding: "4px 8px" }} />
                        )}
                        {(ti.isCustom || ti.selected) && (
                          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {!ti.isCustom && (ti.key === "alineado" || ti.key === "balanceado" || ti.key === "rotacion") && (
                              <div onClick={() => {
                                const newItems = [...w.trenItems];
                                const isFree = !newItems[j].isFree;
                                newItems[j] = { ...newItems[j], isFree, price: isFree ? "0" : "" };
                                const total = newItems.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                                updateWork(i, "trenItems", newItems);
                                updateWork(i, "price", total);
                              }} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${ti.isFree ? T.green : T.border}`, background: ti.isFree ? `${T.green}20` : "transparent", color: ti.isFree ? T.green : T.gray, marginRight: 4 }}>
                                GRATIS
                              </div>
                            )}
                            {!ti.isFree && <>
                            <span style={{ fontSize: 12, color: T.accent, fontWeight: 700 }}>$</span>
                            <input type="text" value={ti.price ? Number(ti.price).toLocaleString("es-AR") : ""} onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              const newItems = [...w.trenItems];
                              newItems[j] = { ...newItems[j], price: raw };
                              const total = newItems.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                              updateWork(i, "trenItems", newItems);
                              updateWork(i, "price", total);
                            }} placeholder="0" style={{ ...inputStyle, width: 85, fontSize: 14, fontWeight: 700, fontFamily: fontD, padding: "4px 8px", textAlign: "right" }} />
                            </>}
                            {ti.isFree && <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>$0</span>}
                          </div>
                        )}
                        {ti.isCustom && w.trenItems.filter(x => x.isCustom).length > 1 && (
                          <span onClick={() => {
                            const newItems = w.trenItems.filter((_, k) => k !== j);
                            const total = newItems.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                            updateWork(i, "trenItems", newItems);
                            updateWork(i, "price", total);
                          }} style={{ color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: "0 4px" }}>✕</span>
                        )}
                        </div>
                        {ti.selected && !ti.isCustom && ti.key !== "otro" && ti.key !== "alineado" && ti.key !== "balanceado" && ti.key !== "rotacion" && w.type.includes("Tren") && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, paddingLeft: 34, paddingBottom: 4 }}>
                            <span style={{ fontSize: 11, color: T.grayLight, fontWeight: 700, marginRight: 2 }}>LADO:</span>
                            {[{ k: "izq", l: "Izquierdo" }, { k: "der", l: "Derecho" }, { k: "ambos", l: "Ambos" }].map(s => {
                              const active = (ti.side || "ambos") === s.k;
                              return (
                                <div key={s.k} onClick={(e) => {
                                  e.stopPropagation();
                                  const newItems = [...w.trenItems];
                                  newItems[j] = { ...newItems[j], side: s.k };
                                  updateWork(i, "trenItems", newItems);
                                }} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `2px solid ${active ? T.accent : T.border}`, background: active ? T.accent : "transparent", color: active ? "#FFF" : T.gray, transition: "all .15s", userSelect: "none" }}>
                                  {s.l}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Add more custom fields */}
                    <div onClick={() => {
                      const newItems = [...w.trenItems, { key: `libre_${Date.now()}`, label: "", selected: false, price: "", isCustom: true }];
                      updateWork(i, "trenItems", newItems);
                    }} style={{ padding: "8px 10px", marginBottom: 4, borderRadius: 8, border: `1px dashed ${T.border}`, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: T.accent, background: "rgba(30,136,229,0.04)" }}>
                      + Agregar item
                    </div>
                    {/* Total + IVA + cuotas */}
                    {(() => {
                      const catTotal = parseFloat(w.price) || 0;
                      const catIva = catTotal * (1 + config.ivaRate / 100);
                      const cat3 = catTotal * (1 + config.surcharge3 / 100);
                      const cat6 = catTotal * (1 + config.surcharge6 / 100);
                      return catTotal > 0 ? (
                        <div style={{ padding: "12px 14px", marginTop: 8, background: T.bg, borderRadius: 10, fontSize: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: fontD }}>TOTAL {w.type.toUpperCase()}</span>
                            <span style={{ fontWeight: 800, fontSize: 16, color: T.accent, fontFamily: fontD }}>{fmt(catTotal)}</span>
                          </div>
                          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
                            <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(catTotal * config.ivaRate / 100)}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>Total con IVA</span>
                            <span style={{ fontWeight: 700, color: T.accent }}>{fmt(catIva)}</span>
                          </div>
                          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(cat3 / 3)} c/u</span>
                              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(cat3)}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(cat6 / 6)} c/u</span>
                              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(cat6)}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    <div style={{ marginTop: 8 }}>
                      <label style={labelStyle}>Descripción adicional (opcional)</label>
                      <input value={w.extraDesc || ""} onChange={e => updateWork(i, "extraDesc", e.target.value)}
                        placeholder="Notas adicionales..." style={inputStyle} />
                    </div>
                  </div>
                )}

                {/* Price breakdown */}
                {price > 0 && !w.trenItems && (
                  <div style={{ padding: "12px 14px", background: T.bg, borderRadius: 10, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: T.gray }}>Precio base</span>
                      <span style={{ fontWeight: 700 }}>{fmt(price)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
                      <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(price * config.ivaRate / 100)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: T.gray }}>Total con IVA</span>
                      <span style={{ fontWeight: 700, color: T.accent }}>{fmt(price * (1 + config.ivaRate / 100))}</span>
                    </div>
                    <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total3 / 3)} c/u</span>
                        <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total3)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total6 / 6)} c/u</span>
                        <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total6)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {works.length > 0 && (
            <div style={{ ...card, padding: 16, marginBottom: 16, background: "rgba(30,136,229,0.08)", borderColor: T.accent }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, fontFamily: fontD }}>
                <span>TOTAL</span>
                <span style={{ color: T.accent }}>{fmt(totalWorks)}</span>
              </div>
            </div>
          )}

          {works.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: T.gray, fontSize: 14 }}>
              Tocá un ícono de arriba para agregar un trabajo
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>← Volver</button>
            <button onClick={() => { setPayments([{ method: "", amount: String(totalWorks), account: "", installments: 3 }]); setStep(4); }} disabled={!worksValid}
              style={{ ...btnPrimary(), opacity: worksValid ? 1 : 0.4 }}>Continuar →</button>
          </div>
            </div>
          )}
        </div>
      )}

      {showBrakePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowBrakePopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 420, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🛞</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 20 }}>Pastillas de Freno</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div onClick={() => setBrakeEjes(prev => ({ ...prev, del: !prev.del }))} style={{ flex: 1, ...card, padding: "20px 12px", cursor: "pointer", textAlign: "center", borderColor: brakeEjes.del ? T.accent : T.border, background: brakeEjes.del ? "rgba(30,136,229,0.12)" : T.bg, transition: "all .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>⚙️</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Eje Delantero</div>
                {brakeEjes.del && <div style={{ fontSize: 10, color: T.accent, marginTop: 4, fontWeight: 700 }}>✓ SELECCIONADO</div>}
              </div>
              <div onClick={() => setBrakeEjes(prev => ({ ...prev, tra: !prev.tra }))} style={{ flex: 1, ...card, padding: "20px 12px", cursor: "pointer", textAlign: "center", borderColor: brakeEjes.tra ? T.accent : T.border, background: brakeEjes.tra ? "rgba(30,136,229,0.12)" : T.bg, transition: "all .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>⚙️</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Eje Trasero</div>
                {brakeEjes.tra && <div style={{ fontSize: 10, color: T.accent, marginTop: 4, fontWeight: 700 }}>✓ SELECCIONADO</div>}
              </div>
            </div>
            {brakeEjes.del && <div style={{ marginBottom: 12 }}><label style={{ ...labelStyle, fontSize: 11 }}>Monto Eje Delantero *</label><div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>$</span><input inputMode="numeric" type="text" value={brakeEjes.delPrice ? Number(brakeEjes.delPrice).toLocaleString("es-AR") : ""} onChange={e => setBrakeEjes(prev => ({ ...prev, delPrice: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="0" style={{ ...inputStyle, fontSize: 16, fontFamily: fontD, flex: 1 }} /></div></div>}
            {brakeEjes.tra && <div style={{ marginBottom: 12 }}><label style={{ ...labelStyle, fontSize: 11 }}>Monto Eje Trasero *</label><div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>$</span><input inputMode="numeric" type="text" value={brakeEjes.traPrice ? Number(brakeEjes.traPrice).toLocaleString("es-AR") : ""} onChange={e => setBrakeEjes(prev => ({ ...prev, traPrice: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="0" style={{ ...inputStyle, fontSize: 16, fontFamily: fontD, flex: 1 }} /></div></div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowBrakePopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => { const nw = []; if (brakeEjes.del && brakeEjes.delPrice) nw.push({ type: "Pastillas de Freno", price: brakeEjes.delPrice, desc: "Eje delantero" }); if (brakeEjes.tra && brakeEjes.traPrice) nw.push({ type: "Pastillas de Freno", price: brakeEjes.traPrice, desc: "Eje trasero" }); if (nw.length > 0) { setWorks(w => [...w, ...nw]); setShowBrakePopup(false); } }} disabled={(!brakeEjes.del && !brakeEjes.tra) || (brakeEjes.del && !brakeEjes.delPrice) || (brakeEjes.tra && !brakeEjes.traPrice)} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: (!brakeEjes.del && !brakeEjes.tra) || (brakeEjes.del && !brakeEjes.delPrice) || (brakeEjes.tra && !brakeEjes.traPrice) ? 0.4 : 1 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {unlinkVehicle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setUnlinkVehicle(null)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.red}30`, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
            <div style={{ fontFamily: fontD, fontSize: 17, fontWeight: 700, marginBottom: 16, color: T.white, lineHeight: 1.4 }}>
              El vehículo <span style={{ color: T.accent }}>{fmtD(unlinkVehicle.vehicle.domain)}</span> ya no pertenece a <span style={{ color: T.red }}>{unlinkVehicle.client.name} {unlinkVehicle.client.lastName}</span>?
            </div>
            <div style={{ fontSize: 12, color: T.gray, marginBottom: 20 }}>
              {unlinkVehicle.vehicle.brand} {unlinkVehicle.vehicle.model} {unlinkVehicle.vehicle.year} — Se desvinculará del cliente pero el historial se mantiene.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setUnlinkVehicle(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => {
                setClients(prev => prev.map(c => c.id === unlinkVehicle.client.id ? {
                  ...c,
                  vehicles: c.vehicles.filter(v => v.domain !== unlinkVehicle.vehicle.domain)
                } : c));
                setUnlinkVehicle(null);
              }} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>Sí, desvincular</button>
            </div>
          </div>
        </div>
      )}

      {showKmPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.orange}40` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 10 }}>🛣️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 6, color: T.orange }}>Kilómetros actuales requeridos</div>
            <div style={{ fontSize: 13, color: T.gray, textAlign: "center", marginBottom: 20 }}>Ingresá el kilometraje actual del vehículo para continuar.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <input value={form.currentKm ? Number(form.currentKm).toLocaleString("es-AR") : ""} onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setForm(f => ({ ...f, currentKm: val }));
                if (val && parseInt(val) < (parseInt(form.lastKm) || 0)) {
                  setKmError(`No puede ser menor a ${Number(form.lastKm).toLocaleString("es-AR")} km`);
                } else {
                  setKmError("");
                }
              }}
                placeholder="Ej: 52.000" autoFocus
                style={{ ...inputStyle, fontSize: 22, fontWeight: 700, fontFamily: fontD, textAlign: "center", flex: 1, borderColor: kmError ? T.red : (form.currentKm && !kmError) ? T.green : T.border }} />
              <span style={{ fontSize: 16, color: T.gray, fontWeight: 600 }}>km</span>
            </div>
            {form.lastKm && <div style={{ fontSize: 11, color: T.gray, textAlign: "center", marginBottom: 4 }}>Último registro: <strong style={{ color: T.accent }}>{Number(form.lastKm).toLocaleString("es-AR")} km</strong></div>}
            {kmError && <div style={{ fontSize: 11, color: T.red, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>⚠️ {kmError}</div>}
            <div style={{ marginTop: kmError ? 4 : 12, display: "flex", gap: 10 }}>
              <button onClick={() => setShowKmPopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => {
                if (form.currentKm && !kmError) {
                  setShowKmPopup(false);
                  const finalKm = parseInt(form.currentKm);
                  if (!isNew && !addingNewVehicle && !editMode) {
                    setClients(prev => prev.map(c => c.id === foundClient.id ? {
                      ...c,
                      vehicles: c.vehicles.map(v => v.domain === foundVehicle.domain ? { ...v, km: finalKm } : v)
                    } : c));
                  }
                  setStep(3);
                }
              }} disabled={!form.currentKm || !!kmError} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: (form.currentKm && !kmError) ? 1 : 0.4 }}>Continuar →</button>
            </div>
          </div>
        </div>
      )}

      {showEscapePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowEscapePopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 420, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>💨</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 20 }}>Escape</div>
            <div style={{ fontSize: 12, color: T.gray, textAlign: "center", marginBottom: 16 }}>¿Qué tipo de sistema?</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div onClick={() => {
                setWorks(w => [...w, { type: "Escape", price: 0, desc: "Sistema Original", escapeType: "original", trenItems: buildTrenItems("Escape") }]);
                setShowEscapePopup(false);
              }} style={{ flex: 1, ...card, padding: "20px 12px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>🔧</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Sistema Original</div>
                <div style={{ fontSize: 10, color: T.gray, marginTop: 4 }}>Reparación / reemplazo</div>
              </div>
              <div onClick={() => {
                setWorks(w => [...w, { type: "Escape", price: 0, desc: "Escape Deportivo", escapeType: "deportivo", trenItems: buildTrenItems("Escape Deportivo") }]);
                setShowEscapePopup(false);
              }} style={{ flex: 1, ...card, padding: "20px 12px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>🏎️</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Escape Deportivo</div>
                <div style={{ fontSize: 10, color: T.gray, marginTop: 4 }}>Performance</div>
              </div>
            </div>
            <button onClick={() => setShowEscapePopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, width: "100%", marginTop: 16, fontSize: 13 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: PAYMENT ─── */}
      {step === 4 && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700, marginBottom: 6 }}>💳 Método de Pago</div>
          <div style={{ ...card, padding: 14, marginBottom: 16, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: T.gray }}>Precio base</span>
              <span style={{ fontWeight: 700 }}>{fmt(totalWorks)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
              <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(totalWorks * config.ivaRate / 100)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontWeight: 700 }}>Total con IVA</span>
              <span style={{ fontWeight: 700, color: T.accent }}>{fmt(totalWorks * (1 + config.ivaRate / 100))}</span>
            </div>
            <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(totalWorks * (1 + config.surcharge3 / 100) / 3)} c/u</span>
                <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(totalWorks * (1 + config.surcharge3 / 100))}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(totalWorks * (1 + config.surcharge6 / 100) / 6)} c/u</span>
                <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(totalWorks * (1 + config.surcharge6 / 100))}</span>
              </div>
            </div>
          </div>

          {payments.map((p, i) => (
            <div key={i} style={{ ...card, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: T.orange }}>Pago #{i + 1}</span>
                {payments.length > 1 && <span onClick={() => removePayment(i)} style={{ color: T.red, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Quitar</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Método *</label>
                  <SearchSelect options={["Efectivo", "Tarjeta", "Transferencia", "Cuenta Corriente"]}
                    value={p.method} onChange={v => updatePayment(i, "method", v)} placeholder="Seleccionar" />
                </div>
                <div>
                  <label style={labelStyle}>Monto *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>$</span>
                    <input inputMode="numeric" value={p.amount ? Number(p.amount).toLocaleString("es-AR") : ""} onChange={e => updatePayment(i, "amount", e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0" style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>
              </div>

              {/* Cuenta - only for Transferencia */}
              {p.method === "Transferencia" && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Cuenta</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ acc: "1", label: "Cuenta 1", sub: "Con IVA · Fact. A / B" }, { acc: "2", label: "Cuenta 2", sub: "Sin IVA · Fact. C" }].map(opt => (
                      <div key={opt.acc} onClick={() => {
                        updatePayment(i, "account", opt.acc);
                        updatePayment(i, "withIva", opt.acc === "1");
                        updatePayment(i, "invoiceType", opt.acc === "2" ? "C" : (form.cuit ? "A" : "B"));
                      }}
                        style={{ ...card, padding: "10px 20px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: p.account === opt.acc ? T.accent : T.border, background: p.account === opt.acc ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontSize: 14, fontFamily: font }}>
                        {opt.label}
                        <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IVA - for Efectivo and Tarjeta */}
              {(p.method === "Efectivo" || p.method === "Tarjeta") && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>¿Incluye IVA?</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div onClick={() => { updatePayment(i, "withIva", true); updatePayment(i, "invoiceType", form.cuit ? "A" : "B"); }}
                      style={{ ...card, padding: "10px 20px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: p.withIva === true ? T.accent : T.border, background: p.withIva === true ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontSize: 13 }}>
                      Sí, con IVA
                      <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>Fact. A / B</div>
                    </div>
                    <div onClick={() => { updatePayment(i, "withIva", false); updatePayment(i, "invoiceType", ""); }}
                      style={{ ...card, padding: "10px 20px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: p.withIva === false ? T.accent : T.border, background: p.withIva === false ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontSize: 13 }}>
                      No, sin IVA
                    </div>
                  </div>
                </div>
              )}

              {/* IVA breakdown when applicable */}
              {p.withIva && (parseFloat(p.amount) || 0) > 0 && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: T.bg, borderRadius: 8, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: T.gray }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{fmt(parseFloat(p.amount) || 0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
                    <span style={{ fontWeight: 600, color: T.accent }}>{fmt((parseFloat(p.amount) || 0) * config.ivaRate / 100)}</span>
                  </div>
                  <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>Total con IVA</span>
                    <span style={{ color: T.accent, fontFamily: fontD }}>{fmt((parseFloat(p.amount) || 0) * (1 + config.ivaRate / 100))}</span>
                  </div>
                </div>
              )}

              {/* Invoice type - when IVA is selected */}
              {p.withIva && (p.method === "Efectivo" || p.method === "Tarjeta" || (p.method === "Transferencia" && p.account === "1")) && (
                <div style={{ marginTop: 12 }}>
                  <label style={labelStyle}>Tipo de Factura</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["A", "B"].map(ft => (
                      <div key={ft} onClick={() => updatePayment(i, "invoiceType", ft)}
                        style={{ ...card, padding: "10px 16px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: p.invoiceType === ft ? T.accent : T.border, background: p.invoiceType === ft ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontSize: 14, fontFamily: font }}>
                        Factura {ft}
                        <div style={{ fontSize: 9, color: T.gray, marginTop: 2 }}>{ft === "A" ? "CUIT" : "DNI / CUIT"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuenta 2 = Factura C auto */}
              {p.method === "Transferencia" && p.account === "2" && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: T.bg, borderRadius: 6, fontSize: 11, color: T.gray }}>
                  Factura C (sin IVA) — Cuenta 2
                </div>
              )}
            </div>
          ))}

          <button onClick={addPayment} style={{ ...card, padding: 14, width: "100%", cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 700, color: T.orange, background: "rgba(255,152,0,0.06)", fontFamily: font, marginBottom: 16 }}>
            + Agregar otro método de pago (pago mixto)
          </button>

          {/* Balance */}
          <div style={{ ...card, padding: 16, marginBottom: 16, borderColor: Math.abs(totalPayments - totalWorks) < 1 ? T.green : T.red }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: T.gray }}>Total trabajos</span><span style={{ fontWeight: 700 }}>{fmt(totalWorks)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: T.gray }}>Total pagos</span><span style={{ fontWeight: 700 }}>{fmt(totalPayments)}</span>
            </div>
            <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, fontFamily: fontD }}>
              <span>Diferencia</span>
              <span style={{ color: Math.abs(totalPayments - totalWorks) < 1 ? T.green : T.red }}>
                {Math.abs(totalPayments - totalWorks) < 1 ? "✅ Coincide" : fmt(totalWorks - totalPayments)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(3)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>← Volver</button>
            <button onClick={confirmOrder} disabled={!paymentsValid}
              style={{ ...btnPrimary(T.green), opacity: paymentsValid ? 1 : 0.4 }}>✅ Confirmar Orden</button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: CONFIRMATION ─── */}
      {step === 5 && (
        <div style={{ animation: "scaleIn .4s ease", textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Orden Creada</div>
          <div style={{ fontSize: 14, color: T.gray, marginBottom: 8 }}>Vehículo recepcionado exitosamente</div>
          <div style={{ ...card, padding: 20, maxWidth: 400, margin: "20px auto", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: T.gray }}>Dominio</span><span style={{ fontWeight: 700, fontFamily: fontD, fontSize: 18 }}>{fmtD(form.domain)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: T.gray }}>Cliente</span><span style={{ fontWeight: 600 }}>{form.name} {form.lastName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: T.gray }}>Vehículo</span><span style={{ fontWeight: 600 }}>{form.brand} {form.model} {form.year}</span>
            </div>
            <div style={{ height: 1, background: T.border, margin: "10px 0" }} />
            {works.map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{w.type}</span><span style={{ fontWeight: 700, color: T.accent }}>{fmt(parseFloat(w.price))}</span>
              </div>
            ))}
            <div style={{ height: 1, background: T.border, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, fontFamily: fontD }}>
              <span>TOTAL</span><span style={{ color: T.accent }}>{fmt(totalWorks)}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.green, marginBottom: 24 }}>📱 Mensaje de WhatsApp enviado al cliente</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => onNavigate("dashboard")} style={btnPrimary()}>Ir al Dashboard</button>
            <button onClick={() => { setStep(1); setDomainSearch(""); setFoundClient(null); setFoundVehicle(null); setIsNew(false); setWorks([]); setPayments([{ method: "", amount: "", account: "", installments: 3 }]); setForm({ name: "", lastName: "", dni: "", cuit: "", phone: "", brand: "", model: "", year: "", km: "", currentKm: "", lastKm: "", domain: "" }); }}
              style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>+ Nueva Orden</button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickSaleScreen = ({ config, onNavigate }) => {
  const [items, setItems] = useState([{ name: "", price: "" }]);
  const [method, setMethod] = useState("");
  const [clientInfo, setClientInfo] = useState({ name: "", lastName: "", dni: "", phone: "" });
  const [account, setAccount] = useState("");
  const [installments, setInstallments] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const addItem = () => setItems(i => [...i, { name: "", price: "" }]);
  const updateItem = (i, f, v) => setItems(it => it.map((x, j) => j === i ? { ...x, [f]: v } : x));
  const removeItem = (i) => setItems(it => it.filter((_, j) => j !== i));
  const total = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
  const needsClientInfo = method === "Tarjeta" || method === "Transferencia" || method === "Cta. Corriente";
  const itemsValid = items.every(i => i.name && i.price && parseFloat(i.price) > 0);
  const clientValid = !needsClientInfo || (
    clientInfo.name && clientInfo.lastName && clientInfo.phone &&
    (method === "Cta. Corriente" || clientInfo.dni)
  );
  const allValid = itemsValid && method && clientValid;

  if (confirmed) {
    return (
      <div style={{ padding: 24, animation: "scaleIn .4s ease", textAlign: "center", paddingTop: 60, maxWidth: 500, margin: "0 auto" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
        <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 700, marginBottom: 8 }}>Venta Registrada</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.accent, fontFamily: fontD, marginBottom: 24 }}>{fmt(total)}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => onNavigate("dashboard")} style={btnPrimary()}>Ir al Dashboard</button>
          <button onClick={() => { setConfirmed(false); setItems([{ name: "", price: "" }]); setMethod(""); setClientInfo({ name: "", lastName: "", dni: "", phone: "" }); }}
            style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>+ Nueva Venta</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700, marginBottom: 20 }}>🛒 Venta Rápida</div>

      {/* Items */}
      {items.map((item, i) => (
        <div key={i} style={{ ...card, padding: 14, marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
          <input value={item.name} onChange={e => updateItem(i, "name", e.target.value)}
            placeholder="Producto (ej: Lámpara H7)" style={{ ...inputStyle, flex: 2 }} />
          <input inputMode="numeric" value={item.price ? Number(item.price).toLocaleString("es-AR") : ""} onChange={e => updateItem(i, "price", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0" style={{ ...inputStyle, flex: 1 }} />
          {items.length > 1 && <span onClick={() => removeItem(i)} style={{ color: T.red, cursor: "pointer", fontWeight: 700, fontSize: 16, padding: "0 6px" }}>✕</span>}
        </div>
      ))}
      <button onClick={addItem} style={{ ...card, padding: 12, width: "100%", cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 700, color: T.accent, background: "rgba(30,136,229,0.06)", fontFamily: font, marginBottom: 16 }}>
        + Agregar producto
      </button>

      {total > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16, borderColor: T.accent, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            <span>TOTAL</span><span style={{ color: T.accent }}>{fmt(total)}</span>
          </div>
          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
            <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(total * config.ivaRate / 100)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>Total con IVA</span>
            <span style={{ fontWeight: 700, color: T.accent }}>{fmt(total * (1 + config.ivaRate / 100))}</span>
          </div>
          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total * (1 + config.surcharge3 / 100) / 3)} c/u</span>
              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total * (1 + config.surcharge3 / 100))}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total * (1 + config.surcharge6 / 100) / 6)} c/u</span>
              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total * (1 + config.surcharge6 / 100))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment method */}
      <label style={labelStyle}>Método de pago *</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {["Efectivo", "Tarjeta", "Transferencia", "Cta. Corriente"].map(m => (
          <div key={m} onClick={() => setMethod(m)}
            style={{ ...card, padding: "12px 8px", cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, borderColor: method === m ? T.accent : T.border, background: method === m ? "rgba(30,136,229,0.1)" : T.bg2, fontFamily: font, color: method === m ? T.accent : T.grayLight }}>
            {m}
          </div>
        ))}
      </div>

      {method === "Tarjeta" && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Cuotas</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 3, 6].map(q => (
              <div key={q} onClick={() => setInstallments(q)}
                style={{ ...card, padding: "10px 14px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: installments === q ? T.accent : T.border, background: installments === q ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontSize: 13, fontFamily: font }}>
                {q} {q === 1 ? "pago" : "cuotas"}
              </div>
            ))}
          </div>
        </div>
      )}

      {method === "Transferencia" && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Cuenta</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["1", "2"].map(acc => (
              <div key={acc} onClick={() => setAccount(acc)}
                style={{ ...card, padding: "10px 16px", cursor: "pointer", textAlign: "center", flex: 1, borderColor: account === acc ? T.accent : T.border, background: account === acc ? "rgba(30,136,229,0.1)" : T.bg2, fontWeight: 700, fontFamily: font }}>
                Cuenta {acc}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client info for card/transfer */}
      {needsClientInfo && (
        <div style={{ ...card, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.orange, marginBottom: 12 }}>👤 Datos del cliente</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input value={clientInfo.name} onChange={e => setClientInfo(c => ({ ...c, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input value={clientInfo.lastName} onChange={e => setClientInfo(c => ({ ...c, lastName: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>DNI / CUIT {method !== "Cta. Corriente" ? "*" : "(opcional)"}</label>
            <input inputMode="numeric" value={clientInfo.dni} onChange={e => setClientInfo(c => ({ ...c, dni: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Teléfono *</label>
            <input value={clientInfo.phone} onChange={e => setClientInfo(c => ({ ...c, phone: e.target.value.replace(/[^0-9+]/g, "") }))} placeholder="Ej: 3512345678" style={inputStyle} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => onNavigate("dashboard")} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}` }}>← Volver</button>
        <button onClick={() => setConfirmed(true)} disabled={!allValid}
          style={{ ...btnPrimary(T.green), opacity: allValid ? 1 : 0.4 }}>✅ Confirmar Venta</button>
      </div>
    </div>
  );
};

const DashboardScreen = (props) => {
  const { user, orders, clients, notifications, setNotifications, onNavigate } = props;
  const active = orders.filter(o => o.status === "pending" || o.status === "working" || o.status === "done" || o.status === "inspection" || o.status === "budget_sent" || o.status === "budget_approved");
  const pending = active.filter(o => o.status === "pending").length;
  const working = active.filter(o => o.status === "working").length;
  const done = active.filter(o => o.status === "done").length;
  const canCreate = ["dueño", "encargado", "mecánico", "admin"].includes(user.role);
  const isOwner = user.role === "dueño";
  const canManageAuth = ["dueño", "encargado"].includes(user.role);
  const pendingNotifs = (notifications || []).filter(n => n.status === "pending");

  const getVehicleInfo = (order) => {
    const client = clients.find(c => c.id === order.clientId);
    const vehicle = client?.vehicles.find(v => v.domain === order.domain);
    return { clientName: client ? `${client.name} ${client.lastName}` : "—", brand: vehicle?.brand || "", model: vehicle?.model || "", year: vehicle?.year || "" };
  };

  const getStatusColor = (s) => s === "done" ? T.green : s === "working" ? T.orange : s === "inspection" ? "#9C27B0" : s === "budget_sent" ? "#1E88E5" : s === "budget_approved" ? "#00C853" : T.red;
  const getStatusLabel = (s) => s === "done" ? "LISTO" : s === "working" ? "EN CURSO" : s === "inspection" ? "EN INSPECCIÓN" : s === "budget_sent" ? "PRESUP. ENVIADO" : s === "budget_approved" ? "APROBADO" : "ESPERANDO";

  return (
    <div style={{ padding: 24, animation: "fadeUp .4s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { icon: "🚗", value: active.length, label: "En taller hoy", color: T.accent },
          { icon: "🔴", value: pending, label: "Esperando", color: T.red },
          { icon: "🟡", value: working, label: "En curso", color: T.orange },
          { icon: "✅", value: done, label: "Listos", color: T.green },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: "18px 22px", flex: 1, minWidth: 150, animation: `fadeUp .4s ease ${i*.1}s both` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: fontD, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.gray, marginTop: 4, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { icon: "🔍", label: "Buscar Dominio", action: "search", show: true },
          ...(canCreate ? [{ icon: "📋", label: "Nueva Orden", action: "newOrder", show: true }] : []),
          { icon: "🛒", label: "Venta Rápida", action: "quickSale", show: canCreate },
          { icon: "🔧", label: "En Taller", action: "workshop", show: true },
          ...(["dueño", "admin"].includes(user.role) ? [
            { icon: "📊", label: "Administración", action: "admin", show: true },
          ] : []),
          ...(["dueño", "admin"].includes(user.role) ? [
            { icon: "⚙️", label: "Configuración", action: "config", show: true },
          ] : []),
        ].filter(b => b.show !== false).map((b, i) => (
          <div key={i} onClick={() => onNavigate(b.action)}
            style={{ ...card, padding: 20, cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{b.label}</div>
          </div>
        ))}
      </div>

      {/* En Taller - últimos vehículos */}
      {orders.filter(o => ["pending", "working", "done"].includes(o.status)).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><span>🔧</span> EN TALLER</div>
            <div onClick={() => onNavigate("workshop")} style={{ fontSize: 13, color: T.accent, cursor: "pointer", fontWeight: 600 }}>Ver todos →</div>
          </div>
          {orders.filter(o => ["pending", "working", "done"].includes(o.status)).slice(0, 5).map(o => {
            const cl = clients.find(c => c.id === o.clientId);
            const vh = cl?.vehicles?.find(v => v.domain === o.domain);
            const sc = o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red;
            return (
              <div key={o.id} onClick={() => onNavigate("vehicleDetail", o)}
                style={{ ...card, padding: 14, marginBottom: 8, cursor: "pointer", borderLeft: `3px solid ${sc}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc }} />
                    <div>
                      <span style={{ fontFamily: fontD, fontWeight: 700, fontSize: 16 }}>{fmtD(o.domain)}</span>
                      <span style={{ fontSize: 13, color: T.gray, marginLeft: 8 }}>{vh ? vh.brand + " " + vh.model + " " + vh.year : ""}</span>
                    </div>
                  </div>
                  {o.cobrado && <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${T.green}10`, color: `${T.green}bb`, border: `1px solid ${T.green}60`, marginRight: 8 }}>COBRADO</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc }}>{o.status === "done" ? "LISTO" : o.status === "working" ? "EN CURSO" : "ESPERANDO"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SearchScreen = ({ clients, orders, onNavigate }) => {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const [selVehicle, setSelVehicle] = useState(null);
  const [selClient, setSelClient] = useState(null);

  const results = q.length > 1 ? clients.filter(c =>
    c.vehicles.some(v => v.domain.replace(/\s/g, "").toLowerCase().includes(q.replace(/\s/g, "").toLowerCase())) ||
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.lastName.toLowerCase().includes(q.toLowerCase()) ||
    (c.dni && c.dni.includes(q)) ||
    (c.cuit && c.cuit.includes(q))
  ) : [];

  const isDniSearch = q.length > 1 && /^[0-9\-]+$/.test(q.trim());

  // Vehicle history view
  if (selVehicle) {
    const vOrders = orders.filter(o => o.domain === selVehicle.domain && o.status !== "cancelled").sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const cl = clients.find(c => c.vehicles.some(v => v.domain === selVehicle.domain));
    return (
      <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => { setSelVehicle(null); setSelClient(null); }} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a búsqueda</button>
        <div style={{ ...card, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>{fmtD(selVehicle.domain)}</div>
              <div style={{ fontSize: 15, color: T.grayLight, marginTop: 4 }}>{selVehicle.brand} {selVehicle.model} {selVehicle.year}</div>
              {cl && <div style={{ fontSize: 14, marginTop: 4 }}>Cliente: <strong>{cl.name} {cl.lastName}</strong></div>}
              {selVehicle.km && <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>Km: {Number(selVehicle.km).toLocaleString("es-AR")}</div>}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: fontD, fontSize: 36, fontWeight: 800, color: T.accent }}>{vOrders.length}</div>
              <div style={{ fontSize: 12, color: T.gray }}>ingreso{vOrders.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </div>
        {vOrders.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin registros para este vehículo</div>}
        {vOrders.map(o => {
          const total = o.works.reduce((s, w) => s + (w.price || 0), 0);
          const sc = o.status === "delivered" ? "#00C853" : o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red;
          const sl = o.status === "delivered" ? "ENTREGADO" : o.status === "done" ? "FINALIZADO" : o.status === "working" ? "EN CURSO" : "PENDIENTE";
          return (
            <div key={o.id} onClick={() => onNavigate("vehicleDetail", o)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer", borderLeft: `4px solid ${sc}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{o.date}</div>
                  <div style={{ fontSize: 12, color: sc, fontWeight: 700, marginTop: 2 }}>{sl}</div>
                  {o.assignedTo && <div style={{ fontSize: 11, color: T.gray }}>Mecánico: {o.assignedTo}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, color: T.accent }}>{fmt(total)}</div>
                  {o.payments && o.payments.length > 0 && <div style={{ fontSize: 11, color: T.gray }}>{o.payments.map(p => p.method).filter(Boolean).join(", ")}</div>}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Trabajos:</div>
              {o.works.map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", paddingLeft: 10, borderBottom: i < o.works.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ color: T.grayLight }}>{w.type}{w.desc ? " — " + w.desc : ""}</span>
                  <span style={{ fontWeight: 700, color: T.accent }}>{fmt(w.price || 0)}</span>
                </div>
              ))}
              {o.works.some(w => w.trenItems) && o.works.filter(w => w.trenItems).map((w, wi) => (
                w.trenItems.filter(ti => ti.selected).map((ti, j) => (
                  <div key={wi + "-" + j} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.gray, paddingLeft: 20 }}>
                    <span>• {ti.label}</span>{ti.price && <span>{fmt(parseFloat(ti.price))}</span>}
                  </div>
                ))
              ))}
              {o.techNotes && o.techNotes.filter(n => n).length > 0 && (
                <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: `${T.orange}08`, border: `1px solid ${T.orange}20` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.orange, marginBottom: 4 }}>📝 Notas:</div>
                  {o.techNotes.filter(n => n).map((n, i) => <div key={i} style={{ fontSize: 11, color: T.grayLight }}>• {n}</div>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Client vehicles selection (when searching by DNI/CUIT)
  if (selClient) {
    return (
      <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => setSelClient(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a búsqueda</button>
        <div style={{ ...card, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 6 }}>👤 Cliente</div>
          <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>{selClient.name} {selClient.lastName}</div>
          <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>DNI: {selClient.dni || "—"} {selClient.cuit ? " • CUIT: " + selClient.cuit : ""}</div>
          <div style={{ fontSize: 13, color: T.gray }}>Tel: {selClient.phone || "—"}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🚗 Vehículos registrados ({selClient.vehicles.length})</div>
        {selClient.vehicles.map((v, i) => {
          const vCount = orders.filter(o => o.domain === v.domain && o.status !== "cancelled").length;
          return (
            <div key={i} onClick={() => setSelVehicle(v)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>{fmtD(v.domain)}</div>
                  <div style={{ fontSize: 14, color: T.grayLight }}>{v.brand} {v.model} {v.year}</div>
                  {v.km && <div style={{ fontSize: 12, color: T.gray }}>Km: {Number(v.km).toLocaleString("es-AR")}</div>}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.accent }}>{vCount}</div>
                  <div style={{ fontSize: 11, color: T.gray }}>ingreso{vCount !== 1 ? "s" : ""}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🔍 Buscar Dominio / Cliente</div>
      <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Dominio, nombre, DNI o CUIT..."
        style={{ ...inputStyle, fontSize: 16, padding: "16px 20px", marginBottom: 20, borderColor: q ? T.accent : T.border }} autoFocus />

      {q.length > 1 && results.length === 0 && (
        <div style={{ ...card, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Sin resultados</div>
          <div style={{ fontSize: 13, color: T.gray }}>No se encontró ningún vehículo o cliente con "{q}"</div>
        </div>
      )}

      {results.map(c => (
        <div key={c.id}>
          {isDniSearch ? (
            <div onClick={() => setSelClient(c)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700 }}>{c.name} {c.lastName}</div>
                  <div style={{ fontSize: 13, color: T.gray }}>DNI: {c.dni || "—"}{c.cuit ? " • CUIT: " + c.cuit : ""}</div>
                  <div style={{ fontSize: 12, color: T.grayLight, marginTop: 4 }}>{c.vehicles.length} vehículo{c.vehicles.length !== 1 ? "s" : ""}: {c.vehicles.map(v => fmtD(v.domain)).join(", ")}</div>
                </div>
                <div style={{ fontSize: 20, color: T.gray }}>→</div>
              </div>
            </div>
          ) : (
            c.vehicles.filter(v => v.domain.replace(/\s/g, "").toLowerCase().includes(q.replace(/\s/g, "").toLowerCase())).map(v => {
              const vCount = orders.filter(o => o.domain === v.domain && o.status !== "cancelled").length;
              const activeOrder = orders.find(o => o.domain === v.domain && !["delivered", "cancelled"].includes(o.status));
              return (
                <div key={v.domain} onClick={() => setSelVehicle(v)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>{fmtD(v.domain)}</div>
                      <div style={{ fontSize: 14, color: T.grayLight }}>{v.brand} {v.model} {v.year}</div>
                      <div style={{ fontSize: 12, color: T.gray }}>{c.name} {c.lastName}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.accent }}>{vCount}</div>
                      <div style={{ fontSize: 11, color: T.gray }}>ingreso{vCount !== 1 ? "s" : ""}</div>
                      {activeOrder && <div style={{ fontSize: 10, fontWeight: 700, color: T.green, marginTop: 4 }}>EN TALLER</div>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
};

const WorkshopScreen = ({ orders, clients, user, onNavigate }) => {
  const [filter, setFilter] = useState("all");
  const active = orders.filter(o => o.status === "pending" || o.status === "working" || o.status === "done" || o.status === "inspection" || o.status === "budget_sent" || o.status === "budget_approved");
  const statusPriority = { inspection: 0, budget_sent: 1, budget_approved: 2, pending: 3, working: 4, done: 5, delivered: 6 };
  const filtered = (filter === "all" ? active : active.filter(o => o.status === filter)).sort((a, b) => (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9));

  const getVehicleInfo = (order) => {
    const client = clients.find(c => c.id === order.clientId);
    const vehicle = client?.vehicles.find(v => v.domain === order.domain);
    return { clientName: client ? `${client.name} ${client.lastName}` : "—", brand: vehicle?.brand || "", model: vehicle?.model || "", year: vehicle?.year || "" };
  };

  const getStatusColor = (s) => s === "done" ? T.green : s === "working" ? T.orange : s === "inspection" ? "#9C27B0" : s === "budget_sent" ? "#1E88E5" : s === "budget_approved" ? "#00C853" : T.red;
  const getStatusLabel = (s) => s === "done" ? "✅ Finalizado" : s === "working" ? "🟡 En curso" : "🔴 Esperando";

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 700 }}>🔧 En Taller</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "all", l: "Todos" }, { k: "pending", l: "Esperando" }, { k: "working", l: "En trabajo" }, { k: "done", l: "Listos" }].map(f => (
            <div key={f.k} onClick={() => setFilter(f.k)}
              style={{ padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filter === f.k ? T.accent : T.bg2, color: filter === f.k ? "#fff" : T.gray, border: `1px solid ${filter === f.k ? T.accent : T.border}`, fontFamily: font }}>
              {f.l} ({f.k === "all" ? active.length : active.filter(o => o.status === f.k).length})
            </div>
          ))}
        </div>
      </div>
      {filtered.map((o, i) => {
        const info = getVehicleInfo(o);
        const sc = getStatusColor(o.status);
        return (
        <div key={o.id} onClick={() => onNavigate("vehicleDetail", o)}
          style={{ ...card, padding: "18px 20px", marginBottom: 10, cursor: "pointer", borderLeft: `4px solid ${sc}`, animation: `slideIn .3s ease ${i*.05}s both`, transition: "background .15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = T.bg3; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.bg2; }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: sc, boxShadow: `0 0 8px ${sc}`, animation: o.status === "working" ? "pulse 2s infinite" : "none" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, fontFamily: fontD }}>{fmtD(o.domain)}</div>
                <div style={{ fontSize: 13, color: T.grayLight }}>{info.brand} {info.model} {info.year}</div>
                <div style={{ fontSize: 12, color: T.gray }}>{info.clientName}{o.assignedTo ? ` — Asignado: ${o.assignedTo}` : ""}</div>
              </div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: `${sc}20`, color: sc }}>
              {getStatusLabel(o.status)}
            </div>
            {o.cobrado && <div style={{ padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: `${T.green}10`, color: `${T.green}bb`, border: `1.5px solid ${T.green}60` }}>COBRADO</div>}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {o.works.map((w, j) => (
              <span key={j} style={{ background: T.bg3, padding: "4px 10px", borderRadius: 6, fontSize: 11, color: T.grayLight, border: `1px solid ${T.border}` }}>{w.type}{user.role !== "mecánico" ? ` — ${fmt(w.price)}` : ""}</span>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
};

const VehicleDetailScreen = (props) => {
  const { order, clients, setClients, user, orders, setOrders, notifications, setNotifications, config, onNavigate } = props;
  const client = clients.find(c => c.id === order.clientId);
  const vehicle = client?.vehicles.find(v => v.domain === order.domain);
  const canStartWork = ["dueño", "encargado", "mecánico"].includes(user.role);
  const canFinalize = ["dueño", "encargado", "mecánico"].includes(user.role);
  const canBill = ["dueño", "admin"].includes(user.role);
  const canNotify = ["dueño", "encargado", "admin"].includes(user.role);
  const canSeePrices = user.role !== "mecánico";
  const isPureIntervention = !order.works.some(w => w.type === "Service Full" || w.type === "Service Base") && order.works.some(w => w.type === "Pastillas de Freno" || w.type === "Tren Delantero" || w.type === "Tren Trasero");
  const isBatteryOrder = order.works.some(w => w.type === "Baterías") && !order.works.some(w => w.type === "Service Full" || w.type === "Service Base");
  const isEscapeOrder = order.works.some(w => w.type === "Escape") && !order.works.some(w => w.type === "Service Full" || w.type === "Service Base");
  const total = order.works.reduce((s, w) => s + w.price, 0);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showFojaMenu, setShowFojaMenu] = useState(false);
  const [showDeliverPopup, setShowDeliverPopup] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [showCobrarPopup, setShowCobrarPopup] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [editWorks, setEditWorks] = useState([]);
  const [editPayments, setEditPayments] = useState([]);
  const [showAddWork, setShowAddWork] = useState(false);
  const [newWorks, setNewWorks] = useState([]);
  const [showAccPopup2, setShowAccPopup2] = useState(false);
  const [showBrakePopup2, setShowBrakePopup2] = useState(false);
  const [brakeEjes2, setBrakeEjes2] = useState({ del: false, tra: false, delPrice: "", traPrice: "" });
  const [showEscapePopup2, setShowEscapePopup2] = useState(false);
  const [showPriceError, setShowPriceError] = useState(false);
  const sc = order.status === "delivered" ? "#00C853" : order.status === "done" ? T.green : order.status === "working" ? T.orange : order.status === "inspection" ? "#9C27B0" : order.status === "budget_sent" ? "#1E88E5" : order.status === "budget_approved" ? "#00C853" : T.red;
  const statusLabel = order.status === "delivered" ? "🚗 ENTREGADO" : order.status === "done" ? "✅ FINALIZADO" : order.status === "working" ? "🟡 EN CURSO" : order.status === "inspection" ? "🔍 EN INSPECCIÓN" : order.status === "budget_sent" ? "📩 PRESUP. ENVIADO" : order.status === "budget_approved" ? "✅ APROBADO" : "🔴 ESPERANDO INICIO";

  const startWork = () => {
    setOrders(prev => prev.map(o => o.id === order.id ? {
      ...o, status: "working", assignedTo: user.name,
      startedBy: user.name, startedAt: new Date().toLocaleString("es-AR")
    } : o));
    onNavigate("serviceSheet", order);
  };

  const isSheetComplete = () => {
    if (!order.serviceSheet) return true;
    const sheet = order.serviceSheet;
    const vals = Object.entries(sheet).filter(([k]) => !k.startsWith("_"));
    return vals.every(([, d]) => d.checked || d.status || d.fluidOk || d.toggle || d.voltage || d.dtcStatus);
  };

  const finalize = () => {
    if (!isSheetComplete()) {
      onNavigate("serviceSheet", order);
      return;
    }
    const hasPendingAuth = (notifications || []).some(n => n.orderId === order.id && n.status === "pending");
    if (hasPendingAuth) {
      setShowAuthPopup(true);
      return;
    }
    doFinalize();
  };

  const doFinalize = () => {
    setShowAuthPopup(false);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "done" } : o));
  };

  const reopenOrder = () => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "working" } : o));
  };

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ ...card, padding: 24, marginBottom: 20, borderLeft: `4px solid ${sc}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: fontD, fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>{fmtD(order.domain)}</div>
            <div style={{ fontSize: 15, color: T.gray, marginTop: 4 }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
            <div style={{ fontSize: 14, color: T.grayLight, marginTop: 2 }}>Cliente: <strong style={{ color: T.white }}>{client ? `${client.name} ${client.lastName}` : "—"}</strong></div>
            {order.startedBy && (
              <div style={{ fontSize: 12, color: T.gray, marginTop: 6 }}>
                Iniciado por <strong style={{ color: T.grayLight }}>{order.startedBy}</strong> — {order.startedAt}
              </div>
            )}
          </div>
          <div style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: `${sc}20`, color: sc }}>
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Inspection indicator */}
      {order.status === "inspection" && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: 20, borderColor: "#9C27B0", display: "flex", alignItems: "center", gap: 14, background: "rgba(156,39,176,0.06)" }}>
          <div style={{ fontSize: 28 }}>🔍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#9C27B0" }}>En inspección — Presupuesto pendiente</div>
            <div style={{ fontSize: 12, color: T.gray }}>Motivo: <strong>{order.budgetCategory}</strong></div>
            {order.budgetNote && <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>"{order.budgetNote}"</div>}
          </div>
        </div>
      )}

      {/* Budget sent indicator */}
      {order.status === "budget_sent" && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: 20, borderColor: "#1E88E5", background: "rgba(30,136,229,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 28 }}>📩</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1E88E5" }}>Presupuesto enviado — Esperando aprobación</div>
              <div style={{ fontSize: 12, color: T.gray }}>Total: <strong style={{ color: T.accent }}>{fmt(order.works.reduce((s, w) => s + (parseFloat(w.price) || 0), 0))}</strong></div>
            </div>
          </div>
          {order.works[0]?.trenItems && (
            <div style={{ padding: "8px 12px", background: T.bg, borderRadius: 8, fontSize: 12 }}>
              {order.works[0].trenItems.filter(x => x.isCustom ? x.label : x.selected).map((ti, k) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ color: T.text }}>{ti.isCustom ? ti.label : (ti.otroDesc ? ti.label + " (" + ti.otroDesc + ")" : ti.label)}</span>
                  <span style={{ fontWeight: 700, color: "#9C27B0" }}>{fmt(parseFloat(ti.price) || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BIG START WORK BUTTON for pending orders */}
      {order.status === "pending" && canStartWork && (
        <div onClick={startWork}
          style={{
            ...card, padding: "28px 24px", marginBottom: 20, cursor: "pointer", textAlign: "center",
            background: "rgba(30,136,229,0.08)", borderColor: T.accent, borderWidth: 2, borderStyle: "dashed",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(30,136,229,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(30,136,229,0.08)"; e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>▶️</div>
          <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 700, color: T.accent, letterSpacing: .5 }}>INICIAR TRABAJO</div>
          <div style={{ fontSize: 13, color: T.gray, marginTop: 6 }}>Se asignará a: <strong style={{ color: T.white }}>{user.name}</strong></div>
        </div>
      )}

      {/* Working indicator */}
      {order.status === "working" && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: 20, borderColor: T.orange, display: "flex", alignItems: "center", gap: 14, background: "rgba(255,152,0,0.06)" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.orange, animation: "pulse 1.5s infinite", boxShadow: `0 0 12px ${T.orange}` }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.orange }}>Trabajo en curso</div>
            <div style={{ fontSize: 12, color: T.gray }}>{order.assignedTo} está trabajando en este vehículo</div>
          </div>
        </div>
      )}

      {/* Delivered indicator */}
      {order.status === "delivered" && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: 20, borderColor: "#00C853", display: "flex", alignItems: "center", gap: 14, background: "rgba(0,200,83,0.06)" }}>
          <div style={{ fontSize: 28 }}>🚗</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#00C853" }}>Vehículo entregado al cliente</div>
            {order.deliveredAt && <div style={{ fontSize: 12, color: T.gray }}>Entregado: {order.deliveredAt}</div>}
          </div>
        </div>
      )}

      {/* Works */}
      <div style={{ ...card, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, fontFamily: fontD }}>TRABAJOS</div>
        {order.works.map((w, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < order.works.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{w.type}{w.escapeType ? (w.escapeType === "deportivo" ? " — Deportivo" : " — Original") : ""}</div>
                {w.desc && !w.trenItems && <div style={{ fontSize: 12, color: T.gray }}>{w.desc}</div>}
              </div>
              {canSeePrices && <div style={{ fontWeight: 700, color: T.accent }}>{fmt(w.price)}</div>}
            </div>
            {w.trenItems && w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).length > 0 && (
              <div style={{ paddingLeft: 12, marginTop: 6 }}>
                {w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).map((ti, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
                    <span style={{ fontSize: 12, color: T.grayLight }}>• {ti.isCustom ? ti.label : ti.label}{ti.side && ti.side !== "ambos" ? ` (${ti.side === "izq" ? "Izq" : "Der"})` : ""}{ti.otroDesc ? ` — ${ti.otroDesc}` : ""}</span>
                    {canSeePrices && ti.price && <span style={{ fontSize: 11, color: T.gray, fontFamily: fontD }}>{fmt(parseFloat(ti.price) || 0)}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {canSeePrices && (
          <>
            <div style={{ height: 1, background: T.border, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              <span>TOTAL</span><span style={{ color: T.accent }}>{fmt(total)}</span>
            </div>
            <div style={{ padding: "10px 12px", background: T.bg, borderRadius: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
                <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(total * config.ivaRate / 100)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: T.gray }}>Total con IVA</span>
                <span style={{ fontWeight: 700, color: T.accent }}>{fmt(total * (1 + config.ivaRate / 100))}</span>
              </div>
              <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total * (1 + config.surcharge3 / 100) / 3)} c/u</span>
                  <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total * (1 + config.surcharge3 / 100))}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total * (1 + config.surcharge6 / 100) / 6)} c/u</span>
                  <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total * (1 + config.surcharge6 / 100))}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Auth status banner */}
      {(() => {
        const authNotif = (notifications || []).find(n => n.orderId === order.id);
        if (!authNotif) return null;
        const isApproved = authNotif.status === "approved";
        const isDenied = authNotif.status === "denied";
        const isPending = authNotif.status === "pending";
        const color = isApproved ? T.green : isDenied ? T.red : T.orange;
        const label = isApproved ? "✅ AUTORIZACIÓN APROBADA" : isDenied ? "❌ AUTORIZACIÓN DENEGADA" : "⏳ PENDIENTE DE AUTORIZACIÓN";
        return (
          <div style={{ ...card, padding: "14px 20px", marginBottom: 16, borderLeft: `4px solid ${color}`, background: `${color}08` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color }}>{label}</div>
              {isPending && (user.role === "dueño" || user.role === "encargado") && (
                <button onClick={() => onNavigate("authManage", order)} style={{ ...btnPrimary(color), fontSize: 12, padding: "8px 16px" }}>Gestionar</button>
              )}
            </div>
            {authNotif.items && <div style={{ marginTop: 6, fontSize: 12, color: T.grayLight }}>{authNotif.items.map(it => it.label).join(", ")}</div>}
          </div>
        );
      })()}

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[
          ...(order.status === "inspection" && canStartWork ? [{ icon: "🔍", label: "Realizar Inspección", show: true, color: "#9C27B0", action: () => onNavigate("inspection", order), bg: "rgba(156,39,176,.08)" }] : []),
          ...(order.status === "budget_sent" ? [{ icon: "✅", label: "Aprobar Presupuesto", show: canSeePrices, color: T.green, action: () => {
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "pending" } : o));
          }, bg: "rgba(67,160,71,.08)" }] : []),
          ...(order.status === "budget_sent" ? [{ icon: "❌", label: "Rechazar Presupuesto", show: canSeePrices, color: T.red, action: () => {
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "rejected" } : o));
          }, bg: "rgba(229,57,53,.08)" }] : []),
          ...(order.status === "working" && canStartWork ? [{ icon: "📋", label: "Comenzar Trabajo", show: true, color: T.accent, action: () => onNavigate("serviceSheet", order), bg: "rgba(30,136,229,.08)" }] : []),
          ...((order.status === "done" || order.status === "delivered") && order.serviceSheet ? [{ icon: "📋", label: "Ver Foja de Servicio", show: false, color: T.accent, action: () => onNavigate("serviceSheet", order), bg: "rgba(30,136,229,.08)" }] : []),
          { icon: "✏️", label: "Editar Orden", show: order.status !== "done" && order.status !== "delivered" && canSeePrices, color: T.accent, action: () => {
            setEditClient({ name: client?.name || "", lastName: client?.lastName || "", phone: client?.phone || "", dni: client?.dni || "", cuit: client?.cuit || "" });
            setEditWorks(order.works.map(w => ({ ...w, price: String(w.price) }))); setEditPayments((order.payments || []).map(p => ({ ...p })));
            setShowEditOrder(true);
          }, bg: "rgba(30,136,229,.08)" },
          { icon: "➕", label: "Agregar Trabajo", show: order.status !== "done" && order.status !== "delivered" && canSeePrices, color: T.accent, action: () => {
            setNewWorks([]);
            setShowAddWork(true);
          }, bg: "rgba(30,136,229,.08)" },
          { icon: "💬", label: "Contactar Cliente", show: user.role !== "mecánico", color: T.accent, action: () => {
            const phone = client?.phone || "";
            window.open("https://wa.me/549" + phone, "_blank");
          }, bg: "rgba(30,136,229,.08)" },
          ...((order.status === "done" || order.status === "delivered") && (order.serviceSheet || isPureIntervention || isBatteryOrder || isEscapeOrder) ? [{ icon: "📑", label: "Fojas", show: true, color: T.accent, action: () => setShowFojaMenu(true), bg: "rgba(30,136,229,.08)" }] : []),
          ...(canFinalize && order.status === "working" ? [{ icon: "✅", label: "Finalizar Orden", show: true, color: T.green, action: finalize, bg: "rgba(67,160,71,.08)" }] : []),
          ...(canNotify && order.status === "done" && !order.clientNotified ? [{ icon: "📱", label: "Avisar al Cliente", show: true, color: T.green, action: () => {
            setShowNotifyPopup(true);
          }, bg: "rgba(67,160,71,.08)" }] : []),
          ...(canBill && order.status === "done" ? [{ icon: "📄", label: "Facturar", show: true, color: T.accent, bg: "rgba(30,136,229,.08)" }] : []),
          ...(order.status === "done" ? [{ icon: "🔄", label: "Reabrir Orden", show: true, color: T.orange, action: reopenOrder, bg: "rgba(255,152,0,.08)" }] : []),
          ...(order.status === "done" ? [{ icon: "🚗", label: "Entregado", show: true, color: "#00C853", action: () => { if (!order.cobrado) { setShowCobrarPopup(true); return; } setShowDeliverPopup(true); }, bg: "rgba(0,200,83,.08)" }] : []),
          ...(user.role === "dueño" && order.status !== "delivered" ? [{ icon: "🗑️", label: "Cancelar Orden", show: true, color: T.red, action: () => { setCancelStep(1); setShowCancelPopup(true); }, bg: "rgba(229,57,53,.08)" }] : []),
        ].filter(x => x.show).map((a, i) => (
          <div key={i} onClick={a.action || (() => {})}
            style={{ ...card, padding: 16, cursor: "pointer", textAlign: "center", background: a.bg || T.bg2, transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color || T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: a.color === T.green ? T.green : a.color === T.accent ? T.accent : T.white }}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* Pending auth popup */}
            {/* Deliver popup */}
      {showAddWork && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowAddWork(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 540, width: "95%", maxHeight: "85vh", overflowY: "auto", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>➕ Agregar Trabajo</div>

            {/* Work type grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
              {WORK_TYPES.map((wt, idx) => {
                if (wt.isGroup) {
                  const anyAdded = wt.subItems.some(s => order.works.some(w => w.type === s.name) || newWorks.some(w => w.type === s.name));
                  const allAdded = wt.subItems.every(s => order.works.some(w => w.type === s.name) || newWorks.some(w => w.type === s.name));
                  return (
                    <div key={idx} onClick={() => { if (!allAdded) setShowAccPopup2(true); }}
                      style={{ ...card, padding: "12px 6px", cursor: allAdded ? "default" : "pointer", textAlign: "center", borderColor: anyAdded ? T.accent : T.border, background: anyAdded ? "rgba(30,136,229,0.12)" : T.bg2, opacity: allAdded ? 0.5 : 1, transition: "all .2s" }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{wt.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2 }}>{wt.name}</div>
                      {anyAdded && <div style={{ fontSize: 8, color: T.accent, marginTop: 2 }}>{[...order.works, ...newWorks].filter(w => wt.subItems.some(s => s.name === w.type)).length}x</div>}
                    </div>
                  );
                }
                const existInOrder = order.works.some(w => w.type === wt.name);
                const existInNew = newWorks.some(w => w.type === wt.name);
                const isBlocked = (wt.name === "Service Full" || wt.name === "Service Base") && (existInOrder || existInNew);
                const isAdded = existInOrder || existInNew;
                return (
                  <div key={idx} onClick={() => {
                      if (isBlocked) return;
                      if (wt.name === "Pastillas de Freno") {
                        setShowBrakePopup2(true);
                        setBrakeEjes2({ del: false, tra: false, delPrice: "", traPrice: "" });
                      } else if (wt.name === "Escape") {
                        setShowEscapePopup2(true);
                      } else if (BUDGET_CATEGORIES[wt.name] || FREE_CATEGORIES.includes(wt.name)) {
                        if (existInOrder || existInNew) {
                          setNewWorks(w => [...w, { type: wt.name, price: 0, desc: "", trenItems: buildTrenItems(wt.name), _mergeWith: wt.name }]);
                        } else {
                          setNewWorks(w => [...w, { type: wt.name, price: 0, desc: "", trenItems: buildTrenItems(wt.name) }]);
                        }
                      } else {
                        if (!existInOrder && !existInNew) {
                          setNewWorks(w => [...w, { type: wt.name, price: "", desc: "" }]);
                        }
                      }
                  }} style={{ ...card, padding: "12px 6px", cursor: isBlocked ? "default" : "pointer", textAlign: "center", borderColor: isAdded ? T.accent : T.border, background: isAdded ? "rgba(30,136,229,0.12)" : T.bg2, opacity: isBlocked ? 0.5 : 1, transition: "all .2s" }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{wt.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.2 }}>{wt.name}</div>
                    {isBlocked && <div style={{ fontSize: 8, color: T.accent, marginTop: 2 }}>✓ Agregado</div>}
                    {isAdded && !isBlocked && <div style={{ fontSize: 8, color: T.green, marginTop: 2 }}>+ Agregar más</div>}
                  </div>
                );
              })}
            </div>

            {/* Accessory sub-popup */}
            {showAccPopup2 && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }} onClick={() => setShowAccPopup2(false)}>
                <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 360, width: "85%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 36, textAlign: "center", marginBottom: 6 }}>🧰</div>
                  <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>Accesorios</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {WORK_TYPES.find(t => t.isGroup)?.subItems.map((sub, idx) => {
                      const isAdded = order.works.some(w => w.type === sub.name) || newWorks.some(w => w.type === sub.name);
                      return (
                        <div key={idx} onClick={() => {
                          if (!isAdded) {
                            setNewWorks(w => [...w, SIMPLE_WORK_TYPES.includes(sub.name) ? { type: sub.name, price: "", desc: "" } : { type: sub.name, price: 0, desc: "", trenItems: buildTrenItems(sub.name) }]);
                            setShowAccPopup2(false);
                          }
                        }} style={{ ...card, padding: 14, cursor: isAdded ? "default" : "pointer", textAlign: "center", borderColor: isAdded ? T.accent : T.border, background: isAdded ? "rgba(30,136,229,0.12)" : T.bg2, opacity: isAdded ? 0.6 : 1 }}>
                          <div style={{ fontSize: 28, marginBottom: 4 }}>{sub.icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{sub.name}</div>
                          {isAdded && <div style={{ fontSize: 8, color: T.accent, marginTop: 2 }}>✓ Agregado</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Brake popup for add work */}
            {showBrakePopup2 && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }} onClick={() => setShowBrakePopup2(false)}>
                <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 360, width: "85%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 36, textAlign: "center", marginBottom: 6 }}>🛞</div>
                  <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>Pastillas de Freno</div>
                  <div style={{ fontSize: 13, color: T.gray, textAlign: "center", marginBottom: 16 }}>¿Qué eje?</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[{ k: "del", l: "Eje Delantero" }, { k: "tra", l: "Eje Trasero" }, { k: "ambos", l: "Ambos Ejes" }].map(opt => (
                      <div key={opt.k} onClick={() => {
                        const desc = opt.k === "ambos" ? "Delanteras y Traseras" : opt.k === "del" ? "Delanteras" : "Traseras";
                        const ejes = { del: opt.k === "del" || opt.k === "ambos", tra: opt.k === "tra" || opt.k === "ambos" };
                        setNewWorks(w => [...w, { type: "Pastillas de Freno", price: "", desc, brakeEjes: ejes }]);
                        setShowBrakePopup2(false);
                      }} style={{ ...card, padding: 14, cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 700 }}>
                        {opt.l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Escape popup for add work */}
            {showEscapePopup2 && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }} onClick={() => setShowEscapePopup2(false)}>
                <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 360, width: "85%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 36, textAlign: "center", marginBottom: 6 }}>💨</div>
                  <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 14 }}>Sistema de Escape</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div onClick={() => {
                      setNewWorks(w => [...w, { type: "Escape", price: 0, desc: "Sistema Original", escapeType: "original", trenItems: buildTrenItems("Escape") }]);
                      setShowEscapePopup2(false);
                    }} style={{ ...card, flex: 1, padding: 20, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🔧</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Original</div>
                    </div>
                    <div onClick={() => {
                      setNewWorks(w => [...w, { type: "Escape", price: 0, desc: "Escape Deportivo", escapeType: "deportivo", trenItems: buildTrenItems("Escape Deportivo") }]);
                      setShowEscapePopup2(false);
                    }} style={{ ...card, flex: 1, padding: 20, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🏎️</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Deportivo</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New works added */}
            {newWorks.map((w, i) => (
              <div key={i} style={{ ...card, padding: 12, marginBottom: 8, borderLeft: `3px solid ${T.accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{findWorkType(w.type)?.icon} {w.type}</span>
                  <span onClick={() => setNewWorks(prev => prev.filter((_, j) => j !== i))} style={{ color: T.red, cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(229,57,53,0.08)" }}>✕ Quitar</span>
                </div>
                {w.trenItems ? (
                  <div>
                    {w.trenItems.map((ti, j) => (
                      <div key={j} style={{ padding: "6px 8px", marginBottom: 3, background: ti.isCustom ? (ti.label ? "rgba(30,136,229,0.06)" : T.bg) : (ti.selected ? "rgba(30,136,229,0.06)" : T.bg), borderRadius: 6, border: `1px solid ${(ti.isCustom ? (ti.label || ti.price) : ti.selected) ? T.accent : T.border}`, fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {!ti.isCustom && (
                          <div onClick={() => {
                            const nw = [...newWorks];
                            const items = [...nw[i].trenItems];
                            items[j] = { ...items[j], selected: !items[j].selected };
                            const tot = items.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                            nw[i] = { ...nw[i], trenItems: items, price: tot };
                            setNewWorks(nw);
                          }} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${ti.selected ? T.accent : T.border}`, background: ti.selected ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            {ti.selected && <span style={{ color: "#FFF", fontSize: 11, fontWeight: 800 }}>✓</span>}
                          </div>
                        )}
                        {ti.isCustom ? (
                          <input value={ti.label || ""} onChange={e => {
                            const nw = [...newWorks]; const items = [...nw[i].trenItems];
                            items[j] = { ...items[j], label: e.target.value };
                            nw[i] = { ...nw[i], trenItems: items };
                            setNewWorks(nw);
                          }} placeholder="Describir..." style={{ ...inputStyle, flex: 1, fontSize: 11, padding: "3px 6px" }} />
                        ) : (
                          <span style={{ flex: 1, fontWeight: 600, color: ti.selected ? T.accent : T.text }}>{ti.label}</span>
                        )}
                        {(ti.isCustom || ti.selected) && (
                          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <span style={{ fontSize: 10, color: T.accent, fontWeight: 700 }}>$</span>
                            <input type="text" value={ti.price ? Number(ti.price).toLocaleString("es-AR") : ""} onChange={e => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              const nw = [...newWorks]; const items = [...nw[i].trenItems];
                              items[j] = { ...items[j], price: raw };
                              const tot = items.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                              nw[i] = { ...nw[i], trenItems: items, price: tot };
                              setNewWorks(nw);
                            }} placeholder="0" style={{ ...inputStyle, width: 70, fontSize: 12, fontWeight: 700, fontFamily: fontD, padding: "3px 6px", textAlign: "right" }} />
                          </div>
                        )}
                        </div>
                        {ti.selected && !ti.isCustom && ti.key !== "otro" && ti.key !== "alineado" && ti.key !== "balanceado" && ti.key !== "rotacion" && w.type.includes("Tren") && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, paddingLeft: 28 }}>
                            <span style={{ fontSize: 10, color: T.grayLight, fontWeight: 700 }}>LADO:</span>
                            {[{ k: "izq", l: "Izq" }, { k: "der", l: "Der" }, { k: "ambos", l: "Ambos" }].map(s => {
                              const active = (ti.side || "ambos") === s.k;
                              return (
                                <div key={s.k} onClick={(e) => {
                                  e.stopPropagation();
                                  const nw = [...newWorks]; const items = [...nw[i].trenItems];
                                  items[j] = { ...items[j], side: s.k };
                                  nw[i] = { ...nw[i], trenItems: items };
                                  setNewWorks(nw);
                                }} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer", border: `2px solid ${active ? T.accent : T.border}`, background: active ? T.accent : "transparent", color: active ? "#FFF" : T.gray, transition: "all .15s" }}>
                                  {s.l}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    <div onClick={() => {
                      const nw = [...newWorks]; const items = [...nw[i].trenItems, { key: `libre_${Date.now()}`, label: "", selected: false, price: "", isCustom: true }];
                      nw[i] = { ...nw[i], trenItems: items };
                      setNewWorks(nw);
                    }} style={{ padding: "5px 8px", borderRadius: 6, border: `1px dashed ${T.border}`, textAlign: "center", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.accent, marginTop: 4 }}>+ Agregar item</div>
                    {(parseFloat(w.price) || 0) > 0 && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "6px 8px", background: T.bg, borderRadius: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>Total</span>
                      <span style={{ fontWeight: 800, color: T.accent, fontFamily: fontD }}>{fmt(parseFloat(w.price) || 0)}</span>
                    </div>}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={labelStyle}>Precio</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <span style={{ fontSize: 14, color: T.accent, fontWeight: 700 }}>$</span>
                        <input value={w.price ? Number(w.price).toLocaleString("es-AR") : ""} onChange={e => {
                          setNewWorks(prev => prev.map((x, j) => j === i ? { ...x, price: e.target.value.replace(/[^0-9]/g, "") } : x));
                        }} style={{ ...inputStyle, fontWeight: 700, fontFamily: fontD }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Descripción</label>
                      <input value={w.desc || ""} onChange={e => {
                        setNewWorks(prev => prev.map((x, j) => j === i ? { ...x, desc: e.target.value } : x));
                      }} placeholder="Detalle..." style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {newWorks.length === 0 && <div style={{ textAlign: "center", padding: 20, color: T.gray, fontSize: 13 }}>Tocá un ícono para agregar un trabajo</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAddWork(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => {
                const hasItemsSelected = newWorks.some(w => w.trenItems ? w.trenItems.some(ti => ti.isCustom ? ti.label : ti.selected) : true);
                const missingPrice = newWorks.some(w => {
                  if (w.trenItems) {
                    return w.trenItems.some(ti => (ti.isCustom ? (ti.label && !ti.price) : (ti.selected && !ti.price)));
                  }
                  return !w.price || parseFloat(w.price) === 0;
                });
                if (missingPrice) { setShowPriceError(true); return; }
                const validWorks = newWorks.filter(w => parseFloat(w.price) > 0 || (w.trenItems && w.trenItems.some(ti => ti.selected && parseFloat(ti.price) > 0)));
                if (validWorks.length > 0) {
                  setOrders(prev => prev.map(o => {
                    if (o.id !== order.id) return o;
                    let updatedWorks = [...o.works];
                    validWorks.forEach(nw => {
                      const existIdx = updatedWorks.findIndex(ew => ew.type === nw.type && nw._mergeWith);
                      if (existIdx >= 0 && nw.trenItems) {
                        const existing = updatedWorks[existIdx];
                        const merged = existing.trenItems ? [...existing.trenItems] : [];
                        nw.trenItems.filter(ti => ti.selected || (ti.isCustom && ti.label)).forEach(newItem => {
                          const existItem = merged.findIndex(m => m.key === newItem.key && !m.isCustom);
                          if (existItem >= 0) {
                            merged[existItem] = { ...merged[existItem], selected: true, price: newItem.price || merged[existItem].price, side: newItem.side || merged[existItem].side };
                          } else if (newItem.isCustom && newItem.label) {
                            merged.push(newItem);
                          }
                        });
                        const newTotal = merged.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
                        const newDesc = merged.filter(x => x.isCustom ? x.label : x.selected).map(x => x.label).join(", ");
                        updatedWorks[existIdx] = { ...existing, trenItems: merged, price: newTotal, desc: newDesc };
                      } else {
                        updatedWorks.push({ ...nw, price: parseFloat(nw.price) || 0 });
                      }
                    });
                    return { ...o, works: updatedWorks };
                  }));
                }
                setShowAddWork(false);
              }} disabled={newWorks.length === 0} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13, opacity: newWorks.length > 0 ? 1 : 0.4 }}>💾 Agregar {newWorks.length > 0 ? `(${newWorks.length})` : ""}</button>
            </div>
          </div>
        </div>
      )}

      {showPriceError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowPriceError(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 340, width: "85%", border: `1px solid ${T.red}30`, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, color: T.red, marginBottom: 8 }}>Precio requerido</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>Ingresá el precio en todos los items seleccionados para continuar.</div>
            <button onClick={() => setShowPriceError(false)} style={{ ...btnPrimary(T.accent), width: "100%", fontSize: 14 }}>Entendido</button>
          </div>
        </div>
      )}

      {showEditOrder && editClient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowEditOrder(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 540, width: "95%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>✏️ Editar Orden — {fmtD(order.domain)}</div>

            {/* Client data */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>👤 Datos del Cliente</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div><label style={labelStyle}>Nombre</label><input value={editClient.name} onChange={e => setEditClient(p => ({ ...p, name: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Apellido</label><input value={editClient.lastName} onChange={e => setEditClient(p => ({ ...p, lastName: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Teléfono</label><input inputMode="numeric" value={editClient.phone} onChange={e => setEditClient(p => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>DNI</label><input inputMode="numeric" value={editClient.dni || ""} onChange={e => setEditClient(p => ({ ...p, dni: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div>
            </div>

            {/* Works */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>🔧 Trabajos</div>
            {editWorks.map((w, i) => (
              <div key={i} style={{ ...card, padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{w.type}{w.desc ? " — " + w.desc : ""}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>$</span>
                      <input inputMode="numeric" value={w.price ? String(w.price) : ""} onChange={e => setEditWorks(ws => ws.map((x, j) => j === i ? { ...x, price: e.target.value.replace(/[^0-9]/g, "") } : x))}
                        style={{ ...inputStyle, width: 90, fontSize: 14, fontWeight: 700, fontFamily: fontD, textAlign: "right", padding: "8px 10px" }} />
                    </div>
                    {editWorks.length > 1 && (
                      <div onClick={() => setEditWorks(ws => ws.filter((_, j) => j !== i))}
                        style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.red, fontSize: 16, borderRadius: 6, background: "rgba(229,57,53,0.08)", border: `1px solid ${T.red}30` }}>✕</div>
                    )}
                  </div>
                </div>
                {w.trenItems && w.trenItems.filter(ti => ti.selected).length > 0 && (
                  <div style={{ paddingLeft: 10 }}>
                    {w.trenItems.filter(ti => ti.selected).map((ti, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.grayLight, padding: "2px 0" }}>
                        <span>• {ti.label}</span>
                        <span>{ti.price ? fmt(parseFloat(ti.price)) : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 14, fontWeight: 700, color: T.accent, fontFamily: fontD, marginBottom: 16 }}>
              Total: {fmt(editWorks.reduce((s, w) => s + (parseFloat(w.price) || 0), 0))}
            </div>

            {/* Payments */}
            <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>💳 Método de Pago</div>
            {(editPayments || []).map((pm, i) => (
              <div key={i} style={{ ...card, padding: 12, marginBottom: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                  <div><label style={labelStyle}>Método</label>
                    <select value={pm.method || ""} onChange={e => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, method: e.target.value } : p))} style={inputStyle}>
                      <option value="">Seleccionar</option>
                      <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Cuenta Corriente</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Monto</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>$</span>
                      <input inputMode="numeric" value={pm.amount ? String(pm.amount) : ""} onChange={e => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, amount: e.target.value.replace(/[^0-9]/g, "") } : p))}
                        style={{ ...inputStyle, fontWeight: 700, fontFamily: fontD }} />
                    </div>
                  </div>
                </div>
                {pm.method === "Transferencia" && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {[{ a: "1", l: "Cuenta 1 — Con IVA" }, { a: "2", l: "Cuenta 2 — Sin IVA" }].map(opt => (
                      <div key={opt.a} onClick={() => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, account: opt.a, withIva: opt.a === "1", invoiceType: opt.a === "2" ? "C" : p.invoiceType } : p))}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.account === opt.a ? T.accent : T.border}`, color: pm.account === opt.a ? T.accent : T.gray, background: pm.account === opt.a ? `${T.accent}15` : T.bg }}>{opt.l}</div>
                    ))}
                  </div>
                )}
                {(pm.method === "Efectivo" || pm.method === "Tarjeta") && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div onClick={() => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, withIva: true } : p))}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.withIva === true ? T.accent : T.border}`, color: pm.withIva === true ? T.accent : T.gray }}>Con IVA</div>
                    <div onClick={() => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, withIva: false } : p))}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.withIva === false ? T.accent : T.border}`, color: pm.withIva === false ? T.accent : T.gray }}>Sin IVA</div>
                  </div>
                )}
                {pm.withIva && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {["A", "B", "C"].map(ft => (
                      <div key={ft} onClick={() => setEditPayments(ps => ps.map((p, j) => j === i ? { ...p, invoiceType: ft } : p))}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 700, border: `2px solid ${pm.invoiceType === ft ? T.accent : T.border}`, color: pm.invoiceType === ft ? T.accent : T.gray }}>Fact. {ft}</div>
                    ))}
                  </div>
                )}
                {(editPayments || []).length > 1 && (
                  <div onClick={() => setEditPayments(ps => ps.filter((_, j) => j !== i))}
                    style={{ marginTop: 8, fontSize: 12, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Quitar este pago</div>
                )}
              </div>
            ))}
            <button onClick={() => setEditPayments(ps => [...(ps || []), { method: "", amount: "", account: "", withIva: null, invoiceType: "" }])}
              style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 12, marginBottom: 16, color: T.orange }}>+ Agregar otro método de pago</button>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEditOrder(false)}
                style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cancelar</button>
              <button onClick={() => {
                setClients(prev => prev.map(c => c.id === order.clientId ? { ...c, name: editClient.name, lastName: editClient.lastName, phone: editClient.phone, dni: editClient.dni } : c));
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, works: editWorks.map(w => ({ ...w, price: parseFloat(w.price) || 0 })), payments: (editPayments || []).map(p => ({ ...p, amount: parseFloat(p.amount) || 0 })) } : o));
                setShowEditOrder(false);
              }} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 13 }}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {showNotifyPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowNotifyPopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", border: `1px solid ${T.border}`, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📱</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 12, color: T.white }}>¿Notificar a <span style={{ color: T.green }}>{client?.name} {client?.lastName}</span> que su <span style={{ color: T.accent }}>{vehicle?.brand} {vehicle?.model}</span> está listo para ser retirado?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => {
                const phone = client?.phone || "";
                const name = client?.name || "cliente";
                const brand = vehicle?.brand || "";
                const model = vehicle?.model || "";
                const msg = "Hola " + name + "! Te informamos que tu " + brand + " " + model + " (" + order.domain + ") ya está *listo para retirar*. 🚗\n\n¡Te esperamos en *CarBoys*!";
                window.open("https://wa.me/549" + phone + "?text=" + encodeURIComponent(msg), "_blank");
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, clientNotified: true } : o));
                setShowNotifyPopup(false);
              }} style={{ ...btnPrimary(T.green), flex: 1, fontSize: 13 }}>📱 Enviar WhatsApp</button>
              <button onClick={() => {
                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, clientNotified: true } : o));
                setShowNotifyPopup(false);
              }} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      
      {showCobrarPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }} onClick={() => setShowCobrarPopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", border: `1px solid ${T.orange}40`, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 10, color: T.orange }}>Cobro pendiente</div>
            <div style={{ fontSize: 14, color: T.grayLight, marginBottom: 20, lineHeight: 1.5 }}>
              Este vehículo aún no fue cobrado. Realizá el cobro antes de entregar.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowCobrarPopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>Cerrar</button>
              <button onClick={() => { setShowCobrarPopup(false); onNavigate("admin"); }} style={{ ...btnPrimary(T.orange), flex: 1, fontSize: 13 }}>🧾 Ir a Cobros</button>
            </div>
          </div>
        </div>
      )}

      {showDeliverPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}
          onClick={() => setShowDeliverPopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 360, width: "90%", border: `1px solid ${T.border}` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 8 }}>🚗</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Confirmar Entrega</div>
            <div style={{ fontSize: 13, color: T.gray, textAlign: "center", marginBottom: 20 }}>El vehículo será marcado como entregado y ya no aparecerá en el taller.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowDeliverPopup(false); setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "delivered", deliveredAt: new Date().toLocaleString("es-AR") } : o)); onNavigate("workshop"); }}
                style={{ ...btnPrimary("#00C853"), fontSize: 15, padding: "14px 0" }}>
                Confirmar Entrega
              </button>
              <button onClick={() => setShowDeliverPopup(false)}
                style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, padding: "10px 0" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foja menu popup */}
      {showCancelPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}
          onClick={() => setShowCancelPopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.red}40` }}
            onClick={e => e.stopPropagation()}>
            {cancelStep === 1 ? (
              <>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 10 }}>⚠️</div>
                <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8, color: T.red }}>Cancelar Orden de Trabajo</div>
                <div style={{ fontSize: 13, color: T.gray, textAlign: "center", marginBottom: 6 }}>
                  Estás por cancelar la orden del vehículo
                </div>
                <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, textAlign: "center", color: T.accent, marginBottom: 6 }}>{fmtD(order.domain)}</div>
                <div style={{ fontSize: 12, color: T.grayLight, textAlign: "center", marginBottom: 20 }}>
                  {order.works.map(w => w.type).join(", ")}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowCancelPopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>No, volver</button>
                  <button onClick={() => setCancelStep(2)} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>Sí, cancelar orden</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, textAlign: "center", marginBottom: 10 }}>🗑️</div>
                <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8, color: T.red }}>¿Estás seguro?</div>
                <div style={{ fontSize: 13, color: T.gray, textAlign: "center", marginBottom: 8, lineHeight: 1.5 }}>
                  Esta acción <strong style={{ color: T.red }}>eliminará permanentemente</strong> la orden de trabajo de <strong>{fmtD(order.domain)}</strong>.
                </div>
                <div style={{ fontSize: 12, color: T.red, textAlign: "center", marginBottom: 20, fontWeight: 600 }}>No se podrá recuperar.</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowCancelPopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>No, conservar</button>
                  <button onClick={() => {
                    setShowCancelPopup(false);
                    setOrders(prev => prev.filter(o => o.id !== order.id));
                    onNavigate("workshop");
                  }} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 13 }}>🗑️ Eliminar definitivamente</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showFojaMenu && (() => {
        const fojas = [];
        const hasServiceFull = order.works.some(w => w.type === "Service Full");
        const hasServiceBase = order.works.some(w => w.type === "Service Base");
        const hasTren = order.works.some(w => w.type === "Tren Delantero" || w.type === "Tren Trasero" || w.type === "Pastillas de Freno");
        const hasBattery = order.works.some(w => w.type === "Baterías");
        const hasEscape = order.works.some(w => w.type === "Escape");

        if (hasServiceFull || hasServiceBase) fojas.push({ icon: "🛠️", label: hasServiceFull ? "Foja de Service Full" : "Foja de Service Base", key: "service" });
        if (hasTren) fojas.push({ icon: "⚙️", label: "Informe de Intervención", key: "intervention" });
        if (hasBattery) fojas.push({ icon: "🔋", label: "Foja de Batería", key: "battery" });
        if (hasEscape) fojas.push({ icon: "💨", label: "Foja de Escape", key: "escape" });

        const cl = client;
        const v = vehicle;

        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}
          onClick={() => setShowFojaMenu(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>📑</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>Fojas disponibles</div>
            <div style={{ fontSize: 12, color: T.gray, textAlign: "center", marginBottom: 16 }}>{fmtD(order.domain)} — {v?.brand} {v?.model}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {fojas.map(f => (
                <div key={f.key} style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowFojaMenu(false); onNavigate("fojaClient", { ...order, _fojaType: f.key }); }}
                    style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{f.icon}</span> {f.label}
                  </button>
                  <button onClick={() => {
                    setShowFojaMenu(false);
                    const phone = cl?.phone || "";
                    const msg = `Hola ${cl?.name || ""}! Te enviamos la ${f.label.toLowerCase()} de tu ${v?.brand || ""} ${v?.model || ""} (${fmtD(order.domain)}).\n\n¡Gracias por confiar en *CarBoys*! 🔧`;
                    window.open("https://wa.me/549" + phone + "?text=" + encodeURIComponent(msg), "_blank");
                  }} style={{ ...btnPrimary(T.green), padding: "12px 14px", fontSize: 16 }}>📱</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowFojaMenu(false)}
              style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, width: "100%", fontSize: 13, padding: "10px 0" }}>
              Cerrar
            </button>
          </div>
        </div>
        );
      })()}

      {showAuthPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Autorizaciones pendientes</div>
            <div style={{ fontSize: 14, color: T.grayLight, marginBottom: 24, lineHeight: 1.5 }}>
              Tenés solicitudes de autorización que aún no fueron respondidas. ¿Deseás finalizar la orden de todos modos?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAuthPopup(false)}
                style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 14 }}>Cancelar</button>
              <button onClick={doFinalize}
                style={{ ...btnPrimary(T.orange), flex: 1, fontSize: 14 }}>Finalizar igual</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PieChart = ({ data, size = 180 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: T.gray, fontSize: 13 }}>Sin datos</div>;
  let cumulative = 0;
  const slices = data.map(d => {
    const start = cumulative;
    cumulative += d.value / total;
    return { ...d, start, end: cumulative };
  });

  const getPath = (start, end) => {
    if (end - start >= 0.9999) return `M 0 -1 A 1 1 0 1 1 -0.0001 -1 Z`;
    const s = { x: Math.sin(2 * Math.PI * start), y: -Math.cos(2 * Math.PI * start) };
    const e = { x: Math.sin(2 * Math.PI * end), y: -Math.cos(2 * Math.PI * end) };
    const large = end - start > 0.5 ? 1 : 0;
    return `M 0 0 L ${s.x} ${s.y} A 1 1 0 ${large} 1 ${e.x} ${e.y} Z`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.3))" }}>
        {slices.map((s, i) => (
          <path key={i} d={getPath(s.start, s.end)} fill={s.color} stroke={T.bg2} strokeWidth="0.02">
            <title>{s.label}: {s.value} ({(s.value/total*100).toFixed(1)}%)</title>
          </path>
        ))}
        <circle cx="0" cy="0" r="0.55" fill={T.bg2} />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill={T.white} style={{ fontSize: ".22px", fontWeight: 800, fontFamily: fontD }}>{total}</text>
        <text x="0" y=".22" textAnchor="middle" fill={T.gray} style={{ fontSize: ".1px", fontFamily: font }}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: T.grayLight }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: T.white, marginLeft: "auto" }}>{s.value}</span>
            <span style={{ color: T.gray, fontSize: 11 }}>({(s.value/total*100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminScreen = ({ orders, clients, setOrders, setClients, config, onNavigate }) => {
  const [tab, setTab] = useState("resumen");
  const [showTotalVentas, setShowTotalVentas] = useState(false);
  const [selCobro, setSelCobro] = useState(null);
  const [cobroPay, setCobroPay] = useState([]);
  const [cobroClient, setCobroClient] = useState(null);
  const [histYear, setHistYear] = useState(new Date().getFullYear());
  const [histMonth, setHistMonth] = useState(null);
  const [histDetail, setHistDetail] = useState(null);
  const [statView, setStatView] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [selProv, setSelProv] = useState(null);
  const [selServ, setSelServ] = useState(null);
  const [igGastos, setIgGastos] = useState([]);
  const [showIgGasto, setShowIgGasto] = useState(false);
  const [selIgnacio, setSelIgnacio] = useState(null);
  const [igForm, setIgForm] = useState({ categoria: "", desc: "", monto: "", fecha: new Date().toISOString().split("T")[0] });
  const holdRef = useRef(null);
  const [period, setPeriod] = useState("dia");
  const [egresos, setEgresos] = useState([]);
  const [egresoForm, setEgresoForm] = useState({ desc: "", monto: "", fecha: new Date().toISOString().split("T")[0], categoria: "", categoriaLabel: "", detalle: "" });
  const [showEgreso, setShowEgreso] = useState(false);
  const [saldoReal, setSaldoReal] = useState("");
  const [showCierre, setShowCierre] = useState(false);
  const [cierres, setCierres] = useState([]);
  const [ctaFilter, setCtaFilter] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [showProv, setShowProv] = useState(false);
  const [provForm, setProvForm] = useState({ nombre: "", rubro: "", diasPago: "30", cuit: "", tel: "" });
  const [factProv, setFactProv] = useState([]);
  const [showFactProv, setShowFactProv] = useState(false);
  const [factProvForm, setFactProvForm] = useState({ provId: "", nroFactura: "", monto: "", fechaEmision: new Date().toISOString().split("T")[0], fechaVenc: "", estado: "pendiente" });
  const [servicios, setServicios] = useState([]);
  const [showServ, setShowServ] = useState(false);
  const [servForm, setServForm] = useState({ nombre: "", desc: "", monto: "", metodo: "", vencimiento: "" });

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const startDate = period === "dia" ? today : period === "semana" ? weekAgo : monthAgo;

  const completed = orders.filter(o => o.status === "done" || o.status === "delivered");
  const periodOrders = completed.filter(o => (o.date || "") >= startDate);
  const totalVentas = periodOrders.reduce((s, o) => s + o.works.reduce((s2, w) => s2 + (w.price || 0), 0), 0);
  const totalIngresos = periodOrders.reduce((s, o) => s + (o.payments || []).reduce((s2, p) => s2 + (p.amount || 0), 0), 0);
  const periodEgresos = egresos.filter(e => e.fecha >= startDate);
  const totalEgr = periodEgresos.reduce((s, e) => s + (e.monto || 0), 0);

  const payTotals = {};
  periodOrders.forEach(o => (o.payments || []).forEach(p => { payTotals[p.method || "Sin definir"] = (payTotals[p.method || "Sin definir"] || 0) + (p.amount || 0); }));
  const payEntries = Object.entries(payTotals).sort((a, b) => b[1] - a[1]);
  const payColors = { "Efectivo": "#43a047", "Transferencia": "#1E88E5", "Tarjeta": "#9C27B0", "Cuenta Corriente": "#FF9800" };

  const ctaCte = orders.filter(o => (o.payments || []).some(p => p.method === "Cuenta Corriente"));
  const ctaFiltered = ctaFilter ? ctaCte.filter(o => { const c = clients.find(x => x.id === o.clientId); return c && (c.name + " " + c.lastName).toLowerCase().includes(ctaFilter.toLowerCase()); }) : ctaCte;
  const ctaTotal = ctaCte.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Cuenta Corriente").reduce((s2, p) => s2 + (p.amount || 0), 0), 0);

  const conFactura = periodOrders.filter(o => (o.payments || []).some(p => p.invoiceType && p.invoiceType !== ""));
  const sinFactura = periodOrders.filter(o => !(o.payments || []).some(p => p.invoiceType && p.invoiceType !== ""));
  const factA = conFactura.filter(o => (o.payments || []).some(p => p.invoiceType === "A"));
  const factB = conFactura.filter(o => (o.payments || []).some(p => p.invoiceType === "B"));
  const factC = conFactura.filter(o => (o.payments || []).some(p => p.invoiceType === "C"));

  const provVencidas = factProv.filter(f => f.estado === "pendiente" && f.fechaVenc && f.fechaVenc < today);
  const provPorVencer = factProv.filter(f => f.estado === "pendiente" && f.fechaVenc && f.fechaVenc >= today && f.fechaVenc <= new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);

  const workStats = {};
  completed.forEach(o => o.works.forEach(w => { workStats[w.type] = (workStats[w.type] || 0) + 1; }));
  const topWorks = Object.entries(workStats).sort((a, b) => b[1] - a[1]);
  const clientStats = {};
  completed.forEach(o => { clientStats[o.clientId] = (clientStats[o.clientId] || 0) + 1; });
  const topClients = Object.entries(clientStats).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, cnt]) => { const c = clients.find(x => x.id === parseInt(id)); return { name: c ? c.name + " " + c.lastName : "—", count: cnt }; });

  const PB = (k, l) => <div key={k} onClick={() => setPeriod(k)} style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, background: period === k ? T.accent : T.bg, color: period === k ? "#fff" : T.gray, border: `1px solid ${period === k ? T.accent : T.border}` }}>{l}</div>;

  const TABS = [
    { key: "resumen", icon: "📊", l: "Resumen" },
    { key: "cobros", icon: "🧾", l: "Cobros" },
    { key: "caja", icon: "📒", l: "Caja" },
    { key: "facturas", icon: "🧾", l: "Facturación" },
    { key: "historial", icon: "📚", l: "Historial" },
    { key: "stats", icon: "📈", l: "Estadísticas" },
    { key: "ctacte", icon: "💰", l: "Cta. Cte." },
    { key: "proveedores", icon: "📦", l: "Proveedores" },
    { key: "servicios", icon: "🔧", l: "Servicios" },
    { key: "ignacio", icon: "👑", l: "Ignacio" },
  ];

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800 }}>📊 Administración</div>
        <button onClick={() => onNavigate("dashboard")} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13 }}>← Volver</button>
      </div>

      {/* Alertas */}
      {provVencidas.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16, borderColor: T.red, background: "rgba(229,57,53,0.06)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.red }}>🚨 {provVencidas.length} factura{provVencidas.length !== 1 ? "s" : ""} de proveedores vencida{provVencidas.length !== 1 ? "s" : ""}</div>
        </div>
      )}
      {provPorVencer.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16, borderColor: T.orange, background: "rgba(255,152,0,0.06)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.orange }}>⚠️ {provPorVencer.length} factura{provPorVencer.length !== 1 ? "s" : ""} por vencer esta semana</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <div key={t.key} onClick={() => { setTab(t.key); setSelCobro(null); setCobroPay([]); setCobroClient(null); setHistDetail(null); setHistMonth(null); setStatView(null); setSelProv(null); setSelServ(null); setSelIgnacio(null); }}
            style={{ ...card, padding: 8, cursor: "pointer", textAlign: "center", borderColor: tab === t.key ? T.accent : T.border, background: tab === t.key ? `${T.accent}12` : T.bg2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 65, gridColumn: "span 1" }}>
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: t.half ? 12 : 8, fontWeight: 700, color: tab === t.key ? T.accent : T.gray, lineHeight: 1.2 }}>{t.l}</div>
          </div>
        ))}
      </div>

      {/* ══════ RESUMEN ══════ */}
      {tab === "resumen" && (<div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{PB("dia", "Hoy")}{PB("semana", "Semana")}{PB("mes", "Mes")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { l: "Total Ventas", v: showTotalVentas ? fmt(totalVentas) : "• • • • •", c: T.accent, ic: "💰", tap: true },
            { l: "Ticket Promedio", v: fmt(periodOrders.length > 0 ? totalVentas / periodOrders.length : 0), c: "#9C27B0", ic: "🎯" },
            { l: "Órdenes", v: periodOrders.length, c: T.green, ic: "✅" },
            { l: "Vehículos Entregados", v: periodOrders.filter(o => o.status === "delivered").length, c: T.orange, ic: "🚗" },
          ].map(s => (
            <div key={s.l} onClick={() => { if (s.tap) setShowTotalVentas(!showTotalVentas); }} style={{ ...card, padding: 20, borderLeft: `4px solid ${s.c}`, cursor: s.tap ? "pointer" : "default" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.ic}</div>
              <div style={{ fontFamily: fontD, fontSize: 32, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Últimas órdenes completadas</div>
          {periodOrders.slice(-8).reverse().map(o => {
            const c = clients.find(x => x.id === o.clientId);
            const v = c?.vehicles?.find(x => x.domain === o.domain);
            const tot = o.works.reduce((s, w) => s + (w.price || 0), 0);
            return (
              <div key={o.id} onClick={() => onNavigate("vehicleDetail", o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: fontD }}>{fmtD(o.domain)}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{c ? c.name + " " + c.lastName : "—"} • {v ? v.brand + " " + v.model : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(tot)}</div>
                  <div style={{ fontSize: 11, color: T.gray }}>{o.date}</div>
                </div>
              </div>
            );
          })}
          {periodOrders.length === 0 && <div style={{ fontSize: 13, color: T.gray, padding: 10 }}>Sin órdenes en este período</div>}
        </div>
      </div>)}

      {/* ══════ MEDIOS DE PAGO ══════ */}
      
      {/* ══════ CUENTA CORRIENTE ══════ */}
      
      {/* ══════ COBROS ══════ */}
      {tab === "cobros" && (<div>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🧾 Cobros — Vehículos en Taller</div>
        {(() => {
          const inTaller = orders.filter(o => ["pending", "working", "done"].includes(o.status));
          if (selCobro) {
            const o = selCobro;
            const cl = clients.find(c => c.id === o.clientId);
            const vh = cl?.vehicles?.find(v => v.domain === o.domain);
            const total = o.works.reduce((s, w) => s + (w.price || 0), 0);
            const iva = config.ivaRate || 21;
            return (
              <div>
                <button onClick={() => { setSelCobro(null); setCobroPay([]); }} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a lista</button>
                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>{fmtD(o.domain)}</div>
                      <div style={{ fontSize: 15, color: T.grayLight, marginTop: 4 }}>{vh ? vh.brand + " " + vh.model + " " + vh.year : ""}</div>
                    </div>
                    <div style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: (o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red) + "20", color: o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red }}>
                      {o.status === "done" ? "✅ LISTO" : o.status === "working" ? "🟡 EN CURSO" : "🔴 ESPERANDO"}
                    </div>
                  </div>
                </div>
                {cobroClient && <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>👤 Datos del Cliente</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div><label style={labelStyle}>Nombre</label><input value={cobroClient.name} onChange={e => setCobroClient(p => ({ ...p, name: e.target.value }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Apellido</label><input value={cobroClient.lastName} onChange={e => setCobroClient(p => ({ ...p, lastName: e.target.value }))} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div><label style={labelStyle}>Teléfono</label><input inputMode="numeric" value={cobroClient.phone} onChange={e => setCobroClient(p => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>DNI</label><input inputMode="numeric" value={cobroClient.dni} onChange={e => setCobroClient(p => ({ ...p, dni: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>CUIT</label><input value={cobroClient.cuit} onChange={e => setCobroClient(p => ({ ...p, cuit: e.target.value }))} style={inputStyle} placeholder="Ej: 20-12345678-9" /></div>
                </div>}
                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>🔧 Trabajos Realizados</div>
                  {o.works.map((w, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontWeight: 700 }}>{w.type}{w.desc ? " — " + w.desc : ""}</span>
                        <span style={{ fontWeight: 700, color: T.accent, fontFamily: fontD }}>{fmt(w.price || 0)}</span>
                      </div>
                      {w.trenItems && w.trenItems.filter(ti => ti.selected).map((ti, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.grayLight, paddingLeft: 14, padding: "2px 0 2px 14px" }}>
                          <span>• {ti.label}</span>
                          {ti.price && <span>{fmt(parseFloat(ti.price))}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ height: 2, background: T.border, margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, fontFamily: fontD }}>
                    <span>TOTAL</span>
                    <span style={{ color: T.accent }}>{fmt(total)}</span>
                  </div>
                </div>
                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>💳 Método de Pago</div>
                  {cobroPay.map((pm, i) => (
                    <div key={i} style={{ ...card, padding: 12, marginBottom: 8, background: T.bg }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                        <div><label style={labelStyle}>Método</label>
                          <select value={pm.method || ""} onChange={e => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, method: e.target.value } : p))} style={inputStyle}>
                            <option value="">Seleccionar</option><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Cuenta Corriente</option>
                          </select>
                        </div>
                        <div><label style={labelStyle}>Monto</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>$</span>
                            <input inputMode="numeric" value={pm.amount ? String(pm.amount) : ""} onChange={e => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, amount: e.target.value.replace(/[^0-9]/g, "") } : p))} style={{ ...inputStyle, fontWeight: 700, fontFamily: fontD }} />
                          </div>
                        </div>
                      </div>
                      {pm.method === "Transferencia" && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          {[{ a: "1", l: "Cta 1 — Con IVA" }, { a: "2", l: "Cta 2 — Sin IVA" }].map(opt => (
                            <div key={opt.a} onClick={() => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, account: opt.a, withIva: opt.a === "1", invoiceType: opt.a === "2" ? "C" : p.invoiceType } : p))}
                              style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.account === opt.a ? T.accent : T.border}`, color: pm.account === opt.a ? T.accent : T.gray }}>{opt.l}</div>
                          ))}
                        </div>
                      )}
                      {(pm.method === "Efectivo" || pm.method === "Tarjeta") && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <div onClick={() => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, withIva: true } : p))} style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.withIva === true ? T.accent : T.border}`, color: pm.withIva === true ? T.accent : T.gray }}>Con IVA</div>
                          <div onClick={() => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, withIva: false } : p))} style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 700, border: `2px solid ${pm.withIva === false ? T.accent : T.border}`, color: pm.withIva === false ? T.accent : T.gray }}>Sin IVA</div>
                        </div>
                      )}
                      {pm.withIva && (
                        <div style={{ display: "flex", gap: 8 }}>
                          {["A", "B", "C"].map(ft => (
                            <div key={ft} onClick={() => setCobroPay(ps => ps.map((p, j) => j === i ? { ...p, invoiceType: ft } : p))} style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 700, border: `2px solid ${pm.invoiceType === ft ? T.accent : T.border}`, color: pm.invoiceType === ft ? T.accent : T.gray }}>Fact. {ft}</div>
                          ))}
                        </div>
                      )}
                      {pm.withIva && parseFloat(pm.amount) > 0 && (
                        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: T.bg2 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: T.gray }}>Subtotal</span><span style={{ fontWeight: 700 }}>{fmt(parseFloat(pm.amount))}</span></div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: T.gray }}>IVA {iva}%</span><span style={{ fontWeight: 700, color: T.accent }}>{fmt(parseFloat(pm.amount) * iva / 100)}</span></div>
                          <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span>Total con IVA</span><span style={{ color: T.accent, fontFamily: fontD }}>{fmt(parseFloat(pm.amount) * (1 + iva / 100))}</span></div>
                        </div>
                      )}
                      {cobroPay.length > 1 && <div onClick={() => setCobroPay(ps => ps.filter((_, j) => j !== i))} style={{ marginTop: 8, fontSize: 12, color: T.red, cursor: "pointer", fontWeight: 700 }}>✕ Quitar</div>}
                    </div>
                  ))}
                  <button onClick={() => setCobroPay(ps => [...ps, { method: "", amount: "", account: "", withIva: null, invoiceType: "" }])} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 12, color: T.orange, marginBottom: 12 }}>+ Agregar método</button>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {o.cobrado ? (
                    <div style={{ flex: 1, padding: "16px 0", borderRadius: 10, textAlign: "center", fontSize: 15, fontWeight: 700, background: `${T.green}15`, border: `2px solid ${T.green}`, color: T.green }}>✅ COBRADO</div>
                  ) : (
                  <button
                    onTouchStart={() => { setHoldProgress(0); let p = 0; holdRef.current = setInterval(() => { p += 2.67; setHoldProgress(Math.min(p,100)); if (p >= 100) { clearInterval(holdRef.current); if (cobroClient) { setClients(prev => prev.map(c => c.id === o.clientId ? { ...c, name: cobroClient.name, lastName: cobroClient.lastName, phone: cobroClient.phone, dni: cobroClient.dni, cuit: cobroClient.cuit } : c)); } setOrders(prev => prev.map(o2 => o2.id === o.id ? { ...o2, cobrado: true, payments: cobroPay.map(pp => ({ ...pp, amount: parseFloat(pp.amount) || 0 })) } : o2)); setSelCobro({...o, cobrado: true}); setHoldProgress(0); } }, 40); }}
                    onTouchEnd={() => { clearInterval(holdRef.current); setHoldProgress(0); }}
                    onMouseDown={() => { setHoldProgress(0); let p = 0; holdRef.current = setInterval(() => { p += 2.67; setHoldProgress(Math.min(p,100)); if (p >= 100) { clearInterval(holdRef.current); if (cobroClient) { setClients(prev => prev.map(c => c.id === o.clientId ? { ...c, name: cobroClient.name, lastName: cobroClient.lastName, phone: cobroClient.phone, dni: cobroClient.dni, cuit: cobroClient.cuit } : c)); } setOrders(prev => prev.map(o2 => o2.id === o.id ? { ...o2, cobrado: true, payments: cobroPay.map(pp => ({ ...pp, amount: parseFloat(pp.amount) || 0 })) } : o2)); setSelCobro({...o, cobrado: true}); setHoldProgress(0); } }, 40); }}
                    onMouseUp={() => { clearInterval(holdRef.current); setHoldProgress(0); }}
                    onMouseLeave={() => { clearInterval(holdRef.current); setHoldProgress(0); }}
                    style={{ ...btnPrimary(T.red), flex: 1, fontSize: 15, padding: "16px 0", position: "relative", overflow: "hidden", userSelect: "none" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${holdProgress}%`, background: "rgba(255,255,255,0.3)", transition: "width 0.04s linear", borderRadius: 10 }} />
                    <span style={{ position: "relative", zIndex: 1 }}>{holdProgress > 0 ? `${Math.round(holdProgress)}%` : "COBRAR"}</span>
                    {holdProgress === 0 && <div style={{ position: "relative", zIndex: 1, fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Mantener 1.5 seg</div>}
                  </button>
                  )}
                  {(cobroPay || []).some(p => p.withIva || p.method === "Tarjeta" || p.method === "Transferencia") && (
                  <button onClick={() => {}} style={{ ...btnPrimary(T.accent), flex: 1, fontSize: 15, padding: "16px 0" }}>🧾 EMITIR FACTURA</button>
                )}
                </div>
              </div>
            );
          }
          return (
            <div>
              {inTaller.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>No hay vehículos en taller</div>}
              {inTaller.map(o => {
                const cl = clients.find(c => c.id === o.clientId);
                const vh = cl?.vehicles?.find(v => v.domain === o.domain);
                const sc = o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red;
                const sl = o.status === "done" ? "LISTO" : o.status === "working" ? "EN CURSO" : "ESPERANDO";
                const total = o.works.reduce((s, w) => s + (w.price || 0), 0);
                return (
                  <div key={o.id} onClick={() => { setSelCobro(o); setCobroPay((o.payments || []).map(p => ({ ...p }))); const _cl = clients.find(c => c.id === o.clientId); setCobroClient(_cl ? { name: _cl.name, lastName: _cl.lastName, phone: _cl.phone, dni: _cl.dni || '', cuit: _cl.cuit || '' } : null); }}
                    style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer", borderLeft: `4px solid ${sc}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc }} />
                        <div>
                          <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700 }}>{fmtD(o.domain)}</div>
                          <div style={{ fontSize: 13, color: T.grayLight }}>{cl ? cl.name + " " + cl.lastName : "—"}</div>
                          <div style={{ fontSize: 12, color: T.gray }}>{vh ? vh.brand + " " + vh.model : ""} • {o.works.map(w => w.type).join(", ")}</div>
                        </div>
                      </div>
                      {o.cobrado && <div style={{ padding: "8px 18px", borderRadius: 10, background: `${T.green}10`, border: `1.5px solid ${T.green}60`, fontSize: 20, fontWeight: 700, color: `${T.green}bb`, flexShrink: 0 }}>COBRADO</div>}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: T.accent }}>{fmt(total)}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: sc }}>{sl}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>)}

      
      {/* ══════ HISTORIAL ══════ */}
      {tab === "historial" && (<div>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📚 Historial de Vehículos</div>
        {(() => {
          const allOrders = orders.filter(o => o.status !== "cancelled").sort((a, b) => (b.date || "").localeCompare(a.date || ""));
          const years = [...new Set(allOrders.map(o => new Date(o.date || Date.now()).getFullYear()))].sort((a, b) => b - a);
          const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

          if (histDetail) {
            const o = histDetail;
            const cl = clients.find(c => c.id === o.clientId);
            const vh = cl?.vehicles?.find(v => v.domain === o.domain);
            const total = o.works.reduce((s, w) => s + (w.price || 0), 0);
            const sc = o.status === "delivered" ? "#00C853" : o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red;
            return (
              <div>
                <button onClick={() => setHistDetail(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver</button>
                <div style={{ ...card, padding: 20, marginBottom: 16, borderLeft: `4px solid ${sc}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800 }}>{fmtD(o.domain)}</div>
                      <div style={{ fontSize: 15, color: T.grayLight, marginTop: 4 }}>{vh ? vh.brand + " " + vh.model + " " + vh.year : ""}</div>
                      <div style={{ fontSize: 14, marginTop: 4 }}>Cliente: <strong>{cl ? cl.name + " " + cl.lastName : "—"}</strong></div>
                      {cl?.phone && <div style={{ fontSize: 12, color: T.gray }}>Tel: {cl.phone}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: T.gray }}>{o.date}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: sc, marginTop: 4 }}>{o.status === "delivered" ? "ENTREGADO" : o.status === "done" ? "FINALIZADO" : o.status === "working" ? "EN CURSO" : "PENDIENTE"}</div>
                    {o.cobrado && <div style={{ fontSize: 11, fontWeight: 700, color: `${T.green}bb`, marginTop: 3, padding: "2px 8px", borderRadius: 4, background: `${T.green}10`, border: `1px solid ${T.green}60` }}>COBRADO</div>}
                      {o.assignedTo && <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>Mecánico: {o.assignedTo}</div>}
                    </div>
                  </div>
                </div>
                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>🔧 Trabajos</div>
                  {o.works.map((w, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontWeight: 700 }}>{w.type}{w.desc ? " — " + w.desc : ""}</span>
                        <span style={{ fontWeight: 700, color: T.accent, fontFamily: fontD }}>{fmt(w.price || 0)}</span>
                      </div>
                      {w.trenItems && w.trenItems.filter(ti => ti.selected).map((ti, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.grayLight, paddingLeft: 14 }}>
                          <span>• {ti.label}</span>{ti.price && <span>{fmt(parseFloat(ti.price))}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{ height: 2, background: T.border, margin: "10px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, fontFamily: fontD }}><span>TOTAL</span><span style={{ color: T.accent }}>{fmt(total)}</span></div>
                </div>
                {o.payments && o.payments.length > 0 && (
                  <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 10 }}>💳 Pago</div>
                    {o.payments.map((pm, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                        <span>{pm.method || "—"}{pm.account ? " — Cta " + pm.account : ""}{pm.withIva ? " (con IVA)" : ""}{pm.invoiceType ? " Fact. " + pm.invoiceType : ""}</span>
                        <span style={{ fontWeight: 700, color: T.accent }}>{fmt(pm.amount || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {o.techNotes && o.techNotes.length > 0 && o.techNotes.some(n => n) && (
                  <div style={{ ...card, padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.orange, marginBottom: 10 }}>📝 Notas Técnicas</div>
                    {o.techNotes.filter(n => n).map((n, i) => <div key={i} style={{ fontSize: 13, color: T.grayLight, marginBottom: 4 }}>• {n}</div>)}
                  </div>
                )}
              </div>
            );
          }

          const yearOrders = allOrders.filter(o => new Date(o.date || Date.now()).getFullYear() === histYear);
          const monthOrders = histMonth !== null ? yearOrders.filter(o => new Date(o.date || Date.now()).getMonth() === histMonth) : null;

          return (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {years.map(y => (
                  <div key={y} onClick={() => { setHistYear(y); setHistMonth(null); }}
                    style={{ padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: fontD, background: histYear === y ? T.accent : T.bg2, color: histYear === y ? "#fff" : T.gray, border: `1px solid ${histYear === y ? T.accent : T.border}` }}>{y}</div>
                ))}
              </div>
              <div style={{ ...card, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 10 }}>{histYear} — {yearOrders.length} orden{yearOrders.length !== 1 ? "es" : ""} — Total: {fmt(yearOrders.reduce((s, o) => s + o.works.reduce((s2, w) => s2 + (w.price || 0), 0), 0))}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {months.map((m, mi) => {
                    const cnt = yearOrders.filter(o => new Date(o.date || Date.now()).getMonth() === mi).length;
                    return (
                      <div key={mi} onClick={() => setHistMonth(histMonth === mi ? null : mi)}
                        style={{ padding: "10px 6px", borderRadius: 8, cursor: "pointer", textAlign: "center", border: `1px solid ${histMonth === mi ? T.accent : T.border}`, background: histMonth === mi ? `${T.accent}15` : cnt > 0 ? T.bg : T.bg2 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: histMonth === mi ? T.accent : cnt > 0 ? T.text : T.gray }}>{m.substring(0, 3)}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, fontFamily: fontD, color: cnt > 0 ? T.accent : T.gray }}>{cnt}</div>
                        <div style={{ fontSize: 11, color: cnt > 0 ? T.green : T.gray, fontWeight: 700, marginTop: 3 }}>{cnt > 0 ? fmt(yearOrders.filter(o => new Date(o.date || Date.now()).getMonth() === mi).reduce((s, o) => s + o.works.reduce((s2, w) => s2 + (w.price || 0), 0), 0)) : "$0"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {(monthOrders || yearOrders).map(o => {
                const cl = clients.find(c => c.id === o.clientId);
                const vh = cl?.vehicles?.find(v => v.domain === o.domain);
                const sc = o.status === "delivered" ? "#00C853" : o.status === "done" ? T.green : o.status === "working" ? T.orange : T.red;
                const total = o.works.reduce((s, w) => s + (w.price || 0), 0);
                return (
                  <div key={o.id} onClick={() => setHistDetail(o)}
                    style={{ ...card, padding: 14, marginBottom: 8, cursor: "pointer", borderLeft: `3px solid ${sc}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div>
                          <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700 }}>{fmtD(o.domain)}</div>
                          <div style={{ fontSize: 12, color: T.grayLight }}>{cl ? cl.name + " " + cl.lastName : "—"} • {vh ? vh.brand + " " + vh.model : ""}</div>
                          <div style={{ fontSize: 11, color: T.gray }}>{o.works.map(w => w.type).join(", ")}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 800, color: T.accent }}>{fmt(total)}</div>
                        <div style={{ fontSize: 11, color: T.gray }}>{o.date}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: sc }}>{o.status === "delivered" ? "ENTREGADO" : o.status === "done" ? "LISTO" : o.status === "working" ? "EN CURSO" : "PENDIENTE"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(monthOrders || yearOrders).length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin órdenes en este período</div>}
            </div>
          );
        })()}
      </div>)}

      {tab === "ctacte" && (<div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <input value={ctaFilter} onChange={e => setCtaFilter(e.target.value)} placeholder="🔍 Buscar cliente..." style={{ ...inputStyle, flex: 1 }} />
          <div style={{ ...card, padding: "12px 20px", borderColor: T.orange }}>
            <div style={{ fontSize: 11, color: T.gray }}>Total pendiente</div>
            <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 800, color: T.orange }}>{fmt(ctaTotal)}</div>
          </div>
        </div>
        {ctaFiltered.map(o => {
          const c = clients.find(x => x.id === o.clientId);
          const v = c?.vehicles?.find(x => x.domain === o.domain);
          const ctaMonto = (o.payments || []).filter(p => p.method === "Cuenta Corriente").reduce((s, p) => s + (p.amount || 0), 0);
          return (
            <div key={o.id} onClick={() => onNavigate("vehicleDetail", o)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700 }}>{fmtD(o.domain)}</div>
                  <div style={{ fontSize: 13, color: T.grayLight }}>{c ? c.name + " " + c.lastName : "—"}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{v ? v.brand + " " + v.model + " " + v.year : ""}</div>
                  <div style={{ fontSize: 11, color: T.gray, marginTop: 4 }}>{o.works.map(w => w.type).join(", ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, color: T.orange }}>{fmt(ctaMonto)}</div>
                  <div style={{ fontSize: 11, color: T.gray }}>{o.date}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: o.status === "delivered" ? T.green : T.orange, marginTop: 4 }}>{o.status === "delivered" ? "ENTREGADO" : "EN TALLER"}</div>
                </div>
              </div>
            </div>
          );
        })}
        {ctaFiltered.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin cuentas corrientes{ctaFilter ? " para ese filtro" : ""}</div>}
      </div>)}

      {/* ══════ CAJA ══════ */}
      {tab === "caja" && (<div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{PB("dia", "Hoy")}{PB("semana", "Semana")}{PB("mes", "Mes")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.green}` }}>
            <div style={{ fontSize: 11, color: T.gray }}>Ingresos Efectivo</div>
            <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.green }}>{fmt(periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0))}</div>
          </div>
          <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.red}` }}>
            <div style={{ fontSize: 11, color: T.gray }}>Egresos</div>
            <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.red }}>{fmt(totalEgr)}</div>
          </div>
          <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.accent}` }}>
            <div style={{ fontSize: 11, color: T.gray }}>Saldo en Caja</div>
            <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: (periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0) - totalEgr) >= 0 ? T.green : T.red }}>{fmt(periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0) - totalEgr)}</div>
          </div>
        </div>

        <button onClick={() => setShowEgreso(true)} style={{ ...btnPrimary(T.red), fontSize: 14, width: "100%", marginBottom: 16, padding: "14px 0" }}>➖ Registrar Egreso</button>

        <div style={{ ...card, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📋 Movimientos del período</div>
          {periodOrders.filter(o => (o.payments || []).some(p => p.method === "Efectivo")).map(o => {
            const efAmount = (o.payments || []).filter(p => p.method === "Efectivo").reduce((s, p) => s + (p.amount || 0), 0);
            return (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <div><span style={{ color: T.green, fontWeight: 700 }}>↑</span> Cobro {fmtD(o.domain)} — {clients.find(c => c.id === o.clientId)?.name || ""}</div>
                <div style={{ display: "flex", gap: 12 }}><span style={{ color: T.gray }}>{o.date}</span><span style={{ fontWeight: 700, color: T.green }}>{fmt(efAmount)}</span></div>
              </div>
            );
          })}
          {periodEgresos.map(e => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
              <div><span style={{ color: T.red, fontWeight: 700 }}>↓</span> {e.categoria}{e.detalle ? " — " + e.detalle : ""}{e.desc ? " — " + e.desc : ""}</div>
              <div style={{ display: "flex", gap: 12 }}><span style={{ color: T.gray }}>{e.fecha}</span><span style={{ fontWeight: 700, color: T.red }}>-{fmt(e.monto)}</span></div>
            </div>
          ))}
          {periodOrders.filter(o => (o.payments || []).some(p => p.method === "Efectivo")).length === 0 && periodEgresos.length === 0 && <div style={{ fontSize: 13, color: T.gray, padding: 10 }}>Sin movimientos de efectivo</div>}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setShowCierre(true)} style={{ ...btnPrimary(T.accent), fontSize: 13, flex: 1 }}>📋 Cierre de Caja</button>
        </div>

        {cierres.length > 0 && (
          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📜 Historial de cierres</div>
            {cierres.slice(-5).reverse().map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12 }}>
                <span>{c.fecha}</span>
                <span>Sistema: {fmt(c.saldoSistema)}</span>
                <span>Real: {fmt(c.saldoReal)}</span>
                <span style={{ fontWeight: 700, color: c.diferencia >= 0 ? T.green : T.red }}>Dif: {fmt(c.diferencia)}</span>
              </div>
            ))}
          </div>
        )}

        {showEgreso && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowEgreso(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 440, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>➖ Registrar Egreso</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 8 }}>Categoría</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
                {[
                  { key: "proveedor", icon: "📦", label: "Proveedor" },
                  { key: "uber", icon: "🚕", label: "Uber/Flete" },
                  { key: "comida", icon: "🍔", label: "Comida" },
                  { key: "sueldo", icon: "👤", label: "Sueldo" },
                  { key: "repuesto", icon: "🔩", label: "Repuesto" },
                  { key: "alquiler", icon: "🏠", label: "Alquiler" },
                  { key: "otro", icon: "📝", label: "Otro" },
                ].map(cat => (
                  <div key={cat.key} onClick={() => setEgresoForm(f => ({ ...f, categoria: cat.key, categoriaLabel: cat.label, detalle: "" }))}
                    style={{ ...card, padding: "8px 4px", cursor: "pointer", textAlign: "center", borderColor: egresoForm.categoria === cat.key ? T.accent : T.border, background: egresoForm.categoria === cat.key ? `${T.accent}12` : T.bg }}>
                    <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 2 }}>{cat.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: egresoForm.categoria === cat.key ? T.accent : T.gray }}>{cat.label}</div>
                  </div>
                ))}
              </div>
              {egresoForm.categoria === "proveedor" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Proveedor</label>
                  <select value={egresoForm.detalle || ""} onChange={e => setEgresoForm(f => ({ ...f, detalle: e.target.value }))} style={inputStyle}>
                    <option value="">Seleccionar proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                    <option value="__nuevo__">+ Nuevo (esporádico)</option>
                  </select>
                  {egresoForm.detalle === "__nuevo__" && (
                    <input value={egresoForm.desc || ""} onChange={e => setEgresoForm(f => ({ ...f, desc: e.target.value }))} style={{ ...inputStyle, marginTop: 8 }} placeholder="Nombre del proveedor..." />
                  )}
                </div>
              )}
              {egresoForm.categoria === "sueldo" && (
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>Empleado</label>
                  <select value={egresoForm.detalle || ""} onChange={e => setEgresoForm(f => ({ ...f, detalle: e.target.value }))} style={inputStyle}>
                    <option value="">Seleccionar empleado</option>
                    {["Ignacio", "Chiara", "Kevin", "Fabricio"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
              {(egresoForm.categoria === "otro" || egresoForm.categoria === "repuesto" || egresoForm.categoria === "uber" || egresoForm.categoria === "comida") && (
                <div style={{ marginBottom: 12 }}><label style={labelStyle}>Descripción</label><input value={egresoForm.desc || ""} onChange={e => setEgresoForm(f => ({ ...f, desc: e.target.value }))} style={inputStyle} placeholder="Detalle del gasto..." /></div>
              )}
              <div style={{ marginBottom: 12 }}><label style={labelStyle}>Monto *</label><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>$</span><input inputMode="numeric" value={egresoForm.monto} onChange={e => setEgresoForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} placeholder="0" /></div></div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Fecha</label><input type="date" value={egresoForm.fecha} onChange={e => setEgresoForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowEgreso(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { if (egresoForm.categoria && egresoForm.monto) { setEgresos(p => [...p, { ...egresoForm, id: Date.now(), monto: parseFloat(egresoForm.monto) || 0 }]); setEgresoForm({ desc: "", monto: "", fecha: today, categoria: "", categoriaLabel: "", detalle: "" }); setShowEgreso(false); }}} style={{ ...btnPrimary(T.red), flex: 1 }}>Registrar</button>
              </div>
            </div>
          </div>
        )}

        {showCierre && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowCierre(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📋 Cierre de Caja</div>
              <div style={{ ...card, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span style={{ color: T.gray }}>Saldo sistema</span><span style={{ fontWeight: 700, fontFamily: fontD }}>{fmt(periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0) - totalEgr)}</span></div>
              </div>
              <div style={{ marginBottom: 16 }}><label style={labelStyle}>Saldo real en caja *</label><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>$</span><input inputMode="numeric" value={saldoReal} onChange={e => setSaldoReal(e.target.value.replace(/[^0-9]/g, ""))} style={inputStyle} placeholder="Contar efectivo..." /></div></div>
              {saldoReal && (() => { const sist = periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0) - totalEgr; const dif = (parseFloat(saldoReal) || 0) - sist; return (
                <div style={{ ...card, padding: 14, marginBottom: 16, borderColor: dif >= 0 ? T.green : T.red }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}><span>Diferencia</span><span style={{ color: dif >= 0 ? T.green : T.red, fontFamily: fontD }}>{fmt(dif)}</span></div>
                </div>
              ); })()}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowCierre(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { const sist = periodOrders.reduce((s, o) => s + (o.payments || []).filter(p => p.method === "Efectivo").reduce((s2, p) => s2 + (p.amount || 0), 0), 0) - totalEgr; setCierres(p => [...p, { fecha: today, saldoSistema: sist, saldoReal: parseFloat(saldoReal) || 0, diferencia: (parseFloat(saldoReal) || 0) - sist }]); setSaldoReal(""); setShowCierre(false); }} style={{ ...btnPrimary(T.green), flex: 1 }}>✓ Cerrar Caja</button>
              </div>
            </div>
          </div>
        )}
      </div>)}

      {tab === "facturas" && (<div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{PB("dia", "Hoy")}{PB("semana", "Semana")}{PB("mes", "Mes")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.green}` }}><div style={{ fontSize: 11, color: T.gray }}>Con factura</div><div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, color: T.green }}>{conFactura.length}</div></div>
          <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.red}` }}><div style={{ fontSize: 11, color: T.gray }}>Sin factura</div><div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, color: T.red }}>{sinFactura.length}</div></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {[{ l: "Factura A", v: factA.length, c: T.accent }, { l: "Factura B", v: factB.length, c: "#9C27B0" }, { l: "Factura C", v: factC.length, c: T.orange }].map(s => (
            <div key={s.l} style={{ ...card, padding: 14, textAlign: "center" }}><div style={{ fontSize: 11, color: T.gray }}>{s.l}</div><div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div></div>
          ))}
        </div>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Órdenes sin factura</div>
          {sinFactura.map(o => {
            const c = clients.find(x => x.id === o.clientId);
            const tot = o.works.reduce((s, w) => s + (w.price || 0), 0);
            return (<div key={o.id} onClick={() => onNavigate("vehicleDetail", o)} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
              <div><div style={{ fontSize: 14, fontWeight: 700, fontFamily: fontD }}>{fmtD(o.domain)}</div><div style={{ fontSize: 12, color: T.gray }}>{c ? c.name + " " + c.lastName : "—"}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(tot)}</div><div style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>SIN FACTURA</div></div>
            </div>);
          })}
          {sinFactura.length === 0 && <div style={{ fontSize: 13, color: T.green, padding: 10 }}>✅ Todas las órdenes tienen factura</div>}
        </div>
      </div>)}

      {/* ══════ PROVEEDORES ══════ */}
      {tab === "proveedores" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>📦 Proveedores</div>
          {!selProv && <button onClick={() => setShowProv(true)} style={{ ...btnPrimary(T.accent), fontSize: 12 }}>+ Nuevo Proveedor</button>}
        </div>

        {selProv ? (() => {
          const pvFacts = factProv.filter(f => f.provId === String(selProv.id));
          const pvPend = pvFacts.filter(f => f.estado === "pendiente");
          const pvPagadas = pvFacts.filter(f => f.estado === "pagada");
          const pvTotal = pvPend.reduce((s, f) => s + (f.monto || 0), 0);
          return (
            <div>
              <button onClick={() => setSelProv(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a proveedores</button>
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>{selProv.nombre}</div>
                <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{selProv.rubro || "Sin rubro"} • Pago a {selProv.diasPago || 30} días</div>
                {selProv.cuit && <div style={{ fontSize: 12, color: T.gray }}>CUIT: {selProv.cuit}</div>}
                {selProv.tel && <div style={{ fontSize: 12, color: T.gray }}>Tel: {selProv.tel}</div>}
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 8, background: `${T.red}10`, border: `1px solid ${T.red}30` }}><span style={{ fontSize: 11, color: T.gray }}>Pendiente</span><div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: T.red }}>{fmt(pvTotal)}</div></div>
                  <div style={{ padding: "8px 16px", borderRadius: 8, background: `${T.green}10`, border: `1px solid ${T.green}30` }}><span style={{ fontSize: 11, color: T.gray }}>Pagadas</span><div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: T.green }}>{pvPagadas.length}</div></div>
                </div>
              </div>
              <button onClick={() => setShowFactProv(true)} style={{ ...btnPrimary(T.green), fontSize: 13, width: "100%", marginBottom: 16 }}>+ Cargar Factura</button>
              {pvFacts.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin facturas cargadas</div>}
              {pvFacts.sort((a, b) => (b.fechaEmision || "").localeCompare(a.fechaEmision || "")).map(f => (
                <div key={f.id} style={{ ...card, padding: 14, marginBottom: 8, borderLeft: `3px solid ${f.estado === "pagada" ? T.green : f.fechaVenc && f.fechaVenc < today ? T.red : T.orange}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>FC #{f.nroFactura}</div>
                      <div style={{ fontSize: 11, color: T.gray }}>Emisión: {f.fechaEmision} • Venc: {f.fechaVenc || "—"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.accent }}>{fmt(f.monto)}</div>
                      <div onClick={() => setFactProv(prev => prev.map(x => x.id === f.id ? { ...x, estado: x.estado === "pendiente" ? "pagada" : "pendiente" } : x))}
                        style={{ fontSize: 11, fontWeight: 700, cursor: "pointer", color: f.estado === "pagada" ? T.green : T.orange, marginTop: 4 }}>
                        {f.estado === "pagada" ? "✅ PAGADA" : "⏳ PENDIENTE"}
                      </div>
                    </div>
                  </div>
                  {f.estado === "pendiente" && f.fechaVenc && f.fechaVenc < today && <div style={{ fontSize: 10, color: T.red, fontWeight: 700, marginTop: 4 }}>⚠️ VENCIDA</div>}
                </div>
              ))}
            </div>
          );
        })() : (
          <div>
            {proveedores.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin proveedores. Tocá "Nuevo Proveedor" para agregar.</div>}
            {proveedores.map(pv => {
              const pvFacts = factProv.filter(f => f.provId === String(pv.id));
              const pvPend = pvFacts.filter(f => f.estado === "pendiente");
              const pvTotal = pvPend.reduce((s, f) => s + (f.monto || 0), 0);
              const vencidas = pvFacts.filter(f => f.estado === "pendiente" && f.fechaVenc && f.fechaVenc < today).length;
              return (
                <div key={pv.id} onClick={() => setSelProv(pv)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 28 }}>📦</div>
                      <div>
                        <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700 }}>{pv.nombre}</div>
                        <div style={{ fontSize: 12, color: T.gray }}>{pv.rubro || "Sin rubro"} • {pvFacts.length} factura{pvFacts.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {pvTotal > 0 && <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.orange }}>{fmt(pvTotal)}</div>}
                      {vencidas > 0 && <div style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>⚠️ {vencidas} vencida{vencidas !== 1 ? "s" : ""}</div>}
                      {pvTotal === 0 && <div style={{ fontSize: 12, color: T.green }}>✅ Al día</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showProv && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowProv(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 14 }}>📦 Nuevo Proveedor</div>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Nombre *</label><input value={provForm.nombre} onChange={e => setProvForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} placeholder="Ej: Borur" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Rubro</label><input value={provForm.rubro} onChange={e => setProvForm(f => ({ ...f, rubro: e.target.value }))} style={inputStyle} placeholder="Repuestos" /></div>
                <div><label style={labelStyle}>Días de pago</label><input inputMode="numeric" value={provForm.diasPago} onChange={e => setProvForm(f => ({ ...f, diasPago: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div><label style={labelStyle}>CUIT</label><input value={provForm.cuit} onChange={e => setProvForm(f => ({ ...f, cuit: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Teléfono</label><input inputMode="tel" value={provForm.tel} onChange={e => setProvForm(f => ({ ...f, tel: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowProv(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { if (provForm.nombre) { setProveedores(p => [...p, { ...provForm, id: Date.now() }]); setProvForm({ nombre: "", rubro: "", diasPago: "30", cuit: "", tel: "" }); setShowProv(false); }}} style={{ ...btnPrimary(T.accent), flex: 1 }}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {showFactProv && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowFactProv(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 14 }}>🧾 Nueva Factura — {selProv?.nombre}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>N° Factura *</label><input value={factProvForm.nroFactura} onChange={e => setFactProvForm(f => ({ ...f, nroFactura: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Monto *</label><div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontWeight: 700, color: T.accent }}>$</span><input inputMode="numeric" value={factProvForm.monto} onChange={e => setFactProvForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div><label style={labelStyle}>Fecha emisión</label><input type="date" value={factProvForm.fechaEmision} onChange={e => setFactProvForm(f => ({ ...f, fechaEmision: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Fecha vencimiento</label><input type="date" value={factProvForm.fechaVenc || ""} onChange={e => setFactProvForm(f => ({ ...f, fechaVenc: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowFactProv(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { if (factProvForm.nroFactura && factProvForm.monto && selProv) { setFactProv(p => [...p, { ...factProvForm, id: Date.now(), provId: String(selProv.id), monto: parseFloat(factProvForm.monto) || 0, estado: "pendiente" }]); setFactProvForm({ provId: "", nroFactura: "", monto: "", fechaEmision: today, fechaVenc: "", estado: "pendiente" }); setShowFactProv(false); }}} style={{ ...btnPrimary(T.green), flex: 1 }}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>)}

      {tab === "servicios" && (<div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>🔧 Servicios</div>
          {!selServ && <button onClick={() => setShowServ(true)} style={{ ...btnPrimary(T.accent), fontSize: 12 }}>+ Nuevo Servicio</button>}
        </div>

        {selServ ? (() => {
          const svFacts = (selServ.facturas || []);
          return (
            <div>
              <button onClick={() => setSelServ(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a servicios</button>
              <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>{selServ.nombre}</div>
                <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{selServ.desc || ""}{selServ.metodo ? ` • ${selServ.metodo}` : ""}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginTop: 8 }}>Monto: {fmt(parseFloat(selServ.monto) || 0)}</div>
                {selServ.vencimiento && <div style={{ fontSize: 12, color: selServ.vencimiento < today ? T.red : T.gray, marginTop: 4 }}>Vencimiento: {selServ.vencimiento}{selServ.vencimiento < today ? " ⚠️ VENCIDO" : ""}</div>}
              </div>
              <button onClick={() => {
                const nf = { id: Date.now(), fecha: today, monto: selServ.monto, estado: "pagado" };
                setServicios(prev => prev.map(s => s.id === selServ.id ? { ...s, facturas: [...(s.facturas || []), nf] } : s));
                setSelServ(prev => ({ ...prev, facturas: [...(prev.facturas || []), nf] }));
              }} style={{ ...btnPrimary(T.green), fontSize: 13, width: "100%", marginBottom: 16 }}>+ Registrar Pago</button>
              {svFacts.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin pagos registrados</div>}
              {svFacts.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).map(f => (
                <div key={f.id} style={{ ...card, padding: 14, marginBottom: 8, borderLeft: `3px solid ${T.green}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13 }}>Pago — {f.fecha}</div>
                    <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, color: T.green }}>{fmt(parseFloat(f.monto) || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })() : (
          <div>
            {servicios.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin servicios. Ej: Alquiler, Internet, Luz, etc.</div>}
            {servicios.map(s => (
              <div key={s.id} onClick={() => setSelServ(s)} style={{ ...card, padding: 16, marginBottom: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 28 }}>🔧</div>
                    <div>
                      <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700 }}>{s.nombre}</div>
                      <div style={{ fontSize: 12, color: T.gray }}>{s.desc || ""}{s.metodo ? ` • ${s.metodo}` : ""}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.accent }}>{fmt(parseFloat(s.monto) || 0)}</div>
                    {s.vencimiento && <div style={{ fontSize: 10, color: s.vencimiento < today ? T.red : T.gray }}>{s.vencimiento < today ? "⚠️ VENCIDO" : `Vence: ${s.vencimiento}`}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showServ && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowServ(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 14 }}>🔧 Nuevo Servicio</div>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Nombre *</label><input value={servForm.nombre} onChange={e => setServForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} placeholder="Ej: Alquiler, Internet" /></div>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Descripción</label><input value={servForm.desc} onChange={e => setServForm(f => ({ ...f, desc: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div><label style={labelStyle}>Monto *</label><div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontWeight: 700, color: T.accent }}>$</span><input inputMode="numeric" value={servForm.monto} onChange={e => setServForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div></div>
                <div><label style={labelStyle}>Método pago</label><select value={servForm.metodo} onChange={e => setServForm(f => ({ ...f, metodo: e.target.value }))} style={inputStyle}><option value="">—</option><option>Efectivo</option><option>Transferencia</option><option>Débito automático</option></select></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={labelStyle}>Vencimiento</label><input type="date" value={servForm.vencimiento} onChange={e => setServForm(f => ({ ...f, vencimiento: e.target.value }))} style={inputStyle} /></div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowServ(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { if (servForm.nombre && servForm.monto) { setServicios(p => [...p, { ...servForm, id: Date.now(), facturas: [] }]); setServForm({ nombre: "", desc: "", monto: "", metodo: "", vencimiento: "" }); setShowServ(false); }}} style={{ ...btnPrimary(T.accent), flex: 1 }}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>)}

      {tab === "stats" && (() => {
        const STAT_ITEMS = [
          { key: "pagos", icon: "💳", label: "Medios de Pago" },
          { key: "trabajos", icon: "🔧", label: "Trabajos Realizados" },
          { key: "clientes", icon: "👥", label: "Clientes Frecuentes" },
          { key: "productividad", icon: "⚡", label: "Productividad" },
          { key: "retencion", icon: "📈", label: "Retención" },
          { key: "campanas", icon: "📣", label: "Campañas" },
        ];

        if (!statView) return (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {STAT_ITEMS.map(s => (
                <div key={s.key} onClick={() => setStatView(s.key)}
                  style={{ ...card, padding: 20, cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

        return (
          <div>
            <button onClick={() => setStatView(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver a Estadísticas</button>

            {statView === "pagos" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>💳 Medios de Pago</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{PB("dia", "Hoy")}{PB("semana", "Semana")}{PB("mes", "Mes")}</div>
              <div style={{ ...card, padding: 20 }}>
                {payEntries.length > 0 ? payEntries.map(([method, amount]) => {
                  const pct = totalIngresos > 0 ? Math.round(amount * 100 / totalIngresos) : 0;
                  const color = payColors[method] || T.grayLight;
                  return (
                    <div key={method} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{method}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color }}>{fmt(amount)} <span style={{ fontSize: 11, color: T.gray }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 10, borderRadius: 5, background: T.bg, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 5, background: color }} />
                      </div>
                    </div>
                  );
                }) : <div style={{ fontSize: 13, color: T.gray }}>Sin pagos en este período</div>}
                {payEntries.length > 0 && <div style={{ height: 1, background: T.border, margin: "16px 0" }} />}
                {payEntries.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, fontFamily: fontD }}><span>TOTAL</span><span style={{ color: T.accent }}>{fmt(totalIngresos)}</span></div>}
              </div>
            </div>)}

            {statView === "trabajos" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🔧 Trabajos más Realizados</div>
              <div style={{ ...card, padding: 20 }}>
                {topWorks.slice(0, 10).map(([type, count], i) => {
                  const maxC = topWorks[0][1];
                  return (
                    <div key={type} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{i + 1}. {type}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{count}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: T.bg, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round(count * 100 / maxC)}%`, height: "100%", borderRadius: 4, background: T.accent }} />
                      </div>
                    </div>
                  );
                })}
                {topWorks.length === 0 && <div style={{ fontSize: 13, color: T.gray }}>Sin datos</div>}
              </div>
            </div>)}

            {statView === "clientes" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>👥 Clientes Frecuentes</div>
              <div style={{ ...card, padding: 20 }}>
                {topClients.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 14 }}>{i + 1}. {c.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#9C27B0" }}>{c.count} orden{c.count !== 1 ? "es" : ""}</span>
                  </div>
                ))}
                {topClients.length === 0 && <div style={{ fontSize: 13, color: T.gray }}>Sin datos</div>}
              </div>
            </div>)}

            {statView === "productividad" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>⚡ Productividad</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 16 }}>
                {[
                  { l: "Órdenes Hoy", v: orders.filter(o => o.date === today).length, c: T.accent, ic: "📋" },
                  { l: "En Taller", v: orders.filter(o => ["pending", "working"].includes(o.status)).length, c: T.orange, ic: "🔧" },
                  { l: "Finalizadas Hoy", v: orders.filter(o => o.status === "done" && o.date === today).length, c: T.green, ic: "✅" },
                  { l: "Entregadas Hoy", v: orders.filter(o => o.status === "delivered" && o.date === today).length, c: "#9C27B0", ic: "🚗" },
                ].map(s => (
                  <div key={s.l} style={{ ...card, padding: 16, borderLeft: `4px solid ${s.c}` }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{s.ic}</div>
                    <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: T.gray }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ ...card, padding: 20 }}>
                <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>👤 Rendimiento por Mecánico</div>
                {(() => {
                  const ms = {}; completed.forEach(o => { const m = o.assignedTo || "Sin asignar"; ms[m] = (ms[m] || 0) + 1; });
                  return Object.entries(ms).sort((a, b) => b[1] - a[1]).map(([name, cnt]) => {
                    const rev = completed.filter(o => o.assignedTo === name).reduce((s, o) => s + o.works.reduce((s2, w) => s2 + (w.price || 0), 0), 0);
                    return (<div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                      <div><div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 11, color: T.gray }}>{cnt} órdenes</div></div>
                      <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.accent }}>{fmt(rev)}</div>
                    </div>);
                  });
                })()}
              </div>
            </div>)}

            {statView === "retencion" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📈 Retención de Clientes</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { l: "Clientes Totales", v: clients.length, c: T.accent },
                  { l: "Recurrentes (2+)", v: Object.values(clientStats).filter(v => v >= 2).length, c: T.green },
                  { l: "Tasa Retención", v: clients.length > 0 ? Math.round(Object.values(clientStats).filter(v => v >= 2).length * 100 / clients.length) + "%" : "0%", c: "#9C27B0" },
                ].map(s => (
                  <div key={s.l} style={{ ...card, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: T.gray }}>{s.l}</div>
                    <div style={{ fontFamily: fontD, fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>)}

            {statView === "campanas" && (<div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📣 Campañas</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { name: "Service Recordatorio", desc: "Clientes con +6 meses sin service", target: completed.filter(o => { const d2 = new Date(o.date); return (Date.now() - d2.getTime()) > 180 * 86400000; }).length, color: T.accent, icon: "🔔" },
                  { name: "Oferta Temporada", desc: "Todos los clientes activos", target: clients.length, color: T.green, icon: "🎯" },
                  { name: "Revisión Pre-Viaje", desc: "Antes de finde largo", target: clients.length, color: T.orange, icon: "🚗" },
                  { name: "Promo Personalizada", desc: "Campaña libre", target: 0, color: "#9C27B0", icon: "📣" },
                ].map(c => (
                  <div key={c.name} style={{ ...card, padding: 16 }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.gray, marginBottom: 8 }}>{c.desc}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.target} dest.</span>
                      <button style={{ ...btnPrimary(c.color), fontSize: 11, padding: "6px 12px" }}>Enviar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
          </div>
        );
      })()}

      {/* ══════ IGNACIO ══════ */}
      {tab === "ignacio" && (<div>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>👑 Gastos de Ignacio</div>
        
        {(() => {
          const allGastos = [...igGastos, ...egresos.filter(e => e.categoria === "sueldo" && e.detalle === "Ignacio").map(e => ({ ...e, catName: "Sueldo", desc: "Pago de sueldo" }))];
          const totalGastos = allGastos.reduce((s, g) => s + (parseFloat(g.monto) || 0), 0);
          const igCats = [...new Set(allGastos.map(g => g.catName || g.categoria || "Otro"))];
          const catTotals = {};
          allGastos.forEach(g => { const k = g.catName || g.categoria || "Otro"; catTotals[k] = (catTotals[k] || 0) + (parseFloat(g.monto) || 0); });
          const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
          const pieColors = ["#1E88E5", "#E53935", "#43a047", "#FF9800", "#9C27B0", "#00BCD4", "#795548"];

          if (selIgnacio) {
            const catGastos = allGastos.filter(g => (g.catName || g.categoria || "Otro") === selIgnacio);
            const catTotal = catGastos.reduce((s, g) => s + (parseFloat(g.monto) || 0), 0);
            return (
              <div>
                <button onClick={() => setSelIgnacio(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 16 }}>← Volver</button>
                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>{selIgnacio}</div>
                  <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, color: T.red, marginTop: 8 }}>Total: {fmt(catTotal)}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{catGastos.length} movimiento{catGastos.length !== 1 ? "s" : ""}</div>
                </div>
                <button onClick={() => setShowIgGasto(true)} style={{ ...btnPrimary(T.accent), fontSize: 13, width: "100%", marginBottom: 16 }}>+ Registrar Gasto en {selIgnacio}</button>
                {catGastos.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).map(g => (
                  <div key={g.id} style={{ ...card, padding: 14, marginBottom: 8, borderLeft: `3px solid ${T.orange}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{g.desc || g.catName || g.categoria}</div>
                        <div style={{ fontSize: 11, color: T.gray }}>{g.fecha}</div>
                      </div>
                      <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.red }}>{fmt(parseFloat(g.monto) || 0)}</div>
                    </div>
                  </div>
                ))}
                {catGastos.length === 0 && <div style={{ ...card, padding: 20, textAlign: "center", color: T.gray }}>Sin gastos</div>}
              </div>
            );
          }

          let pieAngle = 0;
          return (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.red}` }}>
                  <div style={{ fontSize: 11, color: T.gray }}>Total Gastos</div>
                  <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.red }}>{fmt(totalGastos)}</div>
                </div>
                <div style={{ ...card, padding: 16, borderLeft: `4px solid ${T.accent}` }}>
                  <div style={{ fontSize: 11, color: T.gray }}>Categorías</div>
                  <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 800, color: T.accent }}>{igCats.length}</div>
                </div>
              </div>

              {catEntries.length > 0 && (
                <div style={{ ...card, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <svg width="100" height="100" viewBox="0 0 120 120">
                      {catEntries.map(([cat, amount], i) => {
                        const pct = totalGastos > 0 ? amount / totalGastos : 0;
                        const sa = pieAngle; pieAngle += pct * 360; const ea = pieAngle;
                        const rad = Math.PI / 180;
                        if (pct === 0) return null;
                        if (pct >= 0.999) return <circle key={i} cx="60" cy="60" r="50" fill={pieColors[i % pieColors.length]} />;
                        return <path key={i} d={`M60,60 L${60+50*Math.cos((sa-90)*rad)},${60+50*Math.sin((sa-90)*rad)} A50,50 0 ${pct>.5?1:0},1 ${60+50*Math.cos((ea-90)*rad)},${60+50*Math.sin((ea-90)*rad)} Z`} fill={pieColors[i % pieColors.length]} />;
                      })}
                    </svg>
                    <div style={{ flex: 1 }}>
                      {catEntries.map(([cat, amount], i) => (
                        <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: pieColors[i % pieColors.length] }} />
                            <span style={{ color: T.grayLight }}>{cat}</span>
                          </div>
                          <span style={{ fontWeight: 700 }}>{fmt(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 10 }}>Carpetas de gastos</div>
              {igCats.map(cat => (
                <div key={cat} onClick={() => setSelIgnacio(cat)} style={{ ...card, padding: 14, marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 22 }}>📁</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{cat}</div>
                        <div style={{ fontSize: 11, color: T.gray }}>{allGastos.filter(g => (g.catName || g.categoria) === cat).length} gasto{allGastos.filter(g => (g.catName || g.categoria) === cat).length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: T.red }}>{fmt(catTotals[cat] || 0)}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowIgGasto(true)} style={{ ...btnPrimary(T.accent), fontSize: 13, width: "100%", marginTop: 12 }}>+ Nuevo Gasto</button>
            </div>
          );
        })()}

        {showIgGasto && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowIgGasto(false)}>
            <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 400, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 14 }}>👑 Gasto de Ignacio</div>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Categoría *</label>
                <select value={igForm.categoria} onChange={e => setIgForm(f => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
                  <option value="">Seleccionar o crear</option>
                  {[...new Set([...igGastos.map(g => g.catName || g.categoria), "Sueldo"])].filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__nueva__">+ Nueva categoría</option>
                </select>
                {igForm.categoria === "__nueva__" && (
                  <input value={igForm.newCat || ""} onChange={e => setIgForm(f => ({ ...f, newCat: e.target.value }))} style={{ ...inputStyle, marginTop: 8 }} placeholder="Ej: Luz, Gas, Tarjeta..." />
                )}
              </div>
              <div style={{ marginBottom: 10 }}><label style={labelStyle}>Descripción</label><input value={igForm.desc} onChange={e => setIgForm(f => ({ ...f, desc: e.target.value }))} style={inputStyle} placeholder="Detalle..." /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div><label style={labelStyle}>Monto *</label><div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ fontWeight: 700, color: T.accent }}>$</span><input inputMode="numeric" value={igForm.monto} onChange={e => setIgForm(f => ({ ...f, monto: e.target.value.replace(/[^0-9]/g, "") }))} style={inputStyle} /></div></div>
                <div><label style={labelStyle}>Fecha</label><input type="date" value={igForm.fecha} onChange={e => setIgForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowIgGasto(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
                <button onClick={() => { const cat = igForm.categoria === "__nueva__" ? igForm.newCat : igForm.categoria; if (cat && igForm.monto) { setIgGastos(p => [...p, { id: Date.now(), catName: cat, categoria: cat, desc: igForm.desc, monto: parseFloat(igForm.monto) || 0, fecha: igForm.fecha }]); if (selIgnacio) setSelIgnacio(cat); setIgForm({ categoria: "", desc: "", monto: "", fecha: today, newCat: "" }); setShowIgGasto(false); }}} style={{ ...btnPrimary(T.accent), flex: 1 }}>Registrar</button>
              </div>
            </div>
          </div>
        )}
      </div>)}


    </div>
  );
};


const InspectionScreen = (props) => {
  const { order, clients, user, orders, setOrders, config, onNavigate } = props;
  const client = clients.find(c => c.id === order.clientId);
  const vehicle = client?.vehicles.find(v => v.domain === order.domain);
  const cat = order.budgetCategory || "Otros";
  const catIcon = { "Tren Delantero": "⚙️", "Tren Trasero": "⚙️", "Mecánica": "🔩", "Escape": "💨", "Arreglo": "🪛", "Otros": "📝" }[cat] || "🔍";

  const initialItems = () => {
    const fixed = (BUDGET_CATEGORIES[cat] || []).map(t => ({ ...t, selected: false, price: "" }));
    if (FREE_CATEGORIES.includes(cat) || fixed.length === 0) return [{ key: "libre_1", label: "", selected: false, price: "", isCustom: true }];
    return [...fixed, { key: "otro", label: "Otro", selected: false, price: "", otroDesc: "", isCustom: false }];
  };

  const [items, setItems] = useState(order.budgetItems || initialItems());
  const [note, setNote] = useState(order.budgetNote || "");
  const [escapeType, setEscapeType] = useState(order.escapeType || "");

  const total = items.filter(x => x.isCustom ? (x.price && x.label) : x.selected).reduce((s, x) => s + (parseFloat(x.price) || 0), 0);
  const totalIva = total * (1 + config.ivaRate / 100);
  const total3 = total * (1 + config.surcharge3 / 100);
  const total6 = total * (1 + config.surcharge6 / 100);

  const activeItems = cat === "Escape" && !escapeType ? [] : items;
  const showItems = cat === "Escape" ? escapeType : true;

  const handleEscapeType = (type) => {
    setEscapeType(type);
    const src = type === "deportivo" ? "Escape Deportivo" : "Escape";
    const fixed = (BUDGET_CATEGORIES[src] || []).map(t => ({ ...t, selected: false, price: "" }));
    setItems([...fixed, { key: "otro", label: "Otro", selected: false, price: "", otroDesc: "", isCustom: false }]);
  };

  const saveBudget = (sendToClient) => {
    const desc = items.filter(x => x.isCustom ? x.label : x.selected).map(x => x.isCustom ? x.label : (x.otroDesc ? x.label + " (" + x.otroDesc + ")" : x.label)).join(", ");
    setOrders(prev => prev.map(o => o.id === order.id ? {
      ...o,
      status: sendToClient ? "budget_sent" : "inspection",
      budgetItems: items,
      budgetNote: note,
      escapeType,
      works: [{ type: cat, price: total, desc: desc + (escapeType ? ` (${escapeType === "deportivo" ? "Deportivo" : "Original"})` : ""), trenItems: items }],
    } : o));
    if (sendToClient) onNavigate("vehicleDetail", order);
    else onNavigate("vehicleDetail", order);
  };

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <button onClick={() => onNavigate("vehicleDetail", order)} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 16, padding: 0, fontFamily: font }}>← Volver</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 36 }}>🔍</span>
        <div>
          <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 700 }}>Inspección</div>
          <div style={{ fontSize: 13, color: T.gray }}>{vehicle?.brand} {vehicle?.model} {vehicle?.year} — {order.domain}</div>
        </div>
      </div>

      {order.budgetNote && (
        <div style={{ ...card, padding: 12, marginBottom: 16, borderLeft: "3px solid #9C27B0", background: "rgba(156,39,176,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9C27B0", marginBottom: 4 }}>QUEJA DEL CLIENTE</div>
          <div style={{ fontSize: 13, color: T.text }}>{order.budgetNote}</div>
        </div>
      )}

      <div style={{ ...card, padding: 16, marginBottom: 16, borderLeft: `3px solid #9C27B0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>{catIcon}</span>
          <span style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700 }}>{cat}</span>
        </div>

        {/* Escape type selector */}
        {cat === "Escape" && !escapeType && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div onClick={() => handleEscapeType("original")} style={{ flex: 1, ...card, padding: "16px 12px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🔧</div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>Sistema Original</div>
            </div>
            <div onClick={() => handleEscapeType("deportivo")} style={{ flex: 1, ...card, padding: "16px 12px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🏎️</div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>Escape Deportivo</div>
            </div>
          </div>
        )}
        {cat === "Escape" && escapeType && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#9C27B0", fontWeight: 700 }}>{escapeType === "deportivo" ? "🏎️ Deportivo" : "🔧 Original"}</span>
            <span onClick={() => { setEscapeType(""); setItems(initialItems()); }} style={{ fontSize: 11, color: T.accent, cursor: "pointer", fontWeight: 600 }}>Cambiar</span>
          </div>
        )}

        {/* Items list */}
        {showItems && items.map((ti, j) => (
          <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 4, background: ti.isCustom ? (ti.label ? "rgba(156,39,176,0.06)" : T.bg) : (ti.selected ? "rgba(156,39,176,0.06)" : T.bg), borderRadius: 8, border: `1px solid ${(ti.isCustom ? (ti.label || ti.price) : ti.selected) ? "#9C27B0" : T.border}`, transition: "all .2s" }}>
            {!ti.isCustom && (
              <div onClick={() => {
                const newItems = [...items];
                newItems[j] = { ...newItems[j], selected: !newItems[j].selected };
                setItems(newItems);
              }} style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${ti.selected ? "#9C27B0" : T.border}`, background: ti.selected ? "#9C27B0" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .2s" }}>
                {ti.selected && <span style={{ color: "#FFF", fontSize: 14, fontWeight: 800 }}>✓</span>}
              </div>
            )}
            {ti.isCustom ? (
              <input value={ti.label || ""} onChange={e => {
                const newItems = [...items];
                newItems[j] = { ...newItems[j], label: e.target.value };
                setItems(newItems);
              }} placeholder="Describir item..." style={{ ...inputStyle, flex: 1, fontSize: 13, fontWeight: 600, padding: "4px 8px" }} />
            ) : (
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: ti.selected ? "#9C27B0" : T.text }}>{ti.label}</span>
            )}
            {ti.selected && !ti.isCustom && ti.key !== "otro" && ti.key !== "alineado" && ti.key !== "balanceado" && ti.key !== "rotacion" && (cat === "Tren Delantero" || cat === "Tren Trasero") && (
              <div style={{ display: "flex", gap: 2 }}>
                {[{ k: "izq", l: "Izquierdo" }, { k: "der", l: "Derecho" }, { k: "ambos", l: "Ambos" }].map(s => (
                  <div key={s.k} onClick={() => {
                    const newItems = [...items];
                    newItems[j] = { ...newItems[j], side: s.k };
                    setItems(newItems);
                  }} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: "pointer", border: `1px solid ${(ti.side || "ambos") === s.k ? "#9C27B0" : T.border}`, background: (ti.side || "ambos") === s.k ? "rgba(156,39,176,0.15)" : "transparent", color: (ti.side || "ambos") === s.k ? "#9C27B0" : T.gray, transition: "all .15s" }}>
                    {s.l}
                  </div>
                ))}
              </div>
            )}
            {ti.selected && !ti.isCustom && (
              <input value={ti.otroDesc || ""} onChange={e => {
                const newItems = [...items];
                newItems[j] = { ...newItems[j], otroDesc: e.target.value };
                setItems(newItems);
              }} placeholder={ti.key === "otro" ? "Especificar..." : "Descripción..."} style={{ ...inputStyle, width: 100, fontSize: 11, padding: "4px 8px" }} />
            )}
            {(ti.isCustom || ti.selected) && (
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 12, color: "#9C27B0", fontWeight: 700 }}>$</span>
                <input type="text" value={ti.price ? Number(ti.price).toLocaleString("es-AR") : ""} onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  const newItems = [...items];
                  newItems[j] = { ...newItems[j], price: raw };
                  setItems(newItems);
                }} placeholder="0" style={{ ...inputStyle, width: 85, fontSize: 14, fontWeight: 700, fontFamily: fontD, padding: "4px 8px", textAlign: "right" }} />
              </div>
            )}
            {ti.isCustom && items.filter(x => x.isCustom).length > 1 && (
              <span onClick={() => setItems(items.filter((_, k) => k !== j))} style={{ color: T.red, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: "0 4px" }}>✕</span>
            )}
          </div>
        ))}
        {showItems && (
          <div onClick={() => setItems([...items, { key: `libre_${Date.now()}`, label: "", selected: false, price: "", isCustom: true }])}
            style={{ padding: "8px 10px", marginBottom: 4, borderRadius: 8, border: `1px dashed ${T.border}`, textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#9C27B0", background: "rgba(156,39,176,0.03)" }}>
            + Agregar item
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{ ...card, padding: 14, marginBottom: 16 }}>
        <label style={labelStyle}>Observaciones de la inspección</label>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Describir hallazgos, estado general..." rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: font }} />
      </div>

      {/* Total + IVA + cuotas */}
      {total > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fontD, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            <span>TOTAL PRESUPUESTO</span><span style={{ color: "#9C27B0" }}>{fmt(total)}</span>
          </div>
          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>+ IVA {config.ivaRate}%</span>
            <span style={{ fontWeight: 600, color: T.grayLight }}>{fmt(total * config.ivaRate / 100)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>Total con IVA</span>
            <span style={{ fontWeight: 700, color: "#9C27B0" }}>{fmt(totalIva)}</span>
          </div>
          <div style={{ height: 1, background: T.border, margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.gray }}>3 cuotas (+{config.surcharge3}%)</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total3 / 3)} c/u</span>
              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total3)}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: T.gray }}>6 cuotas (+{config.surcharge6}%)</span>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: T.orange, fontWeight: 700 }}>{fmt(total6 / 6)} c/u</span>
              <span style={{ color: T.gray, marginLeft: 8, fontSize: 11 }}>Total: {fmt(total6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => saveBudget(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 13 }}>💾 Guardar borrador</button>
        <button onClick={() => saveBudget(true)} disabled={total === 0} style={{ ...btnPrimary("#9C27B0"), flex: 2, fontSize: 14, opacity: total > 0 ? 1 : 0.4 }}>📩 Enviar Presupuesto al Cliente</button>
      </div>
    </div>
  );
};

const ServiceSheetScreen = (props) => {
  const { order, clients, user, orders, setOrders, notifications, setNotifications, onNavigate } = props;
  const client = clients.find(c => c.id === order.clientId);
  const vehicle = client?.vehicles.find(v => v.domain === order.domain);

  const serviceWorks = order.works.filter(w => w.type === "Service Full" || w.type === "Service Base");
  const interventionWorks = order.works.filter(w => w.type === "Tren Delantero" || w.type === "Tren Trasero" || w.type === "Pastillas de Freno");
  const hasService = serviceWorks.length > 0;
  const embeddedWorkTypes = ["Pastillas de Freno", "Escobillas", "Baterías", "Lámpara"];
  const embeddedWorks = hasService ? order.works.filter(w => embeddedWorkTypes.includes(w.type)) : [];
  const checklistWorks = order.works.filter(w => {
    if (["Service Full", "Service Base", "Tren Delantero", "Tren Trasero"].includes(w.type)) return false;
    if (hasService && embeddedWorkTypes.includes(w.type)) return false; // handled inside service sheet
    if (w.type === "Pastillas de Freno" && !hasService) return false; // handled by intervention
    return true;
  });

  const tabs = [
    ...serviceWorks.map(w => ({ type: "service", label: w.type, icon: w.type === "Service Full" ? "🛠️" : "🔧", work: w })),
    ...embeddedWorks.map(w => ({ type: "embedded", label: w.type, icon: findWorkType(w.type)?.icon || "🔧", work: w })),
    ...interventionWorks.map(w => ({ type: "intervention", label: w.type, icon: "⚙️", work: w })),
    ...checklistWorks.map(w => ({ type: "checklist", label: w.type, icon: findWorkType(w.type)?.icon || "🔧", work: w })),
  ];

  const [activeTab, setActiveTab] = useState(0);
  const currentTab = tabs[activeTab] || tabs[0];

  const isServiceBase = order.works.some(w => w.type === "Service Base");
  const isPastillas = order.works.some(w => w.type === "Pastillas de Freno");
  const pastillasDel = order.works.some(w => w.type === "Pastillas de Freno" && w.desc && w.desc.toLowerCase().includes("delantero"));
  const pastillasTra = order.works.some(w => w.type === "Pastillas de Freno" && w.desc && w.desc.toLowerCase().includes("trasero"));
  const SHEET_TPL = isServiceBase ? SB_TEMPLATE : isPastillas && !order.works.some(w => w.type === "Service Full") ? (pastillasDel && pastillasTra ? PF_AMBOS_TEMPLATE : pastillasTra ? PF_TRA_TEMPLATE : PF_DEL_TEMPLATE) : SF_TEMPLATE;
  const workDesc = order.works.find(w => w.type === "Service Full" || w.type === "Service Base")?.desc || "";

  const forcedChangeItems = new Set();
  order.works.forEach(w => {
    if (w.type === "Escobillas") forcedChangeItems.add("escobillas_estado");
    if (w.type === "Baterías") forcedChangeItems.add("bateria_control");
    if (w.type === "Lámpara") ["luz_baja", "luz_alta", "luz_pos_del", "luz_pos_tra", "luz_stop", "guinos"].forEach(k => forcedChangeItems.add(k));
    if (w.type === "Pastillas de Freno") {
      const desc = (w.desc || "").toLowerCase();
      const hasDel = desc.includes("delanter") || desc.includes("del") || w.brakeEjes?.del;
      const hasTra = desc.includes("traser") || desc.includes("tra") || w.brakeEjes?.tra;
      if (hasDel || (!hasDel && !hasTra)) forcedChangeItems.add("td_pastillas");
      if (hasTra) forcedChangeItems.add("tt_freno");
    }
    if (w.type === "Tren Delantero" && w.trenItems) {
      const TREN_DEL_MAP = {
        amortiguadores: "td_amortiguadores",
        extremos: "td_rotulas", // extremos de dirección maps to rótulas section
        rotulas: "td_rotulas",
        bieletas: "td_bieletas",
        bujes: "td_bujes_parrilla",
        parrilla: "td_bujes_parrilla",
      };
      w.trenItems.filter(ti => ti.selected).forEach(ti => {
        const sheetKey = TREN_DEL_MAP[ti.key];
        if (sheetKey) forcedChangeItems.add(sheetKey);
      });
    }
    if (w.type === "Tren Trasero" && w.trenItems) {
      const TREN_TRA_MAP = {
        amortiguadores_t: "tt_amortiguadores",
        bujes_t: "tt_bujes",
      };
      w.trenItems.filter(ti => ti.selected).forEach(ti => {
        const sheetKey = TREN_TRA_MAP[ti.key];
        if (sheetKey) forcedChangeItems.add(sheetKey);
      });
    }
    if (w.type === "Escape" && w.trenItems) {
      const ESC_MAP = {
        silenciador_tra: "silenciador_trasero",
        silenciador_int: "silenciador_intermedio",
        flexible: "flexible_escape",
        multiple_esc: "multiple_escape",
        cano_intermedio: "cano_escape",
        soporte_esc: "soporte_escape",
        catalizador_esc: "catalizador",
      };
      w.trenItems.filter(ti => ti.selected).forEach(ti => {
        const sheetKey = ESC_MAP[ti.key];
        if (sheetKey) forcedChangeItems.add(sheetKey);
      });
    }
  });

  const [data, setData] = useState(() => {
    if (order.serviceSheet) return order.serviceSheet;
    const init = {};
    SHEET_TPL.forEach(sec => sec.items.forEach(item => {
      init[item.id] = { checked: false, status: "", obs: "", percent: -1, toggle: "", voltage: "", fluidOk: "", added: false, lampChanged: false, dtcStatus: "", dtcEntries: [], tires: { del_izq: 100, del_der: 100, tra_izq: 100, tra_der: 100 } };
    }));
    return init;
  });

  const [expandedSection, setExpandedSection] = useState(null);
  const [techNotes, setTechNotes] = useState(order.techNotes || [""]);
  const [showErrors, setShowErrors] = useState(false);

  const [workChecklist, setWorkChecklist] = useState(() => {
    const saved = order.workChecklist || {};
    const result = {};
    checklistWorks.forEach(w => {
      const wKey = w.type + "_" + (order.works.indexOf(w));
      if (saved[wKey]) {
        result[wKey] = saved[wKey];
      } else {
        const items = [];
        if (w.trenItems) {
          const selected = w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected);
          if (selected.length > 0) {
            selected.forEach(ti => {
              items.push({ label: ti.isCustom ? ti.label : ti.label, desc: ti.otroDesc || "", done: false, note: "" });
            });
          }
        }
        if (items.length === 0 && w.desc) {
          const parts = w.desc.split(",").map(s => s.trim()).filter(Boolean);
          if (parts.length > 1) {
            parts.forEach(p => items.push({ label: p, desc: "", done: false, note: "" }));
          } else {
            items.push({ label: w.desc, desc: "", done: false, note: "" });
          }
        }
        if (items.length === 0) {
          items.push({ label: w.type, desc: "", done: false, note: "" });
        }
        if (w.type === "Baterías") {
          items.push({ label: "Datos de batería instalada", desc: "Completar serie, amperaje y garantía", done: false, note: "", isBatteryData: true, batCode: "", batAmp: "", batWarranty: "12" });
          items.push({ label: "Control carga alternador", desc: "Medir voltaje del alternador", done: false, note: "", isVoltage: true, voltage: "" });
        }
        result[wKey] = items;
      }
    });
    return result;
  });

  const saveChecklist = (newCl) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, workChecklist: newCl } : o));
  };

  const updateCheckItem = (wKey, idx, updates) => {
    setWorkChecklist(prev => {
      const newCl = { ...prev };
      newCl[wKey] = [...(newCl[wKey] || [])];
      newCl[wKey][idx] = { ...newCl[wKey][idx], ...updates };
      saveChecklist(newCl);
      return newCl;
    });
  };
  const [errorItems, setErrorItems] = useState([]);

  const upd = (id, updates) => setData(d => ({ ...d, [id]: { ...d[id], ...updates } }));

  const isVisible = (item) => {
    if (!item.dependsOn) return true;
    return !!data[item.dependsOn]?.toggle;
  };

  const isComplete = (item) => {
    const d = data[item.id];
    if (!d) return false;
    switch (item.type) {
      case "check": return d.checked;
      case "serviceReset": return !!d.resetStatus;
      case "statusRC": return !!d.status;
      case "binary": return !!d.fluidOk;
      case "ternary": return !!d.fluidOk;
      case "lavaparabrisas": return !!d.fluidOk;
      case "fluid": return !!d.fluidOk;
      case "brakeFluid": return d.percent >= 0;
      case "lamp": return !!d.fluidOk;
      case "percentRC": return d.percent >= 0;
      case "batteryPercent": return d.percent >= 0;
      case "freno_trasero": return !!d.toggle && d.percent >= 0;
      case "toggle": return !!d.toggle;
      case "voltage": return !!d.voltage;
      case "dtc": return !!d.dtcStatus;
      case "tires": return d.checked;
      case "optionalBinary": return !d.checked || !!d.fluidOk;
      case "optionalStatusRC": return !d.checked || !!d.status;
      default: return d.checked;
    }
  };

  const allItems = SHEET_TPL.flatMap(s => s.items.filter(isVisible));
  const completedCount = allItems.filter(isComplete).length;
  const progress = allItems.length > 0 ? (completedCount / allItems.length * 100) : 0;

  const saveSheet = () => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, serviceSheet: data, techNotes } : o));
  };
  useEffect(() => { saveSheet(); }, [data, techNotes]);

  const SHEET_TO_WORK_MAP = {
    escobillas_estado: "Escobillas",
    bateria_control: "Baterías",
    bujias_estado: "Bujías",
    td_pastillas: "Pastillas de Freno",
    correa_poliv: "Mecánica",
    tensores_poliv: "Mecánica",
  };

  useEffect(() => {
    if (checklistWorks.length === 0) return;
    let updated = false;
    const newCl = { ...workChecklist };
    Object.entries(SHEET_TO_WORK_MAP).forEach(([sheetKey, workType]) => {
      const sheetItem = data[sheetKey];
      if (!sheetItem) return;
      const isCambiado = sheetItem.fluidOk === "cambiado" || sheetItem.fluidOk === "cambiada" || sheetItem.status === "cambiado";
      if (!isCambiado) return;
      Object.entries(newCl).forEach(([wKey, items]) => {
        if (!wKey.startsWith(workType + "_")) return;
        items.forEach((item, idx) => {
          if (!item.done && !item.autoCompleted) {
            newCl[wKey] = [...newCl[wKey]];
            newCl[wKey][idx] = { ...newCl[wKey][idx], autoCompleted: true, autoNote: "Completado desde Foja de Servicio" };
            updated = true;
          }
        });
      });
    });
    if (updated) {
      setWorkChecklist(newCl);
      saveChecklist(newCl);
    }
  }, [data]);

  const [showPendingAuthPopup, setShowPendingAuthPopup] = useState(false);
  const [showMissingChangePopup, setShowMissingChangePopup] = useState(null);
  const [showAuthRequest, setShowAuthRequest] = useState(false);

  const tryFinalize = () => {
    if (serviceWorks.length > 0) {
      const incomplete = allItems.filter(it => !isComplete(it));
      if (incomplete.length > 0) {
        setErrorItems(incomplete.map(it => it.id));
        setShowErrors(true);
        const secIdx = SHEET_TPL.findIndex(s => s.items.some(it => it.id === incomplete[0].id));
        setExpandedSection(secIdx);
        setActiveTab(0);
        return;
      }

      const missingChanges = [];
      const workLabels = {};
      order.works.forEach(w => {
        if (w.type === "Service Full" || w.type === "Service Base") return;
        const myForced = [];
        forcedChangeItems.forEach(key => {
          const sheetItem = data[key];
          if (!sheetItem) return;
          const isMarked = sheetItem.fluidOk === "cambiado" || sheetItem.status === "cambiado";
          const belongsTo = (() => {
            if (w.type === "Escobillas" && key === "escobillas_estado") return true;
            if (w.type === "Baterías" && key === "bateria_control") return true;
            if (w.type === "Pastillas de Freno" && (key === "td_pastillas" || key === "tt_freno")) return true;
            if (w.type === "Tren Delantero" && key.startsWith("td_")) return true;
            if (w.type === "Tren Trasero" && key.startsWith("tt_")) return true;
            if (w.type === "Escape" && ["silenciador_trasero", "silenciador_intermedio", "multiple_escape", "cano_escape", "soporte_escape", "catalizador"].includes(key)) return true;
            if (w.type === "Lámpara" && ["luz_baja", "luz_alta", "luz_pos_del", "luz_pos_tra", "luz_stop", "guinos"].includes(key)) return true;
            return false;
          })();
          if (belongsTo) myForced.push({ key, isMarked });
        });
        if (myForced.length > 0 && !myForced.some(f => f.isMarked)) {
          missingChanges.push(w.type);
        }
      });
      if (missingChanges.length > 0) {
        setShowMissingChangePopup(missingChanges);
        return;
      }
    }
    for (const [wKey, items] of Object.entries(workChecklist)) {
      const pending = items.filter(it => !it.done);
      if (pending.length > 0) {
        const tabIdx = tabs.findIndex(t => t.type === "checklist" && t.work.type + "_" + order.works.indexOf(t.work) === wKey);
        if (tabIdx >= 0) setActiveTab(tabIdx);
        return;
      }
    }
    const hasPendingAuth = (notifications || []).some(n => n.orderId === order.id && n.status === "pending");
    if (hasPendingAuth) {
      setShowPendingAuthPopup(true);
      return;
    }
    doFinalize();
  };

  const doFinalize = () => {
    setShowPendingAuthPopup(false);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "done", serviceSheet: data, techNotes, workChecklist } : o));
    onNavigate("vehicleDetail", order);
  };

  const hasError = (id) => showErrors && errorItems.includes(id);

  const setStatus4 = (id, s) => {
    const d = data[id];
    if (d.status === s) {
      upd(id, { status: "", checked: false });
    } else {
      upd(id, { status: s, checked: true });
    }
  };

  const setBinary = (id, val) => {
    const d = data[id];
    upd(id, { fluidOk: d.fluidOk === val ? "" : val, checked: d.fluidOk === val ? false : true });
  };

  const renderItem = (item) => {
    const d = data[item.id] || {};
    const ml = { marginLeft: 34 };
    const errStyle = hasError(item.id) ? { outline: `2px solid ${T.red}`, outlineOffset: -1, borderRadius: 8, background: "rgba(229,57,53,0.04)" } : {};
    const isForced = forcedChangeItems.has(item.id);

    return (
      <div key={item.id} id={`sheet-item-${item.id}`} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}`, ...errStyle }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          {item.type === "check" || item.type === "serviceReset" || item.type === "optionalBinary" || item.type === "optionalStatusRC" ? (
            <div onClick={() => {
              if (item.type === "check") upd(item.id, { checked: !d.checked });
              else if (item.type === "serviceReset") upd(item.id, { checked: !d.checked, resetStatus: !d.checked ? d.resetStatus : "" });
              else if (item.type === "optionalBinary") upd(item.id, { checked: !d.checked, fluidOk: !d.checked ? d.fluidOk : "" });
              else upd(item.id, { checked: !d.checked, status: !d.checked ? d.status : "" });
            }}
              style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${d.checked ? T.green : T.border}`, background: d.checked ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#fff", flexShrink: 0 }}>
              {d.checked ? "✓" : ""}
            </div>
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: 6, border: `2px solid ${(d.checked || isComplete(item)) ? T.green : T.border}`, background: (d.checked || isComplete(item)) ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0 }}>
              {(d.checked || isComplete(item)) ? "✓" : ""}
            </div>
          )}
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{item.label}</span>
          {hasError(item.id) && <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>⚠ Completar</span>}
        </div>

        {item.type === "statusRC" && !isForced && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["bien", "regular", "cambiar"].map(s => (
                <div key={s} onClick={() => setStatus4(item.id, s)}
                  style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === s ? `${S4_COLORS[s]}20` : T.bg, color: d.status === s ? S4_COLORS[s] : T.gray, border: `1.5px solid ${d.status === s ? S4_COLORS[s] : T.border}`, display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: S4_COLORS[s] }} />{s === "cambiar" ? "CAMBIAR" : s.toUpperCase()}
                </div>
              ))}
            </div>
            {d.status === "cambiar" && (
              <div style={{ marginTop: 8 }}>
                <div onClick={() => setStatus4(item.id, "cambiado")}
                  style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? `${T.accent}20` : T.bg, color: d.status === "cambiado" ? T.accent : T.gray, border: `1.5px solid ${d.status === "cambiado" ? T.accent : T.border}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  🔵 SUSTITUIDA
                </div>
              </div>
            )}
          </div>
        )}

        {item.type === "statusRC" && isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setStatus4(item.id, d.status === "cambiado" ? "" : "cambiado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? "#1E88E520" : T.bg, color: d.status === "cambiado" ? "#1E88E5" : T.gray, border: `2px solid ${d.status === "cambiado" ? "#1E88E5" : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1E88E5" }} />SUSTITUIDA
            </div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 600, display: "flex", alignItems: "center" }}>⚠️ Incluido en la orden</span>
          </div>
        )}

                {item.type === "serviceReset" && (
          <div style={{ display: "flex", gap: 6, ...ml, flexWrap: "wrap" }}>
            <div onClick={() => upd(item.id, { resetStatus: "realizado", checked: true })}
              style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.resetStatus === "realizado" ? "rgba(67,160,71,.15)" : T.bg, color: d.resetStatus === "realizado" ? T.green : T.gray, border: `1px solid ${d.resetStatus === "realizado" ? T.green : T.border}` }}>
              ✅ SE REALIZÓ
            </div>
            <div onClick={() => upd(item.id, { resetStatus: "no_equipado", checked: true })}
              style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.resetStatus === "no_equipado" ? "rgba(229,57,53,.15)" : T.bg, color: d.resetStatus === "no_equipado" ? T.red : T.gray, border: `1px solid ${d.resetStatus === "no_equipado" ? T.red : T.border}` }}>
              ⛔ NO EQUIPADO
            </div>
          </div>
        )}

        {item.type === "percentRC" && !isForced && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: T.grayLight, width: 65 }}>Desgaste</span>
              <input type="range" min="0" max="100" value={d.percent >= 0 ? d.percent : 50}
                onChange={e => { const v = parseInt(e.target.value); upd(item.id, { percent: v, checked: true, status: v <= 10 ? "cambiar" : v <= 20 ? "regular" : "" }); }}
                style={{ flex: 1, accentColor: (d.percent >= 0 ? d.percent : 50) > 70 ? "#43a047" : (d.percent >= 0 ? d.percent : 50) > 20 ? "#43a047" : (d.percent >= 0 ? d.percent : 50) > 10 ? "#FF9800" : T.red, height: 6 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: (d.percent >= 0 ? d.percent : 50) > 70 ? "#43a047" : (d.percent >= 0 ? d.percent : 50) > 20 ? "#43a047" : (d.percent >= 0 ? d.percent : 50) > 10 ? "#FF9800" : T.red, width: 36, textAlign: "right" }}>{d.percent >= 0 ? d.percent : "--"}%</span>
            </div>
            <div style={{ display: "flex", gap: 6, fontSize: 11, fontWeight: 700, justifyContent: "space-between" }}>
              <span style={{ color: T.red }}>0-10% CAMBIAR</span>
              <span style={{ color: "#FF9800" }}>10-20% CRÍTICO</span>
              <span style={{ color: "#43a047" }}>20-70% BIEN</span>
              <span style={{ color: "#43a047" }}>70-100% ÓPTIMO</span>
            </div>
            {d.percent >= 0 && d.percent <= 10 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                {["cambiar", "cambiado"].map(s => (
                  <div key={s} onClick={() => setStatus4(item.id, s)}
                    style={{ padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, background: d.status === s ? `${S4_COLORS[s]}20` : T.bg, color: d.status === s ? S4_COLORS[s] : T.gray, border: `1px solid ${d.status === s ? S4_COLORS[s] : T.border}` }}>
                    {S4_ICONS[s]} {s === "cambiado" ? "SUSTITUIDA" : s.toUpperCase()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {item.type === "percentRC" && isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setStatus4(item.id, d.status === "cambiado" ? "" : "cambiado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? "#1E88E520" : T.bg, color: d.status === "cambiado" ? "#1E88E5" : T.gray, border: `2px solid ${d.status === "cambiado" ? "#1E88E5" : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1E88E5" }} />SUSTITUIDA
            </div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 600, display: "flex", alignItems: "center" }}>⚠️ Incluido en la orden</span>
          </div>
        )}

        {item.type === "batteryPercent" && (() => {
          const pct = d.percent >= 0 ? d.percent : -1;
          const autoLabel = pct >= 75 ? "BIEN" : pct >= 50 ? "REGULAR" : pct >= 15 ? "MAL" : pct >= 0 ? "CRÍTICO" : "";
          const autoColor = pct >= 75 ? T.green : pct >= 50 ? T.orange : pct >= 0 ? T.red : T.gray;
          return (
            <div style={{ ...ml, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: T.grayLight, width: 65 }}>{item.percentLabel}</span>
                <input type="range" min="0" max="100" value={pct >= 0 ? pct : 50}
                  onChange={e => upd(item.id, { percent: parseInt(e.target.value), checked: true })}
                  style={{ flex: 1, accentColor: autoColor, height: 6 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: autoColor, width: 36, textAlign: "right" }}>{pct >= 0 ? pct : "--"}%</span>
              </div>
              {pct >= 0 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: `${autoColor}20`, color: autoColor, border: `1px solid ${autoColor}` }}>
                    {pct >= 75 ? "🟢" : pct >= 50 ? "🟡" : "🔴"} {autoLabel}
                  </div>
                  <div onClick={() => setStatus4(item.id, "cambiado")}
                    style={{ padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? `${S4_COLORS.cambiado}20` : T.bg, color: d.status === "cambiado" ? S4_COLORS.cambiado : T.gray, border: `1px solid ${d.status === "cambiado" ? S4_COLORS.cambiado : T.border}` }}>
                    {S4_ICONS.cambiado} SUSTITUIDA
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {item.type === "optionalBinary" && d.checked && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            {[{ k: "bien", label: "BIEN", color: T.green }, { k: "mal", label: "MAL", color: T.red }].map(s => (
              <div key={s.k} onClick={() => upd(item.id, { fluidOk: d.fluidOk === s.k ? "" : s.k })}
                style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === s.k ? `${s.color}20` : T.bg, color: d.fluidOk === s.k ? s.color : T.gray, border: `2px solid ${d.fluidOk === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
              </div>
            ))}
          </div>
        )}

        {item.type === "optionalStatusRC" && d.checked && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8, ...ml, flexWrap: "wrap" }}>
            {["bien", "regular", "cambiar"].map(s => (
              <div key={s} onClick={() => setStatus4(item.id, s)}
                style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === s ? `${S4_COLORS[s]}20` : T.bg, color: d.status === s ? S4_COLORS[s] : T.gray, border: `1px solid ${d.status === s ? S4_COLORS[s] : T.border}` }}>
                {S4_ICONS[s]} {s === "cambiado" ? "SUSTITUIDA" : s.toUpperCase()}
              </div>
            ))}
            {(d.status === "regular" || d.status === "cambiar" || d.status === "cambiado") && (
              <div onClick={() => setStatus4(item.id, "cambiado")}
                style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? `${S4_COLORS.cambiado}20` : T.bg, color: d.status === "cambiado" ? S4_COLORS.cambiado : T.gray, border: `1px solid ${d.status === "cambiado" ? S4_COLORS.cambiado : T.border}` }}>
                {S4_ICONS.cambiado} SUSTITUIDA
              </div>
            )}
          </div>
        )}

        {item.type === "freno_trasero" && !isForced && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["Pastillas", "Cinta"].map(opt => (
                <div key={opt} onClick={() => upd(item.id, { toggle: d.toggle === opt ? "" : opt })}
                  style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, background: d.toggle === opt ? "rgba(30,136,229,0.12)" : T.bg, color: d.toggle === opt ? T.accent : T.gray, border: `2px solid ${d.toggle === opt ? T.accent : T.border}` }}>
                  {opt}
                </div>
              ))}
            </div>
            {d.toggle && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: T.grayLight, width: 65 }}>Vida útil</span>
                  <input type="range" min="0" max="100" value={d.percent >= 0 ? d.percent : 50}
                    onChange={e => upd(item.id, { percent: parseInt(e.target.value), checked: true })}
                    style={{ flex: 1, accentColor: (d.percent >= 0 ? d.percent : 50) > 50 ? T.green : (d.percent >= 0 ? d.percent : 50) > 20 ? T.orange : T.red, height: 6 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: (d.percent >= 0 ? d.percent : 50) > 50 ? T.green : (d.percent >= 0 ? d.percent : 50) > 20 ? T.orange : T.red, width: 36, textAlign: "right" }}>{d.percent >= 0 ? d.percent : "--"}%</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["cambiar", "cambiado"].map(s => (
                    <div key={s} onClick={() => setStatus4(item.id, s)}
                      style={{ padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, background: d.status === s ? `${S4_COLORS[s]}20` : T.bg, color: d.status === s ? S4_COLORS[s] : T.gray, border: `1px solid ${d.status === s ? S4_COLORS[s] : T.border}` }}>
                      {S4_ICONS[s]} {s === "cambiado" ? "SUSTITUIDA" : s.toUpperCase()}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {item.type === "freno_trasero" && isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setStatus4(item.id, d.status === "cambiado" ? "" : "cambiado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.status === "cambiado" ? "#1E88E520" : T.bg, color: d.status === "cambiado" ? "#1E88E5" : T.gray, border: `2px solid ${d.status === "cambiado" ? "#1E88E5" : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1E88E5" }} />SUSTITUIDA
            </div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 600, display: "flex", alignItems: "center" }}>⚠️ Incluido en la orden</span>
          </div>
        )}

        {item.type === "binary" && !isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            {[
              { k: "bien", label: item.labels?.[0] || "BIEN", color: T.green },
              { k: "mal", label: item.labels?.[1] || "MAL", color: T.red },
            ].map(s => (
              <div key={s.k} onClick={() => setBinary(item.id, s.k)}
                style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, background: d.fluidOk === s.k ? `${s.color}20` : T.bg, color: d.fluidOk === s.k ? s.color : T.gray, border: `2px solid ${d.fluidOk === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
              </div>
            ))}
          </div>
        )}

        {item.type === "binary" && isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setBinary(item.id, d.fluidOk === "cambiado" ? "" : "cambiado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === "cambiado" ? "#1E88E520" : T.bg, color: d.fluidOk === "cambiado" ? "#1E88E5" : T.gray, border: `2px solid ${d.fluidOk === "cambiado" ? "#1E88E5" : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1E88E5" }} />SUSTITUIDA
            </div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 600, display: "flex", alignItems: "center" }}>⚠️ Incluido en la orden</span>
          </div>
        )}

        {item.type === "ternary" && !isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            {[
              { k: "bien", label: "BIEN", color: T.green },
              { k: "mal", label: "MAL", color: T.red },
              { k: "cambiado", label: "SUSTITUIDA", color: "#1E88E5" },
            ].map(s => (
              <div key={s.k} onClick={() => setBinary(item.id, s.k)}
                style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === s.k ? `${s.color}20` : T.bg, color: d.fluidOk === s.k ? s.color : T.gray, border: `2px solid ${d.fluidOk === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
              </div>
            ))}
          </div>
        )}

        {item.type === "ternary" && isForced && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setBinary(item.id, d.fluidOk === "cambiado" ? "" : "cambiado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === "cambiado" ? "#1E88E520" : T.bg, color: d.fluidOk === "cambiado" ? "#1E88E5" : T.gray, border: `2px solid ${d.fluidOk === "cambiado" ? "#1E88E5" : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1E88E5" }} />SUSTITUIDA
            </div>
            <span style={{ fontSize: 10, color: T.orange, fontWeight: 600, display: "flex", alignItems: "center" }}>⚠️ Incluido en la orden</span>
          </div>
        )}

        {item.type === "lavaparabrisas" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            <div onClick={() => setBinary(item.id, d.fluidOk === "nivelado" ? "" : "nivelado")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === "nivelado" ? `${T.accent}20` : T.bg, color: d.fluidOk === "nivelado" ? T.accent : T.gray, border: `2px solid ${d.fluidOk === "nivelado" ? T.accent : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: T.accent }} />SE NIVELÓ
            </div>
          </div>
        )}

        {item.type === "brakeFluid" && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.grayLight, marginBottom: 6 }}>% DE AGUA EN LÍQUIDO</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[{v:0,l:"0%",c:T.green,t:"OK"},{v:1,l:"1%",c:T.green,t:"OK"},{v:2,l:"2%",c:T.green,t:"OK"},{v:3,l:"3%",c:T.red,t:"CRÍTICO"},{v:4,l:"4%",c:T.red,t:"MAL"}].map(o => (
                <div key={o.v} onClick={() => upd(item.id, { percent: d.percent === o.v ? -1 : o.v, checked: true })}
                  style={{ flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer", textAlign: "center", border: `2px solid ${d.percent === o.v ? o.c : T.border}`, background: d.percent === o.v ? `${o.c}20` : T.bg, transition: "all .15s" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fontD, color: d.percent === o.v ? o.c : T.gray }}>{o.l}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: d.percent === o.v ? o.c : T.gray, marginTop: 2 }}>{o.t}</div>
                </div>
              ))}
            </div>
            <div onClick={() => upd(item.id, { added: !d.added })}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.added ? "rgba(30,136,229,0.12)" : T.bg, color: d.added ? T.accent : T.gray, border: `1px solid ${d.added ? T.accent : T.border}` }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${d.added ? T.accent : T.border}`, background: d.added ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{d.added ? "✓" : ""}</div>
              Se niveló
            </div>
          </div>
        )}

        {item.type === "fluid" && (
          <div style={{ ...ml, marginBottom: 8 }}>
            {item.hasPercent && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: T.grayLight, width: 70 }}>{item.percentLabel}</span>
                <input type="range" min="0" max="100" value={d.percent >= 0 ? d.percent : 0}
                  onChange={e => upd(item.id, { percent: parseInt(e.target.value) })}
                  style={{ flex: 1, accentColor: (d.percent >= 0 ? d.percent : 0) <= 3 ? T.green : T.red, height: 6 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: (d.percent >= 0 ? d.percent : 0) <= 3 ? T.green : T.red, width: 36, textAlign: "right" }}>{d.percent >= 0 ? d.percent : 0}%</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {[{ k: "bien", label: "BIEN", color: T.green }, { k: "cambiar", label: "CAMBIAR", color: T.red }].map(s => (
                <div key={s.k} onClick={() => setBinary(item.id, s.k)}
                  style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === s.k ? `${s.color}20` : T.bg, color: d.fluidOk === s.k ? s.color : T.gray, border: `2px solid ${d.fluidOk === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
                </div>
              ))}
            </div>
            <div onClick={() => upd(item.id, { added: !d.added })}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.added ? "rgba(30,136,229,0.12)" : T.bg, color: d.added ? T.accent : T.gray, border: `1px solid ${d.added ? T.accent : T.border}` }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${d.added ? T.accent : T.border}`, background: d.added ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{d.added ? "✓" : ""}</div>
              Se niveló
            </div>
          </div>
        )}

        {item.type === "lamp" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml, flexWrap: "wrap" }}>
            {[{ k: "bien", label: "BIEN", color: T.green }, { k: "quemada", label: "QUEMADA", color: T.red }].map(s => (
              <div key={s.k} onClick={() => upd(item.id, { fluidOk: d.fluidOk === s.k ? "" : s.k, checked: true, lampChanged: s.k === "bien" ? false : d.lampChanged })}
                style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.fluidOk === s.k ? `${s.color}20` : T.bg, color: d.fluidOk === s.k ? s.color : T.gray, border: `2px solid ${d.fluidOk === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
              </div>
            ))}
            {d.fluidOk === "quemada" && (
              <div onClick={() => upd(item.id, { lampChanged: !d.lampChanged })}
                style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.lampChanged ? `${T.accent}20` : T.bg, color: d.lampChanged ? T.accent : T.gray, border: `2px solid ${d.lampChanged ? T.accent : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                🔵 SUSTITUIDA
              </div>
            )}
          </div>
        )}

        {item.type === "toggle" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8, ...ml }}>
            {item.toggleOptions.map(opt => (
              <div key={opt} onClick={() => upd(item.id, { toggle: d.toggle === opt ? "" : opt, checked: true })}
                style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, background: d.toggle === opt ? "rgba(30,136,229,0.12)" : T.bg, color: d.toggle === opt ? T.accent : T.gray, border: `2px solid ${d.toggle === opt ? T.accent : T.border}` }}>
                {opt}
              </div>
            ))}
          </div>
        )}

        {item.type === "voltage" && (
          <div style={{ ...ml, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <input value={d.voltage || ""} onChange={e => upd(item.id, { voltage: e.target.value, checked: !!e.target.value })}
              placeholder="Ej: 14.2" style={{ ...inputStyle, width: 100, textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: fontD }} />
            <span style={{ fontSize: 14, color: T.gray }}>V</span>
            {d.voltage && (
              <div style={{ padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: parseFloat(d.voltage) >= 13.5 && parseFloat(d.voltage) <= 14.8 ? `${T.green}20` : `${T.red}20`, color: parseFloat(d.voltage) >= 13.5 && parseFloat(d.voltage) <= 14.8 ? T.green : T.red }}>
                {parseFloat(d.voltage) >= 13.5 && parseFloat(d.voltage) <= 14.8 ? "🟢 BIEN" : "🔴 MAL"}
              </div>
            )}
          </div>
        )}

        {item.type === "dtc" && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {[{ k: "sin_fallos", label: "SIN FALLOS", color: T.green }, { k: "con_fallos", label: "CON FALLOS", color: T.red }].map(s => (
                <div key={s.k} onClick={() => upd(item.id, { dtcStatus: d.dtcStatus === s.k ? "" : s.k, checked: true, dtcEntries: s.k === "sin_fallos" ? [] : (d.dtcEntries?.length ? d.dtcEntries : [{ code: "", desc: "" }]) })}
                  style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, background: d.dtcStatus === s.k ? `${s.color}20` : T.bg, color: d.dtcStatus === s.k ? s.color : T.gray, border: `2px solid ${d.dtcStatus === s.k ? s.color : T.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />{s.label}
                </div>
              ))}
            </div>
            {d.dtcStatus === "con_fallos" && (
              <>
                {(d.dtcEntries || []).map((entry, ei) => (
                  <div key={ei} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input value={entry.code || ""} onChange={e => { const entries = [...(d.dtcEntries || [])]; entries[ei] = { ...entries[ei], code: e.target.value }; upd(item.id, { dtcEntries: entries }); }}
                      placeholder="Código (ej: P0301)" style={{ ...inputStyle, width: 130, fontFamily: fontD, fontSize: 14 }} />
                    <input value={entry.desc || ""} onChange={e => { const entries = [...(d.dtcEntries || [])]; entries[ei] = { ...entries[ei], desc: e.target.value }; upd(item.id, { dtcEntries: entries }); }}
                      placeholder="Descripción..." style={{ ...inputStyle, flex: 1 }} />
                    {(d.dtcEntries || []).length > 1 && (
                      <div onClick={() => upd(item.id, { dtcEntries: (d.dtcEntries || []).filter((_, j) => j !== ei) })}
                        style={{ width: 32, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.red, fontSize: 14, borderRadius: 6, background: "rgba(229,57,53,0.08)" }}>✕</div>
                    )}
                  </div>
                ))}
                <div onClick={() => upd(item.id, { dtcEntries: [...(d.dtcEntries || []), { code: "", desc: "" }] })}
                  style={{ fontSize: 12, color: T.accent, cursor: "pointer", fontWeight: 700 }}>+ Agregar fallo</div>
              </>
            )}
          </div>
        )}

        {item.type === "tires" && (
          <div style={{ ...ml, marginBottom: 8 }}>
            <CarTiresDiagram tires={d.tires || { del_izq: 100, del_der: 100, tra_izq: 100, tra_der: 100 }}
              onChange={t => upd(item.id, { tires: t, checked: true })} />
          </div>
        )}

        <div style={ml}>
          <input value={d.obs || ""} onChange={e => upd(item.id, { obs: e.target.value })}
            placeholder="Observación..." style={{ ...inputStyle, fontSize: 12, padding: "8px 12px" }} />
        </div>
      </div>
    );
  };

  const getCheckProgress = (wKey) => {
    const items = workChecklist[wKey] || [];
    if (items.length === 0) return 100;
    return Math.round(items.filter(it => it.done).length / items.length * 100);
  };

  const allTabsDone = () => {
    if (serviceWorks.length > 0 && progress < 100) return false;
    return Object.entries(workChecklist).every(([, items]) => items.every(it => it.done));
  };

  const renderChecklist = (work) => {
    const wKey = work.type + "_" + order.works.indexOf(work);
    const items = workChecklist[wKey] || [];
    const done = items.filter(it => it.done).length;
    const pct = items.length > 0 ? Math.round(done / items.length * 100) : 0;

    return (
      <div>
        {/* Progress */}
        <div style={{ ...card, padding: 20, marginBottom: 16, borderLeft: `4px solid ${pct === 100 ? T.green : T.orange}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: fontD, fontSize: 13, fontWeight: 600, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{work.type}</div>
              <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700 }}>{fmtD(order.domain)}</div>
              <div style={{ fontSize: 13, color: T.gray }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: fontD, color: pct === 100 ? T.green : T.accent }}>{pct}%</div>
              <div style={{ fontSize: 11, color: T.gray }}>{done}/{items.length}</div>
            </div>
          </div>
          <div style={{ height: 6, background: T.bg, borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: pct === 100 ? T.green : `linear-gradient(90deg, ${T.accent}, #42a5f5)`, width: `${pct}%`, transition: "width .4s" }} />
          </div>
        </div>

        {/* Description if exists */}
        {work.desc && !work.trenItems && (
          <div style={{ ...card, padding: 14, marginBottom: 16, borderLeft: `3px solid ${T.orange}`, background: "rgba(255,152,0,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.orange, marginBottom: 4 }}>📝 DESCRIPCIÓN DEL TRABAJO</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{work.desc}</div>
          </div>
        )}

        {/* Items checklist */}
        <div style={{ ...card, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>Items a realizar</div>
          {items.map((item, idx) => (
            <div key={idx} style={{ padding: "12px 14px", marginBottom: 6, borderRadius: 10, border: `1px solid ${item.done ? T.green : item.autoCompleted ? T.accent : T.border}`, background: item.done ? "rgba(67,160,71,0.06)" : item.autoCompleted ? "rgba(30,136,229,0.06)" : T.bg, transition: "all .2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => { if (!item.isVoltage && !item.isBatteryData) updateCheckItem(wKey, idx, { done: !item.done, autoCompleted: false }); }}
                  style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${item.done ? T.green : item.autoCompleted ? T.accent : T.border}`, background: item.done ? T.green : item.autoCompleted ? `${T.accent}30` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all .2s" }}>
                  {item.done && <span style={{ color: "#FFF", fontSize: 16, fontWeight: 800 }}>✓</span>}
                  {item.autoCompleted && !item.done && <span style={{ color: T.accent, fontSize: 14, fontWeight: 800 }}>!</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: item.done ? T.green : T.text, textDecoration: item.done ? "line-through" : "none" }}>{item.label}</div>
                  {item.desc && <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{item.desc}</div>}
                  {item.autoCompleted && !item.done && (
                    <div style={{ fontSize: 11, color: T.accent, marginTop: 3, fontWeight: 600 }}>📋 {item.autoNote || "Completado desde Foja de Servicio"}</div>
                  )}
                </div>
                {item.done && <span style={{ fontSize: 10, fontWeight: 700, color: T.green, background: `${T.green}15`, padding: "3px 8px", borderRadius: 4 }}>LISTO</span>}
                {item.autoCompleted && !item.done && (
                  <div onClick={() => updateCheckItem(wKey, idx, { done: true, autoCompleted: false })}
                    style={{ ...btnPrimary(T.accent), padding: "6px 12px", fontSize: 11, fontWeight: 700 }}>
                    Confirmar ✓
                  </div>
                )}
              </div>
              {/* Battery data fields */}
              {item.isBatteryData && (
                <div style={{ marginTop: 10, paddingLeft: 40 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.grayLight, marginBottom: 8 }}>🔋 DATOS DE LA BATERÍA INSTALADA</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: T.gray, marginBottom: 2, display: "block" }}>N° DE SERIE *</label>
                      <input value={item.batCode || ""} onChange={e => {
                        const val = e.target.value;
                        const amp = item.batAmp;
                        const war = item.batWarranty;
                        updateCheckItem(wKey, idx, { batCode: val, done: !!(val && amp), note: [val, amp ? amp + " Amp" : "", war ? war + " meses gtía" : ""].filter(Boolean).join(" — ") });
                      }} placeholder="Ej: 7894561230" style={{ ...inputStyle, fontSize: 14, fontWeight: 600, padding: "8px 10px" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: T.gray, marginBottom: 2, display: "block" }}>AMPERAJE *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input value={item.batAmp || ""} onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const code = item.batCode;
                          const war = item.batWarranty;
                          updateCheckItem(wKey, idx, { batAmp: val, done: !!(code && val), note: [code, val ? val + " Amp" : "", war ? war + " meses gtía" : ""].filter(Boolean).join(" — ") });
                        }} placeholder="65" style={{ ...inputStyle, fontSize: 18, fontWeight: 700, fontFamily: fontD, textAlign: "center", width: 80, padding: "6px 8px" }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>Amp</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: T.gray, marginBottom: 2, display: "block" }}>GARANTÍA (meses)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input value={item.batWarranty || ""} onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const code = item.batCode;
                        const amp = item.batAmp;
                        updateCheckItem(wKey, idx, { batWarranty: val, done: !!(code && amp), note: [code, amp ? amp + " Amp" : "", val ? val + " meses gtía" : ""].filter(Boolean).join(" — ") });
                      }} placeholder="12" style={{ ...inputStyle, fontSize: 16, fontWeight: 700, fontFamily: fontD, textAlign: "center", width: 70, padding: "6px 8px" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.gray }}>meses</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Voltage input for alternator check */}
              {item.isVoltage && (
                <div style={{ marginTop: 10, paddingLeft: 40 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.grayLight, marginBottom: 6 }}>⚡ VOLTAJE DEL ALTERNADOR</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="text" value={item.voltage || ""} onChange={e => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      updateCheckItem(wKey, idx, { voltage: val, done: !!val, note: val ? `Voltaje: ${val}V` : "" });
                    }}
                      placeholder="Ej: 14.2"
                      style={{ ...inputStyle, fontSize: 24, fontWeight: 700, fontFamily: fontD, textAlign: "center", width: 120, padding: "8px 12px", borderColor: item.voltage ? (parseFloat(item.voltage) >= 13.5 && parseFloat(item.voltage) <= 14.8 ? T.green : T.red) : T.border }} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: T.accent }}>V</span>
                    {item.voltage && (
                      <div style={{ flex: 1 }}>
                        {parseFloat(item.voltage) >= 13.5 && parseFloat(item.voltage) <= 14.8 ? (
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.green, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.green }} />
                            NORMAL
                          </div>
                        ) : parseFloat(item.voltage) < 13.5 ? (
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.red, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.red }} />
                            BAJA — Revisar alternador
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.orange, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.orange }} />
                            ALTA — Revisar regulador
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: T.gray, marginTop: 4 }}>Rango normal: 13.5V — 14.8V (motor encendido)</div>
                </div>
              )}
              {/* Note field */}
              {!item.isVoltage && (
                <div style={{ marginTop: 8, paddingLeft: 40 }}>
                  <input value={item.note || ""} onChange={e => updateCheckItem(wKey, idx, { note: e.target.value })}
                    placeholder="Observación (opcional)..." style={{ ...inputStyle, fontSize: 12, padding: "6px 10px", width: "100%" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
      {/* Tab navigation when multiple works */}
      {tabs.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {tabs.map((tab, idx) => {
            const isActive = activeTab === idx;
            const tabDone = (tab.type === "service" || tab.type === "embedded") ? progress === 100 :
              tab.type === "checklist" ? getCheckProgress(tab.work.type + "_" + order.works.indexOf(tab.work)) === 100 : false;
            return (
              <div key={idx} onClick={() => {
                setActiveTab(idx);
                if (tab.type === "embedded" || tab.type === "service") {
                  let targetId = null;
                  if (tab.work.type === "Pastillas de Freno") {
                    const desc = (tab.work.desc || "").toLowerCase();
                    const hasTra = desc.includes("traser") || desc.includes("tra") || tab.work.brakeEjes?.tra;
                    const hasDel = desc.includes("delanter") || desc.includes("del") || tab.work.brakeEjes?.del;
                    if (hasTra && !hasDel) {
                      targetId = "tt_freno";
                    } else {
                      targetId = "td_pastillas";
                    }
                  } else {
                    const MAP = { "Escobillas": "escobillas_estado", "Baterías": "bateria_control", "Lámpara": "luz_baja" };
                    targetId = MAP[tab.work.type];
                  }
                  if (targetId) {
                    const secIdx = SHEET_TPL.findIndex(s => s.items.some(it => it.id === targetId));
                    if (secIdx >= 0) {
                      setExpandedSection(secIdx);
                      setTimeout(() => { document.getElementById(`sheet-item-${targetId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200);
                    }
                  }
                }
                window.scrollTo?.({ top: 0, behavior: "smooth" });
              }}
                style={{ padding: "8px 14px", borderRadius: 10, cursor: "pointer", border: `2px solid ${isActive ? T.accent : tabDone ? T.green : T.border}`, background: isActive ? `${T.accent}15` : tabDone ? `${T.green}10` : T.bg2, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, transition: "all .15s" }}>
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? T.accent : tabDone ? T.green : T.grayLight }}>{tab.label}</span>
                {tabDone && <span style={{ fontSize: 10, color: T.green }}>✓</span>}
              </div>
            );
          })}
          </div>
          {/* Show description of active tab's work if exists */}
          {tabs[activeTab]?.work?.desc && (
            <div style={{ ...card, padding: "10px 14px", marginTop: 8, borderLeft: `3px solid ${T.orange}`, background: "rgba(255,152,0,0.06)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.orange, marginBottom: 2 }}>📝 OBSERVACIÓN — {tabs[activeTab].label}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{tabs[activeTab].work.desc}</div>
            </div>
          )}
        </div>
      )}

      {/* Render based on active tab type */}
      {currentTab?.type === "checklist" ? renderChecklist(currentTab.work) : (
        <>
      <div style={{ ...card, padding: 20, marginBottom: 16, borderLeft: `4px solid ${T.orange}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: fontD, fontSize: 13, fontWeight: 600, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Foja de Servicio — {isServiceBase ? "Service Base" : "Service Full"}</div>
            <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700 }}>{fmtD(order.domain)}</div>
            <div style={{ fontSize: 13, color: T.gray }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
            <div style={{ fontSize: 12, color: T.grayLight, marginTop: 2 }}>{client ? `${client.name} ${client.lastName}` : ""}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: fontD, color: progress === 100 ? T.green : T.accent }}>{Math.round(progress)}%</div>
            <div style={{ fontSize: 11, color: T.gray }}>{completedCount}/{allItems.length}</div>
          </div>
        </div>
        <div style={{ height: 6, background: T.bg, borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: progress === 100 ? T.green : `linear-gradient(90deg, ${T.accent}, #42a5f5)`, width: `${progress}%`, transition: "width .4s" }} />
        </div>
      </div>

      {workDesc && (
        <div style={{ ...card, padding: 14, marginBottom: 16, borderLeft: `3px solid ${T.orange}`, background: "rgba(255,152,0,0.06)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.orange, marginBottom: 4 }}>⚠️ OBSERVACIÓN DEL CLIENTE</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{workDesc}</div>
        </div>
      )}

      {showErrors && errorItems.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 16, borderLeft: `3px solid ${T.red}`, background: "rgba(229,57,53,0.06)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.red }}>⚠ Hay {errorItems.length} ítem{errorItems.length > 1 ? "s" : ""} sin completar. Revisalos para poder finalizar.</div>
        </div>
      )}

      {SHEET_TPL.map((sec, si) => {
        const isOpen = expandedSection === si;
        const visibleItems = sec.items.filter(isVisible);
        const secComplete = visibleItems.filter(isComplete).length;
        const secHasErrors = showErrors && visibleItems.some(it => errorItems.includes(it.id));

        return (
          <div key={si} id={`sheet-section-${si}`} style={{ ...card, marginBottom: 10, overflow: "hidden", animation: `fadeUp .3s ease ${si * .03}s both`, borderColor: secHasErrors ? T.red : T.border }}>
            <div onClick={() => {
              const opening = !isOpen;
              setExpandedSection(opening ? si : null);
              if (opening) setTimeout(() => { 
                const el = document.getElementById(`sheet-section-${si}`);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 80;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }, 120);
            }}
              style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", background: isOpen ? T.bg3 : "transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{sec.icon}</span>
                <span style={{ fontFamily: fontD, fontWeight: 700, fontSize: 16, letterSpacing: .5 }}>{sec.section}</span>
                {secHasErrors && <span style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>⚠</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: secComplete === visibleItems.length ? T.green : T.gray, fontWeight: 700 }}>{secComplete}/{visibleItems.length}</span>
                <span style={{ fontSize: 12, color: T.gray, transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
              </div>
            </div>
            {isOpen && <div style={{ padding: "0 18px 14px" }}>{visibleItems.map(renderItem)}</div>}
          </div>
        );
      })}

      <div style={{ ...card, padding: 18, marginTop: 10, marginBottom: 16 }}>
        <div style={{ fontFamily: fontD, fontWeight: 700, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span>📝</span> OBSERVACIONES TÉCNICAS
        </div>
        {techNotes.map((note, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={note} onChange={e => { const n = [...techNotes]; n[i] = e.target.value; setTechNotes(n); }}
              placeholder={`Observación ${i + 1}...`} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
            {techNotes.length > 1 && (
              <div onClick={() => setTechNotes(techNotes.filter((_, j) => j !== i))}
                style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.red, fontSize: 14, borderRadius: 6, background: "rgba(229,57,53,0.08)" }}>✕</div>
            )}
          </div>
        ))}
        <div onClick={() => setTechNotes([...techNotes, ""])}
          style={{ fontSize: 12, color: T.accent, cursor: "pointer", fontWeight: 700, marginTop: 4 }}>+ Agregar observación</div>
      </div>

      {/* Authorization request */}

      </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onNavigate("vehicleDetail", order)}
          style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>← Volver</button>
        <button onClick={tryFinalize}
          style={{ ...btnPrimary(allTabsDone() ? T.green : T.gray), flex: 1, fontSize: 16 }}>✅ Finalizar Trabajo</button>
      </div>

      {/* Missing change popup */}
      {showMissingChangePopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.orange}40`, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 10, color: T.orange }}>Trabajo pendiente</div>
            <div style={{ fontSize: 14, color: T.grayLight, marginBottom: 8, lineHeight: 1.5 }}>
              La orden incluye trabajos que no fueron marcados como <strong style={{ color: T.accent }}>cambiados</strong> en la Foja de Servicio:
            </div>
            <div style={{ marginBottom: 20 }}>
              {showMissingChangePopup.map((item, i) => (
                <div key={i} style={{ padding: "8px 14px", marginBottom: 4, borderRadius: 8, background: "rgba(255,152,0,0.08)", border: `1px solid ${T.orange}30`, fontSize: 14, fontWeight: 700, color: T.orange }}>
                  🔧 {item}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: T.gray, marginBottom: 16 }}>
              Volvé a la Foja de Servicio y marcá estos items como "SUSTITUIDA" para poder finalizar.
            </div>
            <button onClick={() => { setShowMissingChangePopup(null); setActiveTab(0); }}
              style={{ ...btnPrimary(T.accent), width: "100%", fontSize: 14 }}>Entendido, volver a la Foja</button>
          </div>
        </div>
      )}

      {/* Pending auth popup */}
      {showPendingAuthPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)", animation: "fadeUp .2s ease" }}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 400, width: "90%", border: `1px solid ${T.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Autorizaciones pendientes</div>
            <div style={{ fontSize: 14, color: T.grayLight, marginBottom: 24, lineHeight: 1.5 }}>
              Tenés solicitudes de autorización que aún no fueron respondidas. ¿Deseás finalizar la orden de todos modos?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowPendingAuthPopup(false)}
                style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1, fontSize: 14 }}>Cancelar</button>
              <button onClick={doFinalize}
                style={{ ...btnPrimary(T.orange), flex: 1, fontSize: 14 }}>Finalizar igual</button>
            </div>
          </div>
        </div>
      )}

      {/* Pendientes de autorización */}
      {(() => {
        const authItems = SHEET_TPL.flatMap(sec => sec.items.filter(it => {
          if (!it.needsAuth || forcedChangeItems.has(it.id)) return false;
          const d2 = data[it.id];
          if (!d2) return false;
          if (d2.status === "cambiar") return true;
          if (it.type === "batteryPercent" && d2.percent >= 0 && d2.percent < 50) return true;
          if ((it.type === "binary" || it.type === "ternary") && d2.fluidOk === "mal") return true;
          if (it.type === "fluid" && d2.fluidOk === "cambiar") return true;
          return false;
        }));
        const existingAuth = (notifications || []).find(n => n.orderId === order.id && n.status === "pending");
        const approvedAuth = (notifications || []).find(n => n.orderId === order.id && n.status === "approved");
        const deniedAuth = (notifications || []).find(n => n.orderId === order.id && n.status === "denied");
        if (authItems.length === 0 && !existingAuth && !approvedAuth && !deniedAuth) return null;
        return (
          <div style={{ ...card, padding: 24, marginTop: 20, borderColor: T.red, borderLeft: "4px solid " + T.red, background: "rgba(229,57,53,0.04)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
              <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700, color: T.red }}>PEDIR AUTORIZACIÓN</div>
              {authItems.length > 0 && <div style={{ fontSize: 14, color: T.grayLight, marginTop: 6 }}>{authItems.length} ítem{authItems.length !== 1 ? "s" : ""} requiere{authItems.length === 1 ? "" : "n"} cambio:</div>}
            </div>
            {authItems.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", marginBottom: 8, borderRadius: 10, background: T.red + "10", border: "1px solid " + T.red + "30" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.red }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{it.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.red }}>CAMBIAR</span>
              </div>
            ))}
            {approvedAuth && <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: T.green + "10", border: "1px solid " + T.green + "30", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.green }}>✅ AUTORIZACIÓN APROBADA</div>
              {approvedAuth.items && <div style={{ marginTop: 6 }}>{approvedAuth.items.map((it, i) => <div key={i} style={{ fontSize: 13, color: T.grayLight, marginTop: 2 }}>• {it.label}</div>)}</div>}
            </div>}
            {deniedAuth && <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: T.red + "10", border: "1px solid " + T.red + "30", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.red }}>❌ AUTORIZACIÓN DENEGADA</div>
              <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{deniedAuth.denyReason === "cliente" ? "Denegado por el cliente" : "Denegado por administración"}</div>
            </div>}
            {existingAuth && <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: T.orange + "10", border: "1px solid " + T.orange + "30", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.orange }}>⏳ Solicitud enviada — esperando respuesta</div>
            </div>}
            {!existingAuth && !approvedAuth && !deniedAuth && authItems.length > 0 && (
              <button onClick={() => {
                const items = authItems.map(it => ({ id: it.id, label: it.label }));
                const notif = { id: Date.now(), orderId: order.id, domain: order.domain, clientId: order.clientId, items, status: "pending", date: new Date().toISOString().split("T")[0], requestedBy: user.name };
                setNotifications(prev => [...prev, notif]);
              }} style={{ ...btnPrimary(T.red), width: "100%", marginTop: 16, fontSize: 18, padding: "18px 0", fontFamily: fontD }}>
                📤 Pedir Autorización
              </button>
            )}
          </div>
        );
      })()}

    </div>
  );
};

const AuthManageScreen = ({ notification, order, clients, user, orders, setOrders, notifications, setNotifications, config, onNavigate }) => {
  const client = clients.find(c => c.id === order.clientId);
  const vehicle = client?.vehicles.find(v => v.domain === order.domain);
  const notif = notifications.find(n => n.orderId === order.id && n.status === "pending");
  const [sent, setSent] = useState(false);

  if (!notif) return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, fontFamily: fontD }}>Sin solicitudes pendientes</div>
      <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13 }}>← Volver</button>
    </div>
  );

  const items = notif.items || [];
  const totalSinIva = items.reduce((s, it) => s + (parseFloat(order.works.find(w => w.trenItems?.some(ti => ti.label === it.label))?.trenItems?.find(ti => ti.label === it.label)?.price) || 0), 0);
  const iva = config.ivaRate || 21;
  const totalConIva = totalSinIva * (1 + iva / 100);

  const sendWhatsApp = () => {
    const ph = client?.phone || "";
    let msg = config.authMessage || "Hola {nombre}, tu vehículo {dominio} necesita: {item}. Total: ${total}";
    msg = msg.replace("{nombre}", client?.name || "")
      .replace("{dominio}", fmtD(order.domain))
      .replace("{vehiculo}", (vehicle?.brand || "") + " " + (vehicle?.model || ""))
      .replace("{item}", items.map(it => it.label).join(", "))
      .replace("{precio}", fmt(totalSinIva))
      .replace("{precioIVA}", fmt(totalConIva))
      .replace("{total}", fmt(totalConIva));
    if (ph) window.open("https://wa.me/549" + ph + "?text=" + encodeURIComponent(msg), "_blank");
    setSent(true);
  };

  const approve = () => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: "approved" } : n));
    // Enable "cambiado" status on approved items in service sheet
    if (order.serviceSheet) {
      const updated = { ...order.serviceSheet };
      items.forEach(it => {
        if (updated[it.id]) updated[it.id] = { ...updated[it.id], authApproved: true };
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, serviceSheet: updated } : o));
    }
    onNavigate("vehicleDetail", order);
  };

  const deny = (reason) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: "denied", denyReason: reason } : n));
    onNavigate("vehicleDetail", order);
  };

  const [showDenyPopup, setShowDenyPopup] = useState(false);

  return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>📋 Solicitud de Autorización</div>
        <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13 }}>← Volver</button>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 6 }}>VEHÍCULO</div>
        <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>{fmtD(order.domain)}</div>
        <div style={{ fontSize: 14, color: T.grayLight }}>{vehicle?.brand} {vehicle?.model} {vehicle?.year}</div>
        <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>Cliente: {client?.name} {client?.lastName}</div>
        <div style={{ fontSize: 12, color: T.gray }}>Solicitado por: {notif.requestedBy} — {notif.date}</div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 16, borderColor: T.orange }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.orange, marginBottom: 10 }}>⚠️ Items que requieren cambio</div>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{it.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.red }}>CAMBIAR</span>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 8 }}>PRESUPUESTO</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: T.gray }}>Subtotal (sin IVA)</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{fmt(totalSinIva)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: T.gray }}>IVA ({iva}%)</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{fmt(totalSinIva * iva / 100)}</span>
        </div>
        <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: fontD }}>TOTAL</span>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: fontD, color: T.accent }}>{fmt(totalConIva)}</span>
        </div>
      </div>

      <button onClick={sendWhatsApp} style={{ ...btnPrimary(T.green), width: "100%", marginBottom: 12, fontSize: 15, padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        📱 Enviar Presupuesto por WhatsApp
      </button>
      {sent && <div style={{ textAlign: "center", fontSize: 12, color: T.green, marginBottom: 12 }}>✅ Presupuesto enviado</div>}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={approve} style={{ ...btnPrimary(T.green), flex: 1, fontSize: 15, padding: "16px 0" }}>
          ✅ Autorizado
        </button>
        <button onClick={() => setShowDenyPopup(true)} style={{ ...btnPrimary(T.red), flex: 1, fontSize: 15, padding: "16px 0" }}>
          ❌ Denegado
        </button>
      </div>

      {showDenyPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }} onClick={() => setShowDenyPopup(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 28, maxWidth: 350, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 20, textAlign: "center", marginBottom: 12 }}>❌</div>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Motivo de denegación</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => deny("cliente")} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 14, padding: "14px 0" }}>👤 Denegado por el Cliente</button>
              <button onClick={() => deny("administracion")} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 14, padding: "14px 0" }}>🏢 Denegado por Administración</button>
              <button onClick={() => setShowDenyPopup(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 12, padding: "10px 0", color: T.gray }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FojaProgressBar = ({ pct, color, h = 4 }) => (
  <div style={{ width: "100%", height: h, borderRadius: h, background: `${color}18`, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", borderRadius: h, background: color }} />
  </div>
);

const FojaTireDiagram = ({ tires, size = 95 }) => {
  const gc = (p) => p >= 60 ? "#2E7D32" : p >= 30 ? "#E65100" : "#C62828";
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5}>
      <rect x="30" y="20" width="60" height="140" rx="14" fill="none" stroke="#CBD5E0" strokeWidth="1.5" />
      <circle cx="60" cy="90" r="4" fill="#CBD5E0" />
      <line x1="40" y1="90" x2="80" y2="90" stroke="#CBD5E0" strokeWidth="1" />
      <rect x="8" y="28" width="24" height="42" rx="6" fill={gc(tires[0])} />
      <rect x="88" y="28" width="24" height="42" rx="6" fill={gc(tires[1])} />
      <rect x="8" y="108" width="24" height="42" rx="6" fill={gc(tires[2])} />
      <rect x="88" y="108" width="24" height="42" rx="6" fill={gc(tires[3])} />
      {[tires[0],tires[1],tires[2],tires[3]].map((p,i) => {
        const coords = [[20,53],[100,53],[20,133],[100,133]][i];
        const labels = ["DI","DD","TI","TD"];
        return <g key={i}><text x={coords[0]} y={coords[1]} textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="700" fontFamily="Rajdhani">{p}%</text><text x={coords[0]} y={i<2?22:160} textAnchor="middle" fill="#718096" fontSize="7" fontFamily="Outfit">{labels[i]}</text></g>;
      })}
    </svg>
  );
};

const InterventionDiagram = ({ order, sheet }) => {
  const zones = [
    { label: "DELANTERO IZQ.", items: [] },
    { label: "DELANTERO DER.", items: [] },
    { label: "TRASERO IZQ.", items: [] },
    { label: "TRASERO DER.", items: [] },
  ];
  const generalItems = [];
  const observations = [];

  const statusColor = (s) => s === "good" ? "#43A047" : s === "regular" ? "#F9A825" : s === "bad" || s === "changed" ? "#E53935" : "#43A047";

  const frontItemsIzq = [];
  const frontItemsDer = [];
  const frontItemsBoth = [];
  order.works.filter(w => w.type === "Tren Delantero").forEach(w => {
    if (w.trenItems) {
      w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).forEach(ti => {
        const name = ti.isCustom ? ti.label : ti.label;
        const desc = ti.otroDesc ? ` (${ti.otroDesc})` : "";
        const side = ti.side || "ambos";
        if (ti.key === "alineado" || ti.key === "balanceado" || ti.key === "rotacion") {
          generalItems.push({ name: name + desc, status: "good" });
        } else if (side === "ambos") {
          frontItemsBoth.push({ name: name + desc, status: "changed" });
        } else if (side === "izq") {
          frontItemsIzq.push({ name: name + desc, status: "changed" });
        } else if (side === "der") {
          frontItemsDer.push({ name: name + desc, status: "changed" });
        }
      });
    } else if (w.desc) {
      frontItemsBoth.push({ name: w.desc, status: "changed" });
    } else {
      frontItemsBoth.push({ name: "Intervención completa", status: "good" });
    }
  });
  zones[0].items = [...frontItemsBoth, ...frontItemsIzq];
  zones[1].items = [...frontItemsBoth, ...frontItemsDer];

  const rearItemsIzq = [];
  const rearItemsDer = [];
  const rearItemsBoth = [];
  order.works.filter(w => w.type === "Tren Trasero").forEach(w => {
    if (w.trenItems) {
      w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).forEach(ti => {
        const name = ti.isCustom ? ti.label : ti.label;
        const desc = ti.otroDesc ? ` (${ti.otroDesc})` : "";
        const side = ti.side || "ambos";
        if (side === "ambos") {
          rearItemsBoth.push({ name: name + desc, status: "changed" });
        } else if (side === "izq") {
          rearItemsIzq.push({ name: name + desc, status: "changed" });
        } else if (side === "der") {
          rearItemsDer.push({ name: name + desc, status: "changed" });
        }
      });
    } else if (w.desc) {
      rearItemsBoth.push({ name: w.desc, status: "changed" });
    } else {
      rearItemsBoth.push({ name: "Intervención completa", status: "good" });
    }
  });
  zones[2].items = [...rearItemsBoth, ...rearItemsIzq];
  zones[3].items = [...rearItemsBoth, ...rearItemsDer];

  order.works.filter(w => w.type === "Pastillas de Freno").forEach(w => {
    const desc = (w.desc || "").toLowerCase();
    const hasDel = desc.includes("delanter") || desc.includes("del") || w.brakeEjes?.del;
    const hasTra = desc.includes("traser") || desc.includes("tra") || w.brakeEjes?.tra;
    if (hasDel || (!hasTra && !hasDel)) {
      zones[0].items.push({ name: "Pastillas de freno", status: "changed" });
      zones[1].items.push({ name: "Pastillas de freno", status: "changed" });
    }
    if (hasTra) {
      zones[2].items.push({ name: "Pastillas de freno", status: "changed" });
      zones[3].items.push({ name: "Pastillas de freno", status: "changed" });
    }
  });

  const hasAny = zones.some(z => z.items.length > 0) || generalItems.length > 0;
  if (!hasAny && sheet) {
    if (sheet.td_pastillas?.checked) {
      zones[0].items.push({ name: "Pastilla de freno", status: "good" });
      zones[1].items.push({ name: "Pastilla de freno", status: "good" });
    }
    if (sheet.td_rotulas?.checked && (sheet.td_rotulas.status === "cambiado" || sheet.td_rotulas.status === "cambiar")) {
      zones[0].items.push({ name: "Rótula de dirección", status: "changed" });
      zones[1].items.push({ name: "Rótula de dirección", status: "changed" });
    }
    if (sheet.td_bujes_parrilla?.checked && (sheet.td_bujes_parrilla.status === "cambiado" || sheet.td_bujes_parrilla.status === "cambiar")) {
      zones[0].items.push({ name: "Buje de parrilla", status: "changed" });
      zones[1].items.push({ name: "Buje de parrilla", status: "changed" });
    }
    if (sheet.td_amortiguadores?.checked && (sheet.td_amortiguadores.status === "cambiado" || sheet.td_amortiguadores.status === "cambiar")) {
      zones[0].items.push({ name: "Amortiguador", status: "changed" });
      zones[1].items.push({ name: "Amortiguador", status: "changed" });
    }
    if (sheet.tt_freno?.checked) {
      const tipo = sheet.tt_freno.toggle || "Pastillas";
      zones[2].items.push({ name: tipo === "Tambor" ? "Zapata de freno" : "Pastilla de freno", status: "good" });
      zones[3].items.push({ name: tipo === "Tambor" ? "Zapata de freno" : "Pastilla de freno", status: "good" });
    }
    if (sheet.td_bieletas?.checked && (sheet.td_bieletas.status === "cambiado" || sheet.td_bieletas.status === "cambiar")) {
      zones[0].items.push({ name: "Bieletas de estabilizadora", status: "changed" });
      zones[1].items.push({ name: "Bieletas de estabilizadora", status: "changed" });
    }
  }

  (order.techNotes || []).filter(n => n && n.trim()).forEach(n => {
    observations.push({ label: "Nota", text: n });
  });

  const renderItem = (item, i) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
      <span style={{ width: 9, height: 9, borderRadius: 2, background: statusColor(item.status), display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 5.5, fontWeight: 800, flexShrink: 0 }}>{item.status === "good" || item.status === "changed" ? "✓" : item.status === "regular" ? "!" : "✕"}</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: statusColor(item.status), lineHeight: 1.2 }}>{item.name}</span>
    </div>
  );

  const renderZone = (zone, idx, extraStyle = {}) => (
    <div style={{ background: zone.items.length ? (zone.items.every(it => it.status === "good") ? "#F0FFF4" : zone.items.some(it => it.status === "bad" || it.status === "changed") ? "#FFF5F5" : "#FFFDE7") : "#FAFBFD", padding: "8px 10px", ...extraStyle }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: zone.items.length ? statusColor(zone.items[0].status) : "#CBD5E0" }} />
        <span style={{ fontSize: 6, fontWeight: 800, color: "#1E88E5", letterSpacing: 1.5 }}>{zone.label}</span>
      </div>
      {zone.items.length > 0 ? zone.items.map(renderItem) : <div style={{ fontSize: 7, color: "#CBD5E0", fontStyle: "italic" }}>Sin intervención</div>}
    </div>
  );

  return (
    <div style={{ borderRadius: 8, marginBottom: 10, overflow: "hidden", border: "1px solid #EDF0F5" }}>
      <div style={{ background: "#F0F4F8", padding: "5px 12px", textAlign: "center", borderBottom: "1px solid #EDF0F5" }}>
        <span style={{ fontSize: 6.5, fontWeight: 700, color: "#718096", letterSpacing: 3 }}>MAPA DE INTERVENCIÓN POR CUADRANTE</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 1fr", gridTemplateRows: "auto auto" }}>
        {renderZone(zones[0], 0, { borderRight: "1px solid #EDF0F5", borderBottom: "1px solid #EDF0F5" })}

        {/* Center car */}
        <div style={{ gridRow: "1 / 3", gridColumn: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F9FC" }}>
          <svg viewBox="0 0 60 160" style={{ width: 45 }}>
            <rect x="8" y="6" width="44" height="148" rx="14" fill="#E8ECF2" stroke="#CBD5E0" strokeWidth="0.8" />
            {[[0,22, zones[0].items.length>0],[52,22, zones[1].items.length>0],[0,115, zones[2].items.length>0],[52,115, zones[3].items.length>0]].map(([x,y,active],i) => (
              <g key={i}>
                <rect x={x} y={y} width="8" height="24" rx="3" fill={active ? "#C6F6D5" : "#E8ECF2"} stroke={active ? "#43A047" : "#CBD5E0"} strokeWidth={active ? "1" : "0.5"} />
                <circle cx={x+4} cy={y+12} r="3" fill="none" stroke={active ? "#43A047" : "#CBD5E0"} strokeWidth="0.4" />
                {active && <circle cx={x+4} cy={y+12} r="1.2" fill="#43A047" opacity="0.5" />}
              </g>
            ))}
            <line x1="30" y1="10" x2="30" y2="150" stroke="#CBD5E0" strokeWidth="0.3" strokeDasharray="2 2" />
            <line x1="12" y1="34" x2="48" y2="34" stroke="#E2E8F0" strokeWidth="0.3" strokeDasharray="2 2" />
            <line x1="12" y1="127" x2="48" y2="127" stroke="#E2E8F0" strokeWidth="0.3" strokeDasharray="2 2" />
          </svg>
        </div>

        {renderZone(zones[1], 1, { borderBottom: "1px solid #EDF0F5" })}
        {renderZone(zones[2], 2, { borderRight: "1px solid #EDF0F5" })}
        {renderZone(zones[3], 3, {})}
      </div>

      {/* General items */}
      {generalItems.length > 0 && (
        <div style={{ background: "#EBF8FF", padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #EDF0F5" }}>
          <span style={{ fontSize: 6, fontWeight: 800, color: "#1E88E5", letterSpacing: 1.5 }}>GENERAL:</span>
          {generalItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: statusColor(item.status), display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 5.5, fontWeight: 800 }}>✓</span>
              <span style={{ fontSize: 8, fontWeight: 600, color: statusColor(item.status) }}>{item.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Líquido de frenos */}
      {sheet.liq_frenos && sheet.liq_frenos.checked && (
        <div style={{ background: "#FAFBFD", padding: "5px 12px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #EDF0F5" }}>
          <span style={{ fontSize: 6, fontWeight: 800, color: "#1E88E5", letterSpacing: 1.5 }}>💧 LÍQ. FRENOS:</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: sheet.liq_frenos.fluidOk === "bien" ? "#43A047" : sheet.liq_frenos.fluidOk === "cambiar" ? "#E53935" : "#F9A825" }}>
            {sheet.liq_frenos.fluidOk === "bien" ? "✓ Nivel correcto" : sheet.liq_frenos.fluidOk === "cambiar" ? "⚠ Se realizó cambio" : "⚠ Revisar"}
          </span>
          {sheet.liq_frenos.percent !== undefined && sheet.liq_frenos.percent !== "" && (
            <span style={{ fontSize: 7, color: "#718096" }}>({sheet.liq_frenos.percent}% agua)</span>
          )}
        </div>
      )}

      {/* Observaciones (técnicas + de items) */}
      {observations.length > 0 && (
        <div style={{ background: "#FFF8E1", padding: "6px 12px", borderTop: "1px solid #EDF0F5" }}>
          <div style={{ fontSize: 6.5, fontWeight: 800, color: "#E65100", letterSpacing: 1.5, marginBottom: 3 }}>📝 OBSERVACIONES</div>
          {observations.map((obs, i) => (
            <div key={i} style={{ display: "flex", gap: 4, marginBottom: 2, paddingLeft: 6, borderLeft: "2px solid #E65100" }}>
              <span style={{ fontSize: 7.5, fontWeight: 700, color: "#E65100", flexShrink: 0 }}>{obs.label}:</span>
              <span style={{ fontSize: 7.5, color: "#4A5568", lineHeight: 1.3 }}>{obs.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FojaClientScreen = ({ order, clients, onNavigate }) => {
  const client = clients.find(c => c.id === order.clientId);
  const vehicle = client?.vehicles.find(v => v.domain === order.domain);
  const fojaType = order._fojaType || null;

  const isBatteryOrder = fojaType === "battery" || (!fojaType && order.works.some(w => w.type === "Baterías") && !order.works.some(w => w.type === "Service Full" || w.type === "Service Base"));
  if (isBatteryOrder) {
    const batWork = order.works.find(w => w.type === "Baterías");
    const cl = order.workChecklist || {};
    const wKey = Object.keys(cl).find(k => k.startsWith("Baterías_")) || "";
    const items = cl[wKey] || [];
    const batData = items.find(it => it.isBatteryData) || {};
    const voltData = items.find(it => it.isVoltage) || {};
    const voltage = parseFloat(voltData.voltage) || 0;
    const voltOk = voltage >= 13.5 && voltage <= 14.8;

    return (
      <div style={{ background: "#E8ECF0", minHeight: "100vh", padding: "16px", fontFamily: font }}>
        <div className="no-print" style={{ maxWidth: 620, margin: "0 auto 12px", display: "flex", gap: 10 }}>
          <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, padding: "10px 20px" }}>← Volver</button>
          <button onClick={() => window.print()} style={{ ...btnPrimary("#1E88E5"), fontSize: 13, padding: "10px 20px", flex: 1 }}>🖨️ Imprimir Foja</button>
        </div>
        <div id="foja-print" style={{ maxWidth: 620, margin: "0 auto", background: "#FFF", borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,.12)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B2D45 60%, #1E88E5 100%)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 800, color: "#FFF", letterSpacing: 4, lineHeight: 1 }}>CARBOYS</div>
              <div style={{ fontSize: 7, letterSpacing: 3, color: "#64B5F6", marginTop: 2 }}>SERVICIO INTEGRAL DEL AUTOMOTOR</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 6.5, color: "#90CAF9", lineHeight: 1.6 }}>
              <div>Av. Recta Martinoli 8590, Córdoba</div>
              <div>Tel: 03547-426967 · Cel: 3515095504</div>
              <div>@carboys.cba</div>
            </div>
          </div>

          {/* Title + Date */}
          <div style={{ padding: "10px 22px", background: "#F8F9FA", borderBottom: "2px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fontD, fontSize: 12, fontWeight: 700, color: "#0D1B2A" }}>FOJA DE BATERÍA</div>
            <div style={{ fontSize: 8, color: "#718096" }}>Fecha: {order.date} · Cambio de Batería</div>
          </div>

          {/* Vehicle + Client */}
          <div style={{ display: "flex", padding: "14px 22px", gap: 14 }}>
            <div style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>VEHÍCULO</div>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: "#0D1B2A", letterSpacing: 2 }}>{fmtD(order.domain)}</div>
              <div style={{ fontSize: 8, color: "#4A5568" }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
              <div style={{ fontSize: 7.5, color: "#718096" }}>Kilometraje: {vehicle?.km ? `${Number(vehicle.km).toLocaleString("es-AR")} km` : "—"}</div>
            </div>
            <div style={{ flex: 1.2, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>CLIENTE</div>
              <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>{client ? `${client.name} ${client.lastName}` : ""}</div>
              <div style={{ fontSize: 8, color: "#718096" }}>Tel: {client?.phone || "—"}</div>
            </div>
          </div>

          {/* Battery + Alternator visual */}
          <div style={{ padding: "16px 22px" }}>
            <div style={{ display: "flex", gap: 16 }}>
              {/* Battery illustration */}
              <div style={{ flex: 1, background: "linear-gradient(135deg, #0D1B2A, #1B2D45)", borderRadius: 10, padding: "18px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: "repeating-linear-gradient(45deg, #FFF 0, #FFF 1px, transparent 1px, transparent 8px)" }} />
                <div style={{ fontSize: 7, fontWeight: 700, color: "#64B5F6", letterSpacing: 2, marginBottom: 10 }}>BATERÍA INSTALADA</div>
                {/* Battery SVG */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
                  <svg width="100" height="60" viewBox="0 0 100 60">
                    <rect x="5" y="10" width="90" height="45" rx="4" fill="#1E88E5" stroke="#64B5F6" strokeWidth="1.5" />
                    <rect x="20" y="4" width="12" height="8" rx="2" fill="#E53935" />
                    <text x="26" y="10" textAnchor="middle" fontSize="5" fill="#FFF" fontWeight="700">+</text>
                    <rect x="68" y="4" width="12" height="8" rx="2" fill="#1B2D45" stroke="#64B5F6" strokeWidth=".5" />
                    <text x="74" y="10" textAnchor="middle" fontSize="5" fill="#64B5F6" fontWeight="700">−</text>
                    <text x="50" y="38" textAnchor="middle" fontSize="16" fill="#FFF" fontWeight="800" fontFamily="DM Sans">{batData.batAmp || "—"}</text>
                    <text x="50" y="48" textAnchor="middle" fontSize="6" fill="#90CAF9" fontWeight="600">AMP</text>
                  </svg>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#FFF", marginBottom: 4 }}>{batData.batCode || "—"}</div>
                {batData.batWarranty && (
                  <div style={{ fontSize: 8, color: "#90CAF9", background: "rgba(30,136,229,0.2)", display: "inline-block", padding: "2px 10px", borderRadius: 4 }}>
                    Garantía: {batData.batWarranty} meses
                  </div>
                )}
              </div>

              {/* Alternator illustration */}
              <div style={{ flex: 1, background: voltage ? (voltOk ? "linear-gradient(135deg, #1B5E20, #2E7D32)" : "linear-gradient(135deg, #B71C1C, #E53935)") : "linear-gradient(135deg, #37474F, #546E7A)", borderRadius: 10, padding: "18px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, background: "repeating-linear-gradient(-45deg, #FFF 0, #FFF 1px, transparent 1px, transparent 8px)" }} />
                <div style={{ fontSize: 7, fontWeight: 700, color: voltage ? (voltOk ? "#A5D6A7" : "#EF9A9A") : "#B0BEC5", letterSpacing: 2, marginBottom: 10 }}>CARGA ALTERNADOR</div>
                {/* Alternator gauge */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                  <svg width="100" height="60" viewBox="0 0 100 60">
                    <circle cx="50" cy="35" r="25" fill="none" stroke={voltOk ? "#4CAF50" : "#EF5350"} strokeWidth="2" opacity="0.3" />
                    <circle cx="50" cy="35" r="20" fill="rgba(255,255,255,0.1)" />
                    <text x="50" y="10" textAnchor="middle" fontSize="5" fill={voltOk ? "#A5D6A7" : "#EF9A9A"}>⚡</text>
                    <text x="50" y="39" textAnchor="middle" fontSize="18" fill="#FFF" fontWeight="800" fontFamily="DM Sans">{voltData.voltage || "—"}</text>
                    <text x="50" y="50" textAnchor="middle" fontSize="7" fill={voltOk ? "#A5D6A7" : "#EF9A9A"} fontWeight="700">VOLTS</text>
                  </svg>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#FFF" }}>{voltOk ? "✓ NORMAL" : voltage < 13.5 ? "⚠ BAJA" : "⚠ ALTA"}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,.6)", marginTop: 2 }}>Rango normal: 13.5V — 14.8V</div>
              </div>
            </div>
          </div>

          {/* Work details */}
          <div style={{ padding: "8px 22px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 6 }}>TRABAJO REALIZADO</div>
            <div style={{ padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              {order.works.map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < order.works.length - 1 ? "1px solid #F0F0F0" : "none" }}>
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#0D1B2A" }}>{w.type}</span>
                    {w.desc && <span style={{ fontSize: 8, color: "#718096", marginLeft: 6 }}>— {w.desc}</span>}
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#1E88E5", fontFamily: fontD }}>${Number(w.price).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "linear-gradient(90deg, #1E88E5, #1565C0)", padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 8, color: "#FFF", fontStyle: "italic", opacity: 0.9 }}>Gracias por confiar en</div>
            <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 800, color: "#FFF", letterSpacing: 3 }}>CARBOYS</div>
          </div>
        </div>
      </div>
    );
  }

  const isEscapeOrder = fojaType === "escape" || (!fojaType && order.works.some(w => w.type === "Escape") && !order.works.some(w => w.type === "Service Full" || w.type === "Service Base"));
  if (isEscapeOrder) {
    const escWork = order.works.find(w => w.type === "Escape");
    const escItems = escWork?.trenItems?.filter(ti => ti.isCustom ? ti.label : ti.selected) || [];
    const selectedKeys = escItems.map(ti => ti.key);
    const selectedLabels = escItems.map(ti => (ti.label || "").toLowerCase());
    const descParts = (escWork?.desc || "").toLowerCase().split(",").map(s => s.trim());
    const isSelected = (key, label) => selectedKeys.includes(key) || selectedLabels.includes(label.toLowerCase()) || descParts.some(d => d.includes(label.toLowerCase()) || label.toLowerCase().includes(d));

    const parts = [
      { key: "multiple_esc", label: "MÚLTIPLE" },
      { key: "catalizador_esc", label: "CATALIZADOR" },
      { key: "flexible", label: "FLEXIBLE" },
      { key: "silenciador_int", label: "SILENC. INTERMEDIO" },
      { key: "cano_intermedio", label: "CAÑO INTERMEDIO" },
      { key: "silenciador_tra", label: "SILENC. TRASERO" },
    ];
    const sideParts = [
      { key: "soporte_esc", label: "SOPORTE" },
      { key: "arreglo_esc", label: "ARREGLO" },
    ];

    return (
      <div style={{ background: "#E8ECF0", minHeight: "100vh", padding: "16px", fontFamily: font }}>
        <div className="no-print" style={{ maxWidth: 620, margin: "0 auto 12px", display: "flex", gap: 10 }}>
          <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, padding: "10px 20px" }}>← Volver</button>
          <button onClick={() => window.print()} style={{ ...btnPrimary("#1E88E5"), fontSize: 13, padding: "10px 20px", flex: 1 }}>🖨️ Imprimir Foja</button>
        </div>
        <div id="foja-print" style={{ maxWidth: 620, margin: "0 auto", background: "#FFF", borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,.12)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B2D45 60%, #1E88E5 100%)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 800, color: "#FFF", letterSpacing: 4, lineHeight: 1 }}>CARBOYS</div>
              <div style={{ fontSize: 7, letterSpacing: 3, color: "#64B5F6", marginTop: 2 }}>SERVICIO INTEGRAL DEL AUTOMOTOR</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 6.5, color: "#90CAF9", lineHeight: 1.6 }}>
              <div>Av. Recta Martinoli 8590, Córdoba</div>
              <div>Tel: 03547-426967 · Cel: 3515095504</div>
              <div>@carboys.cba</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ padding: "10px 22px", background: "#F8F9FA", borderBottom: "2px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fontD, fontSize: 12, fontWeight: 700, color: "#0D1B2A" }}>FOJA DE ESCAPE</div>
            <div style={{ fontSize: 8, color: "#718096" }}>Fecha: {order.date} · {escWork?.escapeType === "deportivo" ? "Escape Deportivo" : "Sistema Original"}</div>
          </div>

          {/* Vehicle + Client */}
          <div style={{ display: "flex", padding: "14px 22px", gap: 14 }}>
            <div style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>VEHÍCULO</div>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: "#0D1B2A", letterSpacing: 2 }}>{fmtD(order.domain)}</div>
              <div style={{ fontSize: 8, color: "#4A5568" }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
              <div style={{ fontSize: 7.5, color: "#718096" }}>Kilometraje: {vehicle?.km ? `${Number(vehicle.km).toLocaleString("es-AR")} km` : "—"}</div>
            </div>
            <div style={{ flex: 1.2, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>CLIENTE</div>
              <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>{client ? `${client.name} ${client.lastName}` : ""}</div>
              <div style={{ fontSize: 8, color: "#718096" }}>Tel: {client?.phone || "—"}</div>
            </div>
          </div>

          {/* Escape Diagram - Technical Drawing */}
          <div style={{ padding: "10px 22px 16px" }}>
            <div style={{ background: "#FFF", borderRadius: 8, border: "1.5px solid #E2E8F0", padding: "16px 12px 12px", position: "relative" }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: "#A0AEC0", letterSpacing: 2, textAlign: "center", marginBottom: 8 }}>DIAGRAMA DEL SISTEMA DE ESCAPE</div>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Main SVG diagram */}
                <div style={{ flex: 1 }}>
                  <svg viewBox="0 0 540 130" style={{ width: "100%", height: "auto" }}>
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F0F4F8" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="540" height="130" fill="url(#grid)" />
                    <text x="18" y="11" fontSize="5.5" fill="#A0AEC0" fontWeight="700" letterSpacing="1">MOTOR</text>

                    {/* 1. Múltiple */}
                    {(() => { const a = isSelected("multiple_esc", "Múltiple"); const c = a ? "#E53935" : "#CBD5E0"; const f = a ? "#FFF5F5" : "#F7FAFC"; return (
                      <g>
                        <path d="M 15,35 Q 24,35 32,47 L 44,55" stroke={c} strokeWidth="2" fill="none"/>
                        <path d="M 15,47 Q 24,47 32,51 L 44,55" stroke={c} strokeWidth="2" fill="none"/>
                        <path d="M 15,63 Q 24,63 32,59 L 44,55" stroke={c} strokeWidth="2" fill="none"/>
                        <path d="M 15,75 Q 24,75 32,65 L 44,55" stroke={c} strokeWidth="2" fill="none"/>
                        <rect x="40" y="47" width="20" height="16" rx="3" fill={f} stroke={c} strokeWidth="1.5"/>
                        {a && <text x="50" y="58" textAnchor="middle" fontSize="6" fill="#E53935" fontWeight="700">✓</text>}
                        <text x="50" y="74" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">MÚLTIPLE</text>
                      </g>
                    );})()}

                    <line x1="60" y1="55" x2="74" y2="55" stroke="#CBD5E0" strokeWidth="2.5"/>

                    {/* 2. Flexible */}
                    {(() => { const a = isSelected("flexible", "Flexible"); const c = a ? "#E53935" : "#CBD5E0"; return (
                      <g>
                        <path d="M 74,48 L 77,62 L 80,48 L 83,62 L 86,48 L 89,62 L 92,48 L 95,62 L 98,48" stroke={c} strokeWidth="1.5" fill="none"/>
                        <text x="86" y="40" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">FLEXIBLE</text>
                        {a && <circle cx="86" cy="32" r="5" fill="#FFF5F5" stroke="#E53935" strokeWidth="1"/>}
                        {a && <text x="86" y="34.5" textAnchor="middle" fontSize="5" fill="#E53935" fontWeight="800">✓</text>}
                      </g>
                    );})()}

                    <line x1="98" y1="55" x2="115" y2="55" stroke="#CBD5E0" strokeWidth="2.5"/>

                    {/* 3. Catalizador */}
                    {(() => { const a = isSelected("catalizador_esc", "Catalizador"); const c = a ? "#E53935" : "#CBD5E0"; const f = a ? "#FFF5F5" : "#F7FAFC"; return (
                      <g>
                        <rect x="115" y="42" width="48" height="26" rx="4" fill={f} stroke={c} strokeWidth="1.5"/>
                        <line x1="124" y1="44" x2="124" y2="66" stroke={c} strokeWidth="0.5" opacity="0.4"/>
                        <line x1="131" y1="44" x2="131" y2="66" stroke={c} strokeWidth="0.5" opacity="0.4"/>
                        <line x1="139" y1="44" x2="139" y2="66" stroke={c} strokeWidth="0.5" opacity="0.4"/>
                        <line x1="147" y1="44" x2="147" y2="66" stroke={c} strokeWidth="0.5" opacity="0.4"/>
                        <line x1="155" y1="44" x2="155" y2="66" stroke={c} strokeWidth="0.5" opacity="0.4"/>
                        {a && <text x="139" y="58" textAnchor="middle" fontSize="7" fill="#E53935" fontWeight="800">✓</text>}
                        <text x="139" y="79" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">CATALIZADOR</text>
                      </g>
                    );})()}

                    <line x1="163" y1="55" x2="198" y2="55" stroke="#CBD5E0" strokeWidth="2.5"/>

                    {/* 4. Silenciador intermedio */}
                    {(() => { const a = isSelected("silenciador_int", "Silenciador intermedio"); const c = a ? "#E53935" : "#CBD5E0"; const f = a ? "#FFF5F5" : "#F7FAFC"; return (
                      <g>
                        <rect x="198" y="38" width="68" height="34" rx="10" fill={f} stroke={c} strokeWidth="1.5"/>
                        <line x1="208" y1="42" x2="208" y2="68" stroke={c} strokeWidth="0.3" opacity="0.3"/>
                        <line x1="256" y1="42" x2="256" y2="68" stroke={c} strokeWidth="0.3" opacity="0.3"/>
                        {a && <text x="232" y="58" textAnchor="middle" fontSize="7" fill="#E53935" fontWeight="800">✓</text>}
                        <text x="232" y="83" textAnchor="middle" fontSize="4.5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">SILENC. INTERMEDIO</text>
                      </g>
                    );})()}

                    {/* 5. Caño intermedio */}
                    {(() => { const a = isSelected("cano_intermedio", "Caño intermedio"); const c = a ? "#E53935" : "#CBD5E0"; return (
                      <g>
                        <line x1="266" y1="55" x2="340" y2="55" stroke={c} strokeWidth={a ? 3.5 : 2.5}/>
                        <text x="303" y="40" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">CAÑO INTERMEDIO</text>
                        {a && <circle cx="303" cy="32" r="5" fill="#EBF5FF" stroke="#E53935" strokeWidth="1"/>}
                        {a && <text x="303" y="34.5" textAnchor="middle" fontSize="5" fill="#E53935" fontWeight="800">✓</text>}
                      </g>
                    );})()}

                    {/* 6. Silenciador trasero */}
                    {(() => { const a = isSelected("silenciador_tra", "Silenciador trasero"); const c = a ? "#E53935" : "#CBD5E0"; const f = a ? "#FFF5F5" : "#F7FAFC"; return (
                      <g>
                        <rect x="340" y="33" width="90" height="44" rx="14" fill={f} stroke={c} strokeWidth="1.5"/>
                        <line x1="354" y1="37" x2="354" y2="73" stroke={c} strokeWidth="0.3" opacity="0.3"/>
                        <line x1="418" y1="37" x2="418" y2="73" stroke={c} strokeWidth="0.3" opacity="0.3"/>
                        <circle cx="385" cy="55" r="8" fill="none" stroke={c} strokeWidth="0.5" opacity="0.3"/>
                        {a && <text x="385" y="58" textAnchor="middle" fontSize="8" fill="#E53935" fontWeight="800">✓</text>}
                        <text x="385" y="90" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">SILENC. TRASERO</text>
                      </g>
                    );})()}

                    {/* Pipe to Cola */}
                    <line x1="430" y1="55" x2="460" y2="55" stroke="#CBD5E0" strokeWidth="2"/>

                    {/* 7. Cola */}
                    {(() => { const a = isSelected("cola_esc", "Cola"); const c = a ? "#E53935" : "#CBD5E0"; const f = a ? "#FFF5F5" : "#F7FAFC"; return (
                      <g>
                        <line x1="460" y1="55" x2="485" y2="55" stroke={c} strokeWidth={a ? 3 : 2}/>
                        <circle cx="490" cy="55" r="6" fill={f} stroke={c} strokeWidth="1.5"/>
                        <circle cx="490" cy="55" r="3" fill="none" stroke={c} strokeWidth="0.8"/>
                        <text x="490" y="72" textAnchor="middle" fontSize="5" fill={a ? "#E53935" : "#A0AEC0"} fontWeight="700">COLA</text>
                        {a && <text x="490" y="57.5" textAnchor="middle" fontSize="5" fill="#E53935" fontWeight="800">✓</text>}
                      </g>
                    );})()}

                    {/* Soportes (mounts) - subtle dots */}
                    {[160, 275, 320, 420].map((x, i) => (
                      <circle key={i} cx={x} cy="55" r="2" fill="#A0AEC0" opacity="0.4" />
                    ))}

                    {/* Legend */}
                    <circle cx="20" cy="118" r="4" fill="#E53935"/>
                    <text x="28" y="120" fontSize="5" fill="#718096" fontWeight="600">Sustituida</text>
                    <rect x="85" y="114" width="8" height="8" rx="1.5" fill="#F7FAFC" stroke="#CBD5E0" strokeWidth="0.8"/>
                    <text x="97" y="120" fontSize="5" fill="#718096" fontWeight="600">Sin intervención</text>
                  </svg>
                </div>

                {/* Side items: Soporte + Arreglo */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center", width: 36, flexShrink: 0 }}>
                  {(() => { const a = isSelected("soporte_esc", "Soporte"); return (
                    <div style={{ padding: "3px 2px", borderRadius: 3, border: `0.8px solid ${a ? "#E53935" : "#E2E8F0"}`, background: a ? "#FFF5F5" : "#FAFBFC", textAlign: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: a ? "#1E88E5" : "#F7FAFC", border: `0.8px solid ${a ? "#E53935" : "#CBD5E0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 1 }}>
                        {a && <span style={{ color: "#FFF", fontSize: 5, fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 4, fontWeight: 700, color: a ? "#E53935" : "#A0AEC0", lineHeight: 1 }}>SOPORTE</div>
                    </div>
                  );})()}
                  {(() => { const a = isSelected("arreglo_esc", "Arreglo"); return (
                    <div style={{ padding: "3px 2px", borderRadius: 3, border: `0.8px solid ${a ? "#E53935" : "#E2E8F0"}`, background: a ? "#FFF5F5" : "#FAFBFC", textAlign: "center" }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: a ? "#1E88E5" : "#F7FAFC", border: `0.8px solid ${a ? "#E53935" : "#CBD5E0"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 1 }}>
                        {a && <span style={{ color: "#FFF", fontSize: 5, fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 4, fontWeight: 700, color: a ? "#E53935" : "#A0AEC0", lineHeight: 1 }}>ARREGLO</div>
                    </div>
                  );})()}
                </div>
              </div>
            </div>
          </div>

          {/* Work details */}
          <div style={{ padding: "4px 22px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 6 }}>TRABAJOS REALIZADOS</div>
            <div style={{ padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              {order.works.filter(w => w.type === "Escape").map((w, wi) => {
                let items = w.trenItems?.filter(ti => ti.isCustom ? ti.label : ti.selected) || [];
                if (items.length === 0 && w.desc && w.trenItems) {
                  const parts = w.desc.split(",").map(s => s.trim()).filter(Boolean);
                  items = parts.map(p => {
                    const match = w.trenItems.find(ti => ti.label && ti.label.toLowerCase() === p.toLowerCase());
                    return match || { label: p, price: "" };
                  });
                } else if (items.length === 0 && w.desc) {
                  items = w.desc.split(",").map(s => s.trim()).filter(Boolean).map(s => ({ label: s, price: "" }));
                }
                if (items.length > 0) {
                  return items.map((ti, j) => (
                    <div key={`${wi}-${j}`} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #F0F0F0" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#0D1B2A" }}>• {ti.label}{ti.otroDesc ? ` — ${ti.otroDesc}` : ""}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#718096", fontFamily: fontD }}>{Number(ti.price) > 0 ? `$${Number(ti.price).toLocaleString("es-AR")}` : ""}</span>
                    </div>
                  ));
                }
                return (
                  <div key={wi} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #F0F0F0" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#0D1B2A" }}>{w.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1E88E5", fontFamily: fontD }}>${Number(w.price).toLocaleString("es-AR")}</span>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #0D1B2A", marginTop: 6, paddingTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0D1B2A", fontFamily: fontD }}>TOTAL</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#1E88E5", fontFamily: fontD }}>${order.works.filter(w => w.type === "Escape").reduce((s, w) => s + (parseFloat(w.price) || 0), 0).toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: "linear-gradient(90deg, #1E88E5, #1565C0)", padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 8, color: "#FFF", fontStyle: "italic", opacity: 0.9 }}>Gracias por confiar en</div>
            <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 800, color: "#FFF", letterSpacing: 3 }}>CARBOYS</div>
          </div>
        </div>
      </div>
    );
  }

  const sheet = order.serviceSheet || {};
  const isBase = order.works.some(w => w.type === "Service Base");
  const isPF = !order.works.some(w => w.type === "Service Full" || w.type === "Service Base") && order.works.some(w => w.type === "Pastillas de Freno" || w.type === "Tren Delantero" || w.type === "Tren Trasero");
  const forceIntervention = fojaType === "intervention";
  const hasTrenWorks = order.works.some(w => w.type === "Tren Delantero" || w.type === "Tren Trasero" || w.type === "Pastillas de Freno");

  if (forceIntervention && hasTrenWorks) {
    const trenWorks = order.works.filter(w => w.type === "Tren Delantero" || w.type === "Tren Trasero" || w.type === "Pastillas de Freno");
    return (
      <div style={{ background: "#E8ECF0", minHeight: "100vh", padding: "16px", fontFamily: font }}>
        <div className="no-print" style={{ maxWidth: 620, margin: "0 auto 12px", display: "flex", gap: 10 }}>
          <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, padding: "10px 20px" }}>← Volver</button>
          <button onClick={() => window.print()} style={{ ...btnPrimary("#1E88E5"), fontSize: 13, padding: "10px 20px", flex: 1 }}>🖨️ Imprimir Informe</button>
        </div>
        <div id="foja-print" style={{ maxWidth: 620, margin: "0 auto", background: "#FFF", borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,.12)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B2D45 60%, #1E88E5 100%)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 800, color: "#FFF", letterSpacing: 4, lineHeight: 1 }}>CARBOYS</div>
              <div style={{ fontSize: 7, letterSpacing: 3, color: "#64B5F6", marginTop: 2 }}>SERVICIO INTEGRAL DEL AUTOMOTOR</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 6.5, color: "#90CAF9", lineHeight: 1.6 }}>
              <div>Av. Recta Martinoli 8590, Córdoba</div>
              <div>Tel: 03547-426967 · Cel: 3515095504</div>
              <div>@carboys.cba</div>
            </div>
          </div>
          {/* Title */}
          <div style={{ padding: "10px 22px", background: "#F8F9FA", borderBottom: "2px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fontD, fontSize: 12, fontWeight: 700, color: "#0D1B2A" }}>INFORME DE INTERVENCIÓN</div>
            <div style={{ fontSize: 8, color: "#718096" }}>Fecha: {order.date}</div>
          </div>
          {/* Vehicle + Client */}
          <div style={{ display: "flex", padding: "14px 22px", gap: 14 }}>
            <div style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>VEHÍCULO</div>
              <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 800, color: "#0D1B2A", letterSpacing: 2 }}>{fmtD(order.domain)}</div>
              <div style={{ fontSize: 8, color: "#4A5568" }}>{vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : ""}</div>
              <div style={{ fontSize: 7.5, color: "#718096" }}>Kilometraje: {vehicle?.km ? `${Number(vehicle.km).toLocaleString("es-AR")} km` : "—"}</div>
            </div>
            <div style={{ flex: 1.2, padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              <div style={{ fontSize: 6, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 4 }}>CLIENTE</div>
              <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, color: "#0D1B2A" }}>{client ? `${client.name} ${client.lastName}` : ""}</div>
              <div style={{ fontSize: 8, color: "#718096" }}>Tel: {client?.phone || "—"}</div>
            </div>
          </div>
          {/* Intervention Diagram */}
          <div style={{ padding: "8px 22px" }}>
            <InterventionDiagram order={order} sheet={sheet} />
          </div>
          {/* Trabajos */}
          <div style={{ padding: "8px 22px 16px" }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#A0AEC0", letterSpacing: 1, marginBottom: 6 }}>TRABAJOS REALIZADOS</div>
            <div style={{ padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 6 }}>
              {trenWorks.map((w, wi) => (
                <div key={wi} style={{ marginBottom: wi < trenWorks.length - 1 ? 6 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #F0F0F0" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#0D1B2A" }}>{w.type}{w.desc && !w.trenItems ? ` — ${w.desc}` : ""}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1E88E5", fontFamily: fontD }}>${Number(w.price).toLocaleString("es-AR")}</span>
                  </div>
                  {w.trenItems && w.trenItems.filter(ti => ti.selected).map((ti, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0 2px 12px" }}>
                      <span style={{ fontSize: 8.5, color: "#4A5568" }}>• {ti.label}{ti.side && ti.side !== "ambos" ? ` (${ti.side === "izq" ? "Izq" : "Der"})` : ""}</span>
                      {Number(ti.price) > 0 && <span style={{ fontSize: 8.5, color: "#718096", fontFamily: fontD }}>${Number(ti.price).toLocaleString("es-AR")}</span>}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid #0D1B2A", marginTop: 6, paddingTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0D1B2A", fontFamily: fontD }}>TOTAL</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#1E88E5", fontFamily: fontD }}>${trenWorks.reduce((s, w) => s + (parseFloat(w.price) || 0), 0).toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div style={{ background: "linear-gradient(90deg, #1E88E5, #1565C0)", padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 8, color: "#FFF", fontStyle: "italic", opacity: 0.9 }}>Gracias por confiar en</div>
            <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 800, color: "#FFF", letterSpacing: 3 }}>CARBOYS</div>
          </div>
        </div>
      </div>
    );
  }
  const pfDel = order.works.some(w => w.type === "Pastillas de Freno" && w.desc && w.desc.toLowerCase().includes("delantero"));
  const pfTra = order.works.some(w => w.type === "Pastillas de Freno" && w.desc && w.desc.toLowerCase().includes("trasero"));
  const FOJA_TPL = isBase ? SB_TEMPLATE : (isPF && !order.works.some(w => w.type === "Service Full")) ? (pfDel && pfTra ? PF_AMBOS_TEMPLATE : pfTra ? PF_TRA_TEMPLATE : PF_DEL_TEMPLATE) : SF_TEMPLATE;
  const nextKm = (vehicle?.km || 0) + 10000;

  const fojaColor = (item, d) => {
    if (!d) return "#718096";
    if (item.type === "check") return d.checked ? "#2E7D32" : "#718096";
    if (item.type === "statusRC" || item.type === "optionalStatusRC") {
      if (d.status === "bien") return "#2E7D32";
      if (d.status === "regular") return "#E65100";
      if (d.status === "cambiar") return "#C62828";
      if (d.status === "cambiado") return "#1565C0";
      return "#718096";
    }
    if (item.type === "binary" || item.type === "ternary" || item.type === "lavaparabrisas" || item.type === "optionalBinary" || item.type === "fluid" || item.type === "brakeFluid" || item.type === "lamp") {
      if (d.fluidOk === "bien" || d.fluidOk === "ok" || d.fluidOk === "funciona") return "#2E7D32";
      if (d.fluidOk === "mal" || d.fluidOk === "cambiar" || d.fluidOk === "no funciona") return "#C62828";
      if (d.fluidOk === "cambiada") return "#1565C0";
      return "#2E7D32";
    }
    if (item.type === "percentRC" || item.type === "batteryPercent" || item.type === "freno_trasero") {
      const pct = d.percent;
      if (pct >= 60) return "#2E7D32"; if (pct >= 30) return "#E65100"; return "#C62828";
    }
    if (item.type === "voltage") { const v = parseFloat(d.voltage) || 0; return v >= 13.5 && v <= 14.8 ? "#2E7D32" : "#C62828"; }
    return "#718096";
  };

  const fojaLabel = (item, d) => {
    if (!d) return { text: "", color: "#718096" };
    if (item.type === "statusRC" || item.type === "optionalStatusRC") {
      if (d.status === "cambiado") return { text: "Sustituida", color: "#1565C0", wasChanged: true };
      const m = { bien: "Bien", regular: "Regular", cambiar: "Cambiar" };
      const cm = { bien: "#2E7D32", regular: "#E65100", cambiar: "#C62828" };
      return { text: m[d.status] || "", color: cm[d.status] || "#718096" };
    }
    if (item.type === "fluid") {
      if (d.fluidOk === "bien") return { text: "Bien", color: "#2E7D32", subText: d.added ? "Se niveló" : null, subColor: "#1565C0" };
      if (d.fluidOk === "cambiar") return { text: "Cambiar", color: "#C62828" };
      return { text: d.fluidOk || "", color: "#C62828" };
    }
    if (item.type === "brakeFluid") {
      const pct = d.percent >= 0 ? d.percent : null;
      const pctColor = pct !== null ? (pct <= 2 ? "#2E7D32" : pct === 3 ? "#E65100" : "#C62828") : "#718096";
      const pctLabel = pct !== null ? (pct <= 2 ? "OK" : pct === 3 ? "Crítico" : "Mal") : "";
      const statusText = d.fluidOk === "bien" ? "Bien" : d.fluidOk === "cambiar" ? "Cambiar" : "";
      const statusColor = d.fluidOk === "bien" ? "#2E7D32" : "#C62828";
      return { text: statusText, color: statusColor, subText: d.added ? "Se niveló" : null, subColor: "#1565C0", pctVal: pct, pctColor, pctLabel };
    }
    if (item.type === "binary" || item.type === "ternary" || item.type === "optionalBinary") {
      if (d.fluidOk === "cambiado") return { text: "Sustituida", color: "#1565C0", wasChanged: true };
      return { text: d.fluidOk === "bien" ? "Bien" : d.fluidOk === "mal" ? "Mal" : (d.fluidOk || ""), color: d.fluidOk === "bien" ? "#2E7D32" : "#C62828" };
    }
    if (item.type === "lavaparabrisas") {
      if (d.fluidOk === "nivelado") return { text: "Completado", color: "#1565C0" };
      return { text: "", color: "#718096" };
    }
    if (item.type === "percentRC") {
      if (d.status === "cambiado") return { text: "Sustituida", color: "#1565C0", wasChanged: true };
      if (d.status === "cambiar") return { text: `${d.percent >= 0 ? d.percent + "% — " : ""}Cambiar`, color: "#C62828" };
      return { text: d.percent >= 0 ? `${d.percent}%` : "", color: d.percent > 50 ? "#2E7D32" : d.percent > 20 ? "#E65100" : "#C62828" };
    }
    if (item.type === "freno_trasero") {
      if (d.status === "cambiado") return { text: `${d.toggle || "Pastillas"} — Sustituida`, color: "#1565C0", wasChanged: true };
      if (d.toggle) return { text: `${d.toggle} ${d.percent >= 0 ? d.percent + "%" : ""}`, color: d.percent > 50 ? "#2E7D32" : d.percent > 20 ? "#E65100" : "#C62828" };
      return { text: "", color: "#718096" };
    }
    if (item.type === "batteryPercent") {
      if (d.status === "cambiado") return { text: "Sustituida", color: "#1565C0", wasChanged: true };
      return { text: d.percent >= 0 ? `${d.percent}%` : "", color: d.percent >= 75 ? "#2E7D32" : d.percent >= 50 ? "#E65100" : "#C62828" };
    }
    if (item.type === "lamp") {
      if (d.fluidOk === "funciona") return { text: "OK", color: "#2E7D32" };
      if (d.fluidOk === "cambiada") return { text: "Sustituida", color: "#1565C0", wasChanged: true, prevText: "Quemada", prevColor: "#C62828" };
      if (d.fluidOk === "no funciona") return { text: "Quemada", color: "#C62828" };
      return { text: d.fluidOk || "", color: "#718096" };
    }
    if (item.type === "check") return { text: d.checked ? "Realizado" : "", color: "#2E7D32" };
    if (item.type === "serviceReset") return { text: d.resetStatus === "realizado" ? "Se realizó" : d.resetStatus === "no_equipado" ? "No equipado" : "", color: d.resetStatus === "realizado" ? "#2E7D32" : "#C62828" };
    if (item.type === "voltage") { const v = parseFloat(d.voltage) || 0; const ok = v >= 13.5 && v <= 14.8; return { text: d.voltage ? `${d.voltage}V` : "", color: ok ? "#2E7D32" : "#C62828" }; }
    if (item.type === "toggle") return { text: d.toggle || "", color: "#718096" };
    if (item.type === "dtc") return { text: d.dtcStatus === "sin_fallos" ? "Sin fallos" : d.dtcStatus === "con_fallos" ? `${(d.dtcEntries||[]).length} fallo(s)` : "", color: d.dtcStatus === "sin_fallos" ? "#2E7D32" : "#C62828" };
    return { text: "", color: "#718096" };
  };

  const isItemVisible = (item, d) => {
    if (!d) return false;
    if (item.type === "optionalStatusRC" || item.type === "optionalBinary") return !!d.checked;
    if (item.type === "tires") return false;
    if (item.type === "check") return d.checked;
    if (item.type === "serviceReset") return !!d.resetStatus;
    if (d.status || d.fluidOk || d.checked || d.toggle || d.voltage || d.dtcStatus || d.percent >= 0) return true;
    return false;
  };

  const sections = FOJA_TPL.map(sec => {
    const items = sec.items.filter(it => isItemVisible(it, sheet[it.id])).map(it => {
      const d = sheet[it.id] || {};
      const isSustituida = d.status === "cambiado" || d.fluidOk === "cambiado";
      const hasPct = !isSustituida && (it.type === "percentRC" || it.type === "batteryPercent" || (it.type === "freno_trasero" && d.percent >= 0));
      const info = hasPct ? null : fojaLabel(it, d);
      let pctChanged = false;
      if (hasPct && d.status === "cambiado") pctChanged = true;
      return {
        label: it.type === "freno_trasero" ? `Freno (${d.toggle || ""})` : it.label,
        color: info ? info.color : fojaColor(it, d),
        text: info ? info.text : null,
        wasChanged: info ? info.wasChanged : pctChanged,
        prevText: info?.prevText || null,
        prevColor: info?.prevColor || null,
        subText: info?.subText || null,
        subColor: info?.subColor || null,
        pct: hasPct ? d.percent : null,
        pctChanged,
        brakePct: info?.pctVal ?? null,
        brakePctColor: info?.pctColor || null,
        brakePctLabel: info?.pctLabel || null,
      };
    });
    return { ...sec, items };
  }).filter(s => s.items.length > 0);

  const tiresD = sheet.estado_cubiertas || {};
  const tires = [tiresD.tires?.del_izq ?? 0, tiresD.tires?.del_der ?? 0, tiresD.tires?.tra_izq ?? 0, tiresD.tires?.tra_der ?? 0];
  const hasTires = tires.some(t => t > 0);
  const techNotes = (order.techNotes || []).filter(n => n && n.trim());
  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const goodItems = sections.reduce((s, sec) => s + sec.items.filter(it => it.color === "#2E7D32" || it.color === "#1565C0" || it.wasChanged).length, 0);
  const score = totalItems > 0 ? Math.round((goodItems / totalItems) * 100) : 0;
  const scoreColor = score >= 80 ? "#2E7D32" : score >= 60 ? "#E65100" : "#C62828";
  const isCompact = totalItems > 35;
  const itemFs = isCompact ? 8 : 9;
  const secPad = isCompact ? "6px 8px" : "8px 10px";
  const gapSize = isCompact ? 4 : 6;

  return (
    <div style={{ background: "#E8ECF0", minHeight: "100vh", padding: "16px", fontFamily: font }}>
      <div className="no-print" style={{ maxWidth: 620, margin: "0 auto 12px", display: "flex", gap: 10 }}>
        <button onClick={() => onNavigate("vehicleDetail", order)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13, padding: "10px 20px" }}>← Volver</button>
        <button onClick={() => window.print()} style={{ ...btnPrimary("#1E88E5"), fontSize: 13, padding: "10px 20px", flex: 1 }}>🖨️ Imprimir Foja</button>
      </div>
      <div id="foja-print" style={{ maxWidth: 620, margin: "0 auto", background: "#FFF", borderRadius: 4, boxShadow: "0 4px 24px rgba(0,0,0,.12)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B2D45 60%, #1E88E5 100%)", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: fontD, fontSize: 30, fontWeight: 800, color: "#FFF", letterSpacing: 4, lineHeight: 1 }}>CARBOYS</div>
            <div style={{ fontSize: 7, letterSpacing: 3, color: "#64B5F6", marginTop: 2 }}>SERVICIO INTEGRAL DEL AUTOMOTOR</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 8, color: "#90CAF9", lineHeight: 1.7 }}>
            <div>Av. Recta Martinolli 8590, Córdoba</div>
            <div>Tel: 03547-426967 · Cel: 3515995504</div>
            <div style={{ color: "#64B5F6" }}>@carboys.cba</div>
          </div>
        </div>
        <div style={{ background: "#F7F9FC", padding: "6px 22px", borderBottom: "1px solid #E8ECF2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: fontD, fontSize: 13, fontWeight: 700, color: "#1B2D45", letterSpacing: 1 }}>{isPF ? "INFORME DE INTERVENCIÓN" : `FOJA DE SERVICIO — ${isBase ? "Service Base" : "Service Full"}`}</div>
          <div style={{ fontSize: 9, color: "#718096" }}>Fecha: {new Date().toLocaleDateString("es-AR")} · {isBase ? "Service Base" : "Service Full"}</div>
        </div>
        <div style={{ padding: "12px 18px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: "#F7F9FC", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8ECF2" }}>
              <div style={{ fontSize: 7, color: "#A0AEC0", fontWeight: 600, letterSpacing: 1.5, marginBottom: 1 }}>VEHÍCULO</div>
              <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 800, color: "#1B2D45", letterSpacing: 1 }}>{fmtD(order.domain)}</div>
              <div style={{ fontSize: 10, color: "#4A5568", fontWeight: 600 }}>{vehicle?.brand} {vehicle?.model} {vehicle?.year}</div>
              <div style={{ fontSize: 9, color: "#718096" }}>Kilometraje: {(vehicle?.km || 0).toLocaleString("es-AR")} km</div>
            </div>
            <div style={{ flex: 1, background: "#F7F9FC", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8ECF2" }}>
              <div style={{ fontSize: 7, color: "#A0AEC0", fontWeight: 600, letterSpacing: 1.5, marginBottom: 1 }}>CLIENTE</div>
              <div style={{ fontFamily: fontD, fontSize: 17, fontWeight: 700, color: "#1B2D45" }}>{client?.name} {client?.lastName}</div>
              <div style={{ fontSize: 9, color: "#4A5568" }}>Tel: {client?.phone || "—"}</div>
            </div>
            {!isBase && !isPF && (<div style={{ width: 80, background: "#F7F9FC", borderRadius: 8, padding: 8, border: `2px solid ${scoreColor}25`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 7, color: "#A0AEC0", fontWeight: 600, letterSpacing: 1 }}>SCORE</div>
              <div style={{ position: "relative", width: 46, height: 46, margin: "3px 0" }}>
                <svg viewBox="0 0 46 46" width="46" height="46">
                  <circle cx="23" cy="23" r="19" fill="none" stroke="#E8ECF2" strokeWidth="3.5" />
                  <circle cx="23" cy="23" r="19" fill="none" stroke={scoreColor} strokeWidth="3.5" strokeDasharray={`${(score / 100) * 119.4} 119.4`} strokeLinecap="round" transform="rotate(-90 23 23)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontD, fontSize: 18, fontWeight: 800, color: scoreColor }}>{score}</div>
              </div>
              <div style={{ fontSize: 7, color: scoreColor, fontWeight: 700 }}>/ 100</div>
            </div>)}
          </div>
          {(isPF || forceIntervention) && hasTrenWorks ? (
            <InterventionDiagram order={order} sheet={sheet} />
          ) : (forceIntervention && !hasTrenWorks) ? (
            <div style={{ padding: 20, textAlign: "center", color: "#718096", fontSize: 10 }}>No hay trabajos de tren/pastillas en esta orden</div>
          ) : (<>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: gapSize, marginBottom: 8 }}>
            {sections.map((sec, i) => (
              <div key={i} style={{ background: "#FAFBFD", borderRadius: 6, padding: secPad, border: "1px solid #EDF0F5" }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#1E88E5", marginBottom: 4, letterSpacing: .3, borderBottom: "1px solid #EDF0F5", paddingBottom: 2 }}>{sec.icon} {sec.section}</div>
                {sec.items.map((it, j) => (
                  <div key={j} style={{ marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: it.color, flexShrink: 0 }} />
                      <span style={{ fontSize: itemFs, color: "#4A5568", flex: 1 }}>{it.label}</span>
                      {it.pct !== null ? (
                        <div style={{ width: 40, display: "flex", alignItems: "center", gap: 3 }}>
                          <FojaProgressBar pct={it.pct} color={it.color} h={3} />
                          <span style={{ fontSize: 7, color: "#718096", width: 18, textAlign: "right" }}>{it.pct}%</span>
                        </div>
                      ) : (
                        it.wasChanged ? (
                        <span style={{ fontSize: 7, fontWeight: 700 }}>
                          {it.prevText && <><span style={{ color: it.prevColor, textDecoration: "line-through" }}>{it.prevText}</span><span style={{ color: "#718096" }}> → </span></>}
                          <span style={{ color: "#1565C0" }}>{it.text}</span>
                          {it.pctChanged && <span style={{ color: "#1565C0" }}> Sustituida</span>}
                        </span>
                      ) : (
                        <span style={{ fontSize: 7, fontWeight: 700, color: it.color }}>{it.text}</span>
                      )
                      )}
                    </div>
                    {it.brakePct !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 8, marginTop: 1 }}>
                        <span style={{ fontSize: 6, color: "#718096" }}>Agua:</span>
                        <div style={{ width: 30, height: 3, background: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${it.brakePct * 25}%`, height: "100%", background: it.brakePctColor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 6, fontWeight: 700, color: it.brakePctColor }}>{it.brakePct}% — {it.brakePctLabel}</span>
                      </div>
                    )}
                    {it.subText && <div style={{ fontSize: 5.5, color: it.subColor || "#1565C0", fontWeight: 600, paddingLeft: 8, marginTop: 0 }}>{it.subText}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {hasTires && (
              <div style={{ background: "#FAFBFD", borderRadius: 6, padding: "6px 10px", border: "1px solid #EDF0F5", textAlign: "center", width: 140 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#1E88E5", marginBottom: 2, letterSpacing: .3 }}>🛞 CUBIERTAS</div>
                <FojaTireDiagram tires={tires} size={85} />
              </div>
            )}
            {techNotes.length > 0 ? (
              <div style={{ flex: 1, background: "#FAFBFD", borderRadius: 6, padding: "6px 10px", border: "1px solid #EDF0F5" }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: "#E65100", marginBottom: 4, letterSpacing: .3 }}>📝 OBSERVACIONES</div>
                {techNotes.map((o, i) => (
                  <div key={i} style={{ fontSize: 8, color: "#4A5568", marginBottom: 4, paddingLeft: 6, borderLeft: "2px solid #E65100", lineHeight: 1.3 }}>{o}</div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, background: "#FAFBFD", borderRadius: 6, padding: "10px", border: "1px solid #EDF0F5", textAlign: "center", color: "#A0AEC0", fontSize: 9 }}>Sin observaciones adicionales</div>
            )}
          </div>
          </>)}
                    {/* TRABAJOS Y TOTAL */}
          <div style={{ background: "#FAFBFD", borderRadius: 6, padding: "8px 12px", border: "1px solid #EDF0F5", marginBottom: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#1B2D45", marginBottom: 4, letterSpacing: .3, borderBottom: "1px solid #EDF0F5", paddingBottom: 2 }}>TRABAJOS REALIZADOS</div>
            {order.works.map((w, i) => (
              <div key={i} style={{ padding: "3px 0", borderBottom: i < order.works.length - 1 ? "1px solid #F0F2F5" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "#1B2D45", fontWeight: 700 }}>{w.type}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#1B2D45", fontFamily: fontD }}>{"$"+w.price.toLocaleString("es-AR")}</span>
                </div>
                {w.trenItems && w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).length > 0 ? (
                  <div style={{ paddingLeft: 8, marginTop: 1 }}>
                    {w.trenItems.filter(ti => ti.isCustom ? ti.label : ti.selected).map((ti, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1px 0" }}>
                        <span style={{ fontSize: 7.5, color: "#4A5568" }}>• {ti.isCustom ? ti.label : ti.label}{ti.side && ti.side !== "ambos" ? ` (${ti.side === "izq" ? "Izq" : "Der"})` : ""}{ti.otroDesc ? ` — ${ti.otroDesc}` : ""}</span>
                        {ti.price && <span style={{ fontSize: 7.5, color: "#718096", fontFamily: fontD }}>${Number(ti.price).toLocaleString("es-AR")}</span>}
                      </div>
                    ))}
                  </div>
                ) : w.desc ? (
                  <div style={{ paddingLeft: 8, marginTop: 1 }}>
                    <span style={{ fontSize: 7.5, color: "#4A5568" }}>• {w.desc}</span>
                  </div>
                ) : null}
              </div>
            ))}
            <div style={{ borderTop: "2px solid #1E88E5", marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#1B2D45", fontFamily: fontD, letterSpacing: .5 }}>TOTAL</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1E88E5", fontFamily: fontD }}>{"$"+order.works.reduce((s,w)=>s+w.price,0).toLocaleString("es-AR")}</span>
            </div>
          </div>

          {!isPF && <div style={{ background: "linear-gradient(135deg, #1E88E5, #0D47A1)", borderRadius: 8, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#90CAF9" }}>PRÓXIMO SERVICE RECOMENDADO</div>
              <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 800, color: "#FFF", letterSpacing: 1 }}>{nextKm.toLocaleString("es-AR")} km</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, color: "#90CAF9" }}>Gracias por confiar en</div>
              <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, color: "#FFF", letterSpacing: 2 }}>CARBOYS</div>
            </div>
          </div>}
        </div>
        <div style={{ background: "#F7F9FC", borderTop: "1px solid #E8ECF2", padding: "5px 22px", display: "flex", justifyContent: "space-between", fontSize: 7, color: "#A0AEC0" }}>
          <span>CarBoys - Servicio Integral del Automotor</span>
          <span>Av. Recta Martinolli 8590 · 03547-426967 · @carboys.cba</span>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } body { margin:0!important; background:#fff!important; } #foja-print { box-shadow:none!important; border-radius:0!important; max-width:none!important; } }`}</style>
    </div>
  );
};

const Placeholder = ({ title, icon, desc }) => (
  <div style={{ padding: 24, textAlign: "center", paddingTop: 80, animation: "fadeUp .3s ease" }}>
    <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
    <div style={{ fontFamily: fontD, fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{title}</div>
    <div style={{ color: T.gray, fontSize: 14, maxWidth: 400, margin: "0 auto" }}>{desc}</div>
  </div>
);

const ConfigScreen = ({ user, users, setUsers, config, setConfig, onNavigate }) => {
  const [section, setSection] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", role: "mecánico", pin: "0000" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");

  const showSaved = (msg) => { setSavedMsg(msg); setTimeout(() => setSavedMsg(""), 2000); };

  const ROLES = [
    { key: "dueño", label: "Dueño", desc: "Acceso total al sistema", color: T.red, icon: "👑" },
    { key: "admin", label: "Administración", desc: "Todo excepto gestión de usuarios", color: T.orange, icon: "🛡️" },
    { key: "encargado", label: "Encargado", desc: "Crea órdenes, ve precios, entrega", color: T.accent, icon: "📋" },
    { key: "mecánico", label: "Mecánico", desc: "Solo ve y trabaja en órdenes asignadas", color: T.green, icon: "🔧" },
  ];

  const ROLE_PERMS = {
    dueño: { precios: true, crearOrden: true, finalizar: true, entregar: true, presupuesto: true, admin: true, config: true, cancelar: true },
    admin: { precios: true, crearOrden: true, finalizar: true, entregar: true, presupuesto: true, admin: true, config: true, cancelar: false },
    encargado: { precios: true, crearOrden: true, finalizar: true, entregar: true, presupuesto: true, admin: false, config: false, cancelar: false },
    mecánico: { precios: false, crearOrden: false, finalizar: true, entregar: false, presupuesto: false, admin: false, config: false, cancelar: false },
  };

  const PERM_LABELS = {
    precios: "💰 Ver precios y montos",
    crearOrden: "📝 Crear/editar órdenes",
    finalizar: "✅ Finalizar trabajos",
    entregar: "🚗 Entregar vehículos",
    presupuesto: "📤 Enviar presupuestos",
    admin: "📊 Acceder a Administración",
    config: "⚙️ Acceder a Configuración",
    cancelar: "🗑️ Cancelar órdenes",
  };

  const COLORS = [T.red, T.accent, T.orange, T.green, "#9C27B0", "#00BCD4", "#FF5722", "#795548"];

  const sections = [
    { key: "users", icon: "👥", label: "Gestión de Usuarios", desc: "Crear, editar y administrar usuarios", only: "dueño" },
    { key: "surcharges", icon: "💳", label: "Recargos Tarjeta", desc: "Cuotas e IVA" },
    { key: "whatsapp", icon: "📱", label: "WhatsApp Business", desc: "Mensajes y conexión" },
    
    { key: "hours", icon: "🕐", label: "Horarios de Atención", desc: "Días y horarios" },
    { key: "notifs", icon: "🔔", label: "Notificaciones", desc: "Alertas y recordatorios" },
    { key: "backup", icon: "💾", label: "Backup / Exportar", desc: "Descargar datos" },
    

  ].filter(s => !s.only || s.only === user.role);

  if (!section) return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span onClick={() => onNavigate("dashboard")} style={{ cursor: "pointer", fontSize: 20, color: T.gray }}>←</span>
        <div>
          <div style={{ fontFamily: fontD, fontSize: 24, fontWeight: 700 }}>⚙️ Configuración</div>
          <div style={{ fontSize: 12, color: T.gray }}>Administrá tu taller</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {sections.map(s => (
          <div key={s.key} onClick={() => setSection(s.key)}
            style={{ ...card, padding: 20, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: T.gray }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (section === "users") return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span onClick={() => editingUser ? setEditingUser(null) : setSection(null)} style={{ cursor: "pointer", fontSize: 20, color: T.gray }}>←</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>👥 {editingUser ? "Editar Usuario" : "Gestión de Usuarios"}</div>
        </div>
        {!editingUser && <div onClick={() => { setNewUser({ name: "", role: "mecánico", pin: "0000" }); setShowNewUser(true); }}
          style={{ ...btnPrimary(T.accent), padding: "8px 16px", fontSize: 12 }}>+ Nuevo</div>}
      </div>

      {savedMsg && <div style={{ ...card, padding: 12, marginBottom: 16, borderColor: T.green, background: "rgba(67,160,71,0.08)", textAlign: "center", fontSize: 13, fontWeight: 700, color: T.green }}>{savedMsg}</div>}

      {editingUser ? (
        <div>
          {/* Edit user form */}
          <div style={{ ...card, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: editingUser.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#FFF" }}>
                {editingUser.initial || editingUser.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <input value={editingUser.name} onChange={e => setEditingUser(u => ({ ...u, name: e.target.value, initial: e.target.value[0]?.toUpperCase() || "" }))}
                  style={{ ...inputStyle, fontSize: 18, fontWeight: 700, padding: "6px 10px" }} />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, marginBottom: 8 }}>ROL</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
              {ROLES.filter(r => r.key !== "dueño" || editingUser.role === "dueño").map(r => (
                <div key={r.key} onClick={() => setEditingUser(u => ({ ...u, role: r.key }))}
                  style={{ padding: 12, borderRadius: 10, cursor: "pointer", border: `2px solid ${editingUser.role === r.key ? r.color : T.border}`, background: editingUser.role === r.key ? `${r.color}15` : T.bg, transition: "all .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span>{r.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: editingUser.role === r.key ? r.color : T.text }}>{r.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: T.gray }}>{r.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, marginBottom: 8 }}>COLOR</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setEditingUser(u => ({ ...u, color: c }))}
                  style={{ width: 32, height: 32, borderRadius: 8, background: c, cursor: "pointer", border: editingUser.color === c ? "3px solid #FFF" : "3px solid transparent", boxShadow: editingUser.color === c ? `0 0 0 2px ${c}` : "none" }} />
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, marginBottom: 8 }}>PIN DE ACCESO</div>
            <input inputMode="numeric" value={editingUser.pin} onChange={e => setEditingUser(u => ({ ...u, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))}
              maxLength={4} style={{ ...inputStyle, fontSize: 28, fontWeight: 700, fontFamily: fontD, textAlign: "center", letterSpacing: 12, width: 160, padding: "8px 12px" }} />

            <div style={{ fontSize: 12, fontWeight: 700, color: T.grayLight, marginBottom: 8, marginTop: 20 }}>PERMISOS DEL ROL: {ROLES.find(r => r.key === editingUser.role)?.label}</div>
            <div style={{ ...card, padding: 14 }}>
              {Object.entries(PERM_LABELS).map(([k, label]) => {
                const has = ROLE_PERMS[editingUser.role]?.[k];
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}22` }}>
                    <span style={{ fontSize: 13, color: has ? T.text : T.gray }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: has ? T.green : T.red }}>{has ? "✓ Sí" : "✕ No"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setEditingUser(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
            <button onClick={() => {
              setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
              setEditingUser(null);
              showSaved("✅ Usuario actualizado");
            }} style={{ ...btnPrimary(T.accent), flex: 1 }}>💾 Guardar</button>
          </div>
        </div>
      ) : (
        <div>
          {/* Users list */}
          {users.map(u => (
            <div key={u.id} style={{ ...card, padding: 16, marginBottom: 8, opacity: u.active === false ? 0.5 : 1, borderLeft: `4px solid ${u.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#FFF" }}>
                  {u.initial || u.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name} {u.active === false && <span style={{ fontSize: 10, color: T.red, background: `${T.red}15`, padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>INACTIVO</span>}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{ROLES.find(r => r.key === u.role)?.icon} {ROLES.find(r => r.key === u.role)?.label} • PIN: {u.pin}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {u.role !== "dueño" && (
                    <div onClick={() => {
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, active: x.active === false ? true : false } : x));
                      showSaved(u.active === false ? "✅ Usuario activado" : "⏸️ Usuario desactivado");
                    }} style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, border: `1px solid ${T.border}`, color: u.active === false ? T.green : T.orange }}>
                      {u.active === false ? "Activar" : "Pausar"}
                    </div>
                  )}
                  <div onClick={() => setEditingUser({ ...u })}
                    style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontWeight: 700, border: `1px solid ${T.accent}`, color: T.accent }}>
                    Editar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New user popup */}
      {showNewUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }} onClick={() => setShowNewUser(false)}>
          <div style={{ background: T.bg2, borderRadius: 16, padding: 24, maxWidth: 420, width: "90%", border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>👤 Nuevo Usuario</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.grayLight }}>NOMBRE</label>
              <input value={newUser.name} onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                placeholder="Nombre del usuario" style={{ ...inputStyle, fontSize: 16, fontWeight: 600, padding: "10px 12px", marginTop: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.grayLight }}>ROL</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 4 }}>
                {ROLES.filter(r => r.key !== "dueño").map(r => (
                  <div key={r.key} onClick={() => setNewUser(u => ({ ...u, role: r.key }))}
                    style={{ padding: 10, borderRadius: 8, cursor: "pointer", border: `2px solid ${newUser.role === r.key ? r.color : T.border}`, background: newUser.role === r.key ? `${r.color}15` : T.bg, textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: newUser.role === r.key ? r.color : T.gray }}>{r.icon} {r.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.grayLight }}>PIN (4 dígitos)</label>
              <input inputMode="numeric" value={newUser.pin} onChange={e => setNewUser(u => ({ ...u, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))}
                maxLength={4} placeholder="0000" style={{ ...inputStyle, fontSize: 22, fontWeight: 700, fontFamily: fontD, textAlign: "center", letterSpacing: 10, width: 140, padding: "8px 12px", marginTop: 4 }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNewUser(false)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, flex: 1 }}>Cancelar</button>
              <button onClick={() => {
                if (!newUser.name || !newUser.pin || newUser.pin.length < 4) return;
                const color = COLORS[users.length % COLORS.length];
                setUsers(prev => [...prev, { id: Date.now(), name: newUser.name, role: newUser.role, pin: newUser.pin, initial: newUser.name[0].toUpperCase(), color, active: true }]);
                setShowNewUser(false);
                showSaved("✅ Usuario creado");
              }} disabled={!newUser.name || newUser.pin.length < 4}
                style={{ ...btnPrimary(T.accent), flex: 1, opacity: (newUser.name && newUser.pin.length >= 4) ? 1 : 0.4 }}>Crear Usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  
  if (section === "whatsapp") return (
    <div style={{ padding: 24, animation: "fadeUp .3s ease", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 22, fontWeight: 700 }}>📱 WhatsApp Business</div>
        <button onClick={() => setSection(null)} style={{ ...btnPrimary(T.bg3), border: `1px solid ${T.border}`, fontSize: 13 }}>← Volver</button>
      </div>

      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📞 Datos de WhatsApp</div>
        <div style={{ marginBottom: 12 }}><label style={labelStyle}>Número del Taller (con código país)</label><input inputMode="tel" value={config.whatsappNum || ""} onChange={e => setConfig(prev => ({ ...prev, whatsappNum: e.target.value }))} style={inputStyle} placeholder="Ej: 5493547426967" /></div>
        <div style={{ marginBottom: 12 }}><label style={labelStyle}>Nombre que se muestra</label><input value={config.whatsappName || ""} onChange={e => setConfig(prev => ({ ...prev, whatsappName: e.target.value }))} style={inputStyle} placeholder="Ej: CarBoys Servicio Integral" /></div>
        <button onClick={() => showSaved("WhatsApp guardado ✓")} style={{ ...btnPrimary(T.green), fontSize: 13, width: "100%" }}>💾 Guardar</button>
      </div>

      <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 14, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>📝 Mensajes Pre-guardados</div>

      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 8, color: T.accent }}>📋 Mensaje de Autorización de Cambio</div>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 10 }}>Se envía al cliente cuando un repuesto necesita autorización. Variables: {"{nombre}"} {"{dominio}"} {"{vehiculo}"} {"{item}"} {"{precio}"} {"{precioIVA}"} {"{total}"}</div>
        <textarea value={config.authMessage || ""} onChange={e => setConfig(prev => ({ ...prev, authMessage: e.target.value }))}
          style={{ ...inputStyle, minHeight: 180, fontFamily: font, fontSize: 13, lineHeight: 1.6, resize: "vertical" }}
          placeholder="Escribí el mensaje de autorización..." />
      </div>

      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 8, color: T.green }}>✅ Mensaje de Vehículo Listo</div>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 10 }}>Se envía al cliente cuando el vehículo está listo para retirar. Variables: {"{nombre}"} {"{dominio}"} {"{vehiculo}"}</div>
        <textarea value={config.readyMessage || "Hola {nombre}! Te informamos que tu {vehiculo} ({dominio}) ya está listo para retirar.\n\n¡Gracias por confiar en *CarBoys*! 🔧\n\nTe esperamos de Lunes a Viernes de 8 a 18hs.\nAv. Recta Martinoli 8590, Córdoba"} onChange={e => setConfig(prev => ({ ...prev, readyMessage: e.target.value }))}
          style={{ ...inputStyle, minHeight: 150, fontFamily: font, fontSize: 13, lineHeight: 1.6, resize: "vertical" }} />
      </div>

      <div style={{ ...card, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#9C27B0" }}>📋 Mensaje de Recepción</div>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 10 }}>Se envía al cliente cuando se recepciona su vehículo. Variables: {"{nombre}"} {"{dominio}"} {"{vehiculo}"}</div>
        <textarea value={config.welcomeMessage || "¡Bienvenido/a {nombre} a *CarBoys*! 🔧\n\nTu {vehiculo} ({dominio}) ya está registrado en nuestro sistema.\n\nTe mantendremos informado/a sobre el estado de tu vehículo.\n\nGracias por confiar en nosotros!"} onChange={e => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
          style={{ ...inputStyle, minHeight: 150, fontFamily: font, fontSize: 13, lineHeight: 1.6, resize: "vertical" }} />
      </div>

      <div style={{ ...card, padding: 20 }}>
        <div style={{ fontFamily: fontD, fontSize: 14, fontWeight: 700, marginBottom: 8, color: T.orange }}>📣 Mensaje de Campaña / Promo</div>
        <div style={{ fontSize: 11, color: T.gray, marginBottom: 10 }}>Plantilla para campañas de marketing y promociones.</div>
        <textarea value={config.promoMessage || "¡Hola {nombre}! Desde *CarBoys* te acercamos una promo especial:\n\n🔧 [COMPLETAR PROMO]\n\n📅 Válido hasta [FECHA]\n\nReserva tu turno respondiendo este mensaje.\n\n*CarBoys* — Servicio Integral del Automotor 🔧"} onChange={e => setConfig(prev => ({ ...prev, promoMessage: e.target.value }))}
          style={{ ...inputStyle, minHeight: 150, fontFamily: font, fontSize: 13, lineHeight: 1.6, resize: "vertical" }} />
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: T.grayLight }}>💡 Tip: Usá * para negrita en WhatsApp (ej: *texto en negrita*). Usá \n para salto de línea.</div>
      <button onClick={() => showSaved("Mensajes guardados ✓")} style={{ ...btnPrimary(T.green), marginTop: 12, fontSize: 14, width: "100%" }}>💾 Guardar Todo</button>
    </div>
  );

  if (section === "surcharges") return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span onClick={() => setSection(null)} style={{ cursor: "pointer", fontSize: 20, color: T.gray }}>←</span>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>💳 Recargos Tarjeta</div>
      </div>
      {savedMsg && <div style={{ ...card, padding: 12, marginBottom: 16, borderColor: T.green, background: "rgba(67,160,71,0.08)", textAlign: "center", fontSize: 13, fontWeight: 700, color: T.green }}>{savedMsg}</div>}
      <div style={{ ...card, padding: 20 }}>
        {[
          { key: "surcharge3", label: "Recargo 3 cuotas", icon: "3️⃣" },
          { key: "surcharge6", label: "Recargo 6 cuotas", icon: "6️⃣" },
          { key: "ivaRate", label: "IVA", icon: "🏛️" },
        ].map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${T.border}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{f.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="text" value={config[f.key]} onChange={e => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setConfig(c => ({ ...c, [f.key]: parseFloat(val) || 0 }));
              }} style={{ ...inputStyle, width: 70, fontSize: 20, fontWeight: 700, fontFamily: fontD, textAlign: "center", padding: "6px 8px" }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>%</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: T.bg, fontSize: 12, color: T.gray }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: T.grayLight }}>📐 Ejemplo con $100.000:</div>
          <div>3 cuotas: {fmt(100000 * (1 + config.surcharge3 / 100))} ({fmt(100000 * (1 + config.surcharge3 / 100) / 3)} c/u)</div>
          <div>6 cuotas: {fmt(100000 * (1 + config.surcharge6 / 100))} ({fmt(100000 * (1 + config.surcharge6 / 100) / 6)} c/u)</div>
          <div>+ IVA: {fmt(100000 * (1 + config.ivaRate / 100))}</div>
        </div>
      </div>
      <button onClick={() => { setSection(null); showSaved("✅ Recargos guardados"); }} style={{ ...btnPrimary(T.accent), width: "100%", marginTop: 16, fontSize: 14 }}>💾 Guardar</button>
    </div>
  );

  const placeholderSection = {
    whatsapp: { icon: "📱", title: "WhatsApp Business", desc: "Conectá tu WhatsApp Business para enviar mensajes automáticos a clientes." },
    shop: { icon: "🏪", title: "Datos del Taller", desc: "Nombre, dirección, CUIT y logo del taller para facturas y fojas." },
    hours: { icon: "🕐", title: "Horarios de Atención", desc: "Configurá los días y horarios de atención del taller." },
    notifs: { icon: "🔔", title: "Notificaciones", desc: "Configurá alertas internas, sonidos y recordatorios." },
    backup: { icon: "💾", title: "Backup / Exportar", desc: "Descargá toda la información del taller en Excel o PDF." },
  }[section];

  if (placeholderSection) return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto", animation: "fadeUp .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span onClick={() => setSection(null)} style={{ cursor: "pointer", fontSize: 20, color: T.gray }}>←</span>
        <div style={{ fontFamily: fontD, fontSize: 20, fontWeight: 700 }}>{placeholderSection.icon} {placeholderSection.title}</div>
      </div>
      <div style={{ ...card, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{placeholderSection.icon}</div>
        <div style={{ fontFamily: fontD, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{placeholderSection.title}</div>
        <div style={{ fontSize: 14, color: T.gray, marginBottom: 24, lineHeight: 1.5 }}>{placeholderSection.desc}</div>
        <div style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>🚧 Próximamente</div>
      </div>
    </div>
  );

  return null;
};

export default function App() {
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [selOrder, setSelOrder] = useState(null);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [users, setUsers] = useState(USERS);
  const [vehicleDB, setVehicleDB] = useState(VEHICLE_DB);
  const [notifications, setNotifications] = useState([]);

  const nav = useCallback((target, data = null) => {
    if ((target === "vehicleDetail" || target === "serviceSheet" || target === "authManage" || target === "fojaClient") && data) setSelOrder(data);
    setScreen(target);
    window.scrollTo?.(0, 0);
  }, []);

  if (!user) return <><FontLoader /><LoginScreen onLogin={setUser} /></>;

  const _foundOrder = selOrder ? orders.find(o => o.id === selOrder.id) : null;
  const currentOrder = selOrder ? (_foundOrder ? (selOrder._fojaType ? { ..._foundOrder, _fojaType: selOrder._fojaType } : _foundOrder) : selOrder) : null;

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen user={user} orders={orders} clients={clients} notifications={notifications} setNotifications={setNotifications} onNavigate={nav} />;
      case "search": return <SearchScreen clients={clients} orders={orders} onNavigate={nav} />;
      case "newOrder": return <NewOrderScreen clients={clients} setClients={setClients} orders={orders} setOrders={setOrders} config={config} vehicleDB={vehicleDB} setVehicleDB={setVehicleDB} onNavigate={nav} />;
      case "quickSale": return <QuickSaleScreen config={config} onNavigate={nav} />;
      case "workshop": return <WorkshopScreen orders={orders} clients={clients} user={user} onNavigate={nav} />;
      case "vehicleDetail": return currentOrder ? <VehicleDetailScreen order={currentOrder} clients={clients} setClients={setClients} user={user} orders={orders} setOrders={setOrders} notifications={notifications} setNotifications={setNotifications} config={config} onNavigate={nav} /> : null;
      case "inspection": return currentOrder ? <InspectionScreen order={currentOrder} clients={clients} user={user} orders={orders} setOrders={setOrders} config={config} onNavigate={nav} /> : null;
      case "serviceSheet": return currentOrder ? <ServiceSheetScreen order={currentOrder} clients={clients} user={user} orders={orders} setOrders={setOrders} notifications={notifications} setNotifications={setNotifications} onNavigate={nav} /> : null;
      case "authManage": return currentOrder ? <AuthManageScreen notification={notifications.find(n => n.orderId === currentOrder.id && n.status === "pending")} order={currentOrder} clients={clients} user={user} orders={orders} setOrders={setOrders} notifications={notifications} setNotifications={setNotifications} config={config} onNavigate={nav} /> : null;
      case "admin": return ["dueño", "admin"].includes(user.role) ? <AdminScreen orders={orders} clients={clients} setOrders={setOrders} setClients={setClients} config={config} onNavigate={nav} /> : null;
      case "fojaClient": return currentOrder ? <FojaClientScreen order={currentOrder} clients={clients} onNavigate={nav} /> : null;
            case "config": return ["dueño", "admin"].includes(user.role) ? <ConfigScreen user={user} users={users} setUsers={setUsers} config={config} setConfig={setConfig} onNavigate={nav} /> : null;
      default: return null;
    }
  };

  return (
    <><FontLoader />
      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: font, color: T.white, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ background: "rgba(6,10,22,.95)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {screen !== "dashboard" && (
              <div onClick={() => nav("dashboard")}
                style={{ width: 36, height: 36, borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; }}>←</div>
            )}
            <div onClick={() => nav("dashboard")} style={{ cursor: "pointer" }}>
              <span style={{ fontFamily: fontD, fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>
                <span style={{ color: "#c8d6e5" }}>Car</span><span style={{ color: T.red }}>Boys</span>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: T.gray }}>Sesión activa</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            </div>
            <div onClick={() => { setUser(null); setScreen("dashboard"); }}
              style={{ width: 38, height: 38, borderRadius: "50%", background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, cursor: "pointer", fontFamily: fontD }} title="Cerrar sesión">
              {user.initial}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>{renderScreen()}</div>
      </div>
    </>
  );
}
