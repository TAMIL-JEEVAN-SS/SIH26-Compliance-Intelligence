import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/dashboard';
import Inspector from '@/pages/inspector';
import Institutes from '@/pages/institutes';
import InstituteDetail from '@/pages/institute-detail';
import Monitoring from '@/pages/monitoring';
import Inspections from '@/pages/inspections';
import Analytics from '@/pages/analytics';
import Evidence from '@/pages/evidence';
import Settings from '@/pages/settings';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/institutes" component={Institutes} />
        <Route path="/institutes/:id" component={InstituteDetail} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/inspections" component={Inspections} />
        <Route path="/inspector" component={Inspector} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/evidence" component={Evidence} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
