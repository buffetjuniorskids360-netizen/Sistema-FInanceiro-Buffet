import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import EventsPage from "@/pages/events-page";
import ClientsPage from "@/pages/clients-page";
import PaymentsPage from "@/pages/payments-page";
import DocumentsPage from "@/pages/documents-page";
import RevenuePage from "@/pages/revenue-page";
import RevenueTotalPage from "@/pages/revenue-total-page";
import EventsMonthPage from "@/pages/events-month-page";
import ActiveClientsPage from "@/pages/active-clients-page";
import PendingPaymentsPage from "@/pages/pending-payments-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/clients" component={ClientsPage} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <ProtectedRoute path="/revenue" component={RevenuePage} />
      <ProtectedRoute path="/documents" component={DocumentsPage} />
      <ProtectedRoute path="/receita-total" component={RevenueTotalPage} />
      <ProtectedRoute path="/eventos-mes" component={EventsMonthPage} />
      <ProtectedRoute path="/clientes-ativos" component={ActiveClientsPage} />
      <ProtectedRoute path="/pagamentos-pendentes" component={PendingPaymentsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
