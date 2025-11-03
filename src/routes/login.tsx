import { createFileRoute } from "@tanstack/react-router";
import * as Schema from "effect/Schema";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "~/auth/client";
import { PasskeyIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "~/components/ui/field";
import { Form } from "~/components/ui/form";
import { Text } from "~/components/ui/text";
import { useAppForm } from "~/lib/use-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

class LoginSchema extends Schema.Struct({
  email: Schema.String,
  password: Schema.String.pipe(Schema.minLength(8)),
  name: Schema.String,
}) {}

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, startTransition] = useTransition();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    validators: {
      onSubmit: Schema.standardSchemaV1(LoginSchema),
    },
    onSubmit: async ({ value }) => {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
        });
        if (result.error) {
          toast.error(result.error.message);
          return;
        }
      }

      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: "/",
      });
      if (result.error) {
        toast.error(result.error.message);
      }
    },
  });

  useEffect(() => {
    if (
      !PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return;
    }

    authClient.signIn.passkey({ autoFill: true }).then((result) => {
      if (result?.error != null) {
        if (result.error.message !== "auth cancelled") {
          toast.error(result.error.message);
        }
      } else navigate({ to: "/" });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Form
        form={form as never}
        className="w-full max-w-lg space-y-6 rounded-xl border bg-linear-to-t from-primary/10 to-card p-8 shadow-lg backdrop-blur-[2px] transition-all hover:shadow-xl dark:border-primary/10 dark:from-primary/20 dark:to-card/90"
      >
        <FieldSet disabled={isPending || form.state.isSubmitting}>
          <FieldLegend>
            {isSignUp ? "Create an account" : "Welcome back"}
          </FieldLegend>
          <Text>
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your email and password to sign in to your account"}
          </Text>
          <FieldGroup>
            {isSignUp && (
              <form.AppField
                name="name"
                children={(field) => <field.TextField label="Name" />}
              />
            )}
            <form.AppField
              name="email"
              children={(field) => (
                <field.TextField
                  autoComplete="username webauthn"
                  label="Email"
                  type="email"
                />
              )}
            />
            <form.AppField
              name="password"
              children={(field) => (
                <field.TextField
                  autoComplete="current-password webauthn"
                  label="Password"
                  type="password"
                />
              )}
            />
          </FieldGroup>
        </FieldSet>

        <div className="space-y-2">
          <form.SubscribeButton className="w-full" disabled={isPending}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </form.SubscribeButton>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isPending || form.state.isSubmitting}
            onClick={() =>
              startTransition(async () => {
                const toastId = toast.loading("Signing in with passkey...");
                await authClient.signIn.passkey().then((result) => {
                  if (result?.error != null) {
                    toast.error(result.error.message, { id: toastId });
                  } else {
                    toast.dismiss(toastId);
                    navigate({ to: "/" });
                  }
                });
              })
            }
          >
            <PasskeyIcon className="size-4" />
            Sign in with passkey
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isPending || form.state.isSubmitting}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
