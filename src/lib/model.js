// Model obliczeń „Bilans ciepła”.
//
// Uproszczony sezonowy bilans cieplny domu jednorodzinnego (w duchu PN-EN ISO 13790 / 12831):
//   straty = (H_przegrody + H_mostki + H_wentylacja) · stopniodni · 24 h
//   zapotrzebowanie = straty − η · (zyski wewnętrzne + zyski słoneczne)
// Wynik to szacunek do porównywania wariantów („co się opłaca”), a nie świadectwo
// charakterystyki energetycznej ani projekt instalacji. Wszystkie założenia są poniżej, nazwane wprost.

// ---------- Strefy klimatyczne (orientacyjnie) ----------
// sd = stopniodni sezonu grzewczego (baza 20 °C), days = długość sezonu grzewczego.
export const ZONES = [
	{ id: 1, name: 'I', cities: 'Szczecin, Świnoujście', sd: 3500, days: 210, design: -16 },
	{ id: 2, name: 'II', cities: 'Poznań, Wrocław', sd: 3750, days: 220, design: -18 },
	{ id: 3, name: 'III', cities: 'Warszawa, Kraków, Łódź', sd: 3950, days: 225, design: -20 },
	{ id: 4, name: 'IV', cities: 'Białystok, Olsztyn', sd: 4200, days: 235, design: -22 },
	{ id: 5, name: 'V', cities: 'Suwałki, Zakopane', sd: 4600, days: 250, design: -24 }
];

// ---------- Przegrody ----------
// U = 1 / (R_bazowe + d / λ). R_bazowe zawiera warstwę konstrukcyjną i opory przejmowania.
export const LAYERS = {
	wall: { rBase: 0.85, lambda: 0.033, label: 'Ściany', limit: 0.2 }, // pustak 25 cm + styropian grafitowy
	roof: { rBase: 0.35, lambda: 0.037, label: 'Dach / strop', limit: 0.15 }, // wełna mineralna
	floor: { rBase: 0.6, lambda: 0.035, label: 'Podłoga na gruncie', limit: 0.3 } // XPS / EPS pod posadzką
};

export const WINDOWS = {
	stare: { label: 'Stare (lata 90.)', u: 2.6, g: 0.75 },
	dwuszybowe: { label: 'Dwuszybowe', u: 1.3, g: 0.6 },
	trzyszybowe: { label: 'Trzyszybowe', u: 0.9, g: 0.5 },
	pasywne: { label: 'Pasywne', u: 0.7, g: 0.5 }
};
export const WINDOW_LIMIT = 0.9; // WT 2021

// Krotność wymiany powietrza [1/h]: wentylacja + infiltracja (nieszczelności).
export const VENTILATION = {
	grawitacyjna: { label: 'Grawitacyjna', airChange: 0.6, recovery: 0, infiltration: 0.1, fanKwh: 0 },
	rekuperacja: { label: 'Rekuperacja', airChange: 0.5, recovery: 0.85, infiltration: 0.1, fanKwh: 350 }
};

// ---------- Źródła ciepła (ceny i emisje orientacyjne, do edycji w aplikacji) ----------
// efficiency: sprawność sezonowa (dla pompy ciepła SCOP), price: zł za kWh paliwa / prądu,
// co2: kg CO₂ na kWh paliwa / prądu z sieci.
export const HEATING = {
	gaz: { label: 'Kocioł gazowy', efficiency: 0.95, price: 0.32, co2: 0.202, electric: false },
	pompa: { label: 'Pompa ciepła', efficiency: 3.5, price: 1.05, co2: 0.7, electric: true },
	pellet: { label: 'Kocioł na pellet', efficiency: 0.85, price: 0.27, co2: 0.03, electric: false },
	prad: { label: 'Grzejniki elektryczne', efficiency: 1, price: 1.05, co2: 0.7, electric: true },
	wegiel: { label: 'Kocioł węglowy', efficiency: 0.8, price: 0.2, co2: 0.354, electric: false }
};

// ---------- Pozostałe założenia ----------
export const ASSUMPTIONS = {
	storeyHeight: 2.8, // m, wysokość kondygnacji brutto (do ścian)
	roomHeight: 2.6, // m, wysokość pomieszczeń (do kubatury)
	shapeRatio: 1.5, // rzut prostokątny, długość = 1,5 × szerokość
	windowRatio: 0.15, // powierzchnia okien i drzwi = 15% powierzchni użytkowej
	roofFactor: 1.1, // powierzchnia dachu / stropu względem rzutu
	groundFactor: 0.6, // grunt pod domem jest cieplejszy niż powietrze zewnętrzne
	thermalBridge: 0.05, // W/m²K dodawane do całej obudowy (mostki termiczne)
	internalGains: 3, // W/m², ludzie i urządzenia
	solarSeason: 200, // kWh/m², promieniowanie na okna w sezonie (średnio dla wszystkich stron świata)
	frameShading: 0.56, // udział szyby w oknie × zacienienie
	gainUse: 0.9, // jaka część zysków faktycznie ogranicza ogrzewanie
	pvYield: 1000, // kWh rocznie z 1 kWp
	pvValue: 0.5 // jaka część ceny prądu wraca za energię z PV (autokonsumpcja + net-billing, upraszczając)
};

export const DEFAULTS = {
	area: 140,
	floors: 2,
	zone: 3,
	wall: 15,
	roof: 25,
	floor: 10,
	windows: 'trzyszybowe',
	ventilation: 'grawitacyjna',
	heating: 'gaz',
	pv: 0
};

// Orientacyjna skala zapotrzebowania na ciepło użytkowe do ogrzewania (EU, kWh/m²·rok).
// Progi A+ i A odpowiadają standardom NF15 (pasywny) i NF40 (energooszczędny).
export const CLASSES = [
	{ id: 'A+', max: 15, label: 'Pasywny (NF15)' },
	{ id: 'A', max: 40, label: 'Energooszczędny (NF40)' },
	{ id: 'B', max: 60, label: 'Bardzo dobry' },
	{ id: 'C', max: 90, label: 'Dobry' },
	{ id: 'D', max: 120, label: 'Przeciętny' },
	{ id: 'E', max: 160, label: 'Słaby' },
	{ id: 'F', max: 220, label: 'Bardzo słaby' },
	{ id: 'G', max: Infinity, label: 'Nieocieplony' }
];

export const uValue = (layer, cm) => 1 / (LAYERS[layer].rBase + cm / 100 / LAYERS[layer].lambda);

export const energyClass = (eu) => CLASSES.find((c) => eu <= c.max);

/** Wymiary bryły z powierzchni użytkowej i liczby kondygnacji. */
export function geometry(area, floors) {
	const a = ASSUMPTIONS;
	const footprint = area / floors;
	const width = Math.sqrt(footprint / a.shapeRatio);
	const length = width * a.shapeRatio;
	const perimeter = 2 * (width + length);
	const windows = area * a.windowRatio;
	const wallsGross = perimeter * a.storeyHeight * floors;
	return {
		footprint,
		width,
		length,
		windows,
		walls: Math.max(wallsGross - windows, 0),
		roof: footprint * a.roofFactor,
		floor: footprint,
		volume: area * a.roomHeight
	};
}

/**
 * Główne obliczenie.
 * @param {typeof DEFAULTS} input
 * @param {typeof HEATING} [heating] — ceny / sprawności (mogą być zmienione przez użytkownika)
 */
export function calculate(input, heating = HEATING) {
	const a = ASSUMPTIONS;
	const zone = ZONES.find((z) => z.id === input.zone) ?? ZONES[2];
	const geo = geometry(input.area, input.floors);
	const win = WINDOWS[input.windows];
	const vent = VENTILATION[input.ventilation];
	const source = heating[input.heating];

	const u = {
		walls: uValue('wall', input.wall),
		roof: uValue('roof', input.roof),
		floor: uValue('floor', input.floor),
		windows: win.u
	};

	// Współczynniki strat [W/K]
	const envelope = geo.walls + geo.roof + geo.floor + geo.windows;
	const effectiveAirChange = vent.airChange * (1 - vent.recovery) + vent.infiltration;
	const h = {
		walls: u.walls * geo.walls,
		roof: u.roof * geo.roof,
		floor: u.floor * geo.floor * a.groundFactor,
		windows: u.windows * geo.windows,
		bridges: a.thermalBridge * envelope,
		ventilation: 0.34 * geo.volume * effectiveAirChange
	};

	const kwhPerWK = (zone.sd * 24) / 1000; // ile kWh w sezonie „kosztuje” 1 W/K
	const losses = Object.fromEntries(Object.entries(h).map(([k, v]) => [k, v * kwhPerWK]));
	const totalLosses = Object.values(losses).reduce((s, v) => s + v, 0);

	const seasonHours = zone.days * 24;
	const gains = {
		internal: (a.internalGains * input.area * seasonHours) / 1000,
		solar: geo.windows * win.g * a.solarSeason * a.frameShading
	};
	const usedGains = Math.min(a.gainUse * (gains.internal + gains.solar), totalLosses);

	const demand = totalLosses - usedGains; // kWh/rok ciepła do dostarczenia
	const eu = demand / input.area;

	// Energia końcowa: paliwo lub prąd, plus prąd na wentylatory rekuperatora
	const finalEnergy = demand / source.efficiency;
	const fanCost = vent.fanKwh * heating.prad.price;
	const heatingCost = finalEnergy * source.price + fanCost;
	const co2 = finalEnergy * source.co2 + vent.fanKwh * heating.prad.co2;

	// PV liczymy tylko na prąd zużywany przez ogrzewanie (pompa / grzejniki / wentylatory rekuperatora),
	// bo to kalkulator ogrzewania — przy kotle gazowym PV prawie nic tu nie zmienia.
	const heatingElectricity = (source.electric ? finalEnergy : 0) + vent.fanKwh;
	const pvProduction = input.pv * a.pvYield;
	const pvUsed = Math.min(pvProduction, heatingElectricity);
	const pvSavings = pvUsed * heating.prad.price * a.pvValue;

	// Moc szczytowa (dobór źródła ciepła) przy temperaturze obliczeniowej strefy
	const peakKw = (Object.values(h).reduce((s, v) => s + v, 0) * (20 - zone.design)) / 1000;

	return {
		zone,
		geo,
		u,
		h,
		losses,
		totalLosses,
		gains,
		usedGains,
		demand,
		eu,
		class: energyClass(eu),
		finalEnergy,
		heatingCost,
		co2,
		pvProduction,
		pvUsed,
		pvSavings,
		netCost: heatingCost - pvSavings,
		peakKw
	};
}

/** Co dałaby każda z typowych modernizacji (względem obecnego wariantu), od największej oszczędności. */
export function upgrades(input, heating = HEATING) {
	const base = calculate(input, heating);
	const candidates = [
		input.wall < 20 && { id: 'wall', label: `Ocieplenie ścian do 20 cm`, change: { wall: 20 } },
		input.roof < 30 && { id: 'roof', label: `Ocieplenie dachu do 30 cm`, change: { roof: 30 } },
		input.floor < 15 && { id: 'floor', label: `Ocieplenie podłogi do 15 cm`, change: { floor: 15 } },
		WINDOWS[input.windows].u > WINDOWS.trzyszybowe.u && {
			id: 'windows',
			label: 'Wymiana okien na trzyszybowe',
			change: { windows: 'trzyszybowe' }
		},
		input.ventilation !== 'rekuperacja' && {
			id: 'ventilation',
			label: 'Rekuperacja zamiast wentylacji grawitacyjnej',
			change: { ventilation: 'rekuperacja' }
		},
		input.heating !== 'pompa' && { id: 'heating', label: 'Pompa ciepła zamiast obecnego źródła', change: { heating: 'pompa' } },
		input.pv < 6 &&
			HEATING[input.heating].electric && { id: 'pv', label: 'Fotowoltaika 6 kWp', change: { pv: 6 } }
	].filter(Boolean);

	return candidates
		.map((c) => {
			const next = calculate({ ...input, ...c.change }, heating);
			return {
				...c,
				savings: base.netCost - next.netCost,
				kwh: base.demand - next.demand,
				co2: base.co2 - next.co2,
				eu: next.eu
			};
		})
		.filter((c) => c.savings > 1 || c.co2 > 1)
		.sort((x, y) => y.savings - x.savings);
}
