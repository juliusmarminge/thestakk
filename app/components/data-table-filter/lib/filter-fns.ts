import { Array, DateTime } from "effect";
import { dateFilterOperators } from "../core/operators";
import type { FilterModel } from "../core/types";

export function optionFilterFn<_TData>(inputData: string, filterValue: FilterModel<"option">) {
  if (!inputData) return false;
  if (filterValue.values.length === 0) return true;

  const value = inputData.toString().toLowerCase();

  const found = !!filterValue.values.find((v) => v.toLowerCase() === value);

  switch (filterValue.operator) {
    case "is":
    case "is any of":
      return found;
    case "is not":
    case "is none of":
      return !found;
  }
}

export function multiOptionFilterFn(inputData: string[], filterValue: FilterModel<"multiOption">) {
  if (!inputData) return false;

  if (
    filterValue.values.length === 0 ||
    !filterValue.values[0] ||
    filterValue.values[0].length === 0
  )
    return true;

  const values = inputData;
  const filterValues = filterValue.values;

  switch (filterValue.operator) {
    case "include":
    case "include any of":
      return Array.intersection(values, filterValues).length > 0;
    case "exclude":
      return Array.intersection(values, filterValues).length === 0;
    case "exclude if any of":
      return !(Array.intersection(values, filterValues).length > 0);
    case "include all of":
      return Array.intersection(values, filterValues).length === filterValues.length;
    case "exclude if all":
      return !(Array.intersection(values, filterValues).length === filterValues.length);
  }
}

export function dateFilterFn<_TData>(inputData: Date, filterValue: FilterModel<"date">) {
  if (!filterValue || filterValue.values.length === 0) return true;

  if (
    dateFilterOperators[filterValue.operator].target === "single" &&
    filterValue.values.length > 1
  )
    throw new Error("Singular operators require at most one filter value");

  if (filterValue.operator in ["is between", "is not between"] && filterValue.values.length !== 2)
    throw new Error("Plural operators require two filter values");

  const filterVals = filterValue.values;
  const d1 = DateTime.unsafeFromDate(filterVals[0]);
  const d2 = DateTime.unsafeFromDate(filterVals[1]);

  const value = DateTime.unsafeFromDate(inputData);

  switch (filterValue.operator) {
    case "is":
      return DateTime.getPart(value, "day") === DateTime.getPart(d1, "day");
    case "is not":
      return DateTime.getPart(value, "day") !== DateTime.getPart(d1, "day");
    case "is before":
      return DateTime.lessThan(value, DateTime.startOf(d1, "day"));
    case "is on or after":
      return DateTime.greaterThanOrEqualTo(value, DateTime.startOf(d1, "day"));
    case "is after":
      return DateTime.greaterThan(value, DateTime.startOf(d1, "day"));
    case "is on or before":
      return DateTime.lessThanOrEqualTo(value, DateTime.startOf(d1, "day"));
    case "is between":
      return DateTime.between(value, {
        minimum: DateTime.startOf(d1, "day"),
        maximum: DateTime.endOf(d2, "day"),
      });
    case "is not between":
      return !DateTime.between(value, {
        minimum: DateTime.startOf(d1, "day"),
        maximum: DateTime.endOf(d2, "day"),
      });
  }
}

export function textFilterFn<_TData>(inputData: string, filterValue: FilterModel<"text">) {
  if (!filterValue || filterValue.values.length === 0) return true;

  const value = inputData.toLowerCase().trim();
  const filterStr = filterValue.values[0].toLowerCase().trim();

  if (filterStr === "") return true;

  const found = value.includes(filterStr);

  switch (filterValue.operator) {
    case "contains":
      return found;
    case "does not contain":
      return !found;
  }
}

export function numberFilterFn<_TData>(inputData: number, filterValue: FilterModel<"number">) {
  if (!filterValue || !filterValue.values || filterValue.values.length === 0) {
    return true;
  }

  const value = inputData;
  const filterVal = filterValue.values[0];

  switch (filterValue.operator) {
    case "is":
      return value === filterVal;
    case "is not":
      return value !== filterVal;
    case "is greater than":
      return value > filterVal;
    case "is greater than or equal to":
      return value >= filterVal;
    case "is less than":
      return value < filterVal;
    case "is less than or equal to":
      return value <= filterVal;
    case "is between": {
      const lowerBound = filterValue.values[0];
      const upperBound = filterValue.values[1];
      return value >= lowerBound && value <= upperBound;
    }
    case "is not between": {
      const lowerBound = filterValue.values[0];
      const upperBound = filterValue.values[1];
      return value < lowerBound || value > upperBound;
    }
    default:
      return true;
  }
}
