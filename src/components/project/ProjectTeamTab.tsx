import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UserPlus, Trash2, Crown, Shield, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectTeamTabProps {
  projectId: string;
  ownerId: string;
}

export const ProjectTeamTab = ({ projectId, ownerId }: ProjectTeamTabProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState({ email: '', role: 'viewer' });
  const { checkCanInviteTeamMember } = usePlanLimits();

  const isOwner = user?.id === ownerId;

  const { data: owner } = useQuery({
    queryKey: ['owner', ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ownerId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*, profiles(id, email, full_name, avatar_url)')
        .eq('project_id', projectId);

      if (error) throw error;
      return data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // First, find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteData.email)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profiles) throw new Error('User not found with that email');

      // Then add to team
      const { error } = await supabase.from('team_members').insert({
        project_id: projectId,
        user_id: profiles.id,
        role: inviteData.role as any,
        invited_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
      toast({
        title: 'Success',
        description: 'Team member invited successfully',
      });
      setIsInviteDialogOpen(false);
      setInviteData({ email: '', role: 'viewer' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'member':
        return <UserPlus className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleInviteMember = () => {
    // Check plan limits before inviting
    if (!checkCanInviteTeamMember()) {
      return;
    }
    inviteMutation.mutate();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage who has access to this project
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Invite someone to collaborate on this project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="team@example.com"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) =>
                        setInviteData({ ...inviteData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer - Can view secrets</SelectItem>
                        <SelectItem value="member">Member - Can edit secrets</SelectItem>
                        <SelectItem value="admin">Admin - Full access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={inviteMutation.isPending || !inviteData.email}
                  >
                    {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading team members...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Owner */}
                {owner && (
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={owner.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(owner.full_name, owner.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{owner.full_name || owner.email}</p>
                          <p className="text-sm text-muted-foreground">{owner.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-muted-foreground">—</span>
                    </TableCell>
                  </TableRow>
                )}

                {/* Team Members */}
                {teamMembers?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(
                              member.profiles?.full_name,
                              member.profiles?.email
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.profiles?.full_name || member.profiles?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.profiles?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 capitalize">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMemberToRemove(member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the team member's access to this project. They will no
              longer be able to view or manage secrets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMutation.mutate(memberToRemove)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
