import { createFormHook } from "@tanstack/react-form";
import * as React from "react";
import { fieldContext, formContext, useFormContext } from "./form-context";

const SubscribeButton = React.lazy(() =>
  import("~/components/form").then((mod) => ({ default: mod.SubscribeButton })),
);

const TextField = React.lazy(() =>
  import("~/components/form").then((mod) => ({ default: mod.TextField })),
);

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
});
