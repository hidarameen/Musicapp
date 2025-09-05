import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search as SearchIcon, Music, Users, Video, Filter, Clock, Play, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Song, Artist, Video as VideoType } from "@shared/schema";

export default function Search() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Extract query parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
  }, [location]);

  // Debounced search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only fetch data when there's a debounced search query (lazy loading)
  const shouldFetch = debouncedQuery.length >= 2;

  const { data: songs, isLoading: songsLoading } = useQuery({
    queryKey: ["/api/songs"],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: artists, isLoading: artistsLoading } = useQuery({
    queryKey: ["/api/artists"],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["/api/videos"],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoized filtered results for better performance
  const filteredSongs = useMemo(() => {
    if (!shouldFetch || !debouncedQuery || !songs) return [];
    return (songs as Song[]).filter(song => 
      song.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      getArtistName(song.artistId || "")?.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 50); // Limit to 50 results for performance
  }, [shouldFetch, debouncedQuery, songs, artists]);

  const filteredArtists = useMemo(() => {
    if (!shouldFetch || !debouncedQuery || !artists) return [];
    return (artists as Artist[]).filter(artist =>
      artist.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 20); // Limit to 20 results for performance
  }, [shouldFetch, debouncedQuery, artists]);

  const filteredVideos = useMemo(() => {
    if (!shouldFetch || !debouncedQuery || !videos) return [];
    return (videos as VideoType[]).filter(video =>
      video.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      getArtistName(video.artistId || "")?.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 30); // Limit to 30 results for performance
  }, [shouldFetch, debouncedQuery, videos, artists]);

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLoading = songsLoading || artistsLoading || videosLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            البحث في الموسيقى
          </h1>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن الأغاني، الفنانين، أو الفيديوهات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg bg-card border-border focus:border-primary"
              data-testid="input-search"
            />
          </div>

          {/* Search Stats */}
          {searchQuery && (
            <div className="flex items-center gap-4 mb-6">
              <p className="text-muted-foreground">
                نتائج البحث عن: <span className="text-foreground font-semibold">"{searchQuery}"</span>
              </p>
              <Badge variant="secondary">
                {filteredSongs.length + filteredArtists.length + filteredVideos.length} نتيجة
              </Badge>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">الأكثر صلة</SelectItem>
                <SelectItem value="recent">الأحدث</SelectItem>
                <SelectItem value="popular">الأكثر شيوعاً</SelectItem>
                <SelectItem value="alphabetical">أبجدياً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="all" data-testid="tab-all">
              الكل ({filteredSongs.length + filteredArtists.length + filteredVideos.length})
            </TabsTrigger>
            <TabsTrigger value="songs" data-testid="tab-songs">
              أغاني ({filteredSongs.length})
            </TabsTrigger>
            <TabsTrigger value="artists" data-testid="tab-artists">
              فنانين ({filteredArtists.length})
            </TabsTrigger>
            <TabsTrigger value="videos" data-testid="tab-videos">
              فيديو ({filteredVideos.length})
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-8">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Artists Section */}
                {filteredArtists.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      الفنانين
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredArtists.slice(0, 6).map((artist) => (
                        <Card key={artist.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`card-artist-${artist.id}`}>
                          <CardContent className="p-4 text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                              {artist.profileImageUrl ? (
                                <img 
                                  src={artist.profileImageUrl} 
                                  alt={artist.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <h3 className="font-semibold text-sm mb-1 truncate">{artist.name}</h3>
                            <p className="text-xs text-muted-foreground">فنان</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Songs Section */}
                {filteredSongs.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Music className="w-6 h-6" />
                      الأغاني
                    </h2>
                    <div className="space-y-2">
                      {filteredSongs.slice(0, 10).map((song, index) => (
                        <Card key={song.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`card-song-${song.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <Music className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{song.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {getArtistName(song.artistId || "")}
                                </p>
                              </div>
                              
                              {song.duration && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">{formatDuration(song.duration)}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Heart className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {filteredVideos.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Video className="w-6 h-6" />
                      الفيديوهات
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVideos.slice(0, 6).map((video) => (
                        <Card key={video.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`card-video-${video.id}`}>
                          <CardContent className="p-0">
                            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                              {video.thumbnailUrl ? (
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title} 
                                  className="w-full h-full object-cover rounded-t-lg"
                                />
                              ) : (
                                <Video className="w-12 h-12 text-white" />
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold mb-1 truncate">{video.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {getArtistName(video.artistId || "")}
                              </p>
                              {video.duration && (
                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(video.duration)}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchQuery && filteredSongs.length === 0 && filteredArtists.length === 0 && filteredVideos.length === 0 && (
                  <div className="text-center py-12">
                    <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">لم نجد أي نتائج</h3>
                    <p className="text-muted-foreground">
                      جرب البحث بكلمات مختلفة أو تصفح المحتوى المتاح
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Songs Only */}
          <TabsContent value="songs">
            <div className="space-y-2">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => (
                  <Card key={song.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`song-item-${song.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{song.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {getArtistName(song.artistId || "")}
                          </p>
                        </div>
                        
                        {song.duration && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatDuration(song.duration)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد أغاني</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "لم نجد أغاني تطابق بحثك" : "لا توجد أغاني متاحة حالياً"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Artists Only */}
          <TabsContent value="artists">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {isLoading ? (
                [...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <Card key={artist.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`artist-item-${artist.id}`}>
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                        {artist.profileImageUrl ? (
                          <img 
                            src={artist.profileImageUrl} 
                            alt={artist.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1 truncate">{artist.name}</h3>
                      <p className="text-xs text-muted-foreground">فنان</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا يوجد فنانين</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "لم نجد فنانين يطابقون بحثك" : "لا يوجد فنانين متاحين حالياً"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Videos Only */}
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))
              ) : filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                  <Card key={video.id} className="group hover:bg-card/80 transition-colors cursor-pointer" data-testid={`video-item-${video.id}`}>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <Video className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 truncate">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getArtistName(video.artistId || "")}
                        </p>
                        {video.duration && (
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد فيديوهات</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "لم نجد فيديوهات تطابق بحثك" : "لا توجد فيديوهات متاحة حالياً"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}