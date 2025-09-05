import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { Artist } from "@shared/schema";

export default function Artists() {
  const [, navigate] = useLocation();
  
  const { data: artists, isLoading } = useQuery({
    queryKey: ["/api/artists"],
  });

  const handleArtistClick = (artistId: string) => {
    navigate(`/artist/${artistId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            الفنانين
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <Skeleton className="w-full aspect-square rounded-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
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
          الفنانين
        </h1>

        {artists && Array.isArray(artists) && artists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {(artists as Artist[]).map((artist: Artist) => (
              <Card 
                key={artist.id} 
                className="group cursor-pointer hover:bg-card/80 transition-colors"
                onClick={() => handleArtistClick(artist.id)}
                data-testid={`card-artist-${artist.id}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative">
                    <img 
                      src={artist.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"} 
                      alt={`${artist.name} Photo`}
                      className="w-full aspect-square object-cover rounded-full mb-4"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full flex items-center justify-center">
                      <Button
                        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300"
                        data-testid={`button-play-artist-${artist.id}`}
                      >
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2" data-testid={`text-artist-name-${artist.id}`}>
                    {artist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-artist-bio-${artist.id}`}>
                    {artist.bio || "فنان موهوب"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا يوجد فنانين</h3>
            <p className="text-muted-foreground">
              لا يوجد فنانين متاحين حالياً
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}