import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import Landing from "./pages/Landing";
import AthleteProfile from "./pages/AthleteProfile";
import Feed from "./pages/Feed";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import UploadPage from "./pages/Upload";
import Subscribe from "./pages/Subscribe";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/athlete/:username" element={<AthleteProfile />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/subscribe/:username" element={<Subscribe />} />
          <Route path="/register/athlete" element={<Register />} />
          <Route path="/notifications" element={<Feed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
