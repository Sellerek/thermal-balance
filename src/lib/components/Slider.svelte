<script>
	/** @type {{ label: string, value: number, min: number, max: number, step?: number, unit?: string, hint?: import('svelte').Snippet }} */
	let { label, value = $bindable(), min, max, step = 1, unit = '', hint } = $props();
	const id = $props.id();
	const pct = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="slider">
	<div class="top">
		<label for={id}>{label}</label>
		<output for={id} class="num">{value}{unit && ` ${unit}`}</output>
	</div>
	<input {id} type="range" {min} {max} {step} bind:value style="--pct: {pct}%" />
	{#if hint}<div class="hint">{@render hint()}</div>{/if}
</div>

<style>
	.slider {
		display: grid;
		gap: 0.4rem;
	}
	.top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}
	label {
		font-weight: 500;
	}
	output {
		font-size: 1.125rem;
		font-weight: 600;
	}
	input {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 1.5rem;
		background: transparent;
		cursor: pointer;
		margin: 0;
	}
	input::-webkit-slider-runnable-track {
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--accent) var(--pct), var(--surface-2) var(--pct));
	}
	input::-moz-range-track {
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--accent) var(--pct), var(--surface-2) var(--pct));
	}
	input::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: -7px;
		border-radius: 50%;
		background: var(--text);
		border: 3px solid var(--accent);
		transition: transform 0.15s;
	}
	input::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: var(--text);
		border: 3px solid var(--accent);
	}
	input:active::-webkit-slider-thumb {
		transform: scale(1.2);
	}
	.hint {
		font-size: 0.8125rem;
		color: var(--muted);
	}
</style>
