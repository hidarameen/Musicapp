import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Eye, X, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Video, Artist } from "@shared/schema";

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M مشاهدة`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K مشاهدة`;
    }
    return `${count} مشاهدة`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "اليوم";
    if (diffInDays === 1) return "أمس";
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffInDays / 30)} شهر`;
  };

  const handleVideoClick = (videoId: string) => {
    const video = (videos as Video[])?.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      setIsVideoModalOpen(true);
    }
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الفيديوهات الموسيقية
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          الفيديوهات الموسيقية
        </h1>

        {videos && Array.isArray(videos) && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(videos as Video[]).map((video: Video) => (
              <Card 
                key={video.id} 
                className="group cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => handleVideoClick(video.id)}
                data-testid={`card-video-${video.id}`}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={video.thumbnailUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
                      alt={`${video.title} Thumbnail`}
                      className="w-full aspect-video object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-t-xl flex items-center justify-center">
                      <Button
                        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300"
                        data-testid={`button-play-video-${video.id}`}
                      >
                        <Play className="w-6 h-6 text-white ml-1" />
                      </Button>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 truncate" data-testid={`text-video-title-${video.id}`}>
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-2" data-testid={`text-video-artist-${video.id}`}>
                      {getArtistName(video.artistId || "")}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span data-testid={`text-view-count-${video.id}`}>
                          {formatViewCount(video.viewCount || 0)}
                        </span>
                      </div>
                      <span data-testid={`text-video-date-${video.id}`}>
                        {formatTimeAgo(typeof video.createdAt === 'string' ? video.createdAt : new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <VideoIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد فيديوهات</h3>
            <p className="text-muted-foreground">
              لا توجد فيديوهات متاحة حالياً
            </p>
          </Card>
        )}

        {/* Video Player Modal */}
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-black border-0">
            <DialogHeader className="p-4 bg-black text-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white">
                  {selectedVideo?.title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            <div className="aspect-video bg-black">
              {selectedVideo && (
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={selectedVideo.thumbnailUrl || undefined}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              )}
            </div>
            {selectedVideo && (
              <div className="p-4 bg-card text-foreground">
                <h3 className="font-semibold mb-2">{selectedVideo.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {getArtistName(selectedVideo.artistId || "")}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViewCount(selectedVideo.viewCount || 0)}</span>
                  </div>
                  <span>{formatTimeAgo(typeof selectedVideo.createdAt === 'string' ? selectedVideo.createdAt : new Date().toISOString())}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}