import { tv, type VariantProps } from "tailwind-variants";
import Root from "./button.svelte";

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			default: "bg-muted text-foreground",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline:
				"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 rounded-[7px] px-[14px] py-2 font-semibold",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-input-sm rounded-input px-4 font-semibold",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});

export type Variant = VariantProps<typeof buttonVariants>["variant"];
export type Size = VariantProps<typeof buttonVariants>["size"];

export {
	Root,
	//
	Root as Button
};
