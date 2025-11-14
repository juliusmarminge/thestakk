import { type Button, LoadingButton } from "../ui/button";
import { useFormContext } from "./context";

export function SubscribeButton(props: React.ComponentProps<typeof Button>) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <LoadingButton
          type="submit"
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
