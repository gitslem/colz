import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Profile from "@/pages/profile";
import OpportunityForm from "@/pages/opportunity-form";
import ProjectForm from "@/pages/project-form";
import OpportunityDetail from "@/pages/opportunity-detail";
import ProjectDetail from "@/pages/project-detail";
import ArtistDetail from "@/pages/artist-detail";
import Applications from "@/pages/applications";
import Messages from "@/pages/messages";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </>
      ) : !user?.role ? (
        <>
          <Route path="/" component={Signup} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/profile" component={Profile} />
          <Route path="/opportunities/new" component={OpportunityForm} />
          <Route path="/opportunities/:id" component={OpportunityDetail} />
          <Route path="/projects/new" component={ProjectForm} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/artists/:id" component={ArtistDetail} />
          <Route path="/applications" component={Applications} />
          <Route path="/messages" component={Messages} />
          <Route path="/settings" component={Settings} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
