import { Navigation } from "@/components/Navigation";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Book, Terminal, Zap, Shield, Users, Settings, Code } from "lucide-react";

const docSections = [
  {
    title: "Getting Started",
    items: [
      { path: "/docs", label: "Overview", icon: Book },
      { path: "/docs/installation", label: "Installation", icon: Zap },
      { path: "/docs/quickstart", label: "Quick Start", icon: Terminal },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { path: "/docs/cli", label: "CLI Reference", icon: Code },
      { path: "/docs/team", label: "Team Setup", icon: Users },
      { path: "/docs/security", label: "Security", icon: Shield },
    ],
  },
];

export default function DocsLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border min-h-screen sticky top-20 self-start">
          <nav className="p-6 space-y-8">
            {docSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
