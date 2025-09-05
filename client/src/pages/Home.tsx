import { useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MusicPlayer from "@/components/MusicPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import AdminModal from "@/components/AdminModal";
import { Play, Heart, Clock, List, Flame } from "lucide-react";

// Lazy load heavy components
const TrendingSection = lazy(() => import("@/components/TrendingSection"));
const ArtistsSection = lazy(() => import("@/components/ArtistsSection"));
const VideoGallery = lazy(() => import("@/components/VideoGallery"));
const PlaylistsSection = lazy(() => import("@/components/PlaylistsSection"));

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Show content for both authenticated and non-authenticated users
  // No automatic redirect needed since we allow browsing without auth

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground font-medium">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  // Show content regardless of authentication status

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-32">
        <Header />
        
        {/* Welcome Section */}
        <section className="p-6">
          <div className="relative rounded-2xl overflow-hidden gradient-bg p-8 text-white">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">مرحباً بك في MusicHub</h1>
              <p className="text-lg opacity-90 mb-6">اكتشف أحدث الأغاني والفنانين المفضلين لديك</p>
              <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 transition-all hover-scale flex items-center gap-2">
                <Play className="w-4 h-4" />
                ابدأ الاستماع
              </button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-6 mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">الأغاني المفضلة</h3>
                  <p className="text-sm text-muted-foreground">قائمة مفضلاتك</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">تم تشغيلها مؤخراً</h3>
                  <p className="text-sm text-muted-foreground">آخر الأغاني</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <List className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold">قوائم التشغيل</h3>
                  <p className="text-sm text-muted-foreground">قوائمك الخاصة</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold">الأكثر شعبية</h3>
                  <p className="text-sm text-muted-foreground">المتداولة الآن</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </section>
        }>
          <TrendingSection />
        </Suspense>
        
        <Suspense fallback={
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-square rounded-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          </section>
        }>
          <ArtistsSection />
        </Suspense>
        
        <Suspense fallback={
          <section className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </section>
        }>
          <VideoGallery />
        </Suspense>
        
        <Suspense fallback={
          <section className="px-6 mb-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          </section>
        }>
          <PlaylistsSection />
        </Suspense>
      </main>
      
      <MusicPlayer />
      <AdminModal />
    </div>
  );
}
