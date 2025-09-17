import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut } from "lucide-react";
import Dashboard from "./dashboard";
import type { User } from "@shared/schema";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip navigation for accessibility */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Header with user info and logout */}
      <header className="border-b border-border p-4 bg-card" role="banner">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">DCAlytics</h1>
            {user && (
              <div className="flex items-center space-x-2">
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt={`Profile picture of ${user.firstName || user.email || 'User'}`} 
                    className="w-8 h-8 rounded-full object-cover border border-border"
                    data-testid="img-profile"
                  />
                )}
                <span className="text-muted-foreground" data-testid="text-username">
                  Welcome, {user.firstName || user.email || 'User'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-muted transition-colors touch-target"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
              aria-label="Sign out of your account"
            >
              <LogOut size={16} className="mr-2" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main id="main-content" role="main">
        <Dashboard />
      </main>
    </div>
  );
}