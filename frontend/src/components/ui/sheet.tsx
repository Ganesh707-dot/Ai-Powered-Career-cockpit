"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;
const SheetTitle = DialogPrimitive.Title;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "bottom";
    hideClose?: boolean;
  }
>(({ side = "left", hideClose, className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[101] flex flex-col bg-background shadow-2xl outline-none",
        "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "left" &&
          "inset-y-0 left-0 h-full w-[min(88vw,300px)] border-r border-sidebar-border bg-sidebar data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        side === "right" &&
          "inset-y-0 right-0 h-full w-[min(88vw,400px)] border-l border-sidebar-border bg-sidebar data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        side === "bottom" &&
          "sheet-bottom inset-x-0 bottom-0 top-auto data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        className
      )}
      {...props}
    >
      {side === "bottom" && (
        <div
          className="mx-auto mt-2.5 mb-0 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/35"
          aria-hidden
        />
      )}
      {children}
      {!hideClose && side !== "bottom" && (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full",
            "bg-muted/80 transition-all duration-200 hover:bg-muted active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

/** Header row for bottom sheets — title + optional close */
function SheetBottomHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div className="sheet-bottom-header">
      <div className="min-w-0 flex-1 pr-2">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mobile-icon-btn shrink-0"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetPortal,
  SheetOverlay,
  SheetTitle,
  SheetBottomHeader,
};
