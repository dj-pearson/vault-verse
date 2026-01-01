import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Terminal, Shield, Users, Zap, Book, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface DocEntry {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  icon: typeof FileText;
  category: string;
}

const docEntries: DocEntry[] = [
  {
    title: "Overview",
    description: "Introduction to ENVault and key features",
    path: "/docs",
    keywords: ["introduction", "start", "about", "what is", "features"],
    icon: Book,
    category: "Getting Started",
  },
  {
    title: "Installation",
    description: "Install ENVault CLI via Homebrew, npm, or binary",
    path: "/docs/installation",
    keywords: ["install", "setup", "homebrew", "npm", "download", "binary", "macos", "linux", "windows"],
    icon: Zap,
    category: "Getting Started",
  },
  {
    title: "Quick Start",
    description: "Get up and running in under 5 minutes",
    path: "/docs/quickstart",
    keywords: ["quick", "start", "tutorial", "guide", "first", "begin", "init"],
    icon: Terminal,
    category: "Getting Started",
  },
  {
    title: "CLI Reference",
    description: "Complete reference for all CLI commands",
    path: "/docs/cli",
    keywords: ["cli", "command", "init", "set", "get", "list", "delete", "run", "import", "export", "sync", "login", "env", "team", "project"],
    icon: Terminal,
    category: "Core Concepts",
  },
  {
    title: "Team Setup",
    description: "Share secrets securely with your team",
    path: "/docs/team",
    keywords: ["team", "share", "invite", "collaborate", "members", "permissions", "roles"],
    icon: Users,
    category: "Core Concepts",
  },
  {
    title: "Security",
    description: "Zero-knowledge encryption and security model",
    path: "/docs/security",
    keywords: ["security", "encryption", "zero-knowledge", "aes", "keys", "secure", "privacy"],
    icon: Shield,
    category: "Core Concepts",
  },
  {
    title: "Integrations",
    description: "Use ENVault with popular frameworks and CI/CD",
    path: "/docs/integrations",
    keywords: ["integration", "docker", "nextjs", "express", "github", "gitlab", "ci", "cd", "pipeline", "vercel", "railway"],
    icon: Layers,
    category: "Guides",
  },
];

// CLI command entries for quick access
const cliCommands: DocEntry[] = [
  {
    title: "envault init",
    description: "Initialize a new project",
    path: "/docs/cli",
    keywords: ["init", "new", "create", "project", "start"],
    icon: Terminal,
    category: "CLI Commands",
  },
  {
    title: "envault set",
    description: "Set an environment variable",
    path: "/docs/cli",
    keywords: ["set", "add", "create", "variable", "secret"],
    icon: Terminal,
    category: "CLI Commands",
  },
  {
    title: "envault get",
    description: "Get a variable value",
    path: "/docs/cli",
    keywords: ["get", "read", "show", "variable"],
    icon: Terminal,
    category: "CLI Commands",
  },
  {
    title: "envault run",
    description: "Run command with injected variables",
    path: "/docs/cli",
    keywords: ["run", "execute", "start", "inject"],
    icon: Terminal,
    category: "CLI Commands",
  },
  {
    title: "envault sync",
    description: "Sync project with team",
    path: "/docs/cli",
    keywords: ["sync", "push", "pull", "team", "cloud"],
    icon: Terminal,
    category: "CLI Commands",
  },
  {
    title: "envault export",
    description: "Export variables to file",
    path: "/docs/cli",
    keywords: ["export", "download", "env", "dotenv", "json", "yaml"],
    icon: Terminal,
    category: "CLI Commands",
  },
];

const allEntries = [...docEntries, ...cliCommands];

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Group entries by category
  const groupedEntries = useMemo(() => {
    const groups: Record<string, DocEntry[]> = {};
    allEntries.forEach((entry) => {
      if (!groups[entry.category]) {
        groups[entry.category] = [];
      }
      groups[entry.category].push(entry);
    });
    return groups;
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search docs, commands, and more..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedEntries).map(([category, entries]) => (
            <CommandGroup key={category} heading={category}>
              {entries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <CommandItem
                    key={`${entry.category}-${entry.title}`}
                    value={`${entry.title} ${entry.keywords.join(" ")}`}
                    onSelect={() => handleSelect(entry.path)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.description}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Inline search for the sidebar
export function DocsSearchInline() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredEntries = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(lowerQuery) ||
        entry.description.toLowerCase().includes(lowerQuery) ||
        entry.keywords.some((k) => k.includes(lowerQuery))
    ).slice(0, 5);
  }, [query]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search docs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
      {filteredEntries.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
          {filteredEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={`${entry.category}-${entry.title}`}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent text-sm"
                onClick={() => {
                  navigate(entry.path);
                  setQuery("");
                }}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{entry.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
