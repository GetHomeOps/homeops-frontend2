import * as React from "react";
import { format, parse, isValid, isSameDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "../lib/utils";

/**
 * Parse a date string (YYYY-MM-DD or ISO 8601) into a Date, or undefined if invalid.
 */
function parseDateValue(value) {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
  if (isValid(parsed)) return parsed;
  const iso = new Date(trimmed);
  return isValid(iso) ? iso : undefined;
}

/**
 * Date picker input that uses Popover + Calendar (react-day-picker).
 * Value format: YYYY-MM-DD (accepts ISO strings for display).
 * Select a date to set it; click the selected date again to clear.
 */
export default function DatePickerInput({
  name,
  value,
  onChange,
  className = "form-input w-full",
  placeholder = "",
  disabled = false,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => parseDateValue(value), [value]);

  const displayValue = React.useMemo(() => {
    if (!dateValue) return "";
    return format(dateValue, "dd/MM/yyyy");
  }, [dateValue]);

  const handleSelect = (date) => {
    if (!date) return;
    // Click selected date again = clear
    if (dateValue && isSameDay(date, dateValue)) {
      onChange?.({ target: { name, value: "" } });
    } else {
      onChange?.({ target: { name, value: format(date, "yyyy-MM-dd") } });
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(o) => !disabled && setOpen(o)}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative",
            disabled
              ? "cursor-not-allowed opacity-60 pointer-events-none"
              : "cursor-pointer"
          )}
        >
          <input
            type="text"
            readOnly
            name={name}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "form-input w-full pr-9",
              disabled && "cursor-not-allowed",
              className
            )}
            style={props.style}
            aria-expanded={open}
          />
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-gray-400 dark:text-gray-500"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
            <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
          </svg>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={8}
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={dateValue ?? new Date()}
          initialFocus
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
}
