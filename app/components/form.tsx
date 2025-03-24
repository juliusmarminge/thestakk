import * as Headless from "@headlessui/react";
import type React from "react";
import { useFieldContext, useFormContext } from "~/lib/form-context";
import { cn } from "~/lib/utils";
import { LoadingSpinner } from "./icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Fieldset({
  className,
  ...props
}: { className?: string } & Omit<Headless.FieldsetProps, "as" | "className">) {
  return (
    <Headless.Fieldset
      {...props}
      className={cn(className, "*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6")}
    />
  );
}

export function Legend({
  className,
  ...props
}: { className?: string } & Omit<Headless.LegendProps, "as" | "className">) {
  return (
    <Headless.Legend
      data-slot="legend"
      {...props}
      className={cn(
        className,
        "font-semibold text-base/6 text-zinc-950 data-disabled:opacity-50 sm:text-sm/6 dark:text-white",
      )}
    />
  );
}

export function FieldGroup({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div data-slot="control" {...props} className={cn(className, "space-y-8")} />;
}

export function Field({
  className,
  ...props
}: { className?: string } & Omit<Headless.FieldProps, "as" | "className">) {
  return (
    <Headless.Field
      {...props}
      className={cn(
        className,
        "[&>[data-slot=label]+[data-slot=control]]:mt-3",
        "[&>[data-slot=label]+[data-slot=description]]:mt-1",
        "[&>[data-slot=description]+[data-slot=control]]:mt-3",
        "[&>[data-slot=control]+[data-slot=description]]:mt-3",
        "[&>[data-slot=control]+[data-slot=error]]:mt-3",
        "*:data-[slot=label]:font-medium",
      )}
    />
  );
}

export function Label({
  className,
  ...props
}: { className?: string } & Omit<Headless.LabelProps, "as" | "className">) {
  return (
    <Headless.Label
      data-slot="label"
      {...props}
      className={cn(
        className,
        "select-none text-base/6 text-zinc-950 data-disabled:opacity-50 sm:text-sm/6 dark:text-white",
      )}
    />
  );
}

export function Description({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps, "as" | "className">) {
  return (
    <Headless.Description
      data-slot="description"
      {...props}
      className={cn(
        className,
        "text-base/6 text-zinc-500 data-disabled:opacity-50 sm:text-sm/6 dark:text-zinc-400",
      )}
    />
  );
}

export function ErrorMessage({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps, "as" | "className">) {
  return (
    <Headless.Description
      data-slot="error"
      {...props}
      className={cn(
        className,
        "text-base/6 text-red-600 data-disabled:opacity-50 sm:text-sm/6 dark:text-red-500",
      )}
    />
  );
}

export function TextField(
  props: React.ComponentProps<typeof Input> & { label: string; description?: string },
) {
  const field = useFieldContext<string>();

  return (
    <Field>
      <Label htmlFor={field.name}>{props.label}</Label>
      <Description>{props.description}</Description>
      <Input
        data-slot="control"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        type={props.type}
        name={field.name}
        className={cn(
          field.state.meta.errors.length > 0 && "border-red-600 dark:border-red-500",
          props.className,
        )}
      />
      {field.state.meta.errors.length > 0 && (
        <ErrorMessage>{field.state.meta.errors[0].message}</ErrorMessage>
      )}
    </Field>
  );
}

export function SubscribeButton(props: React.ComponentProps<typeof Button>) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          {...props}
          {...((isSubmitting || ("disabled" in props && props.disabled)) && {
            "data-disabled": true,
          })}
          onClick={props.onClick}
          className={cn("relative overflow-hidden px-5 transition", props.className)}
        >
          <span
            aria-hidden={isSubmitting}
            className={cn(
              "flex items-center transition duration-300",
              isSubmitting && "translate-y-1.5 opacity-0",
            )}
          >
            {props.children}
          </span>
          <span
            aria-hidden={!isSubmitting}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition duration-300",
              !isSubmitting && "-translate-y-1.5 opacity-0",
            )}
          >
            <LoadingSpinner size={16} />
          </span>
        </Button>
      )}
    </form.Subscribe>
  );
}
