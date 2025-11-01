import { cn } from "~/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  loading?: boolean;
  pulse?: boolean;
}

export function Skeleton({
  className,
  children,
  loading = true,
  pulse = true,
  ...props
}: SkeletonProps) {
  if (!loading) return children;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "absolute inset-0 rounded-md bg-secondary",
          pulse && "animate-pulse",
          className,
        )}
        {...props}
      />
      <div className="invisible">{children}</div>
    </div>
  );
}
