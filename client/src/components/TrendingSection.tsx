import { Link } from "wouter";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMusicContext } from "@/components/MusicPlayer";
import { useTrendingSongs, useArtists } from "@/hooks/useAppData";
import type { Artist } from "@shared/schema";

interface Song {
  id: string;
  title: string;
  artistId: string;
  playCount: number;
  coverImageUrl?: string;
}

export default function TrendingSection() {
  const { setCurrentSong, setIsPlaying } = useMusicContext();
  
  const { data: songs, isLoading: songsLoading } = useTrendingSongs();
  const { data: artists } = useArtists();

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const handlePlaySong = (song: any) => {
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

  const handleImageClick = (song: any) => {
    // Set the song to play and then navigate to the player page
    handlePlaySong(song);
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (songsLoading) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الأكثر تداولاً</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
            عرض الكل
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الأكثر تداولاً</h2>
        </div>
        <div className="bg-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">لا توجد أغاني متاحة حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">الأكثر تداولاً</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
          عرض الكل
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {(songs as Song[]).slice(0, 5).map((song: Song, index: number) => (
          <div 
            key={song.id} 
            className="group cursor-pointer hover-scale"
            data-testid={`card-trending-${song.id}`}
          >
            <div className="relative">
              <Link to="/player">
                <img 
                  src={song.coverImageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PHBhdGggZD0iTTIwMCAxMDBDMjE2LjU2OSAxMDAgMjMwIDExMy40MzEgMjMwIDEzMFYyNTBDMjMwIDI2Ni41NjkgMjE2LjU2OSAyODAgMjAwIDI4MEMxODMuNDMxIDI4MCAxNzAgMjY2LjU2OSAxNzAgMjUwVjE5MEMxNzAgMjAwLjQzMyAxNjEuMDQzIDIwOSAxNTAgMjA5QzEzOC45NTcgMjA5IDEzMCAyMDAuNDMzIDEzMCAxOTBWMTgwQzEzMCAxNjkuNTY3IDEzOC45NTcgMTYxIDE1MCAxNjFDMTYxLjA0MyAxNjEgMTcwIDE2OS41NjcgMTcwIDE4MFYxMzBDMTcwIDExMy40MzEgMTgzLjQzMSAxMDAgMjAwIDEwMFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjQwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM4ODU1RkYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjU1REMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4K"} 
                  alt={`${song.title} Cover`}
                  className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleImageClick(song)}
                  data-testid={`img-song-cover-${song.id}`}
                />
              </Link>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center">
                <Button
                  onClick={() => handlePlaySong(song)}
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 glow-effect"
                  data-testid={`button-play-${song.id}`}
                >
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </Button>
              </div>
              <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold">
                #{index + 1}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold truncate" data-testid={`text-song-title-${song.id}`}>
                {song.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-artist-name-${song.id}`}>
                {getArtistName(song.artistId)}
              </p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Play className="w-3 h-3 mr-1" />
                <span data-testid={`text-play-count-${song.id}`}>
                  {formatPlayCount(song.playCount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
