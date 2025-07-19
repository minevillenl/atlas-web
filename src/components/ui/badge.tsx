import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-success/60",
        red: "border-transparent select-none items-center whitespace-nowrap font-medium bg-red-500/15 text-destructive text-xs h-4 px-1 py-1 rounded-md",
        yellow:
          "border-transparent select-none items-center whitespace-nowrap font-medium bg-yellow-500/15 text-yellow-500 text-xs h-4 px-1 py-1 rounded-md",
        orange:
          "border-transparent select-none items-center whitespace-nowrap font-medium bg-orange-500/15 text-orange-500 text-xs h-4 px-1 py-1 rounded-md",
        green:
          "border-transparent select-none items-center whitespace-nowrap font-medium bg-emerald-500/15 text-emerald-500 text-xs h-4 px-1 py-1 rounded-md",
        blue: "border-transparent select-none items-center whitespace-nowrap font-medium bg-blue-500/15 text-blue-500 text-xs h-4 px-1 py-1 rounded-md",
        primary:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40 dark:bg-primary/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
