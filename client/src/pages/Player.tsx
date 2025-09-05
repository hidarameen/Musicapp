import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Heart, 
  Music, 
  ArrowLeft,
  Download,
  Share,
  MoreHorizontal,
  Minimize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMusicContext } from "@/components/MusicPlayer";
import type { Artist } from "@shared/schema";

export default function Player() {
  const [, navigate] = useLocation();
  const { currentSong, isPlaying, setIsPlaying } = useMusicContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch artists for name lookup
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    staleTime: 5 * 60 * 1000,
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

  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  // If no song is playing, redirect to home
  useEffect(() => {
    if (!currentSong) {
      navigate('/');
    }
  }, [currentSong, navigate]);

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">لا توجد أغنية قيد التشغيل</h2>
          <p className="text-muted-foreground mb-4">اختر أغنية للبدء في الاستماع</p>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setCurrentTime(0)}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">مشغل الموسيقى</h1>
            <p className="text-sm text-muted-foreground">يتم التشغيل الآن</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" data-testid="button-minimize">
            <Minimize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" data-testid="button-more">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Player */}
      <div className="max-w-2xl mx-auto p-8">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* Album Art */}
            <div className="aspect-square max-w-md mx-auto mb-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Music className="w-32 h-32 text-white/80" />
            </div>

            {/* Song Info */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2" data-testid="text-song-title">
                {currentSong.title}
              </h2>
              <p className="text-xl text-muted-foreground mb-4" data-testid="text-artist-name">
                {getArtistName(currentSong.artistId)}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="secondary">موسيقى عربية</Badge>
                <Badge variant="outline">جودة عالية</Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <Slider
                value={[currentTime]}
                max={currentSong.duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="w-full mb-4"
                data-testid="slider-progress"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span data-testid="text-current-time">{formatTime(currentTime)}</span>
                <span data-testid="text-duration">{formatTime(currentSong.duration || 0)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsShuffled(!isShuffled)}
                className={`transition-colors ${isShuffled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="button-shuffle"
              >
                <Shuffle className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-previous"
              >
                <SkipBack className="w-8 h-8" />
              </Button>
              
              <Button
                onClick={togglePlay}
                size="lg"
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-all glow-effect transform hover:scale-105"
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-next"
              >
                <SkipForward className="w-8 h-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleRepeat}
                className={`transition-colors ${repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="button-repeat"
              >
                <Repeat className="w-6 h-6" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">1</span>
                )}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-32"
                data-testid="slider-volume"
              />
              <span className="text-sm text-muted-foreground w-8">{volume}%</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500 transition-colors"
                data-testid="button-favorite"
              >
                <Heart className="w-5 h-5" />
                <span className="ml-2">إضافة للمفضلة</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-download"
              >
                <Download className="w-5 h-5" />
                <span className="ml-2">تحميل</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-share"
              >
                <Share className="w-5 h-5" />
                <span className="ml-2">مشاركة</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}