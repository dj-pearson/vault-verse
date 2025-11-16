import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useSecurityLeaks,
  useResolveSecurityLeak,
  useEnvScans,
  useOpenEnvFindings,
  useUpdateFindingStatus,
  useRunSecurityScan,
  useSecurityStats,
} from '@/hooks/useSecurity';
import { format } from 'date-fns';

export const AdminSecurity = () => {
  const { data: leaks, isLoading: leaksLoading } = useSecurityLeaks(100);
  const { data: scans, isLoading: scansLoading } = useEnvScans(50);
  const { data: findings, isLoading: findingsLoading } = useOpenEnvFindings();
  const { data: stats } = useSecurityStats();
  const resolveLeakMutation = useResolveSecurityLeak();
  const updateFindingMutation = useUpdateFindingStatus();
  const runScanMutation = useRunSecurityScan();

  const [selectedLeak, setSelectedLeak] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolveLeak = async () => {
    if (selectedLeak && resolutionNotes) {
      await resolveLeakMutation.mutateAsync({
        id: selectedLeak,
        notes: resolutionNotes,
      });
      setSelectedLeak(null);
      setResolutionNotes('');
    }
  };

  const handleResolveFinding = async (id: string) => {
    await updateFindingMutation.mutateAsync({ id, status: 'resolved' });
  };

  const handleAcknowledgeFinding = async (id: string) => {
    await updateFindingMutation.mutateAsync({ id, status: 'acknowledged' });
  };

  const handleRunScan = async () => {
    if (confirm('Run a full security scan? This may take a few moments.')) {
      try {
        await runScanMutation.mutateAsync();
        alert('Security scan completed successfully!');
      } catch (error) {
        console.error('Scan error:', error);
        alert('Security scan failed. Please check the console for details.');
      }
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive'; className: string }
    > = {
      critical: { variant: 'destructive', className: 'bg-red-600' },
      high: { variant: 'destructive', className: 'bg-orange-600' },
      medium: { variant: 'default', className: 'bg-yellow-600' },
      low: { variant: 'secondary', className: 'bg-blue-600' },
    };

    const config = variants[severity] || variants.low;

    return (
      <Badge variant={config.variant} className={config.className}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const icons = {
      open: <AlertTriangle className="h-3 w-3 mr-1" />,
      acknowledged: <Shield className="h-3 w-3 mr-1" />,
      resolved: <CheckCircle className="h-3 w-3 mr-1" />,
      false_positive: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="outline" className="flex items-center">
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor database leaks and environment variable exposures
          </p>
        </div>
        <Button onClick={handleRunScan} disabled={runScanMutation.isPending}>
          <PlayCircle className="mr-2 h-4 w-4" />
          {runScanMutation.isPending ? 'Running Scan...' : 'Run Security Scan'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Leaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeaks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Leaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.criticalLeaks || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openFindings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.resolvedFindings || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leaks" className="w-full">
        <TabsList>
          <TabsTrigger value="leaks">Database Leaks</TabsTrigger>
          <TabsTrigger value="findings">Environment Findings</TabsTrigger>
          <TabsTrigger value="scans">Scan History</TabsTrigger>
        </TabsList>

        {/* Database Leaks */}
        <TabsContent value="leaks">
          <Card>
            <CardHeader>
              <CardTitle>Database Leak Detections</CardTitle>
              <CardDescription>
                Potential database security issues and data leaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaksLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaks?.map((leak) => (
                      <TableRow key={leak.id}>
                        <TableCell>{getSeverityBadge(leak.severity)}</TableCell>
                        <TableCell className="capitalize">
                          {leak.detection_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="max-w-md">{leak.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {leak.source}
                        </TableCell>
                        <TableCell>
                          {format(new Date(leak.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {leak.resolved_at ? (
                            <Badge variant="outline" className="text-green-600">
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              Open
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!leak.resolved_at && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedLeak(leak.id)}
                                >
                                  Resolve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Security Leak</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Resolution Notes</Label>
                                    <Textarea
                                      placeholder="Describe how this issue was resolved..."
                                      value={resolutionNotes}
                                      onChange={(e) =>
                                        setResolutionNotes(e.target.value)
                                      }
                                      rows={4}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleResolveLeak}
                                    disabled={!resolutionNotes}
                                  >
                                    Mark as Resolved
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {leaks?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                            <p className="text-muted-foreground">
                              No database leaks detected
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Findings */}
        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variable Findings</CardTitle>
              <CardDescription>
                Potential exposure of environment variables and secrets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {findingsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Variable</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings?.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{getSeverityBadge(finding.severity)}</TableCell>
                        <TableCell className="capitalize">
                          {finding.finding_type.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {finding.variable_name}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {finding.description}
                        </TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">
                          {finding.recommendation}
                        </TableCell>
                        <TableCell>{getStatusBadge(finding.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {finding.status === 'open' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleAcknowledgeFinding(finding.id)
                                  }
                                >
                                  Acknowledge
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleResolveFinding(finding.id)}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {findings?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                            <p className="text-muted-foreground">
                              No open findings. Great job!
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan History */}
        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle>Security Scan History</CardTitle>
              <CardDescription>
                History of automated and manual security scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Findings</TableHead>
                      <TableHead>Critical</TableHead>
                      <TableHead>High</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans?.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="capitalize">
                          {scan.scan_type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              scan.status === 'completed'
                                ? 'default'
                                : scan.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{scan.findings_count}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {scan.critical_findings_count}
                        </TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          {scan.high_findings_count}
                        </TableCell>
                        <TableCell>
                          {format(new Date(scan.started_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {scan.completed_at
                            ? format(new Date(scan.completed_at), 'MMM d, yyyy HH:mm')
                            : 'In progress'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {scans?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No scans run yet. Click "Run Security Scan" to start.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
