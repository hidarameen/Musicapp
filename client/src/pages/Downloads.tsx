import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  Download, 
  Music, 
  Play, 
  Trash2, 
  HardDrive,
  Clock,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Song, Artist, User } from "@shared/schema";

interface DownloadedSong {
  id: string;
  title: string;
  artistId: string;
  downloadDate: Date;
  fileSize: number;
  quality: string;
  status: "completed" | "downloading";
  progress?: number;
  localAudioUrl?: string;
}

// Function to get downloaded songs from localStorage
const getDownloadedSongs = () => {
  try {
    const downloaded = localStorage.getItem('downloadedSongs');
    return downloaded ? JSON.parse(downloaded) : [];
  } catch (error) {
    console.error('Error reading downloads from localStorage:', error);
    return [];
  }
};

// Mock data for demonstration (will be replaced by localStorage data)
const mockDownloadedSongs = [
  {
    id: "song-1",
    title: "أهواك",
    artistId: "artist-1",
    downloadDate: new Date("2024-01-15"),
    fileSize: 4.2, // MB
    quality: "320kbps",
    status: "completed"
  },
  {
    id: "song-2", 
    title: "ليلة عمري",
    artistId: "artist-2",
    downloadDate: new Date("2024-01-14"),
    fileSize: 3.8,
    quality: "256kbps", 
    status: "completed"
  },
  {
    id: "song-3",
    title: "نسيني الدنيا",
    artistId: "artist-3", 
    downloadDate: new Date("2024-01-13"),
    fileSize: 5.1,
    quality: "320kbps",
    status: "downloading",
    progress: 75
  }
];

export default function Downloads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch artists for name lookup
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const formatFileSize = (sizeMB: number) => {
    return `${sizeMB.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get actual downloaded songs from localStorage, fallback to mock data for demo
  const downloadedSongs = getDownloadedSongs().length > 0 ? getDownloadedSongs() : mockDownloadedSongs;
  
  // Filter and sort downloaded songs
  const filteredSongs = (downloadedSongs as DownloadedSong[])
    .filter((song: DownloadedSong) => {
      if (!searchQuery) return true;
      return song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             getArtistName(song.artistId).toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a: DownloadedSong, b: DownloadedSong) => {
      switch (sortBy) {
        case "recent":
          return b.downloadDate.getTime() - a.downloadDate.getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title, 'ar');
        case "size":
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

  const completedSongs = filteredSongs.filter((song: DownloadedSong) => song.status === "completed");
  const downloadingSongs = filteredSongs.filter((song: DownloadedSong) => song.status === "downloading");

  const totalSize = (downloadedSongs as DownloadedSong[])
    .filter((song: DownloadedSong) => song.status === "completed")
    .reduce((sum: number, song: DownloadedSong) => sum + song.fileSize, 0);

  const handleDeleteDownload = (songId: string) => {
    // Remove from localStorage
    const existingDownloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
    const updatedDownloads = existingDownloads.filter((download: any) => download.id !== songId);
    localStorage.setItem('downloadedSongs', JSON.stringify(updatedDownloads));
    
    toast({
      title: "تم حذف التحميل",
      description: "تم حذف الأغنية من التحميلات المحفوظة",
    });
    
    // Force refresh the page to update the UI
    window.location.reload();
  };

  const handlePlayOffline = (songId: string) => {
    // Find the song in downloads
    const existingDownloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
    const downloadedSong = existingDownloads.find((download: any) => download.id === songId);
    
    if (downloadedSong && downloadedSong.localAudioUrl) {
      // If we had the music context available, we could set it here
      toast({
        title: "تشغيل الأغنية",
        description: "جاري تشغيل الأغنية من التحميلات المحفوظة",
      });
    } else {
      toast({
        title: "خطأ",
        description: "ملف الصوت غير متوفر محلياً",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Download className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">تسجيل الدخول مطلوب</h3>
          <p className="text-muted-foreground mb-4">
            يجب تسجيل الدخول للوصول إلى التحميلات المحفوظة
          </p>
          <Button onClick={() => window.location.href = "/api/login"}>
            تسجيل الدخول
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            التحميلات
          </h1>
          <p className="text-muted-foreground">
            أغانيك المحملة للاستماع بدون إنترنت
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedSongs.length}</p>
                  <p className="text-sm text-muted-foreground">أغنية محملة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                  <p className="text-sm text-muted-foreground">المساحة المستخدمة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{downloadingSongs.length}</p>
                  <p className="text-sm text-muted-foreground">جاري التحميل</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ابحث في التحميلات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-downloads"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48" data-testid="select-sort-downloads">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">الأحدث</SelectItem>
              <SelectItem value="alphabetical">أبجدياً</SelectItem>
              <SelectItem value="size">حسب الحجم</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="completed" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="completed" data-testid="tab-completed">
              مكتملة ({completedSongs.length})
            </TabsTrigger>
            <TabsTrigger value="downloading" data-testid="tab-downloading">
              جاري التحميل ({downloadingSongs.length})
            </TabsTrigger>
          </TabsList>

          {/* Completed Downloads */}
          <TabsContent value="completed">
            {completedSongs.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completedSongs.map((song) => (
                    <Card key={song.id} className="group hover:bg-card/80 transition-colors" data-testid={`card-download-${song.id}`}>
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center relative">
                          <Music className="w-12 h-12 text-white" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              size="sm" 
                              className="rounded-full w-12 h-12 p-0"
                              onClick={() => handlePlayOffline(song.id)}
                            >
                              <Play className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold truncate">{song.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {getArtistName(song.artistId)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(song.fileSize)}</span>
                            <Badge variant="secondary">{song.quality}</Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            تم التحميل في {formatDate(song.downloadDate)}
                          </p>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handlePlayOffline(song.id)}
                              data-testid={`button-play-${song.id}`}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              تشغيل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteDownload(song.id)}
                              data-testid={`button-delete-${song.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {completedSongs.map((song) => (
                    <Card key={song.id} className="group hover:bg-card/80 transition-colors" data-testid={`list-download-${song.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{song.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {getArtistName(song.artistId)}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(song.fileSize)}</span>
                            <Badge variant="secondary">{song.quality}</Badge>
                            <span>{formatDate(song.downloadDate)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handlePlayOffline(song.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteDownload(song.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              <Card className="p-8 text-center">
                <Download className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد تحميلات</h3>
                <p className="text-muted-foreground">
                  ابدأ بتحميل أغانيك المفضلة للاستماع بدون إنترنت
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Downloading */}
          <TabsContent value="downloading">
            {downloadingSongs.length > 0 ? (
              <div className="space-y-4">
                {downloadingSongs.map((song) => (
                  <Card key={song.id} data-testid={`card-downloading-${song.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Download className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{song.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {getArtistName(song.artistId)}
                          </p>
                          
                          {song.progress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>جاري التحميل...</span>
                                <span>{song.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${song.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(song.fileSize)}</span>
                          <Badge variant="secondary">{song.quality}</Badge>
                        </div>

                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد تحميلات جارية</h3>
                <p className="text-muted-foreground">
                  جميع التحميلات مكتملة
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}