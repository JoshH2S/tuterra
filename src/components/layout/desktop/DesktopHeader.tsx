
import { useState } from "react";
import { ChevronRight, Search, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Breadcrumbs Component
function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            to="/" 
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={name} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <Link
                to={routeTo}
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  isLast 
                    ? "font-medium text-gray-800 dark:text-gray-200" 
                    : "text-gray-500 dark:text-gray-400"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Search Bar Component
function SearchBar() {
  return (
    <div className="relative w-64 md:w-96">
      <Input 
        placeholder="Search..."
        className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    </div>
  );
}

// Notifications Menu
function NotificationsMenu() {
  const [notifications, setNotifications] = useState<any[]>([]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Notifications</h2>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm">Mark all as read</Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            You have no notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {/* Notification items would go here */}
            <div className="p-4 text-center text-sm text-muted-foreground">
              Example notification item
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Menu
function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile-settings">Profile Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/update-password">Change Password</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left Section - Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <Breadcrumbs />
        </div>

        {/* Right Section - Search & User Menu */}
        <div className="flex items-center space-x-4">
          <SearchBar />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
