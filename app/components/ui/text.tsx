import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

type HeadingProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
} & React.ComponentProps<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">;

export function Heading({ className, level = 1, ...props }: HeadingProps) {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn("font-semibold text-2xl/8 text-foreground sm:text-xl/8", className)}
    />
  );
}

export function Subheading({ className, level = 2, ...props }: HeadingProps) {
  const Element: `h${typeof level}` = `h${level}`;

  return (
    <Element
      {...props}
      className={cn("font-semibold text-base/7 text-foreground sm:text-sm/6", className)}
    />
  );
}

export function Text({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="text"
      {...props}
      className={cn("text-base/6 text-muted-foreground sm:text-sm/6", className)}
    />
  );
}

export function TextLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "text-foreground underline decoration-foreground/50 data-[hover]:decoration-foreground",
        className,
      )}
    />
  );
}

export function Strong({ className, ...props }: React.ComponentProps<"strong">) {
  return <strong {...props} className={cn("font-medium text-foreground", className)} />;
}

export function Code({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      {...props}
      className={cn(
        "rounded border border-foreground/10 bg-foreground/[2.5%] px-0.5 font-medium text-foreground text-sm sm:text-[0.8125rem]",
        className,
      )}
    />
  );
}

export function Pre({ className, ...props }: React.ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "rounded border border-foreground/10 bg-foreground/[2.5%] px-0.5 font-medium text-foreground text-sm sm:text-[0.8125rem]",
        className,
      )}
    />
  );
}
