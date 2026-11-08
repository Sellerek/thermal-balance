import { describe, expect, it } from 'vitest';
import { calculate, DEFAULTS, energyClass, geometry, upgrades, uValue, LAYERS } from './model.js';

describe('wartości U', () => {
	it('typowe grubości spełniają WT 2021', () => {
		expect(uValue('wall', 15)).toBeLessThanOrEqual(LAYERS.wall.limit);
		expect(uValue('roof', 25)).toBeLessThanOrEqual(LAYERS.roof.limit);
		expect(uValue('floor', 10)).toBeLessThanOrEqual(LAYERS.floor.limit);
	});

	it('nieocieplona ściana ma U około 1,2 W/m²K', () => {
		expect(uValue('wall', 0)).toBeCloseTo(1.18, 1);
	});

	it('więcej izolacji = niższe U', () => {
		expect(uValue('wall', 20)).toBeLessThan(uValue('wall', 10));
	});
});

describe('geometria', () => {
	it('parterówka ma większy rzut niż dom piętrowy o tej samej powierzchni', () => {
		expect(geometry(140, 1).footprint).toBe(140);
		expect(geometry(140, 2).footprint).toBe(70);
	});
});

describe('bilans', () => {
	const base = calculate(DEFAULTS);

	it('typowy nowy dom z wentylacją grawitacyjną mieści się w 60–120 kWh/m²·rok', () => {
		expect(base.eu).toBeGreaterThan(60);
		expect(base.eu).toBeLessThan(120);
	});

	it('rekuperacja wyraźnie zmniejsza zapotrzebowanie', () => {
		const reku = calculate({ ...DEFAULTS, ventilation: 'rekuperacja' });
		expect(reku.demand).toBeLessThan(base.demand * 0.8);
	});

	it('dom pasywny osiąga klasę A+ lub A', () => {
		const passive = calculate({
			...DEFAULTS,
			wall: 30,
			roof: 40,
			floor: 25,
			windows: 'pasywne',
			ventilation: 'rekuperacja'
		});
		expect(['A+', 'A']).toContain(passive.class.id);
	});

	it('nieocieplony dom z oknami z lat 90. wypada w klasie F lub G', () => {
		const old = calculate({ ...DEFAULTS, wall: 0, roof: 5, floor: 0, windows: 'stare' });
		expect(['F', 'G']).toContain(old.class.id);
	});

	it('zimniejsza strefa = większe zapotrzebowanie', () => {
		expect(calculate({ ...DEFAULTS, zone: 5 }).demand).toBeGreaterThan(calculate({ ...DEFAULTS, zone: 1 }).demand);
	});

	it('pompa ciepła zużywa ok. 3,5 razy mniej energii końcowej niż grzejniki elektryczne', () => {
		const hp = calculate({ ...DEFAULTS, heating: 'pompa' });
		const el = calculate({ ...DEFAULTS, heating: 'prad' });
		expect(el.finalEnergy / hp.finalEnergy).toBeCloseTo(3.5, 5);
	});

	it('suma udziałów strat to 100%', () => {
		const sum = Object.values(base.losses).reduce((s, v) => s + v, 0);
		expect(sum).toBeCloseTo(base.totalLosses, 6);
	});
});

describe('klasy', () => {
	it('progi', () => {
		expect(energyClass(15).id).toBe('A+');
		expect(energyClass(16).id).toBe('A');
		expect(energyClass(500).id).toBe('G');
	});
});

describe('fotowoltaika', () => {
	it('przy kotle gazowym pokrywa tylko wentylatory, przy pompie ciepła — ogrzewanie', () => {
		const gas = calculate({ ...DEFAULTS, ventilation: 'rekuperacja', pv: 10 });
		expect(gas.pvUsed).toBe(350);
		const hp = calculate({ ...DEFAULTS, heating: 'pompa', pv: 10 });
		expect(hp.pvUsed).toBeCloseTo(hp.finalEnergy, 6);
	});

	it('nie jest proponowana przy ogrzewaniu gazem', () => {
		expect(upgrades(DEFAULTS).find((u) => u.id === 'pv')).toBeUndefined();
	});
});

describe('modernizacje', () => {
	it('są posortowane od największej oszczędności i nie proponują tego, co już jest', () => {
		const list = upgrades({ ...DEFAULTS, ventilation: 'rekuperacja' });
		expect(list.find((u) => u.id === 'ventilation')).toBeUndefined();
		for (let i = 1; i < list.length; i++) expect(list[i - 1].savings).toBeGreaterThanOrEqual(list[i].savings);
	});
});
