import { useState } from "react";
import { Play, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVideos, useArtists } from "@/hooks/useAppData";

interface Video {
  id: string;
  title: string;
  artistId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  viewCount: number;
  createdAt: string;
}

interface Artist {
  id: string;
  name: string;
}

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const { data: videos, isLoading: videosLoading } = useVideos();
  const { data: artists, isLoading: artistsLoading } = useArtists();

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

  if (videosLoading || artistsLoading) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الفيديوهات الموسيقية</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
            عرض الكل
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-video rounded-xl" />
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

  if (!videos || !Array.isArray(videos) || videos.length === 0) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الفيديوهات الموسيقية</h2>
        </div>
        <div className="bg-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">لا توجد فيديوهات متاحة حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">الفيديوهات الموسيقية</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
          عرض الكل
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(videos as Video[]).slice(0, 3).map((video: Video) => (
          <div 
            key={video.id} 
            className="group cursor-pointer hover-scale"
            onClick={() => handleVideoClick(video.id)}
            data-testid={`card-video-${video.id}`}
          >
            <div className="relative">
              <img 
                src={video.thumbnailUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
                alt={`${video.title} Thumbnail`}
                className="w-full aspect-video object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center">
                <Button
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 glow-effect"
                  data-testid={`button-play-video-${video.id}`}
                >
                  <Play className="w-6 h-6 text-white ml-1" />
                </Button>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatDuration(video.duration)}
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold truncate" data-testid={`text-video-title-${video.id}`}>
                {video.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-video-artist-${video.id}`}>
                {getArtistName(video.artistId)}
              </p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Eye className="w-3 h-3 mr-1" />
                <span data-testid={`text-view-count-${video.id}`}>
                  {formatViewCount(video.viewCount)}
                </span>
                <span className="mx-2">•</span>
                <span data-testid={`text-video-date-${video.id}`}>
                  {formatTimeAgo(video.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                poster={selectedVideo.thumbnailUrl}
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
                {getArtistName(selectedVideo.artistId)}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViewCount(selectedVideo.viewCount)}</span>
                </div>
                <span>{formatTimeAgo(selectedVideo.createdAt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
