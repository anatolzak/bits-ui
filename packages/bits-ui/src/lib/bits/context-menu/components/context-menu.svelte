<script lang="ts">
	import { derived } from "svelte/store";
	import type { Props } from "../index.js";
	import { setCtx } from "../ctx.js";
	type $$Props = Props;

	export let closeOnOutsideClick: $$Props["closeOnOutsideClick"] = undefined;
	export let closeOnEscape: $$Props["closeOnEscape"] = undefined;
	export let portal: $$Props["portal"] = undefined;
	export let open: $$Props["open"] = undefined;
	export let onOpenChange: $$Props["onOpenChange"] = undefined;
	export let preventScroll: $$Props["preventScroll"] = undefined;
	export let loop: $$Props["loop"] = undefined;
	export let dir: $$Props["dir"] = undefined;
	export let typeahead: $$Props["typeahead"] = undefined;
	export let closeFocus: $$Props["closeFocus"] = undefined;
	export let disableFocusFirstItem: $$Props["disableFocusFirstItem"] = undefined;
	export let onOutsideClick: $$Props["onOutsideClick"] = undefined;
	export let closeOnItemClick: $$Props["closeOnItemClick"] = undefined;

	const {
		states: { open: localOpen },
		updateOption,
		ids,
	} = setCtx({
		closeOnOutsideClick,
		closeOnEscape,
		portal,
		forceVisible: true,
		defaultOpen: open,
		preventScroll,
		loop,
		dir,
		typeahead,
		disableFocusFirstItem,
		closeFocus,
		onOutsideClick,
		closeOnItemClick,
		onOpenChange: ({ next }) => {
			if (open !== next) {
				onOpenChange?.(next);
				open = next;
			}
			return next;
		},
	});

	const idValues = derived([ids.menu, ids.trigger], ([$menuId, $triggerId]) => ({
		menu: $menuId,
		trigger: $triggerId,
	}));

	$: open !== undefined && localOpen.set(open);

	$: updateOption("closeOnItemClick", closeOnItemClick);
	$: updateOption("closeOnOutsideClick", closeOnOutsideClick);
	$: updateOption("closeOnEscape", closeOnEscape);
	$: updateOption("portal", portal);
	$: updateOption("preventScroll", preventScroll);
	$: updateOption("loop", loop);
	$: updateOption("dir", dir);
	$: updateOption("closeFocus", closeFocus);
	$: updateOption("disableFocusFirstItem", disableFocusFirstItem);
	$: updateOption("typeahead", typeahead);
	$: updateOption("onOutsideClick", onOutsideClick);
</script>

<slot ids={$idValues} />
