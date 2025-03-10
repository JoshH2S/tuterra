
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { LegalProvider } from "@/context/LegalContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LegalProvider>
          <MainLayout />
        </LegalProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
