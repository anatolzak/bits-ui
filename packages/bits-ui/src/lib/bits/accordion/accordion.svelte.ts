import { getContext, setContext } from "svelte";
import {
	type Box,
	type BoxedValues,
	type EventCallback,
	type ReadonlyBox,
	type ReadonlyBoxedValues,
	boxWithState,
	composeHandlers,
	dataDisabledAttrs,
	getAriaDisabled,
	getAriaExpanded,
	getDataDisabled,
	kbd,
	openClosedAttrs,
	readonlyBox,
	verifyContextDeps,
} from "$lib/internal/index.js";

/**
 * BASE
 */
type AccordionBaseStateProps = ReadonlyBoxedValues<{
	id: string;
	disabled: boolean;
	forceVisible: boolean;
}>;

interface AccordionRootAttrs {
	id: string;
	"data-accordion-root": string;
}

class AccordionBaseState {
	id: ReadonlyBox<string> = undefined as unknown as ReadonlyBox<string>;
	disabled: ReadonlyBox<boolean> = undefined as unknown as ReadonlyBox<boolean>;
	forceVisible: ReadonlyBox<boolean> = undefined as unknown as ReadonlyBox<boolean>;
	attrs: AccordionRootAttrs = $derived({
		id: this.id.value,
		"data-accordion-root": "",
	});

	constructor(props: AccordionBaseStateProps) {
		this.id = props.id;
		this.disabled = props.disabled;
		this.forceVisible = props.forceVisible;
	}

	get props() {
		return this.attrs;
	}
}

/**
 * SINGLE
 */

type AccordionSingleStateProps = AccordionBaseStateProps & BoxedValues<{ value: string }>;
export class AccordionSingleState extends AccordionBaseState {
	#value: Box<string>;
	isMulti = false as const;

	constructor(props: AccordionSingleStateProps) {
		super(props);
		this.#value = props.value;
	}

	get value() {
		return this.#value.value;
	}

	set value(v: string) {
		this.#value.value = v;
	}
}

/**
 * MULTIPLE
 */
interface AccordionMultiStateProps extends AccordionBaseStateProps {
	value: Box<string[]>;
}

export class AccordionMultiState extends AccordionBaseState {
	#value: Box<string[]>;
	isMulti = true as const;

	constructor(props: AccordionMultiStateProps) {
		super(props);
		this.#value = props.value;
	}

	get value() {
		return this.#value.value;
	}

	set value(v: string[]) {
		this.#value.value = v;
	}
}

/**
 * ITEM
 */

type AccordionItemStateProps = ReadonlyBoxedValues<{
	value: string;
	disabled: boolean;
}> & {
	rootState: AccordionState;
};

interface AccordionItemAttrs {
	"data-accordion-item": string;
}

export class AccordionItemState {
	#value: ReadonlyBox<string>;
	disabled: ReadonlyBox<boolean> = undefined as unknown as ReadonlyBox<boolean>;
	root: AccordionState = undefined as unknown as AccordionState;
	attrs: AccordionItemAttrs = {
		"data-accordion-item": "",
	};
	isDisabled = $derived(this.disabled.value || this.root.disabled.value);
	isSelected = $derived(
		this.root.isMulti ? this.root.value.includes(this.value) : this.root.value === this.value
	);

	constructor(props: AccordionItemStateProps) {
		this.#value = props.value;
		this.disabled = props.disabled;
		this.root = props.rootState;
	}

	get value() {
		return this.#value.value;
	}

	updateValue() {
		if (this.root.isMulti) {
			if (this.root.value.includes(this.value)) {
				this.root.value = this.root.value.filter((v) => v !== this.value);
			} else {
				this.root.value = [...this.root.value, this.value];
			}
		} else {
			if (this.root.value === this.value) {
				this.root.value = "";
			} else {
				this.root.value = this.value;
			}
		}
	}

	get props() {
		return this.attrs;
	}

	createTrigger(props: AccordionTriggerStateProps) {
		return new AccordionTriggerState(props, this);
	}

	createContent() {
		return new AccordionContentState(this);
	}
}

/**
 * TRIGGER
 */

type AccordionTriggerStateProps = ReadonlyBoxedValues<{
	onclick: EventCallback<MouseEvent>;
	onkeydown: EventCallback<KeyboardEvent>;
	disabled: boolean;
	id: string;
}>;

class AccordionTriggerState {
	disabled: ReadonlyBox<boolean> = undefined as unknown as ReadonlyBox<boolean>;
	id: ReadonlyBox<string> = undefined as unknown as ReadonlyBox<string>;
	root: AccordionState = undefined as unknown as AccordionState;
	itemState: AccordionItemState = undefined as unknown as AccordionItemState;
	onclickProp = boxWithState<AccordionTriggerStateProps["onclick"]>(readonlyBox(() => () => {}));
	onkeydownProp = boxWithState<AccordionTriggerStateProps["onkeydown"]>(
		readonlyBox(() => () => {})
	);

	// Disabled if the trigger itself, the item it belongs to, or the root is disabled
	isDisabled = $derived(
		this.disabled.value || this.itemState.disabled.value || this.root.disabled.value
	);
	attrs: Record<string, unknown> = $derived({
		id: this.id.value,
		disabled: this.isDisabled,
		"aria-expanded": getAriaExpanded(this.itemState.isSelected),
		"aria-disabled": getAriaDisabled(this.isDisabled),
		"data-disabled": getDataDisabled(this.isDisabled),
		"data-value": this.itemState.value,
		"data-state": openClosedAttrs(this.itemState.isSelected),
		"data-accordion-trigger": "",
	});

	constructor(props: AccordionTriggerStateProps, itemState: AccordionItemState) {
		this.disabled = props.disabled;
		this.itemState = itemState;
		this.root = itemState.root;
		this.onclickProp.value = props.onclick;
		this.onkeydownProp.value = props.onkeydown;
		this.id = props.id;
	}

	onclick = composeHandlers(this.onclickProp, () => {
		if (this.isDisabled) return;
		this.itemState.updateValue();
	});

	onkeydown = composeHandlers(this.onkeydownProp, (e: KeyboardEvent) => {
		const handledKeys = [kbd.ARROW_DOWN, kbd.ARROW_UP, kbd.HOME, kbd.END, kbd.SPACE, kbd.ENTER];
		if (this.isDisabled || !handledKeys.includes(e.key)) return;

		e.preventDefault();

		if (e.key === kbd.SPACE || e.key === kbd.ENTER) {
			this.itemState.updateValue();
			return;
		}

		if (!this.root.id.value || !this.id.value) return;

		const rootEl = document.getElementById(this.root.id.value);
		if (!rootEl) return;
		const itemEl = document.getElementById(this.id.value);
		if (!itemEl) return;

		const items = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-accordion-trigger]"));
		if (!items.length) return;

		const candidateItems = items.filter((item) => !item.dataset.disabled);
		if (!candidateItems.length) return;

		const currentIndex = candidateItems.indexOf(itemEl);

		switch (e.key) {
			case kbd.ARROW_DOWN:
				candidateItems[(currentIndex + 1) % candidateItems.length]?.focus();
				return;
			case kbd.ARROW_UP:
				candidateItems[
					(currentIndex - 1 + candidateItems.length) % candidateItems.length
				]?.focus();
				return;
			case kbd.HOME:
				candidateItems[0]?.focus();
				return;
			case kbd.END:
				candidateItems[candidateItems.length - 1]?.focus();
		}
	});

	get props() {
		return {
			...this.attrs,
			onclick: this.onclick,
			onkeydown: this.onkeydown,
		};
	}
}

/**
 * CONTENT
 */

class AccordionContentState {
	item = undefined as unknown as AccordionItemState;
	attrs: Record<string, unknown> = $derived({
		"data-state": openClosedAttrs(this.item.isSelected),
		"data-disabled": dataDisabledAttrs(this.item.isDisabled),
		"data-value": this.item.value,
		"data-accordion-content": "",
	});

	constructor(item: AccordionItemState) {
		this.item = item;
	}

	get props() {
		return this.attrs;
	}
}

/**
 * CONTEXT METHODS
 */

export const ACCORDION_ROOT_KEY = Symbol("Accordion.Root");
export const ACCORDION_ITEM_KEY = Symbol("Accordion.Item");

type AccordionState = AccordionSingleState | AccordionMultiState;

type InitAccordionProps = {
	type: "single" | "multiple";
	value: Box<string> | Box<string[]>;
	id: ReadonlyBox<string>;
	disabled: ReadonlyBox<boolean>;
	forceVisible: ReadonlyBox<boolean>;
};

export function setAccordionRootState(props: InitAccordionProps) {
	if (props.type === "single") {
		const { value, type, ...rest } = props;
		return setContext(
			ACCORDION_ROOT_KEY,
			new AccordionSingleState({ ...rest, value: value as Box<string> })
		);
	} else {
		const { value, type, ...rest } = props;
		return setContext(
			ACCORDION_ROOT_KEY,
			new AccordionMultiState({ ...rest, value: value as Box<string[]> })
		);
	}
}

export function getAccordionRootState(): AccordionState {
	return getContext(ACCORDION_ROOT_KEY);
}

export function setAccordionItemState(props: Omit<AccordionItemStateProps, "rootState">) {
	verifyContextDeps(ACCORDION_ROOT_KEY);
	const rootState = getAccordionRootState();
	const itemState = new AccordionItemState({ ...props, rootState });
	setContext(ACCORDION_ITEM_KEY, itemState);
	return itemState;
}

export function getAccordionItemState(): AccordionItemState {
	return getContext(ACCORDION_ITEM_KEY);
}

export function getAccordionTriggerState(props: AccordionTriggerStateProps): AccordionTriggerState {
	verifyContextDeps(ACCORDION_ITEM_KEY);
	const itemState = getAccordionItemState();
	return itemState.createTrigger(props);
}

export function getAccordionContentState(): AccordionContentState {
	verifyContextDeps(ACCORDION_ITEM_KEY);
	const itemState = getAccordionItemState();
	return itemState.createContent();
}
