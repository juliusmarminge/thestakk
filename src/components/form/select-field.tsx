import * as React from "react";
import type { FieldProps } from "~/components/form/context";
import { useFieldContext } from "~/components/form/context";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Field, FieldContent, FieldDescription, FieldLabel } from "../ui/field";

export function SelectField({
  label,
  description,
  descriptionClassName,
  labelClassName,
  triggerClassName,
  fieldClassName,
  items,
  ...props
}: FieldProps<typeof Select<string, false>> & {
  triggerClassName?: string;
  items: { label: string; value: string }[];
}) {
  const field = useFieldContext<string>();

  return (
    <Field className={fieldClassName}>
      {(label || description) && (
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={field.name} className={labelClassName}>
              {label}
            </FieldLabel>
          )}
          {description && (
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
          )}
        </FieldContent>
      )}
      <Select
        {...props}
        id={field.name}
        name={field.name}
        items={items}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger className={cn("data-invalid:border-destructive", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectPopup>
          {items.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </Field>
  );
}
