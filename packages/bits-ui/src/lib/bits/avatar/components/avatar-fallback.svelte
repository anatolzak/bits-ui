<script lang="ts">
	import { melt } from "@melt-ui/svelte";
	import { getCtx } from "../ctx.js";
	import type { FallbackProps } from "../index.js";

	type $$Props = FallbackProps;

	export let asChild: $$Props["asChild"] = false;
	export let el: $$Props["el"] = undefined;

	const {
		elements: { fallback },
		getAttrs,
	} = getCtx();
	const attrs = getAttrs("fallback");

	$: builder = $fallback;
	$: Object.assign(builder, attrs);
</script>

{#if asChild}
	<slot {builder} />
{:else}
	<span bind:this={el} use:melt={builder} {...$$restProps}>
		<slot {builder} />
	</span>
{/if}
