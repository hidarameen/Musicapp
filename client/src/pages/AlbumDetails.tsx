import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import MusicPlayer, { useMusicContext } from "@/components/MusicPlayer";
import { Play, Heart, Share2, Download, Music, Clock, Calendar } from "lucide-react";

import type { Album, Artist, Song } from "@shared/schema";



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

export default function AlbumDetails() {
  const params = useParams();
  const albumId = params.id;
  const { setCurrentSong, setIsPlaying } = useMusicContext();

  const { data: album, isLoading: albumLoading } = useQuery<Album>({
    queryKey: ['/api/albums', albumId],
    enabled: !!albumId,
  });

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ['/api/artists', album?.artistId],
    enabled: !!album?.artistId,
  });

  const { data: songs = [], isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ['/api/albums', albumId, 'songs'],
    enabled: !!albumId,
  });

  if (albumLoading || !album) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 mr-64 mb-24 overflow-y-auto">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg mb-8"></div>
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </main>
        <MusicPlayer />
      </div>
    );
  }

  const handlePlaySong = (song: Song) => {
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
    if (songs.length > 0 && songs[0].audioUrl) {
      handlePlaySong(songs[0]);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 mr-64 mb-24 overflow-y-auto">
        {/* Album Header */}
        <div className="relative h-80 bg-gradient-to-b from-primary/20 to-background">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: album.coverImageUrl ? `url(${album.coverImageUrl})` : 'none',
              filter: 'brightness(0.3) blur(8px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex items-end space-x-6">
              <div className="w-56 h-56 bg-muted rounded-lg overflow-hidden shadow-2xl">
                {album.coverImageUrl ? (
                  <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-20 h-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">ألبوم</Badge>
                  <h1 className="text-5xl font-bold text-white mb-2" data-testid="text-album-title">
                    {album.title}
                  </h1>
                  {!artistLoading && artist && (
                    <p className="text-xl text-white/80 mb-2">
                      {artist.name}
                    </p>
                  )}
                  {album.releaseDate && (
                    <p className="text-white/70">
                      صدر في عام {new Date(album.releaseDate).getFullYear()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handlePlayAll}
                    disabled={songs.length === 0}
                    data-testid="button-play-all"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    تشغيل
                  </Button>
                  <Button variant="outline" size="lg" data-testid="button-favorite">
                    <Heart className="w-5 h-5 mr-2" />
                    إضافة للمفضلة
                  </Button>
                  <Button variant="ghost" size="lg" data-testid="button-share">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="lg" data-testid="button-download">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6 text-white/80">
                  <span className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{songs.length} أغنية</span>
                  </span>
                  {songs.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration(songs)}</span>
                    </span>
                  )}
                  {album.releaseDate && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(album.releaseDate).getFullYear()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">قائمة الأغاني</h2>
            {songs.length > 0 && (
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  تحميل الألبوم
                </Button>
              </div>
            )}
          </div>
          
          {songsLoading ? (
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
          ) : songs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد أغاني</h3>
                <p className="text-muted-foreground">
                  لم يتم إضافة أي أغاني لهذا الألبوم بعد.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b">
                <div className="w-8">#</div>
                <div>العنوان</div>
                <div className="text-center">الاستماع</div>
                <div className="text-center">المدة</div>
              </div>
              
              {/* Songs */}
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className="grid grid-cols-[auto,1fr,auto,auto] gap-4 p-4 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                  data-testid={`song-item-${song.id}`}
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
                      {song.imageUrl ? (
                        <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate" data-testid={`text-song-title-${song.id}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {artist?.name || 'فنان غير معروف'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(song.playCount)}
                    </span>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    {song.duration && (
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(song.duration)}
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
          
          {/* Album Description */}
          {album.description && (
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">عن الألبوم</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-album-description">
                  {album.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
}