import { users, artists, albums, songs, videos, playlists, playlistSongs, userFavorites, } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and } from "drizzle-orm";
export class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async upsertUser(userData) {
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
    async createUser(userData) {
        const [user] = await db.insert(users)
            .values(userData)
            .returning();
        return user;
    }
    async getUserByUsername(username) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);
        return result[0] || null;
    }
    async getUserByEmail(email) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return result[0] || null;
    }
    // Artist operations
    async getArtists() {
        return await db.select().from(artists).orderBy(asc(artists.name));
    }
    async getArtist(id) {
        const [artist] = await db.select().from(artists).where(eq(artists.id, id));
        return artist;
    }
    async createArtist(artist) {
        const [created] = await db.insert(artists).values(artist).returning();
        return created;
    }
    async updateArtist(id, artist) {
        const [updated] = await db
            .update(artists)
            .set(artist)
            .where(eq(artists.id, id))
            .returning();
        return updated;
    }
    async deleteArtist(id) {
        await db.delete(artists).where(eq(artists.id, id));
    }
    // Album operations
    async getAlbums() {
        return await db.select().from(albums).orderBy(desc(albums.createdAt));
    }
    async getAlbum(id) {
        const [album] = await db.select().from(albums).where(eq(albums.id, id));
        return album;
    }
    async getAlbumsByArtist(artistId) {
        return await db
            .select()
            .from(albums)
            .where(eq(albums.artistId, artistId))
            .orderBy(desc(albums.releaseDate));
    }
    async createAlbum(album) {
        const [created] = await db.insert(albums).values(album).returning();
        return created;
    }
    async updateAlbum(id, album) {
        const [updated] = await db
            .update(albums)
            .set(album)
            .where(eq(albums.id, id))
            .returning();
        return updated;
    }
    async deleteAlbum(id) {
        await db.delete(albums).where(eq(albums.id, id));
    }
    // Song operations
    async getSongs() {
        return await db.select().from(songs).orderBy(desc(songs.createdAt));
    }
    async getSong(id) {
        const [song] = await db.select().from(songs).where(eq(songs.id, id));
        return song;
    }
    async getSongsByArtist(artistId) {
        return await db
            .select()
            .from(songs)
            .where(eq(songs.artistId, artistId))
            .orderBy(desc(songs.createdAt));
    }
    async getSongsByAlbum(albumId) {
        return await db
            .select()
            .from(songs)
            .where(eq(songs.albumId, albumId))
            .orderBy(asc(songs.title));
    }
    async getTrendingSongs(limit = 10) {
        return await db
            .select()
            .from(songs)
            .orderBy(desc(songs.playCount))
            .limit(limit);
    }
    async createSong(song) {
        const [created] = await db.insert(songs).values(song).returning();
        return created;
    }
    async updateSong(id, song) {
        const [updated] = await db
            .update(songs)
            .set(song)
            .where(eq(songs.id, id))
            .returning();
        return updated;
    }
    async deleteSong(id) {
        await db.delete(songs).where(eq(songs.id, id));
    }
    async incrementPlayCount(songId) {
        await db
            .update(songs)
            .set({ playCount: sql `${songs.playCount} + 1` })
            .where(eq(songs.id, songId));
    }
    // Video operations
    async getVideos() {
        return await db.select().from(videos).orderBy(desc(videos.createdAt));
    }
    async getVideo(id) {
        const [video] = await db.select().from(videos).where(eq(videos.id, id));
        return video;
    }
    async getVideosByArtist(artistId) {
        return await db
            .select()
            .from(videos)
            .where(eq(videos.artistId, artistId))
            .orderBy(desc(videos.createdAt));
    }
    async createVideo(video) {
        const [created] = await db.insert(videos).values(video).returning();
        return created;
    }
    async updateVideo(id, video) {
        const [updated] = await db
            .update(videos)
            .set(video)
            .where(eq(videos.id, id))
            .returning();
        return updated;
    }
    async deleteVideo(id) {
        await db.delete(videos).where(eq(videos.id, id));
    }
    async incrementViewCount(videoId) {
        await db
            .update(videos)
            .set({ viewCount: sql `${videos.viewCount} + 1` })
            .where(eq(videos.id, videoId));
    }
    // Playlist operations
    async getPlaylists() {
        return await db
            .select()
            .from(playlists)
            .where(eq(playlists.isPublic, true))
            .orderBy(desc(playlists.createdAt));
    }
    async getPlaylist(id) {
        const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
        return playlist;
    }
    async getUserPlaylists(userId) {
        return await db
            .select()
            .from(playlists)
            .where(eq(playlists.userId, userId))
            .orderBy(desc(playlists.createdAt));
    }
    async createPlaylist(playlist) {
        const [created] = await db.insert(playlists).values(playlist).returning();
        return created;
    }
    async updatePlaylist(id, playlist) {
        const [updated] = await db
            .update(playlists)
            .set(playlist)
            .where(eq(playlists.id, id))
            .returning();
        return updated;
    }
    async deletePlaylist(id) {
        await db.delete(playlists).where(eq(playlists.id, id));
    }
    // Playlist song operations
    async getPlaylistSongs(playlistId) {
        return await db
            .select()
            .from(playlistSongs)
            .where(eq(playlistSongs.playlistId, playlistId))
            .orderBy(asc(playlistSongs.position));
    }
    async addSongToPlaylist(playlistSong) {
        const [created] = await db.insert(playlistSongs).values(playlistSong).returning();
        return created;
    }
    async removeSongFromPlaylist(playlistId, songId) {
        await db
            .delete(playlistSongs)
            .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.songId, songId)));
    }
    // User favorites
    async getUserFavorites(userId) {
        return await db
            .select()
            .from(userFavorites)
            .where(eq(userFavorites.userId, userId))
            .orderBy(desc(userFavorites.createdAt));
    }
    async addToFavorites(userId, songId) {
        const [created] = await db
            .insert(userFavorites)
            .values({ userId, songId })
            .returning();
        return created;
    }
    async removeFromFavorites(userId, songId) {
        await db
            .delete(userFavorites)
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.songId, songId)));
    }
    async isFavorite(userId, songId) {
        const [favorite] = await db
            .select()
            .from(userFavorites)
            .where(and(eq(userFavorites.userId, userId), eq(userFavorites.songId, songId)));
        return !!favorite;
    }
}
export const storage = new DatabaseStorage();
