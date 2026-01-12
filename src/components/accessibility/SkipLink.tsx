import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** The ID of the main content element to skip to */
  targetId?: string;
  /** Custom label for the skip link */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SkipLink component for keyboard navigation accessibility.
 * Allows users to skip repetitive navigation and jump directly to main content.
 *
 * WCAG 2.1 Success Criterion 2.4.1 - Bypass Blocks (Level A)
 */
export function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default, visible on focus
        "sr-only focus:not-sr-only",
        // Positioning and styling when focused
        "focus:fixed focus:top-4 focus:left-4 focus:z-[9999]",
        "focus:block focus:px-4 focus:py-2",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "focus:text-sm focus:font-medium",
        // Transition for smooth appearance
        "transition-all duration-150",
        className
      )}
    >
      {label}
    </a>
  );
}

/**
 * Multiple skip links for complex page layouts.
 * Allows users to navigate to different sections of the page.
 */
interface SkipLinksProps {
  links?: Array<{
    targetId: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({
  links = [
    { targetId: "main-content", label: "Skip to main content" },
    { targetId: "main-navigation", label: "Skip to navigation" },
  ],
  className,
}: SkipLinksProps) {
  return (
    <nav
      aria-label="Skip links"
      className={cn("skip-links", className)}
    >
      {links.map((link) => (
        <SkipLink
          key={link.targetId}
          targetId={link.targetId}
          label={link.label}
        />
      ))}
    </nav>
  );
}

export default SkipLink;
