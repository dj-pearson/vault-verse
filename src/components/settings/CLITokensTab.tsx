import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useCLITokens, useGenerateCLIToken, useRevokeCLIToken } from '@/hooks/useCLITokens';
import { Plus, Trash2, Copy, Check, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const CLITokensTab = () => {
  const { data: tokens, isLoading } = useCLITokens();
  const generateToken = useGenerateCLIToken();
  const revokeToken = useRevokeCLIToken();

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [newTokenData, setNewTokenData] = useState<{ name: string; expiresInDays: number }>({
    name: '',
    expiresInDays: 90,
  });
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleGenerateToken = async () => {
    if (!newTokenData.name) {
      toast({
        title: 'Validation Error',
        description: 'Token name is required',
        variant: 'destructive',
      });
      return;
    }

    const result = await generateToken.mutateAsync(newTokenData);
    setGeneratedToken(result.token);
    setNewTokenData({ name: '', expiresInDays: 90 });
  };

  const handleRevokeToken = async () => {
    if (!tokenToRevoke) return;
    await revokeToken.mutateAsync(tokenToRevoke);
    setTokenToRevoke(null);
  };

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    toast({
      title: 'Copied',
      description: 'Token copied to clipboard',
    });
  };

  const closeGenerateDialog = () => {
    setIsGenerateDialogOpen(false);
    setGeneratedToken(null);
    setCopiedToken(false);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading CLI tokens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">CLI Tokens</h2>
          <p className="text-muted-foreground">
            Manage access tokens for the EnvVault CLI
          </p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {generatedToken ? 'Token Generated' : 'Generate CLI Token'}
              </DialogTitle>
              <DialogDescription>
                {generatedToken
                  ? 'Save this token securely - it will not be shown again!'
                  : 'Create a new access token for the EnvVault CLI'}
              </DialogDescription>
            </DialogHeader>

            {generatedToken ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">{generatedToken}</p>
                </div>
                <Button
                  onClick={() => copyToken(generatedToken)}
                  className="w-full"
                  variant="outline"
                >
                  {copiedToken ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Token
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    placeholder="e.g., My Laptop, CI/CD Pipeline"
                    value={newTokenData.name}
                    onChange={(e) =>
                      setNewTokenData({ ...newTokenData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires-in">Expires In (days)</Label>
                  <Input
                    id="expires-in"
                    type="number"
                    min={1}
                    max={365}
                    value={newTokenData.expiresInDays}
                    onChange={(e) =>
                      setNewTokenData({
                        ...newTokenData,
                        expiresInDays: parseInt(e.target.value) || 90,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Token will be valid for {newTokenData.expiresInDays} days
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              {generatedToken ? (
                <Button onClick={closeGenerateDialog}>Done</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={closeGenerateDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateToken} disabled={generateToken.isPending}>
                    {generateToken.isPending ? 'Generating...' : 'Generate'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!tokens || tokens.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No CLI tokens yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Generate your first token to use with the EnvVault CLI
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    {token.last_used_at
                      ? format(new Date(token.last_used_at), 'MMM d, yyyy')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {token.expires_at
                      ? format(new Date(token.expires_at), 'MMM d, yyyy')
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(token.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTokenToRevoke(token.id)}
                      title="Revoke token"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!tokenToRevoke} onOpenChange={() => setTokenToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Token</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke the CLI token. Any scripts or applications using
              this token will stop working. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeToken}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revoke Token
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
