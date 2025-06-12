import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Clients from "@/pages/Clients";
import Rooms from "@/pages/Rooms";
import Products from "@/pages/Products";
import Services from "@/pages/Services";
import CheckIn from "@/pages/CheckIn";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import CheckOut from "@/pages/CheckOut";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={Users} />
        <Route path="/clients" component={Clients} />
        <Route path="/rooms" component={Rooms} />
        <Route path="/products" component={Products} />
        <Route path="/services" component={Services} />
        <Route path="/checkin" component={CheckIn} />
        <Route path="/sales" component={Sales} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/checkout" component={CheckOut} />
        <Route path="/reports/:type?" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
