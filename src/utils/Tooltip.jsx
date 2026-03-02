import React, {useState, useRef, useEffect, useCallback} from "react";
import {createPortal} from "react-dom";
import Transition from "../utils/Transition";

const VIEWPORT_PADDING = 8;
const TOOLTIP_GAP = 8;

/** Estimated tooltip heights by size (used when measuring not yet available). */
const ESTIMATED_HEIGHTS = {xl: 140, lg: 64, md: 48, sm: 36, default: 48};

function Tooltip({children, className, bg, size, position, content}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [coords, setCoords] = useState({top: 0, left: 0});
  const [effectivePosition, setEffectivePosition] = useState("bottom");
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const isVertical = position === "bottom" || position === "top" || !position;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !content) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight =
      ESTIMATED_HEIGHTS[size] ?? ESTIMATED_HEIGHTS.default;
    const measuredHeight = tooltipRef.current?.offsetHeight ?? 0;
    const height = measuredHeight > 0 ? measuredHeight : estimatedHeight;

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const minTop = VIEWPORT_PADDING;
    const maxTop = viewportHeight - height - VIEWPORT_PADDING;

    if (isVertical) {
      const preferAbove = position === "top";
      let placeAbove;
      if (preferAbove) {
        placeAbove = spaceAbove >= height || spaceBelow < height;
      } else {
        /* When not enough space below, render above. When both spaces are
           tight, prefer whichever has more room (e.g. bottom-most elements). */
        placeAbove =
          (spaceBelow < height && spaceAbove >= height) ||
          (spaceBelow < height && spaceAbove > spaceBelow);
      }

      let top;
      const left = rect.left + rect.width / 2;
      if (placeAbove) {
        top = rect.top - height - TOOLTIP_GAP;
        setEffectivePosition("top");
      } else {
        top = rect.bottom + TOOLTIP_GAP;
        setEffectivePosition("bottom");
      }
      top = Math.max(minTop, Math.min(maxTop, top));
      setCoords({top, left});
    }
  }, [content, position, size, isVertical]);

  useEffect(() => {
    if (!tooltipOpen || !isVertical) return;
    updatePosition();
    const raf = requestAnimationFrame(() => {
      updatePosition();
      requestAnimationFrame(updatePosition);
    });
    const el = tooltipRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tooltipOpen, isVertical, updatePosition]);

  const handleEnter = () => {
    setTooltipOpen(true);
  };

  const handleLeave = () => {
    setTooltipOpen(false);
  };

  const positionOuterClasses = (pos) => {
    if (!isVertical) {
      switch (pos) {
        case "right":
          return "left-full top-1/2 -translate-y-1/2";
        case "left":
          return "right-full top-1/2 -translate-y-1/2";
        default:
          return "top-full left-1/2 -translate-x-1/2";
      }
    }
    return null;
  };

  const sizeClasses = (s) => {
    switch (s) {
      case "xl":
        return "min-w-64 max-w-sm px-4 py-2 text-sm";
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

  const colorClasses = (b) => {
    switch (b) {
      case "light":
        return "bg-white text-gray-600 border-gray-200";
      case "dark":
        return "bg-gray-800 text-gray-100 border-gray-700/60";
      default:
        return "text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700/60";
    }
  };

  const positionInnerClasses = (pos) => {
    switch (pos) {
      case "right":
        return "ml-2";
      case "left":
        return "mr-2";
      case "top":
        return "mb-2";
      case "bottom":
      default:
        return "mt-2";
    }
  };

  const tooltipContent = content && (
    <Transition
      show={tooltipOpen}
      tag="div"
      className={`rounded-lg border overflow-hidden shadow-lg ${sizeClasses(
        size,
      )} ${colorClasses(bg)} ${positionInnerClasses(effectivePosition)}`}
      enter="transition ease-out duration-200 transform"
      enterStart="opacity-0 -translate-y-2"
      enterEnd="opacity-100 translate-y-0"
      leave="transition ease-out duration-200"
      leaveStart="opacity-100"
      leaveEnd="opacity-0"
    >
      <div ref={tooltipRef}>{content}</div>
    </Transition>
  );

  return (
    <div
      ref={triggerRef}
      className={`pl-2 relative inline-block ${className || ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
      {content &&
        (isVertical ? (
          createPortal(
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{
                top: coords.top,
                left: coords.left,
                transform: "translateX(-50%)",
              }}
            >
              {tooltipContent}
            </div>,
            document.body,
          )
        ) : (
          <div className={`z-10 absolute ${positionOuterClasses(position)}`}>
            {tooltipContent}
          </div>
        ))}
    </div>
  );
}

export default Tooltip;
