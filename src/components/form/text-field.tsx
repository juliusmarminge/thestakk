import { useStore } from "@tanstack/react-form";
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
  InputGroupInput,
} from "../ui/input-group";
import { type FieldProps, useFieldContext } from "./context";

export function TextField({
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
}: FieldProps<typeof InputGroupInput> & {
  inlineStart?: React.ReactNode;
  inlineEnd?: React.ReactNode;
  blockStart?: React.ReactNode;
  blockEnd?: React.ReactNode;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

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
        <InputGroupInput
          id={field.name}
          name={field.name}
          aria-invalid={isInvalid ? true : undefined}
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
