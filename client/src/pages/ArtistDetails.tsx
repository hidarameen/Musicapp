import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import MusicPlayer, { useMusicContext } from "@/components/MusicPlayer";
import { Play, Heart, Share2, Download, Music, Video, Album, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Artist = {
  id: string;
  name: string;
  bio?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  genres?: string[] | null;
  debutYear?: number | null;
};

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

type Album = {
  id: string;
  title: string;
  artistId: string;
  releaseYear?: number | null;
  imageUrl?: string | null;
  createdAt: string | Date;
};

type Video = {
  id: string;
  title: string;
  artistId?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  viewCount?: number | null;
  createdAt?: string | Date | null;
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

export default function ArtistDetails() {
  const params = useParams();
  const artistId = params.id;
  const { setCurrentSong, setIsPlaying } = useMusicContext();

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ['/api/artists', artistId],
    enabled: !!artistId,
  });

  const { data: songs = [], isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ['/api/artists', artistId, 'songs'],
    enabled: !!artistId,
  });

  const { data: albums = [], isLoading: albumsLoading } = useQuery<Album[]>({
    queryKey: ['/api/artists', artistId, 'albums'],
    enabled: !!artistId,
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/artists', artistId, 'videos'],
    enabled: !!artistId,
  });

  if (artistLoading || !artist) {
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 mr-64 mb-24 overflow-y-auto">
        {/* Artist Header */}
        <div className="relative h-80 bg-gradient-to-b from-primary/20 to-background">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: artist.coverImageUrl ? `url(${artist.coverImageUrl})` : 'none',
              filter: 'brightness(0.3) blur(8px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex items-end space-x-6">
              <Avatar className="w-40 h-40 border-4 border-white shadow-xl">
                <AvatarImage src={artist.profileImageUrl || ''} alt={artist.name} />
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                  {artist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">فنان</Badge>
                  <h1 className="text-5xl font-bold text-white mb-2" data-testid="text-artist-name">
                    {artist.name}
                  </h1>
                  {artist.debutYear && (
                    <p className="text-white/80">منذ عام {artist.debutYear}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {songs.length > 0 && (
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handlePlaySong(songs[0])}
                      data-testid="button-play-all"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      تشغيل
                    </Button>
                  )}
                  <Button variant="outline" size="lg" data-testid="button-follow">
                    <Heart className="w-5 h-5 mr-2" />
                    متابعة
                  </Button>
                  <Button variant="ghost" size="lg" data-testid="button-share">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-6 text-white/80">
                  <span className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{songs.length} أغنية</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Album className="w-4 h-4" />
                    <span>{albums.length} ألبوم</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Video className="w-4 h-4" />
                    <span>{videos.length} فيديو</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="p-8">
          <Tabs defaultValue="songs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="songs">الأغاني</TabsTrigger>
              <TabsTrigger value="albums">الألبومات</TabsTrigger>
              <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
              <TabsTrigger value="about">نبذة</TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">الأغاني الشعبية</h2>
              {songsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-muted rounded-lg animate-pulse">
                      <div className="w-16 h-16 bg-background rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-background rounded w-1/3"></div>
                        <div className="h-3 bg-background rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                      onClick={() => handlePlaySong(song)}
                      data-testid={`song-item-${song.id}`}
                    >
                      <div className="w-8 text-center text-muted-foreground group-hover:hidden">
                        {index + 1}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 hidden group-hover:flex items-center justify-center"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                        {song.imageUrl ? (
                          <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium" data-testid={`text-song-title-${song.id}`}>
                          {song.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(song.playCount)} تشغيل
                        </p>
                      </div>
                      
                      {song.duration && (
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(song.duration)}
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="albums" className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">الألبومات</h2>
              {albumsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {albums.map((album) => (
                    <Card 
                      key={album.id} 
                      className="group cursor-pointer hover:shadow-lg transition-all" 
                      data-testid={`album-card-${album.id}`}
                      onClick={() => window.location.href = `/album/${album.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden relative">
                          {album.imageUrl ? (
                            <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Album className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="lg" className="rounded-full">
                              <Play className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold truncate" data-testid={`text-album-title-${album.id}`}>
                          {album.title}
                        </h3>
                        {album.releaseYear && (
                          <p className="text-sm text-muted-foreground">{album.releaseYear}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">الفيديوهات</h2>
              {videosLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className="group cursor-pointer hover:shadow-lg transition-all" data-testid={`video-card-${video.id}`}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="lg" className="rounded-full">
                              <Play className="w-6 h-6" />
                            </Button>
                          </div>
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {formatDuration(video.duration)}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold truncate mb-2" data-testid={`text-video-title-${video.id}`}>
                          {video.title}
                        </h3>
                        {video.viewCount && (
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(video.viewCount)} مشاهدة
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">نبذة عن الفنان</h2>
              <Card>
                <CardContent className="p-6">
                  {artist.bio ? (
                    <p className="text-muted-foreground leading-relaxed" data-testid="text-artist-bio">
                      {artist.bio}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      لا توجد معلومات متاحة عن هذا الفنان حالياً.
                    </p>
                  )}
                  
                  {artist.genres && artist.genres.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">الأنواع الموسيقية:</h3>
                      <div className="flex flex-wrap gap-2">
                        {artist.genres.map((genre, index) => (
                          <Badge key={index} variant="secondary">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MusicPlayer />
    </div>
  );
}