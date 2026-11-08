<script>
	// Orientacyjna klasa wg zapotrzebowania na ciepło do ogrzewania (EU).
	import { CLASSES } from '$lib/model.js';
	import { thermal } from '$lib/thermal.js';

	let { result } = $props();
	const shown = CLASSES.map((c, i) => {
		const t = 0.08 + (i / (CLASSES.length - 1)) * 0.9;
		// na chłodnych (ciemnych) kolorach jasny tekst, na ciepłych — ciemny
		return { ...c, color: thermal(t), ink: t < 0.45 ? '#f2f2ee' : '#0f0f0f' };
	});
	const prevMax = (i) => (i === 0 ? 0 : CLASSES[i - 1].max);
</script>

<section class="card">
	<h2>Klasa energetyczna</h2>
	<p class="sub">
		<strong class="num">{Math.round(result.eu)} kWh/m²·rok</strong> ciepła do ogrzewania — {result.class.label.toLowerCase()}
	</p>
	<ol>
		{#each shown as c, i (c.id)}
			<li class:current={c.id === result.class.id} style:--c={c.color} style:--ink={c.ink} style:--w="{38 + i * 8.5}%">
				<span class="tag">{c.id}</span>
				<span class="range num">
					{c.max === Infinity ? `> ${prevMax(i)}` : `${prevMax(i)}–${c.max}`}
				</span>
				{#if c.id === result.class.id}<span class="you">Twój dom</span>{/if}
			</li>
		{/each}
	</ol>
	<p class="note">Skala orientacyjna; progi A+ i A odpowiadają standardom NF15 i NF40.</p>
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
	ol {
		list-style: none;
		padding: 0;
		margin: 1.25rem 0 0;
		display: grid;
		gap: 4px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: var(--w);
		min-width: 9rem;
		padding: 0.3rem 0.75rem;
		background: var(--c);
		color: var(--ink);
		border-radius: 0 999px 999px 0;
		font-weight: 600;
		font-size: 0.875rem;
		opacity: 0.45;
		transition: opacity 0.3s, transform 0.3s;
	}
	li.current {
		opacity: 1;
		transform: translateX(6px);
		box-shadow: 0 0 0 2px var(--text);
	}
	.tag {
		font-family: var(--font-display);
		font-size: 1rem;
		min-width: 1.6rem;
	}
	.range {
		font-size: 0.8125rem;
		font-weight: 500;
	}
	.you {
		margin-left: auto;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.note {
		margin-top: 0.9rem;
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
