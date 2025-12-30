import React, {useState} from "react";
import Transition from "../utils/Transition";

function Tooltip({children, className, bg, size, position, content}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const positionOuterClasses = (position) => {
    switch (position) {
      case "right":
        return "left-full top-1/2 -translate-y-1/2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2";
      default:
        return "bottom-full left-1/2 -translate-x-1/2";
    }
  };

  const sizeClasses = (size) => {
    switch (size) {
      case "lg":
        return "min-w-32 px-3 py-2 text-sm";
      case "md":
        return "min-w-24 px-3 py-2 text-sm";
      case "sm":
        return "min-w-16 px-3 py-2 text-xs whitespace-nowrap";
      default:
        return "px-3 py-2 text-xs whitespace-nowrap";
    }
  };

  const colorClasses = (bg) => {
    switch (bg) {
      case "light":
        return "bg-white text-gray-600 border-gray-200";
      case "dark":
        return "bg-gray-800 text-gray-100 border-gray-700/60";
      default:
        return "text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700/60";
    }
  };

  const positionInnerClasses = (position) => {
    switch (position) {
      case "right":
        return "ml-2";
      case "left":
        return "mr-2";
      case "bottom":
        return "mt-2";
      default:
        return "mb-2";
    }
  };

  return (
    <div
      className={`pl-2 relative inline-block ${className || ""}`}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      onFocus={() => setTooltipOpen(true)}
      onBlur={() => setTooltipOpen(false)}
    >
      {children}
      {content && (
        <div className={`z-10 absolute ${positionOuterClasses(position)}`}>
          <Transition
            show={tooltipOpen}
            tag="div"
            className={`rounded-lg border overflow-hidden shadow-lg ${sizeClasses(
              size
            )} ${colorClasses(bg)} ${positionInnerClasses(position)}`}
            enter="transition ease-out duration-200 transform"
            enterStart="opacity-0 -translate-y-2"
            enterEnd="opacity-100 translate-y-0"
            leave="transition ease-out duration-200"
            leaveStart="opacity-100"
            leaveEnd="opacity-0"
          >
            {content}
          </Transition>
        </div>
      )}
    </div>
  );
}

export default Tooltip;
