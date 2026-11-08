<script>
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { calculate, upgrades, uValue, DEFAULTS, HEATING, ZONES, WINDOWS, VENTILATION, LAYERS, WINDOW_LIMIT } from '$lib/model.js';
	import Slider from '$lib/components/Slider.svelte';
	import Segmented from '$lib/components/Segmented.svelte';
	import House from '$lib/components/House.svelte';
	import Breakdown from '$lib/components/Breakdown.svelte';
	import ClassScale from '$lib/components/ClassScale.svelte';
	import Upgrades from '$lib/components/Upgrades.svelte';
	import Assumptions from '$lib/components/Assumptions.svelte';

	let input = $state({ ...DEFAULTS });
	let prices = $state(structuredClone(HEATING));

	const result = $derived(calculate(input, prices));
	const ideas = $derived(upgrades(input, prices));

	// Płynnie zmieniające się liczby w kafelkach
	const opts = { duration: 500, easing: cubicOut };
	const eu = new Tween(0, opts);
	const cost = new Tween(0, opts);
	const co2 = new Tween(0, opts);
	$effect(() => {
		eu.target = result.eu;
		cost.target = result.netCost;
		co2.target = result.co2;
	});

	const fmt = (v, d = 0) => v.toLocaleString('pl-PL', { maximumFractionDigits: d, minimumFractionDigits: d });
	const uHint = (layer, cm) => {
		const u = uValue(layer, cm);
		return { u: fmt(u, 2), ok: u <= LAYERS[layer].limit };
	};

	// ---- Stan w adresie strony: link pokazuje dokładnie ten sam wariant ----
	const KEYS = { area: 'p', floors: 'k', zone: 's', wall: 'sc', roof: 'd', floor: 'po', windows: 'o', ventilation: 'w', heating: 'g', pv: 'pv' };
	let ready = $state(false);

	// afterNavigate: odczyt dopiero, gdy router SvelteKit jest gotowy (replaceState wcześniej rzuca błąd).
	afterNavigate(() => {
		if (ready) return;
		const q = new URLSearchParams(location.search);
		for (const [key, short] of Object.entries(KEYS)) {
			const raw = q.get(short);
			if (raw === null) continue;
			const isNum = typeof DEFAULTS[key] === 'number';
			const value = isNum ? Number(raw) : raw;
			const valid = isNum
				? Number.isFinite(value)
				: { windows: WINDOWS, ventilation: VENTILATION, heating: HEATING }[key]?.[value];
			if (valid) input[key] = value;
		}
		ready = true;
	});

	$effect(() => {
		if (!ready) return;
		const q = new URLSearchParams();
		for (const [key, short] of Object.entries(KEYS)) if (input[key] !== DEFAULTS[key]) q.set(short, String(input[key]));
		const qs = q.toString();
		replaceState(qs ? `?${qs}` : location.pathname, {});
	});

	let copied = $state(false);
	async function share() {
		try {
			await navigator.clipboard.writeText(location.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			/* schowek niedostępny — adres i tak jest w pasku przeglądarki */
		}
	}

	const apply = (change) => {
		Object.assign(input, change);
		document.getElementById('dom')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};
	const reset = () => Object.assign(input, DEFAULTS);
</script>

<svelte:head>
	<title>Bilans ciepła — kalkulator energooszczędnego domu</title>
	<meta
		name="description"
		content="Sprawdź, którędy ucieka ciepło z Twojego domu, ile kosztuje ogrzewanie i która modernizacja da największą oszczędność."
	/>
</svelte:head>

<header class="intro">
	<p class="label">Kalkulator energooszczędnego domu</p>
	<h1>Bilans <span>ciepła</span></h1>
	<p class="lead">Ustaw parametry domu i zobacz w termowizji, którędy ucieka ciepło, ile kosztuje ogrzewanie i co się opłaca poprawić.</p>
</header>

<main class="app">
	<aside class="controls card" aria-label="Parametry domu">
		<div class="controls-head">
			<h2>Twój dom</h2>
			<button class="link" onclick={reset}>Od nowa</button>
		</div>

		<div class="group">
			<p class="label">Bryła i lokalizacja</p>
			<Slider label="Powierzchnia użytkowa" bind:value={input.area} min={60} max={300} step={5} unit="m²" />
			<Segmented label="Kondygnacje" bind:value={input.floors} options={[{ id: 1, label: 'Parterowy' }, { id: 2, label: 'Z piętrem' }]} />
			<Segmented label="Strefa klimatyczna" bind:value={input.zone} options={ZONES.map((z) => ({ id: z.id, label: z.name }))} />
			<p class="hint">{result.zone.cities} · {result.zone.design} °C w najzimniejsze dni</p>
		</div>

		<div class="group">
			<p class="label">Ocieplenie</p>
			<Slider label="Ściany" bind:value={input.wall} min={0} max={30} unit="cm">
				{#snippet hint()}{@const h = uHint('wall', input.wall)}U = {h.u} W/m²K · <span class:ok={h.ok} class:bad={!h.ok}>{h.ok ? 'spełnia WT 2021' : 'poniżej WT 2021'}</span>{/snippet}
			</Slider>
			<Slider label="Dach / strop" bind:value={input.roof} min={0} max={40} unit="cm">
				{#snippet hint()}{@const h = uHint('roof', input.roof)}U = {h.u} W/m²K · <span class:ok={h.ok} class:bad={!h.ok}>{h.ok ? 'spełnia WT 2021' : 'poniżej WT 2021'}</span>{/snippet}
			</Slider>
			<Slider label="Podłoga na gruncie" bind:value={input.floor} min={0} max={25} unit="cm">
				{#snippet hint()}{@const h = uHint('floor', input.floor)}U = {h.u} W/m²K · <span class:ok={h.ok} class:bad={!h.ok}>{h.ok ? 'spełnia WT 2021' : 'poniżej WT 2021'}</span>{/snippet}
			</Slider>
			<Segmented label="Okna" bind:value={input.windows} options={Object.entries(WINDOWS).map(([id, w]) => ({ id, label: w.label }))} />
			<p class="hint">
				U = {fmt(WINDOWS[input.windows].u, 1)} W/m²K ·
				<span class:ok={WINDOWS[input.windows].u <= WINDOW_LIMIT} class:bad={WINDOWS[input.windows].u > WINDOW_LIMIT}>
					{WINDOWS[input.windows].u <= WINDOW_LIMIT ? 'spełnia WT 2021' : 'poniżej WT 2021'}
				</span>
			</p>
		</div>

		<div class="group">
			<p class="label">Instalacje</p>
			<Segmented label="Wentylacja" bind:value={input.ventilation} options={Object.entries(VENTILATION).map(([id, v]) => ({ id, label: v.label }))} />
			<Segmented label="Ogrzewanie" bind:value={input.heating} options={Object.entries(prices).map(([id, h]) => ({ id, label: h.label }))} />
			<Slider label="Fotowoltaika" bind:value={input.pv} min={0} max={12} step={0.5} unit="kWp">
				{#snippet hint()}
					{#if input.pv > 0}
						{fmt(result.pvProduction)} kWh/rok, na ogrzewanie idzie {fmt(result.pvUsed)} kWh
					{:else}
						Brak instalacji
					{/if}
				{/snippet}
			</Slider>
		</div>
	</aside>

	<section class="viz" id="dom" aria-label="Wynik">
		<House {result} {input} />
		<div class="legend" aria-hidden="true">
			<span>mało strat</span>
			<i></i>
			<span>dużo strat</span>
		</div>

		<div class="kpis">
			<div class="kpi">
				<span class="label">Zapotrzebowanie</span>
				<span class="value num">{fmt(eu.current)}</span>
				<span class="unit">kWh/m²·rok · klasa <strong>{result.class.id}</strong></span>
			</div>
			<div class="kpi hot">
				<span class="label">Ogrzewanie rocznie</span>
				<span class="value num">{fmt(Math.max(cost.current, 0))} zł</span>
				<span class="unit">{fmt(Math.max(cost.current, 0) / 12)} zł miesięcznie{#if result.pvSavings > 0} · z PV{/if}</span>
			</div>
			<div class="kpi">
				<span class="label">Emisja CO₂</span>
				<span class="value num">{fmt(co2.current / 1000, 1)} t</span>
				<span class="unit">rocznie</span>
			</div>
			<div class="kpi">
				<span class="label">Moc źródła ciepła</span>
				<span class="value num">{fmt(result.peakKw, 1)} kW</span>
				<span class="unit">przy {result.zone.design} °C</span>
			</div>
		</div>

		<button class="share" onclick={share}>{copied ? 'Skopiowano link ✓' : 'Skopiuj link do tego wariantu'}</button>
	</section>

	<div class="details">
		<Upgrades list={ideas} onapply={apply} />
		<Breakdown {result} />
		<ClassScale {result} />
		<Assumptions bind:prices />
	</div>
</main>

<footer>
	<p>Szacunek do porównywania wariantów — nie zastępuje audytu energetycznego.</p>
	<p>Projekt i kod: <a href="https://photodev.pl">Krzysztof Pietruszka</a></p>
</footer>

<style>
	.intro,
	.app,
	footer {
		width: min(100% - 2rem, 78rem);
		margin-inline: auto;
	}
	.intro {
		padding-block: clamp(2.5rem, 7vw, 4.5rem) clamp(1.5rem, 4vw, 2.5rem);
	}
	h1 {
		font-size: clamp(2.75rem, 9vw, 5.5rem);
		letter-spacing: -0.04em;
		margin-top: 0.5rem;
	}
	h1 span {
		background: linear-gradient(90deg, #d93a4a, #f2702a, #ffb627);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-style: italic;
	}
	.lead {
		max-width: 40rem;
		margin-top: 1rem;
		color: var(--muted);
		font-size: clamp(1rem, 2vw, 1.1875rem);
	}

	.app {
		display: grid;
		gap: 1rem;
		grid-template-areas: 'viz' 'controls' 'details';
	}
	@media (min-width: 60rem) {
		.app {
			grid-template-columns: 22rem 1fr;
			grid-template-areas: 'controls viz' 'controls details';
			align-items: start;
			gap: 1.25rem;
		}
		.controls {
			position: sticky;
			top: 1rem;
			max-height: calc(100vh - 2rem);
			overflow-y: auto;
			scrollbar-width: thin;
		}
	}
	.controls {
		grid-area: controls;
		display: grid;
		gap: 1.5rem;
	}
	.viz {
		grid-area: viz;
	}
	.details {
		grid-area: details;
		display: grid;
		gap: 1rem;
	}

	.controls-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.controls h2 {
		font-size: 1.5rem;
	}
	.link {
		background: none;
		border: 0;
		color: var(--muted);
		text-decoration: underline;
		cursor: pointer;
		font-size: 0.875rem;
	}
	.group {
		display: grid;
		gap: 1.1rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
	}
	.hint {
		font-size: 0.8125rem;
		color: var(--muted);
		margin-top: -0.5rem;
	}
	:global(.ok) {
		color: #8fd694;
	}
	:global(.bad) {
		color: var(--hot);
	}

	.legend {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0.75rem 0 1rem;
		font-size: 0.75rem;
		color: var(--muted);
	}
	.legend i {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(90deg, #1b1046, #4b1683, #9b1f7a, #d93a4a, #f2702a, #ffb627, #fff3b0);
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}
	@media (min-width: 75rem) {
		.kpis {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	.kpi {
		display: grid;
		gap: 0.15rem;
		padding: 1rem 1.1rem;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}
	.kpi.hot {
		background: linear-gradient(135deg, #2a1410, var(--surface) 70%);
		border-color: #4a2416;
	}
	.value {
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 600;
		line-height: 1.15;
	}
	.kpi.hot .value {
		color: var(--accent);
	}
	.unit {
		font-size: 0.8125rem;
		color: var(--muted);
	}
	.unit strong {
		color: var(--text);
	}
	.share {
		margin-top: 0.75rem;
		width: 100%;
		padding: 0.7rem;
		background: none;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		color: var(--muted);
		cursor: pointer;
		transition: color 0.2s, border-color 0.2s;
	}
	.share:hover {
		color: var(--text);
		border-color: var(--muted);
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		padding-block: 3rem;
		margin-top: 2rem;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.875rem;
	}
</style>
