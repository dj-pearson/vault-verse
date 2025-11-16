import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectAuditTabProps {
  projectId: string;
}

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: any;
  created_at: string;
  user_id: string | null;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export const ProjectAuditTab = ({ projectId }: ProjectAuditTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map((log) => log.user_id).filter(Boolean))] as string[];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]));

        return data.map((log) => ({
          ...log,
          profiles: log.user_id ? profileMap.get(log.user_id) : undefined,
        })) as AuditLog[];
      }

      return data.map((log) => ({ ...log, profiles: undefined })) as AuditLog[];
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      created: 'default',
      updated: 'secondary',
      deleted: 'destructive',
    };

    return (
      <Badge variant={variants[action] || 'secondary'} className="capitalize">
        {action}
      </Badge>
    );
  };

  const getResourceIcon = (resourceType: string) => {
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const exportToCSV = () => {
    if (!filteredLogs) return;

    const headers = ['Date', 'User', 'Action', 'Resource Type', 'Details'];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.profiles?.email || 'System',
      log.action,
      log.resource_type,
      JSON.stringify(log.metadata),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${projectId}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Track all changes and actions in this project
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={!filteredLogs?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, resource, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log List */}
        {isLoading ? (
          <div className="text-center py-12">Loading audit logs...</div>
        ) : filteredLogs && filteredLogs.length > 0 ? (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getResourceIcon(log.resource_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActionBadge(log.action)}
                    <span className="font-medium capitalize">
                      {log.resource_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    by {log.profiles?.full_name || log.profiles?.email || 'System'} •{' '}
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                  {log.metadata && (
                    <div className="mt-2 text-sm">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <span key={key} className="text-muted-foreground">
                          {key}: <span className="font-mono">{String(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No audit logs found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Activity will appear here as changes are made
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
