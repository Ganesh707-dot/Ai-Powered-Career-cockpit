"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: "default" | "lg" | "full";
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, size = "default", children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "modal-shell fixed z-[101] flex flex-col overflow-hidden bg-background shadow-2xl outline-none",
        "duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        /* Phone & tablet: bottom sheet */
        "max-xl:inset-x-0 max-xl:bottom-0 max-xl:top-auto max-xl:modal-shell-bottom",
        "max-xl:data-[state=closed]:slide-out-to-bottom max-xl:data-[state=open]:slide-in-from-bottom",
        /* Desktop: centered */
        "xl:inset-x-auto xl:bottom-auto xl:left-1/2 xl:top-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2",
        "xl:modal-shell-center xl:rounded-xl xl:border xl:border-border/80",
        "xl:data-[state=closed]:zoom-out-95 xl:data-[state=open]:zoom-in-95",
        "xl:data-[state=closed]:slide-out-to-left-1/2 xl:data-[state=closed]:slide-out-to-top-[48%]",
        "xl:data-[state=open]:slide-in-from-left-1/2 xl:data-[state=open]:slide-in-from-top-[48%]",
        size === "default" && "xl:max-w-lg",
        size === "lg" && "xl:max-w-2xl",
        size === "full" && "xl:max-w-3xl",
        className
      )}
      {...props}
    >
      <div
        className="mx-auto mt-2.5 mb-0 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/35 xl:hidden"
        aria-hidden
      />
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-3 top-3 xl:right-4 xl:top-4 z-10",
          "flex h-11 w-11 items-center justify-center rounded-full",
          "bg-muted/90 text-foreground/90 border border-border/50",
          "transition-all duration-200 hover:bg-muted active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-ring"
        )}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("modal-header", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("modal-body", className)} {...props} />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("modal-footer", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base xl:text-lg font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed mt-1", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
