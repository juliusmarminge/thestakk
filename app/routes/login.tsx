import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/auth/client";
import { Button } from "~/components/ui/button";
import { FieldGroup, Fieldset, Form, Legend } from "~/components/ui/form";
import { Text } from "~/components/ui/text";
import { useAppForm } from "~/lib/use-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    validators: {
      onSubmit: type({
        email: "string.email",
        password: "string>7",
        name: "string | undefined",
      }),
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Form
        form={form as never}
        className="w-full max-w-lg space-y-6 rounded-xl border bg-gradient-to-t from-primary/10 to-card p-8 shadow-lg backdrop-blur-[2px] transition-all hover:shadow-xl dark:border-primary/10 dark:from-primary/20 dark:to-card/90"
      >
        <Fieldset>
          <Legend>{isSignUp ? "Create an account" : "Welcome back"}</Legend>
          <Text>
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your email and password to sign in to your account"}
          </Text>
          <FieldGroup>
            {isSignUp && (
              <form.AppField name="name" children={(field) => <field.TextField label="Name" />} />
            )}
            <form.AppField
              name="email"
              children={(field) => <field.TextField label="Email" type="email" />}
            />
            <form.AppField
              name="password"
              children={(field) => <field.TextField label="Password" type="password" />}
            />
          </FieldGroup>
        </Fieldset>

        <div className="space-y-2">
          <form.SubscribeButton className="w-full">
            {isSignUp ? "Sign Up" : "Sign In"}
          </form.SubscribeButton>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
