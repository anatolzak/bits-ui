<script lang="ts">
	import { melt } from "@melt-ui/svelte";
	import { getCtx } from "../ctx.js";
	import type { SeparatorProps } from "../index.js";

	type $$Props = SeparatorProps;

	export let asChild: $$Props["asChild"] = false;
	export let el: $$Props["el"] = undefined;

	const {
		elements: { separator },
		getAttrs,
	} = getCtx();

	const attrs = getAttrs("separator");

	$: builder = $separator;
	$: Object.assign(builder, attrs);
</script>

{#if asChild}
	<slot {builder} />
{:else}
	<div bind:this={el} use:melt={$separator} {...$$restProps} />
{/if}
