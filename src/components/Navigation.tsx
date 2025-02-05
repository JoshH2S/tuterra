import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, BookOpen, LogOut, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-primary-500">EduAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <Link
              to="/course/tutor"
              className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Tutor
            </Link>
            <Link
              to="/analytics"
              className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Analytics
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/courses"
              className="text-gray-600 hover:text-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Courses
            </Link>
            <Link
              to="/course/tutor"
              className="text-gray-600 hover:text-primary-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Tutor
            </Link>
            <Link
              to="/analytics"
              className="text-gray-600 hover:text-primary-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Analytics
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;