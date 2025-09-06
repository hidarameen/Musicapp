import {
  users,
  artists,
  albums,
  songs,
  videos,
  playlists,
  playlistSongs,
  userFavorites,
  type User,
  type UpsertUser,
  type Artist,
  type InsertArtist,
  type Album,
  type InsertAlbum,
  type Song,
  type InsertSong,
  type Video,
  type InsertVideo,
  type Playlist,
  type InsertPlaylist,
  type PlaylistSong,
  type InsertPlaylistSong,
  type UserFavorite,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Artist operations
  getArtists(): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist>;
  deleteArtist(id: string): Promise<void>;

  // Album operations
  getAlbums(): Promise<Album[]>;
  getAlbum(id: string): Promise<Album | undefined>;
  getAlbumsByArtist(artistId: string): Promise<Album[]>;
  createAlbum(album: InsertAlbum): Promise<Album>;
  updateAlbum(id: string, album: Partial<InsertAlbum>): Promise<Album>;
  deleteAlbum(id: string): Promise<void>;

  // Song operations
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | undefined>;
  getSongsByArtist(artistId: string): Promise<Song[]>;
  getSongsByAlbum(albumId: string): Promise<Song[]>;
  getTrendingSongs(limit?: number): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  incrementPlayCount(songId: string): Promise<void>;

  // Video operations
  getVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  getVideosByArtist(artistId: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  incrementViewCount(videoId: string): Promise<void>;

  // Playlist operations
  getPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getUserPlaylists(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist>;
  deletePlaylist(id: string): Promise<void>;

  // Playlist song operations
  getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]>;
  addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong>;
  removeSongFromPlaylist(playlistId: string, songId: string): Promise<void>;

  // User favorites
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  addToFavorites(userId: string, songId: string): Promise<UserFavorite>;
  removeFromFavorites(userId: string, songId: string): Promise<void>;
  isFavorite(userId: string, songId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUser(userData: {
    username: string;
    email?: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isAdmin?: boolean;
  }) {
    const [user] = await db.insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserByUsername(username: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  }

  async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  // Artist operations
  async getArtists(): Promise<Artist[]> {
    return await db.select().from(artists).orderBy(asc(artists.name));
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [created] = await db.insert(artists).values(artist).returning();
    return created;
  }

  async updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist> {
    const [updated] = await db
      .update(artists)
      .set(artist)
      .where(eq(artists.id, id))
      .returning();
    return updated;
  }

  async deleteArtist(id: string): Promise<void> {
    await db.delete(artists).where(eq(artists.id, id));
  }

  // Album operations
  async getAlbums(): Promise<Album[]> {
    return await db.select().from(albums).orderBy(desc(albums.createdAt));
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album;
  }

  async getAlbumsByArtist(artistId: string): Promise<Album[]> {
    return await db
      .select()
      .from(albums)
      .where(eq(albums.artistId, artistId))
      .orderBy(desc(albums.releaseDate));
  }

  async createAlbum(album: InsertAlbum): Promise<Album> {
    const [created] = await db.insert(albums).values(album).returning();
    return created;
  }

  async updateAlbum(id: string, album: Partial<InsertAlbum>): Promise<Album> {
    const [updated] = await db
      .update(albums)
      .set(album)
      .where(eq(albums.id, id))
      .returning();
    return updated;
  }

  async deleteAlbum(id: string): Promise<void> {
    await db.delete(albums).where(eq(albums.id, id));
  }

  // Song operations
  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs).orderBy(desc(songs.createdAt));
  }

  async getSong(id: string): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async getSongsByArtist(artistId: string): Promise<Song[]> {
    return await db
      .select()
      .from(songs)
      .where(eq(songs.artistId, artistId))
      .orderBy(desc(songs.createdAt));
  }

  async getSongsByAlbum(albumId: string): Promise<Song[]> {
    return await db
      .select()
      .from(songs)
      .where(eq(songs.albumId, albumId))
      .orderBy(asc(songs.title));
  }

  async getTrendingSongs(limit: number = 10): Promise<Song[]> {
    return await db
      .select()
      .from(songs)
      .orderBy(desc(songs.playCount))
      .limit(limit);
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [created] = await db.insert(songs).values(song).returning();
    return created;
  }

  async updateSong(id: string, song: Partial<InsertSong>): Promise<Song> {
    const [updated] = await db
      .update(songs)
      .set(song)
      .where(eq(songs.id, id))
      .returning();
    return updated;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  async incrementPlayCount(songId: string): Promise<void> {
    await db
      .update(songs)
      .set({ playCount: sql`${songs.playCount} + 1` })
      .where(eq(songs.id, songId));
  }

  // Video operations
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getVideosByArtist(artistId: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.artistId, artistId))
      .orderBy(desc(videos.createdAt));
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [created] = await db.insert(videos).values(video).returning();
    return created;
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video> {
    const [updated] = await db
      .update(videos)
      .set(video)
      .where(eq(videos.id, id))
      .returning();
    return updated;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async incrementViewCount(videoId: string): Promise<void> {
    await db
      .update(videos)
      .set({ viewCount: sql`${videos.viewCount} + 1` })
      .where(eq(videos.id, videoId));
  }

  // Playlist operations
  async getPlaylists(): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.isPublic, true))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.createdAt));
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [created] = await db.insert(playlists).values(playlist).returning();
    return created;
  }

  async updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist> {
    const [updated] = await db
      .update(playlists)
      .set(playlist)
      .where(eq(playlists.id, id))
      .returning();
    return updated;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  // Playlist song operations
  async getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
    return await db
      .select()
      .from(playlistSongs)
      .where(eq(playlistSongs.playlistId, playlistId))
      .orderBy(asc(playlistSongs.position));
  }

  async addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong> {
    const [created] = await db.insert(playlistSongs).values(playlistSong).returning();
    return created;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );
  }

  // User favorites
  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
  }

  async addToFavorites(userId: string, songId: string): Promise<UserFavorite> {
    const [created] = await db
      .insert(userFavorites)
      .values({ userId, songId })
      .returning();
    return created;
  }

  async removeFromFavorites(userId: string, songId: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.songId, songId)
        )
      );
  }

  async isFavorite(userId: string, songId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.songId, songId)
        )
      );
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();