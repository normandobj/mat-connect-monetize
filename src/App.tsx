import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import AthleteProfile from "./pages/AthleteProfile";
import Feed from "./pages/Feed";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import UploadPage from "./pages/Upload";
import Subscribe from "./pages/Subscribe";
import Register from "./pages/Register";
import Invite from "./pages/Invite";
import Auth from "./pages/Auth";
import EditProfile from "./pages/EditProfile";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Treinos from "./pages/Treinos";
import Protocolo21 from "./pages/Protocolo21";
import CursoDestaque from "./pages/CursoDestaque";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/athlete/:username" element={<AthleteProfile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/edit" element={<EditProfile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/treinos" element={<Treinos />} />
              <Route path="/treinos/protocolo-21" element={<Protocolo21 />} />
              <Route path="/treinos/curso-destaque" element={<CursoDestaque />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/subscribe/:username" element={<Subscribe />} />
              <Route path="/register/athlete" element={<Register />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:userId" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/invite/:username/:plan" element={<Invite />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
