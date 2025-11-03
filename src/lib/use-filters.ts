import { useSearch } from "@tanstack/react-router";
import {
  type RegisteredRouter,
  type RouteIds,
  useNavigate,
} from "@tanstack/react-router";

function cleanEmptyParams<T extends Record<string, unknown>>(search: T) {
  const newSearch = { ...search };
  for (const key in newSearch) {
    const value = newSearch[key];
    if (
      value === undefined ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    )
      delete newSearch[key];
  }

  if (search.pageIndex === 0) delete newSearch.pageIndex;
  if (search.pageSize === 10) delete newSearch.pageSize;

  return newSearch;
}

export function useFilters<T extends RouteIds<RegisteredRouter["routeTree"]>>(
  routeId: T,
) {
  const navigate = useNavigate();
  const filters = useSearch({
    from: routeId,
  });

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
