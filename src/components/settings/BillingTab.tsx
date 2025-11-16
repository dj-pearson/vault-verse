import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useBillingHistory } from '@/hooks/useBillingHistory';
import { UsageChart } from '@/components/UsageChart';
import { Check, CreditCard, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

const PLAN_FEATURES = {
  free: [
    '3 projects',
    '10 secrets per project',
    '1 team member',
    '3 environments',
    'CLI access',
    'Community support',
  ],
  team: [
    '10 projects',
    '100 secrets per project',
    '10 team members',
    '3 environments',
    'CLI access',
    'Priority support',
    'Audit logs',
    'Advanced security',
  ],
  enterprise: [
    'Unlimited projects',
    'Unlimited secrets',
    'Unlimited team members',
    'Unlimited environments',
    'CLI access',
    '24/7 dedicated support',
    'Advanced audit logs',
    'SSO & SAML',
    'Custom integrations',
    'SLA guarantee',
  ],
};

export const BillingTab = () => {
  const { subscription, usageCheck, isLoading, updatePlan } = useSubscription();
  const { billingHistory, isLoading: billingLoading } = useBillingHistory();

  if (isLoading) {
    return <div className="text-center py-8">Loading subscription data...</div>;
  }

  const currentPlan = subscription?.plan || 'free';
  const planLimits = usageCheck?.limits;
  const usage = usageCheck?.usage;

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  // Generate mock historical usage data (last 14 days)
  // In production, this would come from the backend
  const generateUsageHistory = (currentValue: number) => {
    const days = 14;
    return Array.from({ length: days }, (_, i) => {
      const daysAgo = days - 1 - i;
      const date = subDays(new Date(), daysAgo).toISOString();
      // Generate realistic fluctuating data around current value
      const variance = currentValue * 0.2; // 20% variance
      const value = Math.max(
        0,
        Math.floor(currentValue + (Math.random() - 0.5) * variance)
      );
      return { date, value };
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the {currentPlan.toUpperCase()} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'} className="mb-2">
                {currentPlan.toUpperCase()}
              </Badge>
              {subscription?.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  Renews on {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
            {currentPlan !== 'enterprise' && (
              <Button onClick={() => currentPlan === 'free' ? updatePlan('team') : updatePlan('enterprise')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            )}
          </div>

          {/* Usage Metrics */}
          {planLimits && usage && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Usage</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Projects</span>
                    <span className="text-muted-foreground">
                      {usage.projects} / {planLimits.projects === -1 ? '∞' : planLimits.projects}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(usage.projects, planLimits.projects)} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Team Members</span>
                    <span className="text-muted-foreground">
                      {usage.team_members} / {planLimits.team_members === -1 ? '∞' : planLimits.team_members}
                    </span>
                  </div>
                  <Progress value={getUsagePercentage(usage.team_members, planLimits.team_members)} />
                </div>
              </div>

              {usage.exceeds_limits && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  You've exceeded your plan limits. Please upgrade to continue.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Charts */}
      {planLimits && usage && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <UsageChart
              title="Projects"
              data={generateUsageHistory(usage.projects)}
              maxValue={planLimits.projects}
              currentValue={usage.projects}
              showTrend={true}
            />
            <UsageChart
              title="Team Members"
              data={generateUsageHistory(usage.team_members)}
              maxValue={planLimits.team_members}
              currentValue={usage.team_members}
              showTrend={true}
            />
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(PLAN_FEATURES).map(([plan, features]) => (
            <Card key={plan} className={currentPlan === plan ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.toUpperCase()}
                  {currentPlan === plan && <Badge>Current</Badge>}
                </CardTitle>
                <CardDescription>
                  {plan === 'free' && '$0/month'}
                  {plan === 'team' && '$29/month'}
                  {plan === 'enterprise' && 'Custom pricing'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {currentPlan !== plan && (
                  <Button
                    className="w-full mt-4"
                    variant={plan === 'enterprise' ? 'outline' : 'default'}
                    onClick={() => updatePlan(plan as any)}
                  >
                    {plan === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      {billingHistory && billingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>View your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {billingLoading ? (
              <div className="text-center py-4">Loading billing history...</div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.invoice_date && format(new Date(record.invoice_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{record.description || 'Subscription'}</TableCell>
                        <TableCell>
                          ${(record.amount / 100).toFixed(2)} {record.currency?.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
