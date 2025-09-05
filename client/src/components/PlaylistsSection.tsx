import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play, Heart, Plus, Music, Flame, Star, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  coverImageUrl?: string;
  createdAt: string;
}

export default function PlaylistsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["/api/playlists"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (playlistData: { name: string; description?: string }) => {
      await apiRequest("POST", "/api/playlists", playlistData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setIsCreateDialogOpen(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      toast({
        title: "تم إنشاء قائمة التشغيل",
        description: "تم إنشاء قائمة التشغيل بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء قائمة التشغيل",
        variant: "destructive",
      });
    },
  });

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم قائمة التشغيل",
        variant: "destructive",
      });
      return;
    }

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      description: newPlaylistDescription || undefined,
    });
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const getPlaylistIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("حب") || lowerName.includes("love")) {
      return Music;
    } else if (lowerName.includes("جديد") || lowerName.includes("new")) {
      return Flame;
    } else if (lowerName.includes("كلاسيك") || lowerName.includes("classic")) {
      return Star;
    } else if (lowerName.includes("تركيز") || lowerName.includes("focus")) {
      return Headphones;
    }
    return Music;
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-primary to-accent",
      "from-green-500 to-blue-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500",
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">قوائم التشغيل المقترحة</h2>
          <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            إنشاء قائمة جديدة
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">قوائم التشغيل المقترحة</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-create-playlist"
            >
              <Plus className="w-4 h-4 mr-2" />
              إنشاء قائمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">إنشاء قائمة تشغيل جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playlistName" className="text-foreground">اسم قائمة التشغيل</Label>
                <Input
                  id="playlistName"
                  type="text"
                  placeholder="أدخل اسم قائمة التشغيل"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-testid="input-playlist-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playlistDescription" className="text-foreground">الوصف (اختياري)</Label>
                <Textarea
                  id="playlistDescription"
                  placeholder="أدخل وصف قائمة التشغيل"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-testid="textarea-playlist-description"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createPlaylistMutation.isPending}
                data-testid="button-submit-playlist"
              >
                {createPlaylistMutation.isPending ? "جاري الإنشاء..." : "إنشاء قائمة التشغيل"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Default playlists if no user playlists exist */}
        {(!playlists || !Array.isArray(playlists) || playlists.length === 0) ? (
          <>
            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">أغاني الحب الكلاسيكية</h3>
                  <p className="text-sm text-muted-foreground">قائمة مقترحة • قريباً</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary-foreground" />
                  </Button>
                  <span className="text-sm text-muted-foreground">قريباً</span>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">أحدث الأغاني العربية</h3>
                  <p className="text-sm text-muted-foreground">قائمة مقترحة • قريباً</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary-foreground" />
                  </Button>
                  <span className="text-sm text-muted-foreground">قريباً</span>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {/* User playlists */}
        {playlists && Array.isArray(playlists) && (playlists as Playlist[]).map((playlist: Playlist, index: number) => {
          const IconComponent = getPlaylistIcon(playlist.name);
          return (
            <div 
              key={playlist.id} 
              className="bg-card rounded-xl p-4 hover:bg-muted transition-colors cursor-pointer hover-scale"
              onClick={() => handlePlaylistClick(playlist.id)}
              data-testid={`card-playlist-${playlist.id}`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getGradientClass(index)} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" data-testid={`text-playlist-name-${playlist.id}`}>
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-playlist-description-${playlist.id}`}>
                    {playlist.description || "قائمة تشغيل شخصية"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary-foreground" />
                  </Button>
                  <span className="text-sm text-muted-foreground">0 أغنية</span>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
