import { useState, useRef, useMemo, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSecrets, useUpsertSecret, useDeleteSecret } from '@/hooks/useSecrets';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Eye, EyeOff, Plus, Trash2, Copy, Check, Upload, Download, MoreVertical, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecretManagerProps {
  environmentId: string;
  environmentName: string;
  canEdit?: boolean;
}

export const SecretManager = memo(function SecretManager({ environmentId, environmentName, canEdit = true }: SecretManagerProps) {
  const { data: secrets, isLoading } = useSecrets(environmentId);
  const upsertSecret = useUpsertSecret();
  const deleteSecret = useDeleteSecret();
  const { checkCanAddSecret } = usePlanLimits();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [secretToDelete, setSecretToDelete] = useState<{ id: string; key: string } | null>(null);
  const [selectedSecrets, setSelectedSecrets] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSecret, setNewSecret] = useState({
    key: '',
    value: '',
    description: '',
  });

  // Filter secrets based on search term
  const filteredSecrets = useMemo(() => {
    if (!secrets) return [];
    if (!searchTerm.trim()) return secrets;

    const search = searchTerm.toLowerCase();
    return secrets.filter(secret =>
      secret.key.toLowerCase().includes(search) ||
      secret.description?.toLowerCase().includes(search)
    );
  }, [secrets, searchTerm]);

  const handleAddSecret = async () => {
    if (!newSecret.key || !newSecret.value) {
      toast({
        title: 'Validation Error',
        description: 'Key and value are required',
        variant: 'destructive',
      });
      return;
    }

    // Validate key format (alphanumeric and underscores only)
    if (!/^[A-Z][A-Z0-9_]*$/.test(newSecret.key)) {
      toast({
        title: 'Invalid Key',
        description: 'Key must start with a letter and contain only uppercase letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    // Check if adding a new secret (not updating existing)
    const isNewSecret = !secrets?.some(s => s.key === newSecret.key);
    if (isNewSecret && !checkCanAddSecret(secrets?.length || 0)) {
      return;
    }

    await upsertSecret.mutateAsync({
      environmentId,
      key: newSecret.key,
      value: newSecret.value,
      description: newSecret.description,
    });

    setNewSecret({ key: '', value: '', description: '' });
    setIsAddDialogOpen(false);
  };

  const handleDeleteSecret = async () => {
    if (!secretToDelete) return;

    await deleteSecret.mutateAsync({
      secretId: secretToDelete.id,
      environmentId,
    });

    setSecretToDelete(null);
  };

  const handleBulkDelete = async () => {
    if (selectedSecrets.size === 0) return;

    const secretsToDelete = secrets?.filter(s => selectedSecrets.has(s.id)) || [];

    for (const secret of secretsToDelete) {
      await deleteSecret.mutateAsync({
        secretId: secret.id,
        environmentId,
      });
    }

    setSelectedSecrets(new Set());
    setBulkDeleteConfirm(false);
    toast({
      title: 'Success',
      description: `Deleted ${secretsToDelete.length} variable(s)`,
    });
  };

  const handleExport = (format: 'csv' | 'json' | 'yaml' | 'env') => {
    if (!secrets || secrets.length === 0) {
      toast({
        title: 'No Data',
        description: 'No secrets to export',
        variant: 'destructive',
      });
      return;
    }

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        // CSV format
        content = [
          ['KEY', 'VALUE'].join(','),
          ...secrets.map(s => [
            s.key,
            `"${s.value.replace(/"/g, '""')}"`, // Escape quotes
          ].join(','))
        ].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;

      case 'json':
        // JSON format
        const jsonObj = secrets.reduce((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {} as Record<string, string>);
        content = JSON.stringify(jsonObj, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;

      case 'yaml':
        // YAML format
        content = secrets.map(s => {
          // Escape special characters in values
          const needsQuotes = /[:#@&*!|>'"{}[\],]/.test(s.value) || s.value.trim() !== s.value;
          const value = needsQuotes ? `"${s.value.replace(/"/g, '\\"')}"` : s.value;
          return `${s.key}: ${value}`;
        }).join('\n');
        mimeType = 'text/yaml';
        extension = 'yaml';
        break;

      case 'env':
        // .env format
        content = secrets.map(s => {
          // Escape quotes and wrap in quotes if value contains spaces or special chars
          const needsQuotes = /[\s#]/.test(s.value);
          const value = needsQuotes ? `"${s.value.replace(/"/g, '\\"')}"` : s.value;
          return `${s.key}=${value}`;
        }).join('\n');
        mimeType = 'text/plain';
        extension = 'env';
        break;
    }

    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${environmentName}-secrets-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `Exported ${secrets.length} variable(s) as ${format.toUpperCase()}`,
    });
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        // Skip header row
        const dataLines = lines.slice(1);
        const imported: Array<{ key: string; value: string; description: string }> = [];

        for (const line of dataLines) {
          // Simple CSV parser (handles quoted values)
          const matches = line.match(/([^,]*|"[^"]*")/g);
          if (!matches || matches.length < 2) continue;

          const key = matches[0].replace(/"/g, '').trim();
          const value = matches[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          const description = matches[2]?.replace(/^"|"$/g, '').replace(/""/g, '"').trim() || '';

          if (key && value) {
            // Validate key format
            if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
              toast({
                title: 'Invalid Key',
                description: `Skipping invalid key: ${key}`,
                variant: 'destructive',
              });
              continue;
            }

            imported.push({ key, value, description });
          }
        }

        // Import secrets
        let successCount = 0;
        for (const secret of imported) {
          try {
            await upsertSecret.mutateAsync({
              environmentId,
              ...secret,
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to import ${secret.key}:`, error);
          }
        }

        toast({
          title: 'Import Complete',
          description: `Successfully imported ${successCount} out of ${imported.length} variable(s)`,
        });

        setIsImportDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: 'Failed to parse CSV file',
          variant: 'destructive',
        });
      }
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleSecretVisibility = useCallback((key: string) => {
    setVisibleSecrets(prev => {
      const newVisible = new Set(prev);
      if (newVisible.has(key)) {
        newVisible.delete(key);
      } else {
        newVisible.add(key);
      }
      return newVisible;
    });
  }, []);

  const toggleSecretSelection = useCallback((id: string) => {
    setSelectedSecrets(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const toggleSelectAll = () => {
    if (selectedSecrets.size === filteredSecrets.length && filteredSecrets.length > 0) {
      setSelectedSecrets(new Set());
    } else {
      setSelectedSecrets(new Set(filteredSecrets.map(s => s.id)));
    }
  };

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: 'Copied',
      description: 'Value copied to clipboard',
    });
  }, []);

  const maskValue = (value: string) => {
    if (value.length <= 4) return '***';
    return value.substring(0, 4) + '*'.repeat(value.length - 4);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8" role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading environment variables</span>
        Loading secrets...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Environment Variables</h3>
          <p className="text-sm text-muted-foreground">
            Manage variables for <span className="font-medium">{environmentName}</span> environment
            {searchTerm && ` • ${filteredSecrets.length} of ${secrets?.length || 0} shown`}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {selectedSecrets.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteConfirm(true)}
                aria-label={`Delete ${selectedSecrets.size} selected variables`}
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete Selected ({selectedSecrets.size})
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Bulk actions menu">
                  <MoreVertical className="h-4 w-4 mr-2" aria-hidden="true" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                  Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')} disabled={!secrets || secrets.length === 0}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')} disabled={!secrets || secrets.length === 0}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('yaml')} disabled={!secrets || secrets.length === 0}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as YAML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('env')} disabled={!secrets || secrets.length === 0}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as .env
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button aria-label="Add new environment variable">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Variable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Environment Variable</DialogTitle>
                  <DialogDescription>
                    Add a new encrypted environment variable to {environmentName}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Key *</Label>
                    <Input
                      id="key"
                      placeholder="DATABASE_URL"
                      value={newSecret.key}
                      onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must start with a letter, uppercase only, use underscores
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="password"
                      placeholder="postgres://..."
                      value={newSecret.value}
                      onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      id="description"
                      placeholder="Database connection string"
                      value={newSecret.description}
                      onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSecret} disabled={upsertSecret.isPending}>
                    {upsertSecret.isPending ? 'Adding...' : 'Add Variable'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* CSV Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: KEY, VALUE, DESCRIPTION
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>CSV File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
              />
              <p className="text-xs text-muted-foreground">
                File format: KEY,VALUE,DESCRIPTION (one variable per line)
              </p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <strong>Example CSV:</strong>
              <pre className="mt-2 text-xs overflow-x-auto">
{`KEY,VALUE,DESCRIPTION
DATABASE_URL,"postgres://user:pass@host/db","Production database"
API_KEY,"sk_live_123456","Stripe API key"`}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Bar */}
      {secrets && secrets.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="secret-search" className="sr-only">Search environment variables</label>
          <Input
            id="secret-search"
            placeholder="Search by key or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-describedby="search-results-status"
          />
          <div id="search-results-status" className="sr-only" aria-live="polite" aria-atomic="true">
            {searchTerm && `${filteredSecrets.length} of ${secrets?.length || 0} variables shown`}
          </div>
        </div>
      )}

      {!secrets || secrets.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No environment variables yet</p>
          {canEdit && (
            <p className="text-sm text-muted-foreground mt-2">
              Add your first variable to get started
            </p>
          )}
        </div>
      ) : filteredSecrets.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No variables match your search</p>
          <Button
            variant="link"
            onClick={() => setSearchTerm('')}
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table aria-label={`Environment variables for ${environmentName}`}>
            <caption className="sr-only">
              Environment variables table. {filteredSecrets.length} variables shown.
              Use the action buttons to show, copy, or delete values.
            </caption>
            <TableHeader>
              <TableRow>
                {canEdit && (
                  <TableHead scope="col" className="w-[50px]">
                    <Checkbox
                      checked={selectedSecrets.size === filteredSecrets.length && filteredSecrets.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label={selectedSecrets.size === filteredSecrets.length ? "Deselect all variables" : "Select all variables"}
                    />
                  </TableHead>
                )}
                <TableHead scope="col">Key</TableHead>
                <TableHead scope="col">Value</TableHead>
                <TableHead scope="col" className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSecrets.map((secret) => (
                <TableRow key={secret.id}>
                  {canEdit && (
                    <TableCell>
                      <Checkbox
                        checked={selectedSecrets.has(secret.id)}
                        onCheckedChange={() => toggleSecretSelection(secret.id)}
                        aria-label={`Select ${secret.key}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono font-medium">
                    <span id={`key-${secret.id}`}>{secret.key}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <span aria-live="polite">
                      {visibleSecrets.has(secret.key) ? secret.value : maskValue(secret.value)}
                    </span>
                    <span className="sr-only">
                      {visibleSecrets.has(secret.key) ? 'Value is visible' : 'Value is hidden'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" role="group" aria-label={`Actions for ${secret.key}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSecretVisibility(secret.key)}
                        aria-label={visibleSecrets.has(secret.key) ? `Hide value for ${secret.key}` : `Show value for ${secret.key}`}
                        aria-pressed={visibleSecrets.has(secret.key)}
                      >
                        {visibleSecrets.has(secret.key) ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(secret.value, secret.key)}
                        aria-label={copiedKey === secret.key ? `Copied ${secret.key} to clipboard` : `Copy ${secret.key} value to clipboard`}
                      >
                        {copiedKey === secret.key ? (
                          <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSecretToDelete({ id: secret.id, key: secret.key })}
                          aria-label={`Delete ${secret.key}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog open={!!secretToDelete} onOpenChange={() => setSecretToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-mono font-semibold">{secretToDelete?.key}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSecret}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Variables</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSecrets.size} variable(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedSecrets.size} Variable(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!canEdit && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          ℹ️ <strong>Read-only mode:</strong> Use the CLI to add or modify variables in this environment.
          <pre className="mt-2 bg-background p-2 rounded text-xs overflow-x-auto">
            envault set KEY=value --env {environmentName.toLowerCase()}
          </pre>
        </div>
      )}
    </div>
  );
});
