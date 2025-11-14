import { cn } from "~/lib/utils";

export function LoaderIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("fill-none stroke-2 stroke-current", className)}
      {...props}
    >
      <title>Loader</title>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 6l0 -3" />
      <path d="M16.25 7.75l2.15 -2.15" />
      <path d="M18 12l3 0" />
      <path d="M16.25 16.25l2.15 2.15" />
      <path d="M12 18l0 3" />
      <path d="M7.75 16.25l-2.15 2.15" />
      <path d="M6 12l-3 0" />
      <path d="M7.75 7.75l-2.15 -2.15" />
    </svg>
  );
}

export function ThemeToggleIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6 fill-none stroke-2 stroke-current", className)}
      {...props}
    >
      <title>Theme Toggle</title>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 3l0 18" />
      <path d="M12 9l4.65 -4.65" />
      <path d="M12 14.3l7.37 -7.37" />
      <path d="M12 19.6l8.85 -8.85" />
    </svg>
  );
}

export function PanelLeftIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("size-6 fill-current", className)}
      {...props}
    >
      <title>Panel Left</title>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3zm12 -16h-8v14h8a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1" />
    </svg>
  );
}

export function PanelRightIcon({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("size-6 fill-current", className)}
      {...props}
    >
      <title>Panel Right</title>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 21a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3zm8 -16h-8a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h8z" />
    </svg>
  );
}
export function LoadingSpinner(props: {
  size?: number;
  invert?: boolean;
  className?: string;
}) {
  const size = props.size ?? "24";
  return (
    <output>
      <svg
        aria-hidden="true"
        className={cn(
          "animate-spin fill-none",
          props.invert
            ? "fill-primary-foreground/75 text-primary dark:fill-background/75"
            : "fill-primary text-primary-background dark:text-background",
          props.className,
        )}
        viewBox="0 0 100 101"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </output>
  );
}

export const PasskeyIcon = ({
  className,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 327 318"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("size-6 fill-current", className)}
    {...props}
  >
    <title>Passkey</title>
    <circle cx="126" cy="75" r="75" />
    <path d="M1 265.5V308.5H217.5V216.5C206.425 208.008 200.794 201.073 192 184C180.063 178.025 173.246 176.622 161 175.5H91.5C45.1022 186.909 19.4472 194.075 1 265.5Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M268 208C300.585 208 327 181.585 327 149C327 116.415 300.585 90 268 90C235.415 90 209 116.415 209 149C209 181.585 235.415 208 268 208ZM268 149C276.837 149 284 141.837 284 133C284 124.163 276.837 117 268 117C259.163 117 252 124.163 252 133C252 141.837 259.163 149 268 149Z"
    />
    <path d="M242.5 292V203H289L309 225.5L284.5 250.5L309 275.5L267 316.5L242.5 292Z" />
  </svg>
);
