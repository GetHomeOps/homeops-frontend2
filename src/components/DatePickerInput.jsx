import * as React from "react";
import {format, parse, isValid, isSameDay} from "date-fns";
import {X} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover";
import {Calendar} from "./ui/calendar";
import {cn} from "../lib/utils";

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
 *
 * Wrapped in React.memo to prevent the Radix PopperAnchor useLayoutEffect
 * from creating an infinite update loop when the parent re-renders frequently.
 */
const DatePickerInput = React.memo(function DatePickerInput({
  name,
  value,
  onChange,
  className = "form-input w-full",
  placeholder = "",
  disabled = false,
  popoverClassName,
  required,
  style,
}) {
  const [open, setOpen] = React.useState(false);

  // Keep onChange in a ref so the memoized component doesn't need it as a dep
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const dateValue = React.useMemo(() => parseDateValue(value), [value]);

  const defaultMonth = React.useMemo(
    () => dateValue ?? new Date(),
    [dateValue],
  );

  const displayValue = React.useMemo(() => {
    if (!dateValue) return "";
    return format(dateValue, "dd/MM/yyyy");
  }, [dateValue]);

  const handleSelect = React.useCallback(
    (date) => {
      if (!date) return;
      if (dateValue && isSameDay(date, dateValue)) {
        onChangeRef.current?.({target: {name, value: ""}});
      } else {
        onChangeRef.current?.({
          target: {name, value: format(date, "yyyy-MM-dd")},
        });
      }
      setOpen(false);
    },
    [dateValue, name],
  );

  const handleClear = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onChangeRef.current?.({target: {name, value: ""}});
    },
    [name],
  );

  const handleOpenChange = React.useCallback(
    (o) => {
      if (!disabled) setOpen(o);
    },
    [disabled],
  );

  return (
    <Popover open={open && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "relative",
            disabled
              ? "cursor-not-allowed opacity-60 pointer-events-none"
              : "cursor-pointer",
          )}
        >
          <input
            type="text"
            readOnly
            name={name}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              "form-input w-full pr-9",
              disabled && "cursor-not-allowed",
              className,
            )}
            style={style}
            aria-expanded={open}
          />
          {dateValue && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Clear date"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-gray-400 dark:text-gray-500"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
              <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
            </svg>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[280px] p-0", popoverClassName)}
        align="start"
        side="bottom"
        sideOffset={4}
        collisionPadding={8}
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          defaultMonth={defaultMonth}
          initialFocus
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
});

export default DatePickerInput;
