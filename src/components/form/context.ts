import { createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export type FieldProps<T extends React.ComponentType> = Omit<
  React.ComponentProps<T>,
  "className"
> & {
  label?: string;
  labelClassName?: string;
  description?: string;
  descriptionClassName?: string;
  fieldClassName?: string;
};
