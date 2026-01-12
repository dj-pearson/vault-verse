import { useRef, useCallback, useEffect } from "react";

/**
 * Focusable elements selector for DOM queries.
 */
export const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "details>summary:first-of-type",
  "details",
].join(",");

/**
 * Hook for managing focus restoration.
 *
 * WCAG 2.1 Success Criterion 2.4.3 - Focus Order (Level A)
 *
 * @example
 * ```tsx
 * const { saveFocus, restoreFocus } = useFocusReturn();
 *
 * const openModal = () => {
 *   saveFocus();
 *   setModalOpen(true);
 * };
 *
 * const closeModal = () => {
 *   setModalOpen(false);
 *   restoreFocus();
 * };
 * ```
 */
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Hook for creating a focus trap within a container.
 *
 * WCAG 2.1 Success Criterion 2.4.3 - Focus Order (Level A)
 *
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, isOpen);
 *
 * return (
 *   <div ref={dialogRef} role="dialog">
 *     ...
 *   </div>
 * );
 * ```
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element when trap activates
    const focusableElements = container.querySelectorAll<HTMLElement>(
      FOCUSABLE_ELEMENTS
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, isActive]);
}

/**
 * Hook for managing focus on first error in forms.
 *
 * WCAG 2.1 Success Criterion 3.3.1 - Error Identification (Level A)
 *
 * @example
 * ```tsx
 * const { focusFirstError } = useFocusOnError(formRef);
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     await submitForm(data);
 *   } catch (errors) {
 *     focusFirstError();
 *   }
 * };
 * ```
 */
export function useFocusOnError(formRef: React.RefObject<HTMLFormElement>) {
  const focusFirstError = useCallback(() => {
    if (!formRef.current) return;

    // Find the first invalid field
    const invalidField = formRef.current.querySelector<HTMLElement>(
      '[aria-invalid="true"], .error, :invalid'
    );

    if (invalidField) {
      invalidField.focus();
      // Ensure it's visible
      invalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [formRef]);

  return { focusFirstError };
}

/**
 * Hook for keyboard navigation within a list or grid.
 *
 * WCAG 2.1 Success Criterion 2.1.1 - Keyboard (Level A)
 *
 * @example
 * ```tsx
 * const { containerProps, getItemProps } = useRoving(items.length);
 *
 * return (
 *   <ul {...containerProps}>
 *     {items.map((item, index) => (
 *       <li key={item.id} {...getItemProps(index)}>
 *         {item.name}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useRovingTabIndex(itemCount: number) {
  const currentIndexRef = useRef(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = currentIndexRef.current;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          newIndex = (currentIndexRef.current + 1) % itemCount;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          newIndex = (currentIndexRef.current - 1 + itemCount) % itemCount;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
        default:
          return;
      }

      currentIndexRef.current = newIndex;
      itemRefs.current[newIndex]?.focus();
    },
    [itemCount]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: setItemRef(index),
      tabIndex: index === currentIndexRef.current ? 0 : -1,
      onFocus: () => {
        currentIndexRef.current = index;
      },
    }),
    [setItemRef]
  );

  const containerProps = {
    onKeyDown: handleKeyDown,
    role: "listbox" as const,
  };

  return { containerProps, getItemProps };
}

/**
 * Focus the main content area after navigation.
 * Should be called after route changes.
 */
export function focusMainContent() {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    // Make it focusable if not already
    if (!mainContent.hasAttribute("tabindex")) {
      mainContent.setAttribute("tabindex", "-1");
    }
    mainContent.focus({ preventScroll: true });
  }
}

export default useFocusReturn;
