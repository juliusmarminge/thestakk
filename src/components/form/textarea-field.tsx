import { useStore } from "@tanstack/react-form";
import * as React from "react";
import { useFieldContext } from "~/components/form/context";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "../ui/input-group";

export function TextareaField({
  label,
  labelClassName,
  description,
  descriptionClassName,
  fieldClassName,
  inlineStart,
  inlineEnd,
  blockStart,
  blockEnd,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupTextarea>, "className"> & {
  label: string;
  labelClassName?: string;
  description?: string;
  descriptionClassName?: string;
  fieldClassName?: string;
  inlineStart?: React.ReactNode;
  inlineEnd?: React.ReactNode;
  blockStart?: React.ReactNode;
  blockEnd?: React.ReactNode;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

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
            <FieldDescription className={descriptionClassName}>
              {description}
            </FieldDescription>
          )}
        </FieldContent>
      )}
      <InputGroup>
        <InputGroupTextarea
          id={field.name}
          name={field.name}
          aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
          value={field.state.value ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
        {inlineStart && (
          <InputGroupAddon align="inline-start">{inlineStart}</InputGroupAddon>
        )}
        {inlineEnd && (
          <InputGroupAddon align="inline-end">{inlineEnd}</InputGroupAddon>
        )}
        {blockStart && (
          <InputGroupAddon align="block-start">{blockStart}</InputGroupAddon>
        )}
        {blockEnd && (
          <InputGroupAddon align="block-end">{blockEnd}</InputGroupAddon>
        )}
      </InputGroup>
      <FieldError errors={errors} />
    </Field>
  );
}
