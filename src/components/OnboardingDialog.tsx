import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Download,
  Key,
  Terminal,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TerminalWindow, TerminalLine } from './TerminalWindow';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to EnvVault!',
    icon: Rocket,
    description: 'Secure, local-first environment variable management',
  },
  {
    id: 'create-project',
    title: 'Create Your First Project',
    icon: CheckCircle,
    description: 'Projects help organize your environment variables',
  },
  {
    id: 'install-cli',
    title: 'Install the CLI',
    icon: Download,
    description: 'The CLI makes managing secrets easy and secure',
  },
  {
    id: 'get-token',
    title: 'Get Your CLI Token',
    icon: Key,
    description: 'Connect the CLI to your account',
  },
  {
    id: 'quick-start',
    title: 'Quick Start Guide',
    icon: Terminal,
    description: 'Common commands to get you started',
  },
];

export const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as completed in user preferences
    if (userId) {
      supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)
        .then(() => {
          onOpenChange(false);
        });
    } else {
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <StepIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Welcome Step */}
          {step.id === 'welcome' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">🔐 Zero-Knowledge</h4>
                  <p className="text-sm text-muted-foreground">
                    Your secrets are encrypted locally. We never see your data.
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">💻 Local-First</h4>
                  <p className="text-sm text-muted-foreground">
                    Works offline. Sync when you want.
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">🚀 CLI + Web</h4>
                  <p className="text-sm text-muted-foreground">
                    Powerful CLI with optional web dashboard.
                  </p>
                </Card>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">What we'll cover:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Creating your first project
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Installing and configuring the CLI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Setting up authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Basic commands to manage secrets
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Create Project Step */}
          {step.id === 'create-project' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Projects help you organize environment variables for different applications.
                You can create environments (dev, staging, production) within each project.
              </p>
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">To create a project:</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Click "New Project" on the dashboard</li>
                  <li>Enter a name (e.g., "my-app")</li>
                  <li>Add an optional description</li>
                  <li>Click "Create Project"</li>
                </ol>
              </Card>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Projects come with 3 default environments: development, staging, and production</span>
              </div>
            </div>
          )}

          {/* Install CLI Step */}
          {step.id === 'install-cli' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Install the EnvVault CLI using your preferred method:
              </p>

              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Recommended</Badge>
                  </div>
                  <h4 className="font-semibold mb-2">macOS & Linux (Homebrew)</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>brew tap envault/tap</TerminalLine>
                    <TerminalLine prompt>brew install envault</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">macOS & Linux (curl)</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>curl -fsSL https://get.envault.net | sh</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">All platforms (npm)</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>npm install -g @envault/cli</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Windows, Linux (Direct Download)</h4>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/dj-pearson/vault-verse/releases/latest" target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Releases
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Download the binary for your platform and add it to your PATH
                  </p>
                </Card>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg text-sm">
                <strong>Verify installation:</strong>
                <TerminalWindow className="mt-2">
                  <TerminalLine prompt>envault --version</TerminalLine>
                </TerminalWindow>
              </div>
            </div>
          )}

          {/* Get Token Step */}
          {step.id === 'get-token' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                To connect the CLI to your account, you'll need a personal access token.
              </p>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  How to get your token:
                </h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Go to Settings → CLI Tokens</li>
                  <li>Click "Create New Token"</li>
                  <li>Give it a name (e.g., "My Laptop")</li>
                  <li>Copy the token (you'll only see it once!)</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">Authenticate the CLI:</h4>
                <TerminalWindow>
                  <TerminalLine prompt>envault login</TerminalLine>
                  <TerminalLine>Enter your token when prompted</TerminalLine>
                </TerminalWindow>
                <p className="text-sm text-muted-foreground mt-2">
                  Your token will be stored securely in your system's keychain
                </p>
              </Card>

              <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>
                  The token is encrypted and stored locally. We never transmit it.
                </span>
              </div>
            </div>
          )}

          {/* Quick Start Step */}
          {step.id === 'quick-start' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Here are the most common commands you'll use:
              </p>

              <div className="space-y-3">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Initialize a project:</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>envault init my-app</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Set a variable:</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>envault set DATABASE_URL=postgres://...</TerminalLine>
                    <TerminalLine prompt>envault set API_KEY=secret123 --env production</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">List variables:</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>envault list</TerminalLine>
                    <TerminalLine prompt>envault list --env production</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Export to .env file:</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>envault export -o .env</TerminalLine>
                  </TerminalWindow>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Run command with env vars:</h4>
                  <TerminalWindow>
                    <TerminalLine prompt>envault run npm start</TerminalLine>
                  </TerminalWindow>
                </Card>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Next steps:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Check out the full docs at /docs</li>
                  <li>• Invite team members to collaborate</li>
                  <li>• Set up CI/CD integrations</li>
                  <li>• Explore audit logs for security</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
