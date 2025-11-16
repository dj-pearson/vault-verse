import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export const usePlanLimits = () => {
  const { subscription, usageCheck } = useSubscription();

  const checkCanCreateProject = (): boolean => {
    if (!usageCheck) return true;

    const { usage, limits } = usageCheck;
    
    if (limits.projects === -1) return true; // Unlimited
    
    if (usage.projects >= limits.projects) {
      toast.error('Project limit reached', {
        description: `You've reached the limit of ${limits.projects} projects on your ${subscription?.plan} plan. Upgrade to create more projects.`,
      });
      return false;
    }

    return true;
  };

  const checkCanAddSecret = (currentCount: number): boolean => {
    if (!usageCheck) return true;

    const { limits } = usageCheck;
    
    if (limits.secrets_per_project === -1) return true; // Unlimited
    
    if (currentCount >= limits.secrets_per_project) {
      toast.error('Secret limit reached', {
        description: `You've reached the limit of ${limits.secrets_per_project} secrets per project on your ${subscription?.plan} plan. Upgrade for more secrets.`,
      });
      return false;
    }

    return true;
  };

  const checkCanInviteTeamMember = (): boolean => {
    if (!usageCheck) return true;

    const { usage, limits } = usageCheck;
    
    if (limits.team_members === -1) return true; // Unlimited
    
    if (usage.team_members >= limits.team_members) {
      toast.error('Team member limit reached', {
        description: `You've reached the limit of ${limits.team_members} team members on your ${subscription?.plan} plan. Upgrade to invite more members.`,
      });
      return false;
    }

    return true;
  };

  const checkCanCreateEnvironment = (currentCount: number): boolean => {
    if (!usageCheck) return true;

    const { limits } = usageCheck;
    
    if (limits.environments === -1) return true; // Unlimited
    
    if (currentCount >= limits.environments) {
      toast.error('Environment limit reached', {
        description: `You've reached the limit of ${limits.environments} environments on your ${subscription?.plan} plan. Upgrade for more environments.`,
      });
      return false;
    }

    return true;
  };

  return {
    checkCanCreateProject,
    checkCanAddSecret,
    checkCanInviteTeamMember,
    checkCanCreateEnvironment,
    limits: usageCheck?.limits,
    usage: usageCheck?.usage,
    currentPlan: subscription?.plan,
  };
};
