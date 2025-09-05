import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  coverImageUrl: varchar("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const albums = pgTable("albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id),
  coverImageUrl: varchar("cover_image_url"),
  releaseDate: timestamp("release_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id),
  albumId: varchar("album_id").references(() => albums.id),
  audioUrl: varchar("audio_url").notNull(),
  lyrics: text("lyrics"),
  duration: integer("duration"), // in seconds
  playCount: integer("play_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artistId: varchar("artist_id").references(() => artists.id),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration"), // in seconds
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  coverImageUrl: varchar("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id),
  songId: varchar("song_id").references(() => songs.id),
  position: integer("position"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  songId: varchar("song_id").references(() => songs.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const artistsRelations = relations(artists, ({ many }) => ({
  songs: many(songs),
  albums: many(albums),
  videos: many(videos),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  artist: one(artists, {
    fields: [albums.artistId],
    references: [artists.id],
  }),
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  artist: one(artists, {
    fields: [songs.artistId],
    references: [artists.id],
  }),
  album: one(albums, {
    fields: [songs.albumId],
    references: [albums.id],
  }),
  playlistSongs: many(playlistSongs),
  userFavorites: many(userFavorites),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  artist: one(artists, {
    fields: [videos.artistId],
    references: [artists.id],
  }),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistSongs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistSongs.playlistId],
    references: [playlists.id],
  }),
  song: one(songs, {
    fields: [playlistSongs.songId],
    references: [songs.id],
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [userFavorites.songId],
    references: [songs.id],
  }),
}));

// Insert schemas
export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
  playCount: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({
  id: true,
  addedAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(6, "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;