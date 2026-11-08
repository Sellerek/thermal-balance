<script>
	// Ceny i sprawności źródeł ciepła do edycji + opis metody. Uczciwie: to szacunek, nie audyt.
	import { HEATING, ASSUMPTIONS } from '$lib/model.js';

	/** @type {{ prices: typeof HEATING }} */
	let { prices = $bindable() } = $props();

	const reset = () => (prices = structuredClone(HEATING));
</script>

<details class="card">
	<summary>
		<h2>Założenia i ceny</h2>
		<span class="hint">Ceny energii możesz zmienić — wyniki przeliczą się od razu</span>
	</summary>

	<table>
		<thead>
			<tr><th>Źródło ciepła</th><th>Sprawność / SCOP</th><th>Cena za kWh</th><th>kg CO₂/kWh</th></tr>
		</thead>
		<tbody>
			{#each Object.entries(prices) as [id, p] (id)}
				<tr>
					<th scope="row">{p.label}</th>
					<td><input type="number" step="0.05" min="0.1" bind:value={prices[id].efficiency} aria-label="Sprawność: {p.label}" /></td>
					<td><input type="number" step="0.01" min="0" bind:value={prices[id].price} aria-label="Cena za kWh: {p.label}" /> zł</td>
					<td class="num">{p.co2.toLocaleString('pl-PL')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<button onclick={reset}>Przywróć domyślne</button>

	<div class="method">
		<h3>Jak to liczę</h3>
		<p>
			Sezonowy bilans cieplny: straty przez przegrody (U × powierzchnia), mostki termiczne
			({ASSUMPTIONS.thermalBridge.toLocaleString('pl-PL')} W/m²K na całą obudowę) i wentylację, przez stopniodni sezonu
			grzewczego w danej strefie klimatycznej. Od strat odejmuję zyski od słońca i ludzi. Bryła to prostokąt
			1:{ASSUMPTIONS.shapeRatio.toLocaleString('pl-PL')}, okna zajmują {ASSUMPTIONS.windowRatio * 100}% powierzchni użytkowej.
		</p>
		<p>
			Fotowoltaika pokrywa tylko prąd zużywany na ogrzewanie; energia z PV jest warta
			{ASSUMPTIONS.pvValue * 100}% ceny prądu (autokonsumpcja i net-billing w uproszczeniu). Ciepła woda użytkowa
			nie jest liczona.
		</p>
		<p class="warn">
			To szacunek do porównywania wariantów, a nie świadectwo charakterystyki energetycznej ani projekt
			instalacji. Przed dużą inwestycją zamów audyt energetyczny.
		</p>
	</div>
</details>

<style>
	summary {
		cursor: pointer;
		list-style: none;
		display: grid;
		gap: 0.25rem;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary h2 {
		font-size: 1.375rem;
		display: flex;
		justify-content: space-between;
	}
	summary h2::after {
		content: '+';
		color: var(--muted);
		transition: transform 0.3s;
	}
	details[open] summary h2::after {
		transform: rotate(45deg);
	}
	.hint {
		color: var(--muted);
		font-size: 0.9375rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1.25rem;
		font-size: 0.875rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.5rem 0.5rem 0.5rem 0;
		border-bottom: 1px solid var(--line);
		font-weight: 400;
		white-space: nowrap;
	}
	thead th {
		color: var(--muted);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	tbody th {
		font-weight: 500;
	}
	input {
		width: 4.75rem;
		padding: 0.3rem 0.45rem;
		background: var(--surface-2);
		border: 1px solid var(--line);
		border-radius: 0.4rem;
	}
	button {
		margin-top: 1rem;
		padding: 0.4rem 0.85rem;
		background: none;
		border: 1px solid var(--line);
		border-radius: 999px;
		cursor: pointer;
		font-size: 0.8125rem;
	}
	.method {
		margin-top: 1.5rem;
		display: grid;
		gap: 0.6rem;
		color: var(--muted);
		font-size: 0.9375rem;
	}
	h3 {
		color: var(--text);
		font-size: 1.0625rem;
	}
	.warn {
		color: var(--text);
		padding: 0.75rem 1rem;
		border-left: 3px solid var(--accent);
		background: var(--surface-2);
		border-radius: 0 0.5rem 0.5rem 0;
	}
	@media (max-width: 34rem) {
		table {
			display: block;
			overflow-x: auto;
		}
	}
</style>
