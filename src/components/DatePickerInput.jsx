import * as React from "react";
import {format, parse, isValid} from "date-fns";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {Calendar} from "./ui/calendar";
import {cn} from "../lib/utils";

/**
 * Date picker input that uses Popover + Calendar (react-day-picker).
 * Keeps the same input field appearance (form-input) but shows a styled calendar dropdown.
 * Value format: YYYY-MM-DD
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

  const dateValue = React.useMemo(() => {
    if (!value || typeof value !== "string") return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Display in dd/MM/yyyy format for user-friendly display
  const displayValue = React.useMemo(() => {
    if (!dateValue) return "";
    return format(dateValue, "dd/MM/yyyy");
  }, [dateValue]);

  const handleSelect = (date) => {
    if (!date) return;
    const formatted = format(date, "yyyy-MM-dd");
    onChange?.({target: {name, value: formatted}});
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
          defaultMonth={dateValue}
          initialFocus
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
}
