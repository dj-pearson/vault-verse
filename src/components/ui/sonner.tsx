import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Accessible toast notification component.
 *
 * WCAG 2.1 Success Criterion 4.1.3 - Status Messages (Level AA)
 *
 * Sonner provides built-in ARIA live region support. This wrapper ensures
 * consistent styling and accessibility across the application.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Accessibility: Ensure toasts are announced to screen readers
      // Sonner uses role="status" and aria-live="polite" by default
      // Use aria-live="assertive" for error toasts
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:border-destructive group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground",
          success: "group-[.toaster]:border-green-500",
        },
        // Ensure adequate time for screen reader users to hear the message
        duration: 5000,
      }}
      // Close button for keyboard users
      closeButton
      // Accessibility: Ensure focus management doesn't interfere with user actions
      pauseWhenPageIsHidden
      {...props}
    />
  );
};

export { Toaster, toast };
