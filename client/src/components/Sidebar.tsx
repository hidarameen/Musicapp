import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Music, Home, Search, Users, Disc, Video, Heart, Download, Clock, Upload, BarChart, Users as UsersIcon, LogIn, LogOut } from "lucide-react";
import type { User } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [showAdmin, setShowAdmin] = useState(false);

  const { data: playlists } = useQuery({
    queryKey: ["/api/users", (user as User)?.id, "playlists"],
    enabled: !!(user as User)?.id,
  });

  const handleAdminClick = () => {
    const modal = document.getElementById('adminModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  };

  const { logout, isLoggingOut } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-card border-r border-border p-6 sticky top-0 h-screen overflow-y-auto scroll-hidden">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Music className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">MusicHub</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link 
          to="/" 
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            location === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          data-testid="nav-home"
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Link>
        <Link 
          to="/search" 
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            location === '/search' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          data-testid="nav-search"
        >
          <Search className="w-5 h-5" />
          <span>البحث</span>
        </Link>
        <Link 
          to="/artists" 
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            location === '/artists' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          data-testid="nav-artists"
        >
          <Users className="w-5 h-5" />
          <span>الفنانين</span>
        </Link>
        <Link 
          to="/albums" 
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            location === '/albums' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          data-testid="nav-albums"
        >
          <Disc className="w-5 h-5" />
          <span>الألبومات</span>
        </Link>
        <Link 
          to="/videos" 
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            location === '/videos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          }`}
          data-testid="nav-videos"
        >
          <Video className="w-5 h-5" />
          <span>الفيديوهات</span>
        </Link>
      </nav>

      <hr className="my-6 border-border" />

      {/* Playlists */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">قوائم التشغيل</h3>
        <div className="space-y-2">
          <Link 
            to="/playlists" 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              location === '/playlists' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            data-testid="nav-favorites"
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm">المفضلة</span>
          </Link>
          <Link 
            to="/downloads" 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
              location === '/downloads' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            data-testid="nav-downloads"
          >
            <Download className="w-4 h-4 text-green-500" />
            <span className="text-sm">تم تحميلها</span>
          </Link>
          <button 
            onClick={() => navigate('/recent')}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
            data-testid="nav-recent"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm">تم تشغيلها مؤخراً</span>
          </button>
        </div>
      </div>

      <hr className="my-6 border-border" />

      {/* Admin Section - Only show if user is admin */}
      {(user as User)?.isAdmin && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">الإدارة</h3>
          <div className="space-y-2">
            <button 
              onClick={handleAdminClick}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors w-full text-left"
              data-testid="nav-upload"
            >
              <Upload className="w-4 h-4 text-accent" />
              <span className="text-sm">رفع محتوى</span>
            </button>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="nav-stats"
            >
              <BarChart className="w-4 h-4 text-accent" />
              <span className="text-sm">الإحصائيات</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="nav-users"
            >
              <UsersIcon className="w-4 h-4 text-accent" />
              <span className="text-sm">المستخدمين</span>
            </a>
          </div>
        </div>
      )}

      {/* User Info & Logout */}
      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        {user ? (
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              {(user as User).profileImageUrl ? (
                <img 
                  src={(user as User).profileImageUrl!} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-primary-foreground">
                  {(user as User).firstName?.[0] || (user as User).email?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {(user as User).firstName || (user as User).email?.split('@')[0] || 'مستخدم'}
              </div>
              {(user as User).isAdmin && (
                <div className="text-xs text-accent">مدير</div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="button-sidebar-login"
          >
            <LogIn className="w-4 h-4 ml-2" />
            تسجيل الدخول
          </button>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid="button-logout"
          >
            <LogOut className="ml-2 h-4 w-4" />
            {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}