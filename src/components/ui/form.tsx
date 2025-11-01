import type { FormApi } from "@tanstack/react-form";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { type Button, LoadingButton } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import {
  FormItemContext,
  type FormItemContextValue,
  useFieldContext,
  useFormContext,
} from "~/lib/form-context";
import { cn } from "~/lib/utils";
import {
  FieldError,
  FieldLabel,
  Field as FieldComponent,
  FieldDescription,
} from "./field";

// FIXME: TYPES

type AppFormApi = FormApi<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> & {
  AppForm: React.ComponentType<any>;
};

export function Form<TForm extends AppFormApi>({
  form,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit"> & { form: TForm }) {
  return (
    <form.AppForm>
      <form
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      />
    </form.AppForm>
  );
}

function getFormIds(id: string): FormItemContextValue {
  return {
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-description`,
    formMessageId: `${id}-form-message`,
  };
}

export function Field({
  className,
  fieldId,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { fieldId: string }) {
  const value = getFormIds(fieldId);

  return (
    <FormItemContext value={value}>
      <FieldComponent
        {...props}
        className={cn(
          "[&>[data-slot=label]+[data-slot=control]]:mt-3",
          "[&>[data-slot=label]+[data-slot=description]]:mt-1",
          "[&>[data-slot=description]+[data-slot=control]]:mt-3",
          "[&>[data-slot=control]+[data-slot=description]]:mt-3",
          "[&>[data-slot=control]+[data-slot=error]]:mt-3",
          "*:data-[slot=label]:font-medium",
          className,
        )}
      />
    </FormItemContext>
  );
}

export function FormLabel({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof FieldLabel>, "htmlFor">) {
  const { formItemId } = React.use(FormItemContext);
  const field = useFieldContext<string>();
  const valid = field.state.meta.errors.length === 0;

  return (
    <FieldLabel
      {...props}
      data-invalid={!valid || undefined}
      htmlFor={formItemId}
      className={cn("data-invalid:text-destructive", className)}
    />
  );
}

export function FormMessage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
  const { formMessageId } = React.use(FormItemContext);

  return (
    <FieldError
      id={formMessageId}
      data-slot="error"
      className={cn(className, "text-destructive data-disabled:opacity-50")}
      {...props}
    />
  );
}

export function FormControl({
  ...props
}: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { formItemId, formDescriptionId, formMessageId } =
    React.use(FormItemContext);
  const field = useFieldContext<string>();
  const valid = field.state.meta.errors.length === 0;

  return (
    <SlotPrimitive.Slot
      data-slot="control"
      data-invalid={!valid || undefined}
      id={formItemId}
      aria-describedby={
        valid ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!valid}
      {...props}
    />
  );
}

export function TextField({
  label,
  labelClassName,
  inputClassName,
  description,
  descriptionClassName,
  fieldClassName,
  messageClassName,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "className"> & {
  label: string;
  labelClassName?: string;
  inputClassName?: string;
  description?: string;
  descriptionClassName?: string;
  messageClassName?: string;
  fieldClassName?: string;
}) {
  const fieldId = React.useId();
  const field = useFieldContext<string>();

  return (
    <Field fieldId={fieldId} className={fieldClassName}>
      <FormLabel className={labelClassName}>{label}</FormLabel>
      {description && (
        <FieldDescription className={descriptionClassName}>
          {description}
        </FieldDescription>
      )}

      <FormControl>
        <Input
          data-slot="control"
          {...props}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          className={cn("data-invalid:border-destructive", inputClassName)}
        />
      </FormControl>

      {field.state.meta.errors.length > 0 && (
        <FormMessage className={messageClassName}>
          {field.state.meta.errors[0].message}
        </FormMessage>
      )}
    </Field>
  );
}

export function SelectField({
  label,
  placeholder,
  labelClassName,
  triggerClassName,
  fieldClassName,
  options,
  ...props
}: React.ComponentProps<typeof Select> & {
  label: string;
  placeholder?: string;
  labelClassName?: string;
  triggerClassName?: string;
  fieldClassName?: string;
  options: { label: string; value: string }[];
}) {
  const fieldId = React.useId();
  const field = useFieldContext<string>();

  return (
    <Field fieldId={fieldId} className={fieldClassName}>
      <FormLabel className={labelClassName}>{label}</FormLabel>
      <Select
        {...props}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <FormControl>
          <SelectTrigger
            className={cn("data-invalid:border-destructive", triggerClassName)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function SubscribeButton(props: React.ComponentProps<typeof Button>) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <LoadingButton
          isLoading={isSubmitting}
          disabled={!canSubmit}
          {...props}
        >
          {props.children}
        </LoadingButton>
      )}
    </form.Subscribe>
  );
}
