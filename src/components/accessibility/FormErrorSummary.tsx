import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormError {
  field: string;
  message: string;
  fieldId?: string;
}

interface FormErrorSummaryProps {
  /** Array of form errors to display */
  errors: FormError[];
  /** Custom title for the error summary */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to auto-focus the summary when errors appear */
  autoFocus?: boolean;
}

/**
 * FormErrorSummary component for accessible error reporting.
 *
 * WCAG 2.1 Success Criteria:
 * - 3.3.1 Error Identification (Level A)
 * - 3.3.3 Error Suggestion (Level AA)
 * - 4.1.3 Status Messages (Level AA)
 *
 * Provides a summary of form errors that:
 * - Is announced to screen readers via aria-live
 * - Links to the invalid fields
 * - Auto-focuses when errors appear
 */
export function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
  className,
  autoFocus = true,
}: FormErrorSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  // Auto-focus the error summary when errors appear
  useEffect(() => {
    if (errors.length > 0 && autoFocus && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errors, autoFocus]);

  if (errors.length === 0) {
    return null;
  }

  const handleErrorClick = (fieldId?: string) => {
    if (fieldId) {
      const field = document.getElementById(fieldId);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div
      ref={summaryRef}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={-1}
      className={cn(
        "rounded-lg border border-destructive bg-destructive/10 p-4",
        "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-destructive">
            {title}
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-destructive">
                {error.fieldId ? (
                  <button
                    type="button"
                    onClick={() => handleErrorClick(error.fieldId)}
                    className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  >
                    {error.field}: {error.message}
                  </button>
                ) : (
                  <span>
                    {error.field}: {error.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to convert react-hook-form errors to FormError array.
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm();
 * const formErrors = useFormErrors(errors, {
 *   email: { label: "Email", fieldId: "email-input" },
 *   password: { label: "Password", fieldId: "password-input" },
 * });
 *
 * return (
 *   <form>
 *     <FormErrorSummary errors={formErrors} />
 *     ...
 *   </form>
 * );
 * ```
 */
export function convertFormErrors(
  errors: Record<string, { message?: string }>,
  fieldConfig: Record<string, { label: string; fieldId?: string }>
): FormError[] {
  return Object.entries(errors)
    .filter(([, error]) => error?.message)
    .map(([key, error]) => ({
      field: fieldConfig[key]?.label || key,
      message: error.message || "Invalid value",
      fieldId: fieldConfig[key]?.fieldId,
    }));
}

/**
 * Inline form field error message with proper accessibility attributes.
 */
interface FieldErrorProps {
  /** Error message to display */
  message?: string;
  /** ID of the associated field (for aria-describedby) */
  fieldId: string;
  /** Additional CSS classes */
  className?: string;
}

export function FieldError({ message, fieldId, className }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={`${fieldId}-error`}
      role="alert"
      aria-live="polite"
      className={cn("text-sm text-destructive mt-1", className)}
    >
      {message}
    </p>
  );
}

export default FormErrorSummary;
