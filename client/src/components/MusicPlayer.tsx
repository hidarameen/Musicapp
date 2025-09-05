import { useState, useRef, useEffect, useContext, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize, List, Monitor, Heart, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Song, Artist } from "@shared/schema";

interface PlayingSong {
  id: string;
  title: string;
  artistId: string;
  audioUrl: string;
  duration: number;
}

interface MusicContextType {
  currentSong: PlayingSong | null;
  setCurrentSong: (song: PlayingSong | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<PlayingSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <MusicContext.Provider value={{ currentSong, setCurrentSong, isPlaying, setIsPlaying }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within MusicProvider');
  }
  return context;
};

export default function MusicPlayer() {
  const { currentSong, isPlaying, setIsPlaying } = useMusicContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch artists for name lookup
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-50">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setCurrentTime(0)}
      />
      
      <div className="flex items-center justify-between">
        {/* Current Song Info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <Link to="/player">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" data-testid="img-album-cover">
              <Music className="w-6 h-6 text-white" />
            </div>
          </Link>
          <Link to="/player" className="min-w-0 flex-1">
            <div className="min-w-0 cursor-pointer hover:text-primary transition-colors">
              <h4 className="font-semibold truncate" data-testid="text-song-title">
                {currentSong.title}
              </h4>
              <p className="text-sm text-muted-foreground truncate" data-testid="text-artist-name">
                {getArtistName(currentSong.artistId)}
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 transition-colors"
            data-testid="button-favorite"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-previous"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={togglePlay}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors glow-effect"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-next"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-repeat"
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-3 w-full">
            <span className="text-xs text-muted-foreground" data-testid="text-current-time">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[currentTime]}
                max={currentSong.duration}
                step={1}
                onValueChange={handleProgressChange}
                className="w-full"
                data-testid="slider-progress"
              />
            </div>
            <span className="text-xs text-muted-foreground" data-testid="text-duration">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>
        
        {/* Volume and Additional Controls */}
        <div className="flex items-center space-x-4 min-w-0 flex-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-queue"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-cast"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-volume"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
              data-testid="slider-volume"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
