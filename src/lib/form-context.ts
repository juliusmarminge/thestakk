import { createFormHookContexts } from "@tanstack/react-form";
import * as React from "react";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export type FormItemContextValue = {
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
};
export const FormItemContext = React.createContext({} as FormItemContextValue);
