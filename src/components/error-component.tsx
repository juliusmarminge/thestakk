import { ErrorComponentProps, Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Heading, Text } from "~/components/ui/text";

export function ErrorComponent(_props: ErrorComponentProps) {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 animate-pulse rounded-full bg-primary/5" />
        <div className="absolute right-1/4 bottom-1/4 h-40 w-40 animate-pulse rounded-full bg-primary/5 [animation-delay:200ms]" />
        <div className="absolute top-1/2 left-1/2 h-24 w-24 animate-pulse rounded-full bg-primary/5 [animation-delay:400ms]" />
      </div>

      <Card className="relative w-full max-w-md space-y-4 p-8 text-center backdrop-blur-sm">
        <div className="mb-6 animate-bounce text-8xl">😅</div>
        <Heading className="bg-linear-to-r from-primary to-primary-foreground bg-clip-text font-semibold text-3xl text-transparent">
          Oops! Something went wrong
        </Heading>
        <Text className="text-lg text-muted-foreground">
          Don't worry, it happens to the best of us. Our team has been notified
          and is working on it.
        </Text>
        <div className="relative mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="transition-transform hover:scale-105"
          >
            Try Again
          </Button>
          <Link
            to="/"
            className={buttonVariants({
              className: "transition-transform hover:scale-105",
            })}
          >
            Go Home
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function NotFoundComponent() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden p-4">
      {/* Animated search paths */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 h-64 w-64 animate-[spin_8s_linear_infinite] rounded-full border-4 border-primary/20 border-dashed" />
        <div className="absolute right-1/3 bottom-1/3 h-48 w-48 animate-[spin_6s_linear_infinite_reverse] rounded-full border-4 border-primary/20 border-dashed" />
        <div className="absolute top-1/2 left-1/2 h-32 w-32 animate-[spin_4s_linear_infinite] rounded-full border-4 border-primary/20 border-dashed" />
      </div>

      <Card className="relative w-full max-w-md space-y-4 p-8 text-center backdrop-blur-sm">
        <div className="mb-6 animate-[bounce_2s_ease-in-out_infinite] text-8xl">
          🔍
        </div>
        <Heading className="bg-linear-to-r from-primary to-primary-foreground bg-clip-text font-semibold text-3xl text-transparent">
          Page Not Found
        </Heading>
        <Text className="text-lg text-muted-foreground">
          Looks like you've ventured into uncharted territory! The page you're
          looking for doesn't exist or may have moved.
        </Text>
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className={buttonVariants({
              className: "relative transition-transform hover:scale-105",
            })}
          >
            <span className="relative z-10">Back to Home</span>
            <div className="absolute inset-0 animate-ping rounded-md bg-primary/10" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
