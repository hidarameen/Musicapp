import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import MusicPlayer, { useMusicContext } from "@/components/MusicPlayer";
import { useAuth } from "@/hooks/useAuth";
import { Play, Heart, Download, Music, Trash2, Clock } from "lucide-react";

type Song = {
  id: string;
  title: string;
  artistId: string;
  albumId?: string | null;
  duration?: number | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  playCount: number;
  createdAt: string | Date;
};

type Artist = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

type FavoriteSong = {
  song: Song;
  artist: Artist;
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + ' مليون';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + ' ألف';
  }
  return num.toString();
}

function getTotalDuration(songs: Song[]): string {
  const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  }
  return `${minutes} دقيقة`;
}

export default function Favorites() {
  const { user } = useAuth();
  const { setCurrentSong, setIsPlaying } = useMusicContext();

  const { data: favorites = [], isLoading } = useQuery<FavoriteSong[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const handlePlaySong = (song: Song, artist: Artist) => {
    if (song.audioUrl) {
      setCurrentSong({
        id: song.id,
        title: song.title,
        artistId: song.artistId,
        audioUrl: song.audioUrl,
        duration: song.duration || 0
      });
      setIsPlaying(true);
    }
  };

  const handlePlayAll = () => {
    if (favorites.length > 0 && favorites[0].song.audioUrl) {
      handlePlaySong(favorites[0].song, favorites[0].artist);
    }
  };

  const handleRemoveFromFavorites = async (songId: string) => {
    // TODO: Implement remove from favorites API call
    console.log('Remove from favorites:', songId);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 mr-64 mb-24 overflow-y-auto">
        {/* Header */}
        <div className="relative h-80 bg-gradient-to-b from-red-500/20 to-background">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex items-end space-x-6">
              <div className="w-56 h-56 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-2xl flex items-center justify-center">
                <Heart className="w-24 h-24 text-white" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-primary font-medium mb-2">قائمة التشغيل</p>
                  <h1 className="text-5xl font-bold text-white mb-2" data-testid="text-favorites-title">
                    أغانيي المفضلة
                  </h1>
                  <p className="text-white/80">
                    {(user as any)?.displayName || (user as any)?.email || 'المستخدم'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handlePlayAll}
                    disabled={favorites.length === 0}
                    data-testid="button-play-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    تشغيل الكل
                  </Button>
                  <Button variant="outline" size="lg" data-testid="button-download-all">
                    <Download className="w-5 h-5 mr-2" />
                    تحميل الكل
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6 text-white/80">
                  <span className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{favorites.length} أغنية</span>
                  </span>
                  {favorites.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration(favorites.map(f => f.song))}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-muted rounded-lg animate-pulse">
                  <div className="w-8 h-4 bg-background rounded"></div>
                  <div className="w-16 h-16 bg-background rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-background rounded w-1/3"></div>
                    <div className="h-3 bg-background rounded w-1/4"></div>
                  </div>
                  <div className="w-12 h-4 bg-background rounded"></div>
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد أغاني مفضلة</h3>
                <p className="text-muted-foreground mb-6">
                  ابدأ بإضافة أغانيك المفضلة بالضغط على أيقونة القلب بجانب أي أغنية.
                </p>
                <Button variant="outline">
                  استكشف الموسيقى
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b">
                <div className="w-8">#</div>
                <div>العنوان</div>
                <div className="text-center">الفنان</div>
                <div className="text-center">الاستماع</div>
                <div className="text-center">المدة</div>
              </div>
              
              {/* Songs */}
              {favorites.map((favorite, index) => (
                <div
                  key={favorite.song.id}
                  className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 p-4 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                  onClick={() => handlePlaySong(favorite.song, favorite.artist)}
                  data-testid={`favorite-item-${favorite.song.id}`}
                >
                  <div className="w-8 text-center text-muted-foreground group-hover:hidden flex items-center justify-center">
                    {index + 1}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 hidden group-hover:flex items-center justify-center"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      {favorite.song.imageUrl ? (
                        <img src={favorite.song.imageUrl} alt={favorite.song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate" data-testid={`text-song-title-${favorite.song.id}`}>
                        {favorite.song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(favorite.song.playCount)} تشغيل
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      {favorite.artist.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(favorite.song.playCount)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(favorite.song.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    {favorite.song.duration && (
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(favorite.song.duration)}
                      </span>
                    )}
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
}