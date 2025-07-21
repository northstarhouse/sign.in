import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import VolunteerCheckin from "@/pages/volunteer-checkin";
import GuestRegistration from "@/pages/guest-registration";
import EmployeeClock from "@/pages/employee-clock";
import DataAccess from "@/pages/data-access";
import SheetsSetup from "@/pages/sheets-setup";
import Manage from "@/pages/manage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/volunteers" component={VolunteerCheckin} />
      <Route path="/guests" component={GuestRegistration} />
      <Route path="/employees" component={EmployeeClock} />
      <Route path="/data" component={DataAccess} />
      <Route path="/manage" component={Manage} />
      <Route path="/sheets-setup" component={SheetsSetup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
