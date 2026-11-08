<script>
	// Dom w „termowizji”: kolor każdej przegrody wynika z jej współczynnika U
	// (im jaśniej i cieplej, tym więcej ciepła ucieka przez 1 m²). Wentylacja grawitacyjna
	// to ciepłe smugi z komina, rekuperacja — mały, chłodny wydmuch z centrali.
	import { thermal, uToT } from '$lib/thermal.js';

	/** @type {{ result: ReturnType<typeof import('$lib/model.js').calculate>, input: typeof import('$lib/model.js').DEFAULTS }} */
	let { result, input } = $props();

	const fmtU = (u) => u.toLocaleString('pl-PL', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

	const GROUND = 262;
	const STOREY = 72;
	const top = $derived(GROUND - input.floors * STOREY);
	const peak = $derived(top - 88);

	const c = $derived({
		walls: thermal(uToT(result.u.walls)),
		roof: thermal(uToT(result.u.roof)),
		floor: thermal(uToT(result.u.floor) * 0.85),
		windows: thermal(uToT(result.u.windows)),
		bridges: thermal(0.35 + (result.losses.bridges / result.totalLosses) * 3),
		vent: thermal(0.45 + (result.losses.ventilation / result.totalLosses) * 1.1)
	});

	const reku = $derived(input.ventilation === 'rekuperacja');
	const ventStrength = $derived(Math.min(result.losses.ventilation / result.totalLosses / 0.5, 1));

	// Okna: na górnych kondygnacjach trzy, na parterze dwa i drzwi.
	const openings = $derived(
		Array.from({ length: input.floors }, (_, i) => {
			const y = top + i * STOREY + 18;
			const ground = i === input.floors - 1;
			return ground
				? [
						{ x: 100, y, w: 36, h: 34 },
						{ x: 284, y, w: 36, h: 34 },
						{ x: 196, y: GROUND - 52, w: 28, h: 52, door: true }
					]
				: [100, 192, 284].map((x) => ({ x, y, w: 36, h: 34 }));
		}).flat()
	);

	const summary = $derived(
		`Dom w widoku termowizyjnym. Ściany U ${fmtU(result.u.walls)}, dach U ${fmtU(result.u.roof)}, ` +
			`okna U ${fmtU(result.u.windows)}, wentylacja ${reku ? 'z rekuperacją' : 'grawitacyjna'}.`
	);
</script>

<figure class="house">
	<svg viewBox="0 0 420 330" role="img" aria-label={summary}>
		<defs>
			<filter id="ir" x="-10%" y="-10%" width="120%" height="120%">
				<feGaussianBlur stdDeviation="1.4" />
			</filter>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#0d0a24" />
				<stop offset="1" stop-color="#160f38" />
			</linearGradient>
		</defs>

		<rect width="420" height="330" fill="url(#sky)" />

		<g filter="url(#ir)">
			<!-- grunt -->
			<rect x="0" y={GROUND} width="420" height={330 - GROUND} fill="#120c30" />
			<!-- podłoga na gruncie -->
			<rect class="part" x="70" y={GROUND} width="280" height="12" style:fill={c.floor}>
				<title>Podłoga na gruncie: U = {fmtU(result.u.floor)} W/m²K</title>
			</rect>
			<!-- ściany -->
			<rect class="part" x="70" y={top} width="280" height={GROUND - top} style:fill={c.walls}>
				<title>Ściany: U = {fmtU(result.u.walls)} W/m²K</title>
			</rect>
			<!-- strop między kondygnacjami (lekko cieplejszy pas = wieniec) -->
			{#each Array.from({ length: input.floors - 1 }) as _, i (i)}
				<rect class="part" x="70" y={top + (i + 1) * STOREY - 3} width="280" height="6" style:fill={c.bridges} />
			{/each}
			<!-- dach -->
			<polygon class="part" points="48,{top} 210,{peak} 372,{top}" style:fill={c.roof}>
				<title>Dach / strop: U = {fmtU(result.u.roof)} W/m²K</title>
			</polygon>
			<!-- mostki termiczne: krawędzie, styk ścian z dachem i fundamentem -->
			<g class="bridges" style:stroke={c.bridges}>
				<title>Mostki termiczne</title>
				<line x1="70" y1={top} x2="350" y2={top} />
				<line x1="70" y1={GROUND} x2="350" y2={GROUND} />
				<line x1="70" y1={top} x2="70" y2={GROUND + 12} />
				<line x1="350" y1={top} x2="350" y2={GROUND + 12} />
			</g>
			<!-- okna i drzwi -->
			{#each openings as o (o.x + '-' + o.y)}
				<rect class="part" x={o.x} y={o.y} width={o.w} height={o.h} rx="2" style:fill={c.windows}>
					<title>{o.door ? 'Drzwi' : 'Okno'}: U = {fmtU(result.u.windows)} W/m²K</title>
				</rect>
			{/each}

			{#if reku}
				<!-- centrala rekuperacyjna: mały, chłodny wydmuch -->
				<rect x="352" y={top + 16} width="22" height="16" rx="3" fill="#2c2463" />
				{#each [0, 1] as i (i)}
					<path
						class="plume small"
						style:stroke={c.vent}
						style:animation-delay="{i * 1.2}s"
						d="M374 {top + 24} q10 -6 18 0 t18 0"
					/>
				{/each}
			{:else}
				<!-- komin wentylacji grawitacyjnej i smugi ciepłego powietrza -->
				<rect x="280" y={peak + 18} width="20" height="40" fill="#2c2463" />
				<g style:opacity={0.35 + ventStrength * 0.65}>
					{#each [0, 1, 2] as i (i)}
						<path
							class="plume"
							style:stroke={c.vent}
							style:stroke-width={3 + ventStrength * 5}
							style:animation-delay="{i * 0.9}s"
							d="M{284 + i * 6} {peak + 14} c-10 -14 10 -22 0 -36 s10 -22 0 -36"
						/>
					{/each}
				</g>
			{/if}
		</g>

		<!-- interfejs „kamery” -->
		<g class="hud">
			<path d="M14 34 V14 H34 M386 14 H406 V34 M406 296 V316 H386 M34 316 H14 V296" />
			<text x="22" y="30">IR · strefa {result.zone.name} · {result.zone.design} °C</text>
			<text x="398" y="30" text-anchor="end">{Math.round(result.eu)} kWh/m²·rok</text>
			<circle cx="210" cy={top + (GROUND - top) / 2} r="9" />
			<path d="M210 {top + (GROUND - top) / 2 - 15} v8 M210 {top + (GROUND - top) / 2 + 7} v8 M195 {top + (GROUND - top) / 2} h8 M217 {top + (GROUND - top) / 2} h8" />
		</g>
	</svg>
</figure>

<style>
	.house {
		margin: 0;
		border-radius: calc(var(--radius) * 1.25);
		overflow: hidden;
		border: 1px solid var(--line);
		background: #0d0a24;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.part,
	.bridges {
		transition:
			fill 0.6s ease,
			stroke 0.6s ease,
			y 0.5s ease,
			height 0.5s ease;
	}
	polygon {
		transition: fill 0.6s ease;
	}
	.bridges line {
		stroke-width: 5;
	}
	.plume {
		fill: none;
		stroke-linecap: round;
		animation: rise 2.7s ease-in infinite;
	}
	.plume.small {
		stroke-width: 3;
		opacity: 0.6;
		animation-name: drift;
		animation-duration: 2.4s;
	}
	@keyframes rise {
		from {
			transform: translateY(6px);
			opacity: 0;
		}
		30% {
			opacity: 0.9;
		}
		to {
			transform: translateY(-26px);
			opacity: 0;
		}
	}
	@keyframes drift {
		from {
			transform: translateX(-4px);
			opacity: 0;
		}
		40% {
			opacity: 0.7;
		}
		to {
			transform: translateX(14px);
			opacity: 0;
		}
	}
	.hud {
		fill: none;
		stroke: rgb(255 255 255 / 0.55);
		stroke-width: 1.5;
	}
	.hud text {
		fill: rgb(255 255 255 / 0.8);
		stroke: none;
		font: 600 11px ui-monospace, 'SF Mono', Menlo, monospace;
		letter-spacing: 0.06em;
	}
	@media (prefers-reduced-motion: reduce) {
		.plume {
			animation: none;
			opacity: 0.6;
		}
		.part,
		.bridges,
		polygon {
			transition: none;
		}
	}
</style>
