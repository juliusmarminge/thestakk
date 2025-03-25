import { ErrorComponent, createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { DataTable } from "~/components/data-table";
import { SectionCards } from "~/components/section-cards";
import { useFilters } from "~/lib/use-filters";

export const Route = createFileRoute("/_app/")({
  validateSearch: type({
    pageIndex: type.number.default(0),
    pageSize: type.number.default(10),
  }),
  component: RouteComponent,
  errorComponent: ErrorComponent,
  loaderDeps: ({ search }) => ({ pageIndex: search.pageIndex, pageSize: search.pageSize }),
  loader: async ({ deps, context: { queryClient, trpc } }) => {
    await queryClient.ensureQueryData(trpc.getItems.queryOptions(deps));
  },
});

function RouteComponent() {
  const { filters, setFilters } = useFilters(Route.id);
  const paginationState = {
    pageIndex: filters.pageIndex,
    pageSize: filters.pageSize,
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable
          paginationState={paginationState}
          onPaginationChange={(pagination) => {
            setFilters(typeof pagination === "function" ? pagination(paginationState) : pagination);
          }}
        />
      </div>
    </div>
  );
}
