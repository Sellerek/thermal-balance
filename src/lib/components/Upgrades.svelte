<script>
	// Co się opłaca: każda modernizacja przeliczona osobno względem obecnego wariantu.
	import { energyClass } from '$lib/model.js';

	/** @type {{ list: ReturnType<typeof import('$lib/model.js').upgrades>, onapply: (change: object) => void }} */
	let { list, onapply } = $props();
	const zl = (v) => Math.round(v).toLocaleString('pl-PL');
</script>

<section class="card">
	<h2>Co da największą oszczędność</h2>
	{#if list.length}
		<p class="sub">Każda zmiana policzona osobno. Kliknij „Sprawdź”, żeby zobaczyć dom po zmianie.</p>
		<ol>
			{#each list as u, i (u.id)}
				<li>
					<span class="rank num">{i + 1}</span>
					<div class="what">
						<strong>{u.label}</strong>
						<span class="meta">
							{#if u.kwh > 1}−{zl(u.kwh)} kWh ciepła · {/if}{u.co2 > 0 ? '−' : '+'}{zl(Math.abs(u.co2))} kg CO₂ · klasa {energyClass(u.eu).id}
						</span>
					</div>
					<span class="save num">{u.savings > 0 ? '−' : '+'}{zl(Math.abs(u.savings))} zł<small>/rok</small></span>
					<button onclick={() => onapply(u.change)}>Sprawdź</button>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="sub">Ten dom ma już wszystkie typowe usprawnienia. Gratulacje!</p>
	{/if}
</section>

<style>
	h2 {
		font-size: 1.375rem;
	}
	.sub {
		color: var(--muted);
		margin-top: 0.25rem;
	}
	ol {
		list-style: none;
		padding: 0;
		margin: 1.25rem 0 0;
		display: grid;
		gap: 0.5rem;
	}
	li {
		display: grid;
		grid-template-columns: 2rem 1fr auto auto;
		align-items: center;
		gap: 0.75rem 1rem;
		padding: 0.85rem 1rem;
		background: var(--surface-2);
		border-radius: var(--radius);
	}
	@media (max-width: 34rem) {
		li {
			grid-template-columns: 2rem 1fr auto;
		}
		button {
			grid-column: 2 / -1;
			justify-self: start;
		}
	}
	.rank {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		font-weight: 600;
	}
	li:first-child .rank {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
	}
	.what {
		display: grid;
	}
	.meta {
		font-size: 0.8125rem;
		color: var(--muted);
	}
	.save {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--accent);
		white-space: nowrap;
	}
	small {
		font-size: 0.75rem;
		color: var(--muted);
		font-weight: 400;
	}
	button {
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: none;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s, color 0.2s, border-color 0.2s;
	}
	button:hover {
		background: var(--text);
		border-color: var(--text);
		color: var(--bg);
	}
</style>
