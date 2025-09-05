import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Music, 
  Play, 
  Heart, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Share2,
  Clock,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Playlist, Song, Artist, User } from "@shared/schema";

const createPlaylistSchema = z.object({
  name: z.string().min(1, "اسم قائمة التشغيل مطلوب"),
  description: z.string().optional(),
});

type CreatePlaylistFormData = z.infer<typeof createPlaylistSchema>;

export default function Playlists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Forms
  const createPlaylistForm = useForm<CreatePlaylistFormData>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Queries
  const { data: userPlaylists, isLoading: userPlaylistsLoading } = useQuery({
    queryKey: ["/api/users", (user as User)?.id, "playlists"],
    enabled: !!(user as User)?.id,
  });

  const { data: publicPlaylists, isLoading: publicPlaylistsLoading } = useQuery({
    queryKey: ["/api/playlists"],
  });

  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const { data: songs } = useQuery({
    queryKey: ["/api/songs"],
  });

  // Mutations
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: CreatePlaylistFormData) => {
      await apiRequest("POST", "/api/playlists", {
        ...data,
        userId: (user as User)?.id,
        isPublic: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", (user as User)?.id, "playlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      createPlaylistForm.reset();
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء قائمة التشغيل",
        description: "تم إنشاء قائمة التشغيل بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في إنشاء قائمة التشغيل",
        variant: "destructive",
      });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      await apiRequest("DELETE", `/api/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", (user as User)?.id, "playlists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "تم حذف قائمة التشغيل",
        description: "تم حذف قائمة التشغيل بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في حذف قائمة التشغيل",
        variant: "destructive",
      });
    },
  });

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const getPlaylistSongs = (playlistId: string) => {
    // This would typically be fetched from a playlist-songs endpoint
    // For now, returning empty array
    return [];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLoading = userPlaylistsLoading || publicPlaylistsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              قوائم التشغيل
            </h1>
            <p className="text-muted-foreground">
              أنشئ وأدر قوائم التشغيل الخاصة بك واستكشف قوائم المستخدمين الآخرين
            </p>
          </div>

          {/* Create Playlist Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-playlist">
                <Plus className="w-4 h-4 mr-2" />
                إنشاء قائمة تشغيل
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء قائمة تشغيل جديدة</DialogTitle>
              </DialogHeader>
              <Form {...createPlaylistForm}>
                <form onSubmit={createPlaylistForm.handleSubmit((data) => createPlaylistMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createPlaylistForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم قائمة التشغيل</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسم قائمة التشغيل" {...field} data-testid="input-playlist-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createPlaylistForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل وصف قائمة التشغيل..." 
                            rows={3}
                            {...field} 
                            data-testid="textarea-playlist-description" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createPlaylistMutation.isPending}
                      data-testid="button-submit-playlist"
                    >
                      {createPlaylistMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          إنشاء...
                        </>
                      ) : (
                        "إنشاء قائمة التشغيل"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel-playlist"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* User's Playlists */}
        {user ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              قوائم التشغيل الخاصة بك
            </h2>
            
            {userPlaylistsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : userPlaylists && Array.isArray(userPlaylists) && userPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(userPlaylists as Playlist[]).map((playlist) => {
                  const playlistSongs = getPlaylistSongs(playlist.id || "");
                  return (
                    <Card key={playlist.id} className="group hover:bg-card/80 transition-all duration-200 cursor-pointer" data-testid={`card-playlist-${playlist.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1 truncate">{playlist.name}</CardTitle>
                            {playlist.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {playlist.description}
                              </p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`dropdown-playlist-${playlist.id}`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                مشاركة
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => playlist.id && deletePlaylistMutation.mutate(playlist.id)}
                                disabled={deletePlaylistMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Playlist Cover */}
                        <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                          <Music className="w-12 h-12 text-white" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="sm" className="rounded-full w-12 h-12 p-0">
                              <Play className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Playlist Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{playlistSongs.length} أغنية</span>
                            {playlist.isPublic && <Badge variant="secondary">عامة</Badge>}
                          </div>
                          
                          {playlist.createdAt && (
                            <p className="text-xs text-muted-foreground">
                              أُنشئت في {new Date(playlist.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد قوائم تشغيل</h3>
                <p className="text-muted-foreground mb-4">
                  أنشئ قائمة التشغيل الأولى لتجميع أغانيك المفضلة
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  إنشاء قائمة تشغيل
                </Button>
              </Card>
            )}
          </div>
        ) : null}

        {/* Public Playlists */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6" />
            قوائم التشغيل المُوصى بها
          </h2>
          
          {publicPlaylistsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : publicPlaylists && Array.isArray(publicPlaylists) && publicPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(publicPlaylists as Playlist[]).map((playlist) => {
                const playlistSongs = getPlaylistSongs(playlist.id || "");
                return (
                  <Card key={playlist.id} className="group hover:bg-card/80 transition-all duration-200 cursor-pointer" data-testid={`card-public-playlist-${playlist.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg mb-1 truncate">{playlist.name}</CardTitle>
                      {playlist.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {playlist.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Playlist Cover */}
                      <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        <Music className="w-12 h-12 text-white" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" className="rounded-full w-12 h-12 p-0">
                            <Play className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Playlist Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{playlistSongs.length} أغنية</span>
                          <Badge variant="secondary">عامة</Badge>
                        </div>
                        
                        {playlist.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            أُنشئت في {new Date(playlist.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد قوائم تشغيل عامة</h3>
              <p className="text-muted-foreground">
                لا توجد قوائم تشغيل عامة متاحة حالياً
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}