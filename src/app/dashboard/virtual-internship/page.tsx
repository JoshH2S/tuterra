import { CompanyInfoCard } from "@/components/internship/CompanyInfoCard";

// Inside the component where you render the dashboard layout
return (
  <div>
    {/* ... existing header ... */}
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
      <div className="md:col-span-3 space-y-6">
        {/* ... existing tabs and content ... */}
      </div>
      
      <div className="space-y-6">
        {/* Add the CompanyInfoCard component */}
        {session && <CompanyInfoCard sessionId={session.id} />}
        
        {/* ... other sidebar content ... */}
      </div>
    </div>
  </div>
); 