import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Dashboard from "./dashboard";
import type { User } from "@shared/schema";

export default function Home() {
  const { user } = useAuth() as { user: User | undefined };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with user info and logout */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">DCAlytics</h1>
            {user && (
              <div className="flex items-center space-x-2">
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-profile"
                  />
                )}
                <span className="text-gray-300" data-testid="text-username">
                  {user.firstName || user.email || 'User'}
                </span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main>
        <Dashboard />
      </main>
    </div>
  );
}