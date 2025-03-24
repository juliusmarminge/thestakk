import {
  type RegisteredRouter,
  type RouteIds,
  getRouteApi,
  useNavigate,
} from "@tanstack/react-router";

function cleanEmptyParams<T extends Record<string, unknown>>(search: T) {
  const newSearch = { ...search };
  for (const key in newSearch) {
    const value = newSearch[key];
    if (value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value)))
      delete newSearch[key];
  }

  if (search.pageIndex === 0) delete newSearch.pageIndex;
  if (search.pageSize === 10) delete newSearch.pageSize;

  return newSearch;
}

export function useFilters<T extends RouteIds<RegisteredRouter["routeTree"]>>(routeId: T) {
  const routeApi = getRouteApi<T>(routeId);
  const navigate = useNavigate();
  const filters = routeApi.useSearch();

  const setFilters = (partialFilters: Partial<typeof filters>) => {
    navigate({
      search: (prev: any) => cleanEmptyParams({ ...prev, ...partialFilters }),
      to: ".",
    });
  };

  const resetFilters = () => {
    navigate({
      search: {},
      to: ".",
    });
  };

  return { filters, setFilters, resetFilters };
}
