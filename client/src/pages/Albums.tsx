import { useQuery } from "@tanstack/react-query";
import { Disc, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Album, Artist } from "@shared/schema";

export default function Albums() {
  const { data: albums, isLoading: albumsLoading } = useQuery({
    queryKey: ["/api/albums"],
  });

  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const getArtistName = (artistId: string) => {
    if (!artists || !Array.isArray(artists)) return "فنان غير معروف";
    const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
    return artist?.name || "فنان غير معروف";
  };

  if (albumsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الألبومات
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
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
          الألبومات
        </h1>

        {albums && Array.isArray(albums) && albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(albums as Album[]).map((album: Album) => (
              <Card 
                key={album.id} 
                className="group cursor-pointer hover:bg-card/80 transition-colors"
                data-testid={`card-album-${album.id}`}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-t-xl flex items-center justify-center">
                    {album.coverImageUrl ? (
                      <img 
                        src={album.coverImageUrl} 
                        alt={album.title} 
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <Disc className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 truncate" data-testid={`text-album-title-${album.id}`}>
                      {album.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate" data-testid={`text-album-artist-${album.id}`}>
                      {getArtistName(album.artistId || "")}
                    </p>
                    {album.releaseDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(album.releaseDate).getFullYear()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد ألبومات</h3>
            <p className="text-muted-foreground">
              لا توجد ألبومات متاحة حالياً
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}