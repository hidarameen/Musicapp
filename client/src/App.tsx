import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicProvider } from "@/components/MusicPlayer";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";

// Lazy load components for better performance
const Home = lazy(() => import("@/pages/Home"));
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Search = lazy(() => import("@/pages/Search"));
const Terms = lazy(() => import("@/pages/Terms"));
const Playlists = lazy(() => import("@/pages/Playlists"));
const Downloads = lazy(() => import("@/pages/Downloads"));
const Artists = lazy(() => import("@/pages/Artists"));
const Albums = lazy(() => import("@/pages/Albums"));
const Videos = lazy(() => import("@/pages/Videos"));
const ArtistDetails = lazy(() => import("@/pages/ArtistDetails"));
const AlbumDetails = lazy(() => import("@/pages/AlbumDetails"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Player = lazy(() => import("@/pages/Player"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">جاري التحميل...</p>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state only during initial auth check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Always show landing page for non-authenticated users on root */}
        {!isAuthenticated && (
          <Route path="/" component={Landing} />
        )}
        {!isAuthenticated && (
          <Route path="/login" component={Login} />
        )}

        {/* Main app routes - available for all users */}
        {isAuthenticated && <Route path="/" component={Home} />}
        <Route path="/browse" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/artists" component={Artists} />
        <Route path="/artists/:id" component={ArtistDetails} />
        <Route path="/albums" component={Albums} />
        <Route path="/albums/:id" component={AlbumDetails} />
        <Route path="/videos" component={Videos} />
        <Route path="/playlists" component={Playlists} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/player" component={Player} />
        <Route path="/terms" component={Terms} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MusicProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MusicProvider>
    </QueryClientProvider>
  );
}

export default App;