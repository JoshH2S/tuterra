
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Lazy-loaded pages
const JobInterviewSimulator = lazy(() => import("@/pages/JobInterviewSimulator"));
const InternshipPage = lazy(() => import("@/pages/InternshipPage"));

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/" element={<JobInterviewSimulator />} />
            <Route path="/interview/:id" element={<JobInterviewSimulator />} />
            <Route path="/internship/:id" element={<InternshipPage />} />
          </Routes>
        </Suspense>
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
