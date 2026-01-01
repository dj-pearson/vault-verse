import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Book, Terminal, Zap, Shield, Users, Code, Menu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocsSearch, DocsSearchInline } from "@/components/DocsSearch";

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
  {
    title: "Guides",
    items: [
      { path: "/docs/integrations", label: "Integrations", icon: Layers },
    ],
  },
];

const SidebarNav = ({ onNavigate, showSearch = false }: { onNavigate?: () => void; showSearch?: boolean }) => {
  const location = useLocation();

  return (
    <nav className="p-6 space-y-6">
      {showSearch && (
        <div className="pb-2">
          <DocsSearchInline />
        </div>
      )}
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
                    onClick={onNavigate}
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
  );
};

export default function DocsLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 flex">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg h-14 w-14">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>Documentation</SheetTitle>
              </SheetHeader>
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border min-h-screen sticky top-20 self-start">
          <SidebarNav showSearch />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Search bar for tablet/mobile (hidden on desktop where sidebar has search) */}
            <div className="lg:hidden mb-6">
              <DocsSearch />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
