import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Button,
  CalendarCell as CalendarCellRac,
  CalendarGridBody as CalendarGridBodyRac,
  CalendarGridHeader as CalendarGridHeaderRac,
  CalendarGrid as CalendarGridRac,
  CalendarHeaderCell as CalendarHeaderCellRac,
  Calendar as CalendarRac,
  Heading as HeadingRac,
  RangeCalendar as RangeCalendarRac,
  composeRenderProps,
} from "react-aria-components";

import { cn } from "~/lib/utils";

interface BaseCalendarProps {
  className?: string;
}

type CalendarProps = React.ComponentProps<typeof CalendarRac> & BaseCalendarProps;
type RangeCalendarProps = React.ComponentProps<typeof RangeCalendarRac> & BaseCalendarProps;

function CalendarHeader() {
  return (
    <header className="flex w-full items-center gap-1 pb-1">
      <Button
        slot="previous"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <HeadingRac className="grow text-center font-medium text-sm" />
      <Button
        slot="next"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </header>
  );
}

function CalendarGridComponent({ isRange = false }: { isRange?: boolean }) {
  const now = today(getLocalTimeZone());

  return (
    <CalendarGridRac>
      <CalendarGridHeaderRac>
        {(day) => (
          <CalendarHeaderCellRac className="size-9 rounded-md p-0 font-medium text-muted-foreground/80 text-xs">
            {day}
          </CalendarHeaderCellRac>
        )}
      </CalendarGridHeaderRac>
      <CalendarGridBodyRac className="[&_td]:px-0 [&_td]:py-px">
        {(date) => (
          <CalendarCellRac
            date={date}
            className={cn(
              "relative flex size-9 items-center justify-center whitespace-nowrap rounded-md p-0 font-normal text-foreground text-sm outline-none duration-150 [transition-property:color,background-color,border-radius,box-shadow] data-disabled:pointer-events-none data-unavailable:pointer-events-none data-focus-visible:z-10 data-hovered:bg-accent data-selected:bg-primary data-hovered:text-foreground data-selected:text-primary-foreground data-unavailable:line-through data-disabled:opacity-30 data-unavailable:opacity-30 data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50",
              // Range-specific styles
              isRange &&
                "data-invalid:data-selection-end:bg-destructive data-invalid:data-selection-start:bg-destructive data-invalid:data-selection-end:text-white data-invalid:data-selection-start:text-white data-selected:rounded-none data-selection-start:rounded-s-md data-selection-end:rounded-e-md data-invalid:bg-red-100 data-selected:bg-accent data-selection-end:bg-primary data-selection-start:bg-primary data-selected:text-foreground data-selection-end:text-primary-foreground data-selection-start:text-primary-foreground",
              // Today indicator styles
              date.compare(now) === 0 &&
                cn(
                  "after:-translate-x-1/2 after:pointer-events-none after:absolute after:start-1/2 after:bottom-1 after:z-10 after:size-[3px] after:rounded-full after:bg-primary",
                  isRange
                    ? "data-selection-end:after:bg-background data-selection-start:after:bg-background"
                    : "data-selected:after:bg-background",
                ),
            )}
          />
        )}
      </CalendarGridBodyRac>
    </CalendarGridRac>
  );
}

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <CalendarRac
      {...props}
      className={composeRenderProps(className, (className) => cn("w-fit", className))}
    >
      <CalendarHeader />
      <CalendarGridComponent />
    </CalendarRac>
  );
}

export function RangeCalendar({ className, ...props }: RangeCalendarProps) {
  return (
    <RangeCalendarRac
      {...props}
      className={composeRenderProps(className, (className) => cn("w-fit", className))}
    >
      <CalendarHeader />
      <CalendarGridComponent isRange />
    </RangeCalendarRac>
  );
}
