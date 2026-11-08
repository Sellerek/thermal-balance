<script>
	/** @type {{ label: string, value: string | number, options: { id: string | number, label: string }[] }} */
	let { label, value = $bindable(), options } = $props();
	const name = $props.id();
</script>

<fieldset>
	<legend>{label}</legend>
	<div class="options">
		{#each options as o (o.id)}
			<label class:active={value === o.id}>
				<input type="radio" {name} value={o.id} bind:group={value} />
				{o.label}
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	legend {
		font-weight: 500;
		padding: 0;
		margin-bottom: 0.5rem;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	label {
		position: relative;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s, color 0.2s;
	}
	label:hover {
		border-color: var(--muted);
	}
	label.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
		font-weight: 600;
	}
	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	label:has(input:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
