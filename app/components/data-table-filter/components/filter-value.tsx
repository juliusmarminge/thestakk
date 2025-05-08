import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";

import { fromDate, getLocalTimeZone } from "@internationalized/date";
import { useDebouncedCallback, useDebouncer } from "@tanstack/react-pacer";
import { Array, DateTime } from "effect";
import {
  cloneElement,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DateRange } from "react-aria-components";
import { Button } from "~/components/ui/button";
import { RangeCalendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { DebouncedInput } from "~/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Slider } from "~/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { numberFilterOperators } from "../core/operators";
import type {
  Column,
  ColumnDataType,
  ColumnOptionExtended,
  DataTableFilterActions,
  FilterModel,
  FilterStrategy,
} from "../core/types";
import { createNumberRange } from "../lib/helpers";
import { type Locale, t } from "../lib/i18n";

interface FilterValueProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  strategy: FilterStrategy;
  locale?: Locale;
}

export const FilterValue = memo(__FilterValue) as typeof __FilterValue;

function __FilterValue<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale,
}: FilterValueProps<TData, TType>) {
  return (
    <Popover>
      <PopoverAnchor className="h-full" />
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="m-0 h-full w-fit whitespace-nowrap rounded-none p-0 px-2 text-xs"
        >
          <FilterValueDisplay filter={filter} column={column} actions={actions} locale={locale} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-fit origin-(--radix-popover-content-transform-origin) p-0"
      >
        <FilterValueController
          filter={filter}
          column={column}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      </PopoverContent>
    </Popover>
  );
}

interface FilterValueDisplayProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  locale?: Locale;
}

export function FilterValueDisplay<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, TType>) {
  switch (column.type) {
    case "option":
      return (
        <FilterValueOptionDisplay
          filter={filter as FilterModel<"option">}
          column={column as Column<TData, "option">}
          actions={actions}
          locale={locale}
        />
      );
    case "multiOption":
      return (
        <FilterValueMultiOptionDisplay
          filter={filter as FilterModel<"multiOption">}
          column={column as Column<TData, "multiOption">}
          actions={actions}
          locale={locale}
        />
      );
    case "date":
      return (
        <FilterValueDateDisplay
          filter={filter as FilterModel<"date">}
          column={column as Column<TData, "date">}
          actions={actions}
          locale={locale}
        />
      );
    case "text":
      return (
        <FilterValueTextDisplay
          filter={filter as FilterModel<"text">}
          column={column as Column<TData, "text">}
          actions={actions}
          locale={locale}
        />
      );
    case "number":
      return (
        <FilterValueNumberDisplay
          filter={filter as FilterModel<"number">}
          column={column as Column<TData, "number">}
          actions={actions}
          locale={locale}
        />
      );
    default:
      return null;
  }
}

export function FilterValueOptionDisplay<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, "option">) {
  const options = useMemo(() => column.getOptions(), [column]);
  const selected = options.filter((o) => filter?.values.includes(o.value));

  // We display the selected options based on how many are selected
  //
  // If there is only one option selected, we display its icon and label
  //
  // If there are multiple options selected, we display:
  // 1) up to 3 icons of the selected options
  // 2) the number of selected options
  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0];
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1">
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className="size-4 text-primary" />)}
        <span>{label}</span>
      </span>
    );
  }
  const name = column.displayName.toLowerCase();
  // TODO: Better pluralization for different languages
  const pluralName = name.endsWith("s") ? `${name}es` : `${name}s`;

  const hasOptionIcons = !options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-0.5">
      {hasOptionIcons &&
        Array.take(selected, 3).map(({ value, icon }) => {
          const Icon = icon!;
          return isValidElement(Icon) ? Icon : <Icon key={value} className="size-4" />;
        })}
      <span className={cn(hasOptionIcons && "ml-1.5")}>
        {selected.length} {pluralName}
      </span>
    </div>
  );
}

export function FilterValueMultiOptionDisplay<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, "multiOption">) {
  const options = useMemo(() => column.getOptions(), [column]);
  const selected = options.filter((o) => filter.values.includes(o.value));

  if (selected.length === 1) {
    const { label, icon: Icon } = selected[0];
    const hasIcon = !!Icon;
    return (
      <span className="inline-flex items-center gap-1.5">
        {hasIcon && (isValidElement(Icon) ? Icon : <Icon className="size-4 text-primary" />)}

        <span>{label}</span>
      </span>
    );
  }

  const name = column.displayName.toLowerCase();

  const hasOptionIcons = !options?.some((o) => !o.icon);

  return (
    <div className="inline-flex items-center gap-1.5">
      {hasOptionIcons && (
        <div key="icons" className="inline-flex items-center gap-0.5">
          {Array.take(selected, 3).map(({ value, icon }) => {
            const Icon = icon!;
            return isValidElement(Icon) ? (
              cloneElement(Icon, { key: value })
            ) : (
              <Icon key={value} className="size-4" />
            );
          })}
        </div>
      )}
      <span>
        {selected.length} {name}
      </span>
    </div>
  );
}

function formatDateRange(_start: Date, _end: Date) {
  const start = DateTime.unsafeFromDate(_start);
  const end = DateTime.unsafeFromDate(_end);

  const sameMonth = DateTime.getPart(start, "month") === DateTime.getPart(end, "month");
  const sameYear = DateTime.getPart(start, "year") === DateTime.getPart(end, "year");

  if (sameMonth && sameYear) {
    return `${DateTime.format(start, { month: "short", day: "numeric" })} - ${DateTime.format(end, { day: "numeric", year: "numeric" })}`;
  }

  if (sameYear) {
    return `${DateTime.format(start, { month: "short", day: "numeric" })} - ${DateTime.format(end, { month: "short", day: "numeric", year: "numeric" })}`;
  }

  return `${DateTime.format(start, { month: "short", day: "numeric", year: "numeric" })} - ${DateTime.format(end, { month: "short", day: "numeric", year: "numeric" })}`;
}

export function FilterValueDateDisplay<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, "date">) {
  if (!filter) return null;
  if (filter.values.length === 0) return <EllipsisHorizontalIcon className="size-4" />;
  if (filter.values.length === 1) {
    const value = DateTime.unsafeFromDate(filter.values[0]);

    const formattedDateStr = DateTime.format(value, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return <span>{formattedDateStr}</span>;
  }

  const formattedRangeStr = formatDateRange(filter.values[0], filter.values[1]);

  return <span>{formattedRangeStr}</span>;
}

export function FilterValueTextDisplay<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, "text">) {
  if (!filter) return null;
  if (filter.values.length === 0 || filter.values[0].trim() === "")
    return <EllipsisHorizontalIcon className="size-4" />;

  const value = filter.values[0];

  return <span>{value}</span>;
}

export function FilterValueNumberDisplay<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueDisplayProps<TData, "number">) {
  if (!filter || !filter.values || filter.values.length === 0) return null;

  if (filter.operator === "is between" || filter.operator === "is not between") {
    const minValue = filter.values[0];
    const maxValue = filter.values[1];

    return (
      <span className="tabular-nums tracking-tight">
        {minValue} {t("and", locale)} {maxValue}
      </span>
    );
  }

  const value = filter.values[0];
  return <span className="tabular-nums tracking-tight">{value}</span>;
}

/****** Property Filter Value Controller ******/

interface FilterValueControllerProps<TData, TType extends ColumnDataType> {
  filter: FilterModel<TType>;
  column: Column<TData, TType>;
  actions: DataTableFilterActions;
  strategy: FilterStrategy;
  locale?: Locale;
}

export const FilterValueController = memo(
  __FilterValueController,
) as typeof __FilterValueController;

function __FilterValueController<TData, TType extends ColumnDataType>({
  filter,
  column,
  actions,
  strategy,
  locale = "en",
}: FilterValueControllerProps<TData, TType>) {
  switch (column.type) {
    case "option":
      return (
        <FilterValueOptionController
          filter={filter as FilterModel<"option">}
          column={column as Column<TData, "option">}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case "multiOption":
      return (
        <FilterValueMultiOptionController
          filter={filter as FilterModel<"multiOption">}
          column={column as Column<TData, "multiOption">}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case "date":
      return (
        <FilterValueDateController
          filter={filter as FilterModel<"date">}
          column={column as Column<TData, "date">}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case "text":
      return (
        <FilterValueTextController
          filter={filter as FilterModel<"text">}
          column={column as Column<TData, "text">}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    case "number":
      return (
        <FilterValueNumberController
          filter={filter as FilterModel<"number">}
          column={column as Column<TData, "number">}
          actions={actions}
          strategy={strategy}
          locale={locale}
        />
      );
    default:
      return null;
  }
}

interface OptionItemProps {
  option: ColumnOptionExtended & { initialSelected: boolean };
  onToggle: (value: string, checked: boolean) => void;
}

// Memoized option item to prevent re-renders unless its own props change
const OptionItem = memo(function OptionItem({ option, onToggle }: OptionItemProps) {
  const { value, label, icon: Icon, selected, count } = option;
  const handleSelect = useCallback(() => {
    onToggle(value, !selected);
  }, [onToggle, value, selected]);

  return (
    <CommandItem
      key={value}
      onSelect={handleSelect}
      className="group flex items-center justify-between gap-1.5"
    >
      <div className="flex items-center gap-1.5">
        <Checkbox
          checked={selected}
          className="mr-1 opacity-0 data-[state=checked]:opacity-100 group-data-[selected=true]:opacity-100 dark:border-ring"
        />
        {Icon && (isValidElement(Icon) ? Icon : <Icon className="size-4 text-primary" />)}
        <span>
          {label}
          <sup
            className={cn(
              count == null && "hidden",
              "ml-0.5 text-muted-foreground tabular-nums tracking-tight",
              count === 0 && "slashed-zero",
            )}
          >
            {typeof count === "number" ? (count < 100 ? count : "100+") : ""}
          </sup>
        </span>
      </div>
    </CommandItem>
  );
});

export function FilterValueOptionController<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueControllerProps<TData, "option">) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues();
    return column.getOptions().map((o) => ({
      ...o,
      selected: filter?.values.includes(o.value),
      initialSelected: filter?.values.includes(o.value),
      count: counts?.get(o.value) ?? 0,
    }));
    // Only run once
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [options, setOptions] = useState(initialOptions);

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })));
  }, [filter?.values]);

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) actions.addFilterValue(column, [value]);
      else actions.removeFilterValue(column, [value]);
    },
    [actions, column],
  );

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = [];
    const unsel: typeof options = [];
    for (const o of options) {
      if (o.initialSelected) sel.push(o);
      else unsel.push(o);
    }
    return { selectedOptions: sel, unselectedOptions: unsel };
  }, [options]);

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t("search", locale)} />
      <CommandEmpty>{t("noresults", locale)}</CommandEmpty>
      <CommandList className="max-h-fit">
        <CommandGroup className={cn(selectedOptions.length === 0 && "hidden")}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && "hidden")}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function FilterValueMultiOptionController<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueControllerProps<TData, "multiOption">) {
  // Compute initial options once per mount
  const initialOptions = useMemo(() => {
    const counts = column.getFacetedUniqueValues();
    return column.getOptions().map((o) => {
      const selected = filter?.values.includes(o.value);
      return {
        ...o,
        selected,
        initialSelected: selected,
        count: counts?.get(o.value) ?? 0,
      };
    });
    // Only run once
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [options, setOptions] = useState(initialOptions);

  // Update selected state when filter values change
  useEffect(() => {
    setOptions((prev) => prev.map((o) => ({ ...o, selected: filter?.values.includes(o.value) })));
  }, [filter?.values]);

  const handleToggle = useCallback(
    (value: string, checked: boolean) => {
      if (checked) actions.addFilterValue(column, [value]);
      else actions.removeFilterValue(column, [value]);
    },
    [actions, column],
  );

  // Derive groups based on `initialSelected` only
  const { selectedOptions, unselectedOptions } = useMemo(() => {
    const sel: typeof options = [];
    const unsel: typeof options = [];
    for (const o of options) {
      if (o.initialSelected) sel.push(o);
      else unsel.push(o);
    }
    return { selectedOptions: sel, unselectedOptions: unsel };
  }, [options]);

  return (
    <Command loop>
      <CommandInput autoFocus placeholder={t("search", locale)} />
      <CommandEmpty>{t("noresults", locale)}</CommandEmpty>
      <CommandList>
        <CommandGroup className={cn(selectedOptions.length === 0 && "hidden")}>
          {selectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup className={cn(unselectedOptions.length === 0 && "hidden")}>
          {unselectedOptions.map((option) => (
            <OptionItem key={option.value} option={option} onToggle={handleToggle} />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function FilterValueDateController<TData>({
  filter,
  column,
  actions,
}: FilterValueControllerProps<TData, "date">) {
  const tz = getLocalTimeZone();
  const [date, setDate] = useState<DateRange | undefined>({
    start: fromDate(filter?.values[0] ?? new Date(), tz),
    end: fromDate(filter?.values[1], tz),
  });

  function changeDateRange(value: DateRange) {
    setDate(value);

    actions.setFilterValue(column, [value.start.toDate(tz), value.end.toDate(tz)]);
  }

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <div>
            <RangeCalendar value={date} onChange={changeDateRange} />
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function FilterValueTextController<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueControllerProps<TData, "text">) {
  const changeText = (value: string | number) => {
    actions.setFilterValue(column, [String(value)]);
  };

  return (
    <Command>
      <CommandList className="max-h-fit">
        <CommandGroup>
          <CommandItem>
            <DebouncedInput
              placeholder={t("search", locale)}
              autoFocus
              value={filter?.values[0] ?? ""}
              onChange={changeText}
            />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function FilterValueNumberController<TData>({
  filter,
  column,
  actions,
  locale = "en",
}: FilterValueControllerProps<TData, "number">) {
  const minMax = useMemo(() => column.getFacetedMinMaxValues(), [column]);
  const [sliderMin, sliderMax] = [minMax ? minMax[0] : 0, minMax ? minMax[1] : 0];

  // Local state for values
  const [values, setValues] = useState(filter?.values ?? [0, 0]);

  // Sync with parent filter changes
  useEffect(() => {
    if (
      filter?.values &&
      filter.values.length === values.length &&
      filter.values.every((v, i) => v === values[i])
    ) {
      setValues(filter.values);
    }
  }, [filter?.values, values]);

  const isNumberRange =
    // filter && values.length === 2
    filter && numberFilterOperators[filter.operator].target === "multiple";

  const setFilterOperatorDebounced = useDebouncer(actions.setFilterOperator, { wait: 500 });
  const setFilterValueDebounced = useDebouncer(actions.setFilterValue, { wait: 500 });

  const changeNumber = (value: number[]) => {
    setValues(value);
    setFilterValueDebounced.maybeExecute(column as any, value);
  };

  const changeMinNumber = (value: number) => {
    const newValues = createNumberRange([value, values[1]]);
    setValues(newValues);
    setFilterValueDebounced.maybeExecute(column as any, newValues);
  };

  const changeMaxNumber = (value: number) => {
    const newValues = createNumberRange([values[0], value]);
    setValues(newValues);
    setFilterValueDebounced.maybeExecute(column as any, newValues);
  };

  const changeType = useCallback(
    (type: "single" | "range") => {
      let newValues: number[] = [];
      if (type === "single")
        newValues = [values[0]]; // Keep the first value for single mode
      else if (!minMax) newValues = createNumberRange([values[0], values[1] ?? 0]);
      else {
        const value = values[0];
        newValues =
          value - minMax[0] < minMax[1] - value
            ? createNumberRange([value, minMax[1]])
            : createNumberRange([minMax[0], value]);
      }

      const newOperator = type === "single" ? "is" : "is between";

      // Update local state
      setValues(newValues);

      // Cancel in-flight debounced calls to prevent flicker/race conditions
      setFilterOperatorDebounced.cancel();
      setFilterValueDebounced.cancel();

      // Update global filter state atomically
      actions.setFilterOperator(column.id, newOperator);
      actions.setFilterValue(column, newValues);
    },
    [values, column, actions, minMax, setFilterOperatorDebounced, setFilterValueDebounced],
  );

  return (
    <Command>
      <CommandList className="w-[300px] px-2 py-2">
        <CommandGroup>
          <div className="flex w-full flex-col">
            <Tabs
              value={isNumberRange ? "range" : "single"}
              onValueChange={(v) => changeType(v as "single" | "range")}
            >
              <TabsList className="w-full *:text-xs">
                <TabsTrigger value="single">{t("single", locale)}</TabsTrigger>
                <TabsTrigger value="range">{t("range", locale)}</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="mt-4 flex flex-col gap-4">
                {minMax && (
                  <Slider
                    value={[values[0]]}
                    onValueChange={(value) => changeNumber(value)}
                    min={sliderMin}
                    max={sliderMax}
                    step={1}
                    aria-orientation="horizontal"
                  />
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">{t("value", locale)}</span>
                  <DebouncedInput
                    id="single"
                    type="number"
                    value={values[0].toString()} // Use values[0] directly
                    onChange={(v) => changeNumber([Number(v)])}
                  />
                </div>
              </TabsContent>
              <TabsContent value="range" className="mt-4 flex flex-col gap-4">
                {minMax && (
                  <Slider
                    value={values} // Use values directly
                    onValueChange={changeNumber}
                    min={sliderMin}
                    max={sliderMax}
                    step={1}
                    aria-orientation="horizontal"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{t("min", locale)}</span>
                    <DebouncedInput
                      type="number"
                      value={values[0]}
                      onChange={(v) => changeMinNumber(Number(v))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{t("max", locale)}</span>
                    <DebouncedInput
                      type="number"
                      value={values[1]}
                      onChange={(v) => changeMaxNumber(Number(v))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
