import React, { useState, useRef } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingArrow,
  FloatingPortal, // <--- 1. Import this
} from "@floating-ui/react";

export default function InfoTooltip({
  content = "Information",
  iconSize = 20,
  className = "text-red-950 hover:text-red-500",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip(),
      shift(),
      arrow({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      {/* Trigger Icon */}
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`flex items-center cursor-pointer transition-colors outline-none ${className}`}
      >
        <IoMdInformationCircleOutline size={iconSize} />
      </span>

      {/* 2. Wrap the popup in FloatingPortal */}
      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="
              z-[9999] /* High Z-Index ensuring it's on top of everything */
              w-max max-w-[200px]
              p-2
              bg-slate-800 text-white text-xs rounded-lg shadow-xl
              whitespace-normal text-center leading-tight
            "
          >
            {content}
            <FloatingArrow 
              ref={arrowRef} 
              context={context} 
              fill="#1e293b" 
              height={8}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}