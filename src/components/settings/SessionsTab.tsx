import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Monitor, Smartphone, Tablet, MapPin, Clock, Shield, XCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  user_agent: string;
  ip_address?: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

export const SessionsTab = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        setIsLoading(false);
        return;
      }

      // Currently only tracking the current session
      // Multi-device session tracking requires backend implementation
      const currentSessionData: Session[] = [
        {
          id: currentSession.access_token.substring(0, 16),
          user_agent: navigator.userAgent,
          ip_address: 'Current device',
          last_active: new Date().toISOString(),
          created_at: currentSession.user?.created_at || new Date().toISOString(),
          is_current: true,
        },
      ];

      setSessions(currentSessionData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    setIsRevoking(true);
    try {
      if (sessionToRevoke.is_current) {
        // Sign out current user
        await supabase.auth.signOut();
        toast({
          title: 'Signed Out',
          description: 'You have been signed out',
        });
      } else {
        // In production, call backend API to revoke specific session
        setSessions(sessions.filter(s => s.id !== sessionToRevoke.id));
        toast({
          title: 'Session Revoked',
          description: 'The session has been terminated',
        });
      }
      setSessionToRevoke(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'All Sessions Terminated',
        description: 'You have been signed out from all devices',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const getDeviceName = (userAgent: string) => {
    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = 'Unknown Browser';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // OS detection
    let os = 'Unknown OS';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-muted-foreground">
            View and manage your current session
          </p>
        </div>
        <Button variant="destructive" onClick={handleRevokeAll}>
          <Shield className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Currently showing your active session on this device. Multi-device session tracking is coming soon.
        </AlertDescription>
      </Alert>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active sessions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.user_agent);

            return (
              <Card key={session.id} className={session.is_current ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <DeviceIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {getDeviceName(session.user_agent)}
                          </CardTitle>
                          {session.is_current && (
                            <Badge variant="default">Current Session</Badge>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{session.ip_address || 'Unknown location'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>
                              Last active {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-3 w-3" />
                            <span>
                              Signed in {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionToRevoke(session)}
                    >
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• If you see a session you don't recognize, revoke it immediately</p>
          <p>• Always sign out from public or shared devices</p>
          <p>• Review your active sessions regularly</p>
          <p>• Use strong, unique passwords for your account</p>
        </CardContent>
      </Card>

      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToRevoke?.is_current ? (
                <>
                  This will sign you out of your current session. You'll need to sign in again to continue.
                </>
              ) : (
                <>
                  This will terminate the session on{' '}
                  <span className="font-semibold">
                    {sessionToRevoke && getDeviceName(sessionToRevoke.user_agent)}
                  </span>
                  . This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
