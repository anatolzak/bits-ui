<script lang="ts">
	import { writable } from "svelte/store";
	import type { ScrollbarProps } from "../index.js";
	import { setScrollbarOrientation } from "../ctx.js";
	import ScrollAreaScrollbarY from "./scroll-area-scrollbar-y.svelte";
	import ScrollAreaScrollbarX from "./scroll-area-scrollbar-x.svelte";

	type $$Props = ScrollbarProps;

	export let orientation: $$Props["orientation"];
	const orientationStore = writable(orientation);

	setScrollbarOrientation(orientationStore);

	$: orientationStore.set(orientation);
</script>

{#if $orientationStore === "vertical"}
	<ScrollAreaScrollbarY {...$$restProps} let:builder>
		<slot {builder} />
	</ScrollAreaScrollbarY>
{:else}
	<ScrollAreaScrollbarX {...$$restProps} let:builder>
		<slot {builder} />
	</ScrollAreaScrollbarX>
{/if}
