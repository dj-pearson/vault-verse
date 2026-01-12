import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category?: string;
}

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { keys: ["Tab"], description: "Move to next focusable element", category: "Navigation" },
  { keys: ["Shift", "Tab"], description: "Move to previous focusable element", category: "Navigation" },
  { keys: ["Enter"], description: "Activate focused button or link", category: "Navigation" },
  { keys: ["Space"], description: "Toggle checkbox or button", category: "Navigation" },
  { keys: ["Escape"], description: "Close dialog or modal", category: "Navigation" },

  // Application shortcuts
  { keys: ["Ctrl/⌘", "B"], description: "Toggle sidebar", category: "Application" },
  { keys: ["Ctrl/⌘", "K"], description: "Open search", category: "Application" },
  { keys: ["?"], description: "Open keyboard shortcuts help", category: "Application" },

  // Form controls
  { keys: ["↑", "↓"], description: "Navigate dropdown options", category: "Forms" },
  { keys: ["Home"], description: "Go to first option", category: "Forms" },
  { keys: ["End"], description: "Go to last option", category: "Forms" },
];

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show trigger button */
  showTrigger?: boolean;
}

/**
 * Keyboard shortcuts help dialog.
 *
 * WCAG 2.1 Success Criterion 3.3.5 - Help (Level AAA)
 *
 * Provides users with documentation of available keyboard shortcuts.
 */
export function KeyboardShortcutsHelp({
  isOpen: controlledIsOpen,
  onOpenChange,
  showTrigger = true,
}: KeyboardShortcutsHelpProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = onOpenChange ?? setInternalIsOpen;

  // Listen for '?' key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  // Group shortcuts by category
  const groupedShortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    const category = shortcut.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <>
      {showTrigger && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          aria-label="Open keyboard shortcuts help"
          className="gap-2"
        >
          <Keyboard className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Keyboard shortcuts</span>
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" aria-hidden="true" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate and interact with ENVault more efficiently.
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">?</kbd> to open this dialog from anywhere.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <section key={category} aria-labelledby={`shortcuts-${category.toLowerCase()}`}>
                <h3
                  id={`shortcuts-${category.toLowerCase()}`}
                  className="text-sm font-semibold text-foreground mb-3"
                >
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono min-w-[2rem] text-center">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> to navigate between interactive elements,
              and <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to activate them.
              All dialogs can be closed with <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd>.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default KeyboardShortcutsHelp;
