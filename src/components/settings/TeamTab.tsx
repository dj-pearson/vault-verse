import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const TeamTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Team Management</h2>
        <p className="text-muted-foreground">Manage team members and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Team management is project-specific. Go to a project's settings to manage team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Team members are managed at the project level</p>
            <p className="text-sm mt-2">
              Navigate to a project and click on "Team" to invite and manage members
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
