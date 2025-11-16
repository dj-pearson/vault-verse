import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const UsageLimitsBadge = () => {
  const { usageCheck, subscription } = useSubscription();

  if (!usageCheck || !subscription) return null;

  const isExceeded = usageCheck.usage.exceeds_limits;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={isExceeded ? "destructive" : "secondary"}>
          {subscription.plan.toUpperCase()} Plan
        </Badge>
        <span className="text-sm text-muted-foreground">
          {usageCheck.usage.projects} / {usageCheck.limits.projects === -1 ? "∞" : usageCheck.limits.projects} projects
        </span>
      </div>
      
      {isExceeded && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've exceeded your plan limits. Upgrade to continue adding resources.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
