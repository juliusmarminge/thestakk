import * as Types from "effect/Types";
import * as Option from "effect/Option";
import * as Array from "effect/Array";
import * as Order from "effect/Order";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EqualsIcon,
  PlusIcon,
  ViewColumnsIcon,
} from "@heroicons/react/16/solid";
import { formOptions, useForm } from "@tanstack/react-form";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type Table as ReactTable,
  type Row as ReactTableRow,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { LoaderIcon } from "~/components/icons";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useIsMobile } from "~/lib/use-mobile";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { GetAllItemsResult, UpdateItemArgs } from "#convex/items.schemas";
import { ItemStatus, ItemType } from "#convex/schema";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useAppForm } from "~/lib/use-form";
import { Form } from "./ui/form";

function useUpdateItem() {
  const mutationFn = useConvexMutation(api.items.update).withOptimisticUpdate(
    (localStore, args) => {
      // Find query that contains the item
      const queries = localStore.getAllQueries(api.items.getAll);
      const query = queries.find((q) =>
        q.value?.items.find((i) => i._id === args._id),
      );
      if (!query?.value) return;

      // Find the item in the query
      const item = Array.findFirstIndex(
        query.value.items,
        (i) => i._id === args._id,
      );
      if (Option.isNone(item)) return;

      const items = Array.replace(query.value.items, item.value, args);

      localStore.setQuery(api.items.getAll, query.args, {
        ...query.value,
        items,
      });
    },
  );

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success("Item saved");
    },
  });
}

function useMoveItem() {
  const mutationFn = useConvexMutation(api.items.moveItem).withOptimisticUpdate(
    (localStore, args) => {
      const queries = localStore.getAllQueries(api.items.getAll);
      const query = queries.find((q) =>
        q.value?.items.find((i) => i._id === args.id),
      );
      if (!query?.value) return;

      const item = Array.findFirstWithIndex(
        query.value.items,
        (i) => i._id === args.id,
      );
      if (Option.isNone(item)) return;

      // Update the moved item's order and re-sort
      const items = pipe(
        Array.replace(query.value.items, item.value[1], item.value[0]),
        Array.sortBy(Order.mapInput(Order.number, (a) => a.order)),
      );

      localStore.setQuery(api.items.getAll, query.args, {
        ...query.value,
        items,
      });
    },
  );

  return useMutation({ mutationFn });
}

function useDeleteItem() {
  const mutationFn = useConvexMutation(
    api.items.deleteOne,
  ).withOptimisticUpdate((localStore, args) => {
    const queries = localStore.getAllQueries(api.items.getAll);
    const query = queries.find((q) =>
      q.value?.items.find((i) => i._id === args.id),
    );
    if (!query?.value) return;

    const items = query.value.items.filter((i) => i._id !== args.id);
    localStore.setQuery(api.items.getAll, query.args, {
      ...query.value,
      items,
    });
  });

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success("Item deleted");
    },
  });
}

type Item = GetAllItemsResult["items"][number];

const updateItemForm = (
  item: Item,
  updateItem: ReturnType<typeof useUpdateItem>,
) =>
  formOptions({
    defaultValues: item,
    validators: {
      onSubmit: Schema.standardSchemaV1(UpdateItemArgs),
    },
    onSubmit: ({ value }) => {
      const { _id, ...update } = Schema.encodeSync(UpdateItemArgs)(value);
      updateItem.mutate({
        ...item,
        ...update,
      });
    },
  });

const columns: ColumnDef<Item>[] = [
  {
    id: "drag",
    header: function DragHeader() {
      return null;
    },
    cell: function DragCell({ row }) {
      return <DragHandle id={row.original._id} />;
    },
  },
  {
    id: "select",
    header: function SelectHeader({ table }) {
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      );
    },
    cell: function SelectCell({ row }) {
      return (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: function HeaderCell({ row }) {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: function TypeCell({ row }) {
      return (
        <div className="w-32">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: function StatusCell({ row }) {
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.status === "Done" ? (
            <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
          ) : (
            <LoaderIcon />
          )}
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: function TargetCell({ row }) {
      const form = useForm(updateItemForm(row.original, useUpdateItem()));

      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="target"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>
                    Target
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value.toString()}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(BigInt(e.target.value))}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </form>
      );
    },
  },
  {
    accessorKey: "limit",
    header: "Limit",
    cell: function LimitCell({ row }) {
      const form = useForm(updateItemForm(row.original, useUpdateItem()));

      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="limit"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>
                    Limit
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value.toString()}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(BigInt(e.target.value))}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </form>
      );
    },
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: function ReviewerCell({ row }) {
      const isAssigned = row.original.reviewer !== "Assign reviewer";
      const form = useForm(updateItemForm(row.original, useUpdateItem()));

      if (isAssigned) {
        return row.original.reviewer;
      }

      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="reviewer"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel className="sr-only" htmlFor={field.name}>
                    Reviewer
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                    aria-invalid={isInvalid}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                      <SelectItem value="Jamik Tashpulatov">
                        Jamik Tashpulatov
                      </SelectItem>
                      <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </form>
      );
    },
  },
  {
    id: "actions",
    cell: function ActionCell({ row }) {
      const deleteItem = useDeleteItem();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                deleteItem.mutate({ id: row.original._id });
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

/**
 * A data table component that displays a list of items in a table format.
 * Supports rearranging items by dragging and dropping.
 */
export function DataTable(props: {
  paginationState: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
}) {
  /**
   * Fetch the items for the current page
   */
  const { data } = useSuspenseQuery(
    convexQuery(api.items.getAll, {
      pageIndex: props.paginationState.pageIndex,
      pageSize: props.paginationState.pageSize,
    }),
  );
  const { items, pageCount } = Schema.decodeSync(GetAllItemsResult)(data);

  const moveItemMutation = useMoveItem();

  /**
   * Handle the drag end event by calculating the new order of the items
   * and then firing the mutation to update the order of the items on the backend
   * @param event - The drag end event
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const activeItemIndex = items.findIndex((i) => i._id === active.id);
    const overItemIndex = items.findIndex((i) => i._id === over.id);
    const overItem = items[overItemIndex];

    let newOrder: number;
    if (overItemIndex > activeItemIndex) {
      const nextItemOrder =
        overItemIndex === items.length - 1
          ? overItem.order + 0.01
          : items[overItemIndex + 1]?.order;
      newOrder = (overItem?.order + nextItemOrder) / 2;
    } else {
      const prevItemOrder =
        overItemIndex === 0
          ? overItem.order - 0.01
          : items[overItemIndex - 1]?.order;
      newOrder = (overItem?.order + prevItemOrder) / 2;
    }

    moveItemMutation.mutate({
      id: active.id as Id<"items">,
      order: newOrder,
    });
  }

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    columns,
    data: items as Types.Mutable<typeof items>,
    state: {
      columnVisibility,
      rowSelection,
      pagination: props.paginationState,
    },
    manualPagination: true,
    pageCount,
    getRowId: (row) => row._id.toString(),
    onPaginationChange: props.onPaginationChange,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex @4xl/main:hidden w-fit"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <TableActions table={table} />
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <TableWithDraggableRows
            table={table}
            data={items}
            handleDragEnd={handleDragEnd}
          />
        </div>
        <TablePagination table={table} />
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
    </Tabs>
  );
}

function TableActions({ table }: { table: ReactTable<Item> }) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ViewColumnsIcon />
            <span className="hidden lg:inline">Customize Columns</span>
            <span className="lg:hidden">Columns</span>
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide(),
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value: unknown) =>
                  column.toggleVisibility(!!value)
                }
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm">
        <PlusIcon />
        <span className="hidden lg:inline">Add Section</span>
      </Button>
    </div>
  );
}

function TableWithDraggableRows({
  table,
  data, // need this for DND to work. table.getRowModel().rows is not enough
  handleDragEnd,
}: {
  table: ReactTable<Item>;
  data: readonly Item[];
  handleDragEnd: (event: DragEndEvent) => void;
}) {
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const rows = table.getRowModel().rows;

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
      id={sortableId}
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
          {rows.length ? (
            <SortableContext
              items={data.map((row) => row._id)}
              strategy={verticalListSortingStrategy}
            >
              {rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DndContext>
  );
}

function TablePagination({ table }: { table: ReactTable<Item> }) {
  return (
    <div className="flex items-center justify-between px-4">
      <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="font-medium text-sm">
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: unknown) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <EqualsIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow({ row }: { row: ReactTableRow<Item> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: Item }) {
  const isMobile = useIsMobile();

  const form = useAppForm(updateItemForm(item, useUpdateItem()));

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onClose={() => form.reset()}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent asChild>
        <Form form={form as never}>
          <DrawerHandle />
          <DrawerHeader className="gap-1">
            <DrawerTitle>{item.header}</DrawerTitle>
            <DrawerDescription>
              Showing total visitors for the last 6 months
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
            {!isMobile && (
              <>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 0,
                      right: 10,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="mobile"
                      type="natural"
                      fill="var(--color-mobile)"
                      fillOpacity={0.6}
                      stroke="var(--color-mobile)"
                      stackId="a"
                    />
                    <Area
                      dataKey="desktop"
                      type="natural"
                      fill="var(--color-desktop)"
                      fillOpacity={0.4}
                      stroke="var(--color-desktop)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
                <Separator />
                <div className="grid gap-2">
                  <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month{" "}
                    <ArrowTrendingUpIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Showing total visitors for the last 6 months. This is just
                    some random text to test the layout. It spans multiple lines
                    and should wrap around.
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div className="flex flex-col gap-4">
              <form.AppField
                name="header"
                children={(field) => <field.TextField label="Header" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <form.AppField
                  name="type"
                  children={(field) => (
                    <field.SelectField
                      label="Type"
                      placeholder="Select a type"
                      options={ItemType.literals.map((type) => ({
                        label: type,
                        value: type,
                      }))}
                      triggerClassName="w-full"
                    />
                  )}
                />
                <form.AppField
                  name="status"
                  children={(field) => (
                    <field.SelectField
                      label="Status"
                      placeholder="Select a status"
                      options={ItemStatus.literals.map((status) => ({
                        label: status,
                        value: status,
                      }))}
                      triggerClassName="w-full"
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <form.AppField
                  name="target"
                  children={(field) => (
                    <field.TextField
                      label="Target"
                      type="number"
                      inputMode="numeric"
                    />
                  )}
                />
                <form.AppField
                  name="limit"
                  children={(field) => (
                    <field.TextField
                      label="Limit"
                      type="number"
                      inputMode="numeric"
                    />
                  )}
                />
              </div>
              <form.AppField
                name="reviewer"
                children={(field) => (
                  <field.SelectField
                    label="Reviewer"
                    placeholder="Select a reviewer"
                    options={[
                      "Eddie Lake",
                      "Jamik Tashpulatov",
                      "Emily Whalen",
                    ].map((reviewer) => ({
                      label: reviewer,
                      value: reviewer,
                    }))}
                    triggerClassName="w-full"
                  />
                )}
              />
            </div>
          </div>
          <DrawerFooter>
            <form.SubscribeButton type="submit">Save</form.SubscribeButton>
            <DrawerClose asChild>
              <Button variant="outline">Close and discard changes</Button>
            </DrawerClose>
          </DrawerFooter>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
