import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/auth/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm({
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
      <Card className="w-full max-w-md bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="font-bold @[250px]:text-3xl text-2xl">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your email and password to sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            {isSignUp && (
              <div className="space-y-2">
                <form.Field name="name">
                  {(field) => (
                    <>
                      <Label htmlFor={field.name}>Name</Label>
                      <Input
                        id={field.name}
                        type="text"
                        placeholder="John Doe"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            )}
            <div className="space-y-2">
              <form.Field name="email">
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                      className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                    )}
                  </>
                )}
              </form.Field>
            </div>
            <div className="space-y-2">
              <form.Field name="password">
                {(field) => (
                  <>
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                      className={field.state.meta.errors.length > 0 ? "border-red-500" : ""}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500">{field.state.meta.errors[0]?.message}</p>
                    )}
                  </>
                )}
              </form.Field>
            </div>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting
                    ? isSignUp
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignUp
                      ? "Sign up"
                      : "Sign in"}
                </Button>
              )}
            </form.Subscribe>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
