import { useLocation } from "wouter";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtists } from "@/hooks/useAppData";

interface Artist {
  id: string;
  name: string;
  bio?: string;
  profileImageUrl?: string;
}

export default function ArtistsSection() {
  const [, navigate] = useLocation();
  const { data: artists, isLoading } = useArtists();

  const handleArtistClick = (artistId: string) => {
    navigate(`/artist/${artistId}`);
  };

  if (isLoading) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الفنانين المميزين</h2>
          <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
            عرض الكل
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <Skeleton className="w-full aspect-square rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!artists || !Array.isArray(artists) || artists.length === 0) {
    return (
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">الفنانين المميزين</h2>
        </div>
        <div className="bg-card rounded-xl p-8 text-center">
          <p className="text-muted-foreground">لا يوجد فنانين متاحين حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">الفنانين المميزين</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
          عرض الكل
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {(artists as Artist[]).slice(0, 6).map((artist: Artist) => (
          <div
            key={artist.id}
            className="group cursor-pointer hover-scale text-center"
            onClick={() => handleArtistClick(artist.id)}
            data-testid={`card-artist-${artist.id}`}
          >
            <div className="relative">
              <img
                src={artist.profileImageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSIxNTAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PHBhdGggZD0iTTE1MCA3MEMxNzIuMDkxIDcwIDE5MCA4Ny45MDg2IDE5MCAxMTBWMTQ1SDExMFYxMTBDMTEwIDg3LjkwODYgMTI3LjkwOSA3MCAxNTAgNzBaTTE5MCAyMjBWMTk1QzE5MCAyMDAuNTIzIDE4NS41MjMgMjA1IDE4MCAyMDVIMTIwQzExNC40NzcgMjA1IDExMCAyMDAuNTIzIDExMCAxOTVWMjIwQzExMCAyMjUuNTIzIDExNC40NzcgMjMwIDEyMCAyMzBIMTgwQzE4NS41MjMgMjMwIDE5MCAyMjUuNTIzIDE5MCAyMjBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSIzMDAiIHkyPSIzMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjNjM2NkYxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOEI1Q0Y2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+Cg=="}
                alt={`${artist.name} Photo`}
                className="w-full aspect-square object-cover rounded-full"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full flex items-center justify-center">
                <Button
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 glow-effect"
                  data-testid={`button-play-artist-${artist.id}`}
                >
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-semibold" data-testid={`text-artist-name-${artist.id}`}>
                {artist.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-artist-bio-${artist.id}`}>
                {artist.bio || "فنان موهوب"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}