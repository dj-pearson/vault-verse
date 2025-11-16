import { cn } from "@/lib/utils";

interface TerminalWindowProps {
  children: React.ReactNode;
  className?: string;
}

export const TerminalWindow = ({ children, className }: TerminalWindowProps) => {
  return (
    <div className={cn("rounded-lg overflow-hidden border border-border shadow-lg", className)}>
      <div className="bg-terminal-bg/50 px-4 py-2 flex items-center gap-2 border-b border-border">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <div className="bg-terminal-bg p-6 font-mono text-sm">
        {children}
      </div>
    </div>
  );
};

interface TerminalLineProps {
  prompt?: boolean;
  success?: boolean;
  children: React.ReactNode;
}

export const TerminalLine = ({ prompt, success, children }: TerminalLineProps) => {
  return (
    <div className="flex gap-2 items-start">
      {prompt && <span className="text-terminal-prompt select-none">$</span>}
      {success && <span className="text-terminal-text select-none">✓</span>}
      <span className={cn(
        prompt ? "text-terminal-text" : "text-terminal-text/70"
      )}>
        {children}
      </span>
    </div>
  );
};
