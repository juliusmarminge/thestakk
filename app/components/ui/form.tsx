import type { FormApi } from "@tanstack/react-form";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { LoadingSpinner } from "~/components/icons";
import { type Button, LoadingButton } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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

// FIXME: TYPES

type AppFormApi = FormApi<any, any, any, any, any, any, any, any, any, any> & {
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

export function Fieldset({ className, ...props }: React.ComponentPropsWithoutRef<"fieldset">) {
  return (
    <fieldset
      {...props}
      className={cn(className, "*:data-[slot=text]:mt-1 [&>*+[data-slot=control]]:mt-6")}
    />
  );
}

export function Legend({
  className,
  ...props
}: { className?: string } & React.ComponentPropsWithoutRef<"legend">) {
  return (
    <legend
      data-slot="legend"
      {...props}
      className={cn(
        className,
        "font-semibold text-base/6 text-foreground data-disabled:opacity-50 sm:text-sm/6",
      )}
    />
  );
}

export function FieldGroup({ className, ...props }: React.ComponentPropsWithRef<"div">) {
  return <div data-slot="control" {...props} className={cn(className, "space-y-8")} />;
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
      <div
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
}: Omit<React.ComponentPropsWithoutRef<typeof Label>, "htmlFor">) {
  const { formItemId } = React.use(FormItemContext);
  const field = useFieldContext<string>();
  const valid = field.state.meta.errors.length === 0;

  return (
    <Label
      {...props}
      data-invalid={!valid || undefined}
      htmlFor={formItemId}
      className={cn("data-invalid:text-destructive", className)}
    />
  );
}

export function FormDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Text>) {
  const { formDescriptionId } = React.use(FormItemContext);

  return (
    <Text
      {...props}
      data-slot="description"
      id={formDescriptionId}
      className={cn(className, "text-muted-foreground data-disabled:opacity-50")}
    />
  );
}

export function FormMessage({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) {
  const { formMessageId } = React.use(FormItemContext);

  return (
    <Text
      id={formMessageId}
      data-slot="error"
      className={cn(className, "text-destructive data-disabled:opacity-50")}
      {...props}
    />
  );
}

export function FormControl({ ...props }: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { formItemId, formDescriptionId, formMessageId } = React.use(FormItemContext);
  const field = useFieldContext<string>();
  const valid = field.state.meta.errors.length === 0;

  return (
    <SlotPrimitive.Slot
      data-slot="control"
      data-invalid={!valid || undefined}
      id={formItemId}
      aria-describedby={valid ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
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
        <FormDescription className={descriptionClassName}>{description}</FormDescription>
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
        <FormMessage className={messageClassName}>{field.state.meta.errors[0].message}</FormMessage>
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
      <Select {...props} value={field.state.value} onValueChange={field.handleChange}>
        <FormControl>
          <SelectTrigger className={cn("data-invalid:border-destructive", triggerClassName)}>
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
        <LoadingButton isLoading={isSubmitting} disabled={!canSubmit} {...props}>
          {props.children}
        </LoadingButton>
      )}
    </form.Subscribe>
  );
}
