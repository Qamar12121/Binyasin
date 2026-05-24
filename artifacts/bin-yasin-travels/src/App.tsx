import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import OurStoryPage from "@/pages/our-story";
import ServicesPage from "@/pages/services";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHome from "@/pages/dashboard/index";
import GroupTicketsPage from "@/pages/dashboard/group-tickets";
import UmrahTicketsPage from "@/pages/dashboard/umrah-tickets";
import UmrahPackagesPage from "@/pages/dashboard/umrah-packages";
import LedgerPage from "@/pages/dashboard/ledger";
import AirlineBookingsPage from "@/pages/dashboard/airline-bookings";
import PackageBookingsPage from "@/pages/dashboard/package-bookings";
import ProfilePage from "@/pages/dashboard/profile";
import ChangePasswordPage from "@/pages/dashboard/change-password";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboardPage from "@/pages/admin/index";
import AdminGroupTicketsPage from "@/pages/admin/group-tickets";
import AdminUmrahTicketsPage from "@/pages/admin/umrah-tickets";
import AdminPackagesPage from "@/pages/admin/packages";
import AdminAgentsPage from "@/pages/admin/agents";
import AdminBookingsPage from "@/pages/admin/bookings";
import AdminTransactionsPage from "@/pages/admin/transactions";
import WhatsAppButton from "@/components/WhatsAppButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, token, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!token || !user) return <Redirect to="/login" />;
  if (adminOnly && user?.role !== "admin") return <Redirect to="/dashboard" />;
  if (!adminOnly && user?.role === "admin") return <Redirect to="/admin" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/our-story" component={OurStoryPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={() => <DashboardLayout><DashboardHome /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/group-tickets">
        {() => <ProtectedRoute component={() => <DashboardLayout><GroupTicketsPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/umrah-tickets">
        {() => <ProtectedRoute component={() => <DashboardLayout><UmrahTicketsPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/umrah-packages">
        {() => <ProtectedRoute component={() => <DashboardLayout><UmrahPackagesPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/ledger">
        {() => <ProtectedRoute component={() => <DashboardLayout><LedgerPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/airline-bookings">
        {() => <ProtectedRoute component={() => <DashboardLayout><AirlineBookingsPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/package-bookings">
        {() => <ProtectedRoute component={() => <DashboardLayout><PackageBookingsPage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/profile">
        {() => <ProtectedRoute component={() => <DashboardLayout><ProfilePage /></DashboardLayout>} />}
      </Route>
      <Route path="/dashboard/change-password">
        {() => <ProtectedRoute component={() => <DashboardLayout><ChangePasswordPage /></DashboardLayout>} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminDashboardPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/group-tickets">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminGroupTicketsPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/umrah-tickets">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminUmrahTicketsPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/packages">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminPackagesPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/agents">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminAgentsPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/bookings">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminBookingsPage /></AdminLayout>} />}
      </Route>
      <Route path="/admin/transactions">
        {() => <ProtectedRoute adminOnly component={() => <AdminLayout><AdminTransactionsPage /></AdminLayout>} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
              <WhatsAppButton />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
