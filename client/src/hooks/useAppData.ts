import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Artist } from "@shared/schema";

// Enhanced shared hooks with better performance
export function useArtists() {
  return useQuery({
    queryKey: ["/api/artists"],
    staleTime: 15 * 60 * 1000, // 15 minutes - longer cache
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Prefetch artists data
export function usePrefetchArtists() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: ["/api/artists"],
      staleTime: 15 * 60 * 1000,
    });
  };
}

export function useTrendingSongs() {
  return useQuery({
    queryKey: ["/api/songs/trending"],
    staleTime: 2 * 60 * 1000, // 2 minutes - trending changes more frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVideos() {
  return useQuery({
    queryKey: ["/api/videos"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAlbums() {
  return useQuery({
    queryKey: ["/api/albums"],
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useArtistName(artistId: string) {
  const { data: artists } = useArtists();
  
  if (!artists || !Array.isArray(artists) || !artistId) {
    return "فنان غير معروف";
  }
  
  const artist = (artists as Artist[]).find((a: Artist) => a.id === artistId);
  return artist?.name || "فنان غير معروف";
}