import { createFormHook } from "@tanstack/react-form";
import * as React from "react";
import { fieldContext, formContext } from "./form-context";

const SubscribeButton = React.lazy(() =>
  import("~/components/ui/form").then((mod) => ({ default: mod.SubscribeButton })),
);

const TextField = React.lazy(() =>
  import("~/components/ui/form").then((mod) => ({ default: mod.TextField })),
);

const SelectField = React.lazy(() =>
  import("~/components/ui/form").then((mod) => ({ default: mod.SelectField })),
);

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    SelectField,
  },
  formComponents: {
    SubscribeButton,
  },
});
