import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface UsageDataPoint {
  date: string;
  value: number;
}

interface UsageChartProps {
  title: string;
  data: UsageDataPoint[];
  maxValue: number;
  currentValue: number;
  unit?: string;
  showTrend?: boolean;
}

export const UsageChart = ({
  title,
  data,
  maxValue,
  currentValue,
  unit = '',
  showTrend = true,
}: UsageChartProps) => {
  // Calculate trend (comparing last value with average of previous values)
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 };

    const previousAvg = data.slice(0, -1).reduce((sum, d) => sum + d.value, 0) / (data.length - 1);
    const lastValue = data[data.length - 1].value;
    const change = ((lastValue - previousAvg) / previousAvg) * 100;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change),
    };
  };

  const trend = calculateTrend();

  // Get max value for scaling
  const chartMax = Math.max(...data.map(d => d.value), maxValue * 0.8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>Last {data.length} days</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {currentValue}{unit}
            </div>
            <div className="text-sm text-muted-foreground">
              of {maxValue === -1 ? '∞' : `${maxValue}${unit}`}
            </div>
          </div>
        </div>
        {showTrend && trend.direction !== 'neutral' && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-orange-600' : 'text-green-600'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.percentage.toFixed(1)}% from average</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-end gap-1">
          {data.map((point, index) => {
            const height = chartMax > 0 ? (point.value / chartMax) * 100 : 0;
            const isLast = index === data.length - 1;

            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="relative flex-1 w-full flex items-end">
                  <div
                    className={`w-full transition-all rounded-t ${
                      isLast
                        ? 'bg-primary'
                        : 'bg-primary/50 group-hover:bg-primary/70'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                      {point.value}{unit}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage percentage bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {maxValue === -1
                ? 'Unlimited'
                : `${((currentValue / maxValue) * 100).toFixed(1)}%`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                maxValue === -1
                  ? 'bg-primary/30'
                  : currentValue / maxValue < 0.7
                  ? 'bg-primary'
                  : currentValue / maxValue < 0.9
                  ? 'bg-orange-500'
                  : 'bg-destructive'
              }`}
              style={{
                width: maxValue === -1 ? '0%' : `${Math.min((currentValue / maxValue) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
