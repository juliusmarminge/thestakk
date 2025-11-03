import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
// import { ReactTableDevtoolsPanel } from "@tanstack/react-table-devtools";

export function TanstackDevtools() {
  return (
    <TanStackDevtools
      plugins={[
        FormDevtoolsPlugin(),
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        // {
        //     name: "TanStack Table",
        //     render: <ReactTableDevtoolsPanel  />,
        // },
      ]}
    />
  );
}
