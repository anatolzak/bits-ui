<script lang="ts">
	import { melt } from "@melt-ui/svelte";
	import { getCtx } from "../ctx.js";
	import type { TriggerEvents, TriggerProps } from "../index.js";
	import { createDispatcher } from "$lib/internal/events.js";

	type $$Props = TriggerProps;
	type $$Events = TriggerEvents;

	export let asChild: $$Props["asChild"] = false;
	export let id: $$Props["id"] = undefined;
	export let el: $$Props["el"] = undefined;

	const {
		elements: { trigger },
		states: { open },
		ids,
		getAttrs,
	} = getCtx();

	const dispatch = createDispatcher();
	const bitsAttrs = getAttrs("trigger");

	$: if (id) {
		ids.trigger.set(id);
	}

	$: attrs = {
		...bitsAttrs,
		"aria-controls": $open ? ids.content : undefined,
	};

	$: builder = $trigger;
	$: Object.assign(builder, attrs);
</script>

{#if asChild}
	<slot {builder} />
{:else}
	<button
		bind:this={el}
		use:melt={builder}
		type="button"
		{...$$restProps}
		on:m-click={dispatch}
		on:m-keydown={dispatch}
	>
		<slot {builder} />
	</button>
{/if}
