import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  insertArtistSchema,
  insertAlbumSchema,
  insertSongSchema,
  insertVideoSchema,
  type Artist,
  type Album,
  type Song,
  type Video,
  type User,
} from "@shared/schema";
import {
  Upload,
  Music,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  Play,
  Video as VideoIcon,
  Disc,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";

// Form schemas
const artistFormSchema = insertArtistSchema.extend({
  name: z.string().min(1, "اسم الفنان مطلوب"),
});

const albumFormSchema = insertAlbumSchema.extend({
  title: z.string().min(1, "عنوان الألبوم مطلوب"),
  artistId: z.string().min(1, "يجب اختيار فنان"),
});

const songFormSchema = insertSongSchema.extend({
  title: z.string().min(1, "عنوان الأغنية مطلوب"),
  artistId: z.string().min(1, "يجب اختيار فنان"),
  audioUrl: z.string().min(1, "رابط الصوت مطلوب"),
  albumId: z.string().optional(),
});

const videoFormSchema = insertVideoSchema.extend({
  title: z.string().min(1, "عنوان الفيديو مطلوب"),
  artistId: z.string().min(1, "يجب اختيار فنان"),
  videoUrl: z.string().min(1, "رابط الفيديو مطلوب"),
});

type FormData = {
  artist: z.infer<typeof artistFormSchema>;
  album: z.infer<typeof albumFormSchema>;
  song: z.infer<typeof songFormSchema>;
  video: z.infer<typeof videoFormSchema>;
};

export default function AdminModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  
  // File upload states
  const [uploadingFiles, setUploadingFiles] = useState({
    image: false,
    audio: false,
    video: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    image: null as string | null,
    audio: null as string | null,
    video: null as string | null,
  });

  // Forms
  const artistForm = useForm<FormData["artist"]>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      profileImageUrl: "",
      coverImageUrl: "",
    },
  });

  const albumForm = useForm<FormData["album"]>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      artistId: "",
      coverImageUrl: "",
    },
  });

  const songForm = useForm<FormData["song"]>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      title: "",
      artistId: "",
      albumId: "none",
      audioUrl: "",
      lyrics: "",
      duration: 0,
    },
  });

  const videoForm = useForm<FormData["video"]>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      artistId: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
    },
  });

  // Data queries - only enabled when modal is open with performance optimization
  const { data: artists, isLoading: artistsLoading } = useQuery({
    queryKey: ["/api/artists"],
    enabled: isOpen && activeTab === "manage",
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: albums, isLoading: albumsLoading } = useQuery({
    queryKey: ["/api/albums"],
    enabled: isOpen && (activeTab === "manage" || activeTab === "upload"),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ["/api/songs"],
    enabled: isOpen && activeTab === "manage",
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    enabled: isOpen && activeTab === "manage",
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Statistics
  const totalSongs = (songs && Array.isArray(songs)) ? songs.length : 0;
  const totalArtists = (artists && Array.isArray(artists)) ? artists.length : 0;
  const totalAlbums = (albums && Array.isArray(albums)) ? albums.length : 0;
  const totalVideos = (videos && Array.isArray(videos)) ? videos.length : 0;
  const totalPlays = (songs && Array.isArray(songs)) ? (songs as Song[]).reduce((sum: number, song: Song) => sum + (song.playCount || 0), 0) : 0;

  // File upload mutations
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, fieldName }: { file: File; fieldName?: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في رفع الصورة');
      }
      
      const result = await response.json();
      return { ...result, fieldName };
    },
    onMutate: () => {
      setUploadingFiles(prev => ({ ...prev, image: true }));
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, image: data.url }));
      
      // Auto-fill the appropriate form field
      if (data.fieldName === 'profileImageUrl') {
        artistForm.setValue('profileImageUrl', data.url);
      } else if (data.fieldName === 'coverImageUrl') {
        artistForm.setValue('coverImageUrl', data.url);
      } else if (data.fieldName === 'albumCoverImageUrl') {
        albumForm.setValue('coverImageUrl', data.url);
      }
      
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingFiles(prev => ({ ...prev, image: false }));
    },
  });

  const uploadAudioMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في رفع الملف الصوتي');
      }
      
      return response.json();
    },
    onMutate: () => {
      setUploadingFiles(prev => ({ ...prev, audio: true }));
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, audio: data.url }));
      // Auto-fill the audio URL in the form
      songForm.setValue('audioUrl', data.url);
      toast({
        title: "تم رفع الملف الصوتي",
        description: "تم رفع الملف الصوتي بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingFiles(prev => ({ ...prev, audio: false }));
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في رفع الفيديو');
      }
      
      return response.json();
    },
    onMutate: () => {
      setUploadingFiles(prev => ({ ...prev, video: true }));
    },
    onSuccess: (data) => {
      setUploadedFiles(prev => ({ ...prev, video: data.url }));
      // Auto-fill the video URL in the form
      videoForm.setValue('videoUrl', data.url);
      toast({
        title: "تم رفع الفيديو",
        description: "تم رفع الفيديو بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingFiles(prev => ({ ...prev, video: false }));
    },
  });

  // File upload handlers
  const handleFileUpload = (file: File, type: 'image' | 'audio' | 'video', fieldName?: string) => {
    if (type === 'image') {
      uploadImageMutation.mutate({ file, fieldName });
    } else if (type === 'audio') {
      uploadAudioMutation.mutate(file);
    } else if (type === 'video') {
      uploadVideoMutation.mutate(file);
    }
  };

  // Mutations
  const createArtistMutation = useMutation({
    mutationFn: async (data: FormData["artist"]) => {
      await apiRequest("POST", "/api/artists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      artistForm.reset();
      // إعادة تعيين ملفات الرفع
      setUploadedFiles(prev => ({ ...prev, image: null }));
      toast({
        title: "تم إنشاء الفنان",
        description: "تم إنشاء الفنان بنجاح",
      });
      // إغلاق النموذج بعد ثانيتين
      setTimeout(() => {
        setActiveTab("upload");
      }, 1500);
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
        description: "فشل في إنشاء الفنان",
        variant: "destructive",
      });
    },
  });

  const createAlbumMutation = useMutation({
    mutationFn: async (data: FormData["album"]) => {
      await apiRequest("POST", "/api/albums", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      albumForm.reset();
      // إعادة تعيين ملفات الرفع
      setUploadedFiles(prev => ({ ...prev, image: null }));
      toast({
        title: "تم إنشاء الألبوم",
        description: "تم إنشاء الألبوم بنجاح",
      });
      // إغلاق النموذج بعد ثانيتين
      setTimeout(() => {
        setActiveTab("upload");
      }, 1500);
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
        description: "فشل في إنشاء الألبوم",
        variant: "destructive",
      });
    },
  });

  const createSongMutation = useMutation({
    mutationFn: async (data: FormData["song"]) => {
      let albumId = data.albumId;
      
      // Handle default album creation if "default" is selected
      if (albumId === "default") {
        // Create default album if it doesn't exist
        const defaultAlbumTitle = "الأغاني المنفردة";
        
        // Check if default album already exists for this artist
        const existingDefaultAlbum = albums && Array.isArray(albums) 
          ? (albums as Album[]).find(album => 
              album.title === defaultAlbumTitle && album.artistId === data.artistId
            )
          : null;
        
        if (existingDefaultAlbum) {
          albumId = existingDefaultAlbum.id;
        } else {
          // Create new default album
          const defaultAlbumData = {
            title: defaultAlbumTitle,
            artistId: data.artistId,
            coverImageUrl: "",
          };
          
          const newAlbum = await apiRequest("POST", "/api/albums", defaultAlbumData);
          albumId = newAlbum.id;
          
          // Refresh albums list
          queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
        }
      } else if (albumId === "none") {
        albumId = null;
      }
      
      // Convert empty strings to null for optional foreign key fields
      const cleanedData = {
        ...data,
        albumId: albumId || null,
        duration: data.duration || null,
        lyrics: data.lyrics || null,
      };
      await apiRequest("POST", "/api/songs", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs/trending"] });
      songForm.reset();
      // إعادة تعيين ملفات الرفع
      setUploadedFiles(prev => ({ ...prev, audio: null }));
      toast({
        title: "تم رفع الأغنية",
        description: "تم رفع الأغنية بنجاح",
      });
      // إغلاق النموذج بعد ثانيتين
      setTimeout(() => {
        setActiveTab("upload");
      }, 1500);
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
        description: "فشل في رفع الأغنية",
        variant: "destructive",
      });
    },
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: FormData["video"]) => {
      await apiRequest("POST", "/api/videos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      videoForm.reset();
      // إعادة تعيين ملفات الرفع
      setUploadedFiles(prev => ({ ...prev, video: null }));
      toast({
        title: "تم رفع الفيديو",
        description: "تم رفع الفيديو بنجاح",
      });
      // إغلاق النموذج بعد ثانيتين
      setTimeout(() => {
        setActiveTab("upload");
      }, 1500);
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
        description: "فشل في رفع الفيديو",
        variant: "destructive",
      });
    },
  });

  const deleteArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      await apiRequest("DELETE", `/api/artists/${artistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "تم حذف الفنان",
        description: "تم حذف الفنان بنجاح",
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
        description: "فشل في حذف الفنان",
        variant: "destructive",
      });
    },
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      await apiRequest("DELETE", `/api/albums/${albumId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      toast({
        title: "تم حذف الألبوم",
        description: "تم حذف الألبوم بنجاح",
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
        description: "فشل في حذف الألبوم",
        variant: "destructive",
      });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: async (songId: string) => {
      await apiRequest("DELETE", `/api/songs/${songId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs/trending"] });
      toast({
        title: "تم حذف الأغنية",
        description: "تم حذف الأغنية بنجاح",
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
        description: "فشل في حذف الأغنية",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("DELETE", `/api/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "تم حذف الفيديو",
        description: "تم حذف الفيديو بنجاح",
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
        description: "فشل في حذف الفيديو",
        variant: "destructive",
      });
    },
  });

  // Listen for modal open events
  useEffect(() => {
    const handleAdminModalOpen = () => {
      setIsOpen(true);
    };

    // Listen for clicks on admin upload buttons
    const adminButtons = document.querySelectorAll('[data-testid="nav-upload"]');
    adminButtons.forEach(button => {
      button.addEventListener('click', handleAdminModalOpen);
    });

    return () => {
      adminButtons.forEach(button => {
        button.removeEventListener('click', handleAdminModalOpen);
      });
    };
  }, []);

  // Don't render if user is not admin
  if (!(user as User)?.isAdmin) {
    return null;
  }

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Edit functions
  const handleEditArtist = (artist: Artist) => {
    artistForm.reset({
      name: artist.name || "",
      bio: artist.bio || "",
      profileImageUrl: artist.profileImageUrl || "",
      coverImageUrl: artist.coverImageUrl || "",
    });
    setActiveTab("upload");
    // Switch to artist tab after a short delay
    setTimeout(() => {
      const artistTab = document.querySelector('[data-testid="tab-upload-artist"]') as HTMLElement;
      if (artistTab) artistTab.click();
    }, 100);
  };

  const handleEditAlbum = (album: Album) => {
    albumForm.reset({
      title: album.title || "",
      artistId: album.artistId || "",
      coverImageUrl: album.coverImageUrl || "",
    });
    setActiveTab("upload");
    // Switch to album tab after a short delay
    setTimeout(() => {
      const albumTab = document.querySelector('[data-testid="tab-upload-album"]') as HTMLElement;
      if (albumTab) albumTab.click();
    }, 100);
  };

  const handleEditSong = (song: Song) => {
    songForm.reset({
      title: song.title || "",
      artistId: song.artistId || "",
      albumId: song.albumId || "none",
      audioUrl: song.audioUrl || "",
      lyrics: song.lyrics || "",
      duration: song.duration || 0,
    });
    setActiveTab("upload");
    // Switch to song tab after a short delay
    setTimeout(() => {
      const songTab = document.querySelector('[data-testid="tab-upload-song"]') as HTMLElement;
      if (songTab) songTab.click();
    }, 100);
  };

  const handleEditVideo = (video: Video) => {
    videoForm.reset({
      title: video.title || "",
      artistId: video.artistId || "",
      videoUrl: video.videoUrl || "",
      thumbnailUrl: video.thumbnailUrl || "",
      duration: video.duration || 0,
    });
    setActiveTab("upload");
    // Switch to video tab after a short delay
    setTimeout(() => {
      const videoTab = document.querySelector('[data-testid="tab-upload-video"]') as HTMLElement;
      if (videoTab) videoTab.click();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
            لوحة الإدارة
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="upload" data-testid="tab-upload">رفع المحتوى</TabsTrigger>
            <TabsTrigger value="manage" data-testid="tab-manage">إدارة المحتوى</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">الإحصائيات</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">المستخدمين</TabsTrigger>
          </TabsList>

          {/* Upload Content Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Tabs defaultValue="song" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="song" data-testid="tab-upload-song">أغنية</TabsTrigger>
                <TabsTrigger value="video" data-testid="tab-upload-video">فيديو</TabsTrigger>
                <TabsTrigger value="artist" data-testid="tab-upload-artist">فنان</TabsTrigger>
                <TabsTrigger value="album" data-testid="tab-upload-album">ألبوم</TabsTrigger>
              </TabsList>

              {/* Upload Song */}
              <TabsContent value="song">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      رفع أغنية جديدة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...songForm}>
                      <form onSubmit={songForm.handleSubmit((data) => createSongMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={songForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان الأغنية</FormLabel>
                                <FormControl>
                                  <Input placeholder="أدخل عنوان الأغنية" {...field} data-testid="input-song-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={songForm.control}
                            name="artistId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الفنان</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-song-artist">
                                      <SelectValue placeholder="اختر الفنان" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {artistsLoading ? (
                                      <div className="p-2">جاري التحميل...</div>
                                    ) : (
                                      (artists && Array.isArray(artists)) ? (artists as Artist[]).map((artist: Artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                          {artist.name}
                                        </SelectItem>
                                      )) : null
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={songForm.control}
                            name="albumId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الألبوم (اختياري)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-song-album">
                                      <SelectValue placeholder="اختر الألبوم" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">بدون ألبوم</SelectItem>
                                    <SelectItem value="default">ألبوم افتراضي</SelectItem>
                                    {albumsLoading ? (
                                      <div className="p-2">جاري التحميل...</div>
                                    ) : (
                                      (albums && Array.isArray(albums)) ? (albums as Album[]).map((album: Album) => (
                                        <SelectItem key={album.id} value={album.id || ""}>
                                          {album.title}
                                        </SelectItem>
                                      )) : null
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={songForm.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>المدة (بالثواني)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="272" 
                                    {...field} 
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-song-duration" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={songForm.control}
                          name="audioUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ملف الصوت</FormLabel>
                              <div className="space-y-2">
                                {/* File Upload */}
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(file, 'audio');
                                      }
                                    }}
                                    disabled={uploadingFiles.audio}
                                    className="flex-1"
                                    data-testid="input-song-audio-file"
                                  />
                                  {uploadingFiles.audio && (
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  )}
                                </div>
                                
                                {/* URL Input */}
                                <FormControl>
                                  <Input 
                                    placeholder="أو أدخل رابط ملف الصوت" 
                                    {...field} 
                                    data-testid="input-song-audio-url" 
                                  />
                                </FormControl>
                                
                                {/* Preview */}
                                {(field.value || uploadedFiles.audio) && (
                                  <div className="p-2 bg-muted rounded border">
                                    <audio 
                                      controls 
                                      src={field.value || uploadedFiles.audio || ''} 
                                      className="w-full"
                                    >
                                      متصفحك لا يدعم تشغيل الصوت
                                    </audio>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={songForm.control}
                          name="lyrics"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمات الأغنية (اختياري)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={4} 
                                  placeholder="أدخل كلمات الأغنية هنا..." 
                                  {...field} 
                                  value={field.value || ""}
                                  data-testid="textarea-song-lyrics" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createSongMutation.isPending}
                          data-testid="button-upload-song"
                        >
                          {createSongMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              جاري الرفع...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              رفع الأغنية
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Video */}
              <TabsContent value="video">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <VideoIcon className="w-5 h-5" />
                      رفع فيديو جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...videoForm}>
                      <form onSubmit={videoForm.handleSubmit((data) => createVideoMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={videoForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان الفيديو</FormLabel>
                                <FormControl>
                                  <Input placeholder="أدخل عنوان الفيديو" {...field} data-testid="input-video-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={videoForm.control}
                            name="artistId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الفنان</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-video-artist">
                                      <SelectValue placeholder="اختر الفنان" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {artistsLoading ? (
                                      <div className="p-2">جاري التحميل...</div>
                                    ) : (
                                      (artists && Array.isArray(artists)) ? (artists as Artist[]).map((artist: Artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                          {artist.name}
                                        </SelectItem>
                                      )) : null
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={videoForm.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>المدة (بالثواني)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="180" 
                                    {...field} 
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-video-duration" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={videoForm.control}
                            name="thumbnailUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>صورة مصغرة للفيديو (اختياري)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/thumbnail.jpg" 
                                    {...field} 
                                    value={field.value || ""}
                                    data-testid="input-video-thumbnail" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={videoForm.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ملف الفيديو</FormLabel>
                              <div className="space-y-2">
                                {/* File Upload */}
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(file, 'video');
                                      }
                                    }}
                                    disabled={uploadingFiles.video}
                                    className="flex-1"
                                    data-testid="input-video-file"
                                  />
                                  {uploadingFiles.video && (
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  )}
                                </div>
                                
                                {/* URL Input */}
                                <FormControl>
                                  <Input 
                                    placeholder="أو أدخل رابط ملف الفيديو" 
                                    {...field} 
                                    data-testid="input-video-url" 
                                  />
                                </FormControl>
                                
                                {/* Preview */}
                                {(field.value || uploadedFiles.video) && (
                                  <div className="p-2 bg-muted rounded border">
                                    <video 
                                      controls 
                                      src={field.value || uploadedFiles.video || ''} 
                                      className="w-full max-h-40"
                                    >
                                      متصفحك لا يدعم تشغيل الفيديو
                                    </video>
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createVideoMutation.isPending}
                          data-testid="button-upload-video"
                        >
                          {createVideoMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              جاري الرفع...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              رفع الفيديو
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Artist */}
              <TabsContent value="artist">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      إضافة فنان جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...artistForm}>
                      <form onSubmit={artistForm.handleSubmit((data) => createArtistMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={artistForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم الفنان</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل اسم الفنان" {...field} data-testid="input-artist-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={artistForm.control}
                            name="profileImageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>صورة الفنان (اختياري)</FormLabel>
                                <div className="space-y-2">
                                  {/* File Upload */}
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileUpload(file, 'image', 'profileImageUrl');
                                        }
                                      }}
                                      disabled={uploadingFiles.image}
                                      className="flex-1"
                                      data-testid="input-artist-image-file"
                                    />
                                    {uploadingFiles.image && (
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    )}
                                  </div>
                                  
                                  {/* URL Input */}
                                  <FormControl>
                                    <Input 
                                      placeholder="أو أدخل رابط الصورة" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-artist-image" 
                                    />
                                  </FormControl>
                                  
                                  {/* Preview */}
                                  {field.value && (
                                    <div className="p-2 bg-muted rounded border">
                                      <img 
                                        src={field.value} 
                                        alt="صورة الفنان" 
                                        className="w-20 h-20 object-cover rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={artistForm.control}
                            name="coverImageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>صورة الغلاف (اختياري)</FormLabel>
                                <div className="space-y-2">
                                  {/* File Upload */}
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileUpload(file, 'image', 'coverImageUrl');
                                        }
                                      }}
                                      disabled={uploadingFiles.image}
                                      className="flex-1"
                                      data-testid="input-artist-cover-file"
                                    />
                                    {uploadingFiles.image && (
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    )}
                                  </div>
                                  
                                  {/* URL Input */}
                                  <FormControl>
                                    <Input 
                                      placeholder="أو أدخل رابط صورة الغلاف" 
                                      {...field} 
                                      value={field.value || ""}
                                      data-testid="input-artist-cover" 
                                    />
                                  </FormControl>
                                  
                                  {/* Preview */}
                                  {field.value && (
                                    <div className="p-2 bg-muted rounded border">
                                      <img 
                                        src={field.value} 
                                        alt="صورة الغلاف" 
                                        className="w-20 h-20 object-cover rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={artistForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نبذة عن الفنان (اختياري)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  rows={3} 
                                  placeholder="أدخل نبذة عن الفنان..." 
                                  {...field} 
                                  value={field.value || ""}
                                  data-testid="textarea-artist-bio" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createArtistMutation.isPending}
                          data-testid="button-create-artist"
                        >
                          {createArtistMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              جاري الإنشاء...
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4 mr-2" />
                              إضافة الفنان
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upload Album */}
              <TabsContent value="album">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Disc className="w-5 h-5" />
                      إضافة ألبوم جديد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...albumForm}>
                      <form onSubmit={albumForm.handleSubmit((data) => createAlbumMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={albumForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان الألبوم</FormLabel>
                                <FormControl>
                                  <Input placeholder="أدخل عنوان الألبوم" {...field} data-testid="input-album-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={albumForm.control}
                            name="artistId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الفنان</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-album-artist">
                                      <SelectValue placeholder="اختر الفنان" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {artistsLoading ? (
                                      <div className="p-2">جاري التحميل...</div>
                                    ) : (
                                      (artists && Array.isArray(artists)) ? (artists as Artist[]).map((artist: Artist) => (
                                        <SelectItem key={artist.id} value={artist.id || ""}>
                                          {artist.name}
                                        </SelectItem>
                                      )) : null
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={albumForm.control}
                          name="coverImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>غلاف الألبوم (اختياري)</FormLabel>
                              <div className="space-y-2">
                                {/* File Upload */}
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(file, 'image', 'albumCoverImageUrl');
                                      }
                                    }}
                                    disabled={uploadingFiles.image}
                                    className="flex-1"
                                    data-testid="input-album-cover-file"
                                  />
                                  {uploadingFiles.image && (
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  )}
                                </div>
                                
                                {/* URL Input */}
                                <FormControl>
                                  <Input 
                                    placeholder="أو أدخل رابط غلاف الألبوم" 
                                    {...field} 
                                    value={field.value || ""}
                                    data-testid="input-album-cover" 
                                  />
                                </FormControl>
                                
                                {/* Preview */}
                                {field.value && (
                                  <div className="p-2 bg-muted rounded border">
                                    <img 
                                      src={field.value} 
                                      alt="غلاف الألبوم" 
                                      className="w-20 h-20 object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={createAlbumMutation.isPending}
                          data-testid="button-create-album"
                        >
                          {createAlbumMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              جاري الإنشاء...
                            </>
                          ) : (
                            <>
                              <Disc className="w-4 h-4 mr-2" />
                              إضافة الألبوم
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Manage Content Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Artists Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      الفنانين
                    </span>
                    <Badge variant="secondary">{totalArtists}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {artistsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(artists && Array.isArray(artists) && artists.length > 0) ? (artists as Artist[]).slice(0, 5).map((artist: Artist) => (
                        <div key={artist.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <span className="text-sm">{artist.name}</span>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditArtist(artist)}
                              title="تعديل الفنان"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الفنان "${artist.name}"؟`)) {
                                  artist.id && deleteArtistMutation.mutate(artist.id);
                                }
                              }}
                              disabled={deleteArtistMutation.isPending}
                              title="حذف الفنان"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">لا يوجد فنانين</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Songs Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      الأغاني
                    </span>
                    <Badge variant="secondary">{totalSongs}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {songsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(songs && Array.isArray(songs) && songs.length > 0) ? (songs as Song[]).slice(0, 5).map((song: Song) => (
                        <div key={song.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">{song.title}</div>
                            <div className="text-xs text-muted-foreground">{getArtistName(song.artistId || "")}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditSong(song)}
                              title="تعديل الأغنية"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الأغنية "${song.title}"؟`)) {
                                  song.id && deleteSongMutation.mutate(song.id);
                                }
                              }}
                              disabled={deleteSongMutation.isPending}
                              title="حذف الأغنية"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">لا توجد أغاني</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Videos Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <VideoIcon className="w-5 h-5" />
                      الفيديوهات
                    </span>
                    <Badge variant="secondary">{totalVideos}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {videosLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(videos && Array.isArray(videos) && videos.length > 0) ? (videos as Video[]).slice(0, 5).map((video: Video) => (
                        <div key={video.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">{video.title}</div>
                            <div className="text-xs text-muted-foreground">{getArtistName(video.artistId || "")}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditVideo(video)}
                              title="تعديل الفيديو"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الفيديو "${video.title}"؟`)) {
                                  video.id && deleteVideoMutation.mutate(video.id);
                                }
                              }}
                              disabled={deleteVideoMutation.isPending}
                              title="حذف الفيديو"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">لا توجد فيديوهات</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Albums Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Disc className="w-5 h-5" />
                      الألبومات
                    </span>
                    <Badge variant="secondary">{totalAlbums}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {albumsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(albums && Array.isArray(albums) && albums.length > 0) ? (albums as Album[]).slice(0, 5).map((album: Album) => (
                        <div key={album.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">{album.title}</div>
                            <div className="text-xs text-muted-foreground">{getArtistName(album.artistId || "")}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                              onClick={() => handleEditAlbum(album)}
                              title="تعديل الألبوم"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف الألبوم "${album.title}"؟`)) {
                                  album.id && deleteAlbumMutation.mutate(album.id);
                                }
                              }}
                              disabled={deleteAlbumMutation.isPending}
                              title="حذف الألبوم"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">لا توجد ألبومات</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Music className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي الأغاني</p>
                      <p className="text-2xl font-bold">{formatNumber(totalSongs)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي الفنانين</p>
                      <p className="text-2xl font-bold">{formatNumber(totalArtists)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Play className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي المشاهدات</p>
                      <p className="text-2xl font-bold">{formatNumber(totalPlays)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <VideoIcon className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي الفيديوهات</p>
                      <p className="text-2xl font-bold">{formatNumber(totalVideos)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">المستخدمين النشطين</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">المديرين</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>إدارة المستخدمين</span>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة مستخدم
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">أنت (المدير الرئيسي)</h4>
                        <p className="text-sm text-muted-foreground">hidarah@mail.io</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">مدير</Badge>
                      <Button variant="ghost" size="sm" disabled>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">لا يوجد مستخدمين إضافيين</h3>
                    <p className="text-sm">
                      يمكنك دعوة مستخدمين جدد لإدارة المحتوى معك
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الصلاحيات والأدوار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">مدير كامل</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• رفع وإدارة المحتوى</li>
                        <li>• إدارة المستخدمين</li>
                        <li>• عرض الإحصائيات</li>
                        <li>• حذف وتعديل المحتوى</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">محرر محتوى</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• رفع الأغاني والفيديوهات</li>
                        <li>• تعديل المحتوى الخاص</li>
                        <li>• عرض الإحصائيات الأساسية</li>
                        <li>• إدارة قوائم التشغيل</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}