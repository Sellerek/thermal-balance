<script>
	// Którędy ucieka ciepło: udział każdej drogi w rocznych stratach + zyski, które je pomniejszają.
	import { thermal, uToT } from '$lib/thermal.js';

	let { result } = $props();
	const fmt = (v) => Math.round(v).toLocaleString('pl-PL');

	const LABELS = {
		walls: 'Ściany',
		roof: 'Dach / strop',
		floor: 'Podłoga na gruncie',
		windows: 'Okna i drzwi',
		bridges: 'Mostki termiczne',
		ventilation: 'Wentylacja'
	};

	const rows = $derived(
		Object.entries(result.losses)
			.map(([id, kwh]) => ({
				id,
				label: LABELS[id],
				kwh,
				share: kwh / result.totalLosses,
				color:
					id in result.u
						? thermal(uToT(result.u[id]))
						: thermal(0.45 + (kwh / result.totalLosses) * 1.1)
			}))
			.sort((a, b) => b.kwh - a.kwh)
	);
	// paski względem największej pozycji — łatwiej porównać
	const maxShare = $derived(rows[0]?.share || 1);
</script>

<section class="card">
	<h2>Którędy ucieka ciepło</h2>
	<p class="sub">Roczne straty: <strong class="num">{fmt(result.totalLosses)} kWh</strong></p>

	<div class="stack" aria-hidden="true">
		{#each rows as r (r.id)}
			<span style:flex-grow={r.share} style:background={r.color}></span>
		{/each}
	</div>

	<ul>
		{#each rows as r (r.id)}
			<li>
				<span class="dot" style:background={r.color}></span>
				<span class="name">{r.label}</span>
				<span class="bar"><span style:width="{(r.share / maxShare) * 100}%" style:background={r.color}></span></span>
				<span class="num pct">{Math.round(r.share * 100)}%</span>
				<span class="num kwh">{fmt(r.kwh)} kWh</span>
			</li>
		{/each}
		<li class="gains">
			<span class="dot"></span>
			<span class="name">Zyski: słońce, ludzie, urządzenia</span>
			<span class="bar"></span>
			<span class="num pct"></span>
			<span class="num kwh">−{fmt(result.usedGains)} kWh</span>
		</li>
	</ul>
	<p class="total">
		Do dostarczenia przez ogrzewanie: <strong class="num">{fmt(result.demand)} kWh/rok</strong>
	</p>
</section>

<style>
	h2 {
		font-size: 1.375rem;
	}
	.sub {
		color: var(--muted);
		margin-top: 0.25rem;
	}
	.sub strong {
		color: var(--text);
	}
	.stack {
		display: flex;
		height: 14px;
		gap: 2px;
		margin: 1.25rem 0;
		border-radius: 7px;
		overflow: hidden;
	}
	.stack span {
		flex-basis: 0;
		transition: flex-grow 0.6s ease, background 0.6s;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}
	li {
		display: grid;
		grid-template-columns: auto 10rem 1fr 2.75rem 6.5rem;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9375rem;
	}
	@media (max-width: 34rem) {
		li {
			grid-template-columns: auto 1fr 2.75rem 6rem;
		}
		.bar {
			display: none;
		}
	}
	.dot {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
	}
	.bar {
		height: 6px;
		background: var(--surface-2);
		border-radius: 3px;
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		transition: width 0.6s ease, background 0.6s;
	}
	.pct,
	.kwh {
		text-align: right;
	}
	.kwh {
		color: var(--muted);
	}
	.gains {
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
	}
	.gains .dot {
		background: var(--cool);
	}
	.gains .kwh {
		color: var(--cool);
	}
	.total {
		margin-top: 1rem;
		color: var(--muted);
	}
	.total strong {
		color: var(--text);
	}
</style>
