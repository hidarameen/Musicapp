import { storage } from "./storage.js";
import { isAuthenticated } from "./auth.js";
import { insertArtistSchema, insertAlbumSchema, insertSongSchema, insertVideoSchema, insertPlaylistSchema, insertPlaylistSongSchema, } from "../shared/schema.js";
export function registerApiRoutes(app) {
    // Artists
    app.get('/api/artists', async (req, res) => {
        try {
            const artists = await storage.getArtists();
            res.json(artists);
        }
        catch (error) {
            console.error("Error fetching artists:", error);
            res.status(500).json({ message: "خطأ في جلب الفنانين" });
        }
    });
    app.get('/api/artists/:id', async (req, res) => {
        try {
            const artist = await storage.getArtist(req.params.id);
            if (!artist) {
                return res.status(404).json({ message: "الفنان غير موجود" });
            }
            res.json(artist);
        }
        catch (error) {
            console.error("Error fetching artist:", error);
            res.status(500).json({ message: "خطأ في جلب بيانات الفنان" });
        }
    });
    app.post('/api/artists', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            const result = insertArtistSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const artist = await storage.createArtist(result.data);
            res.status(201).json(artist);
        }
        catch (error) {
            console.error("Error creating artist:", error);
            res.status(500).json({ message: "خطأ في إنشاء الفنان" });
        }
    });
    app.delete('/api/artists/:id', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            await storage.deleteArtist(req.params.id);
            res.json({ message: "تم حذف الفنان بنجاح" });
        }
        catch (error) {
            console.error("Error deleting artist:", error);
            res.status(500).json({ message: "خطأ في حذف الفنان" });
        }
    });
    // Albums
    app.get('/api/albums', async (req, res) => {
        try {
            const albums = await storage.getAlbums();
            res.json(albums);
        }
        catch (error) {
            console.error("Error fetching albums:", error);
            res.status(500).json({ message: "خطأ في جلب الألبومات" });
        }
    });
    app.get('/api/albums/:id', async (req, res) => {
        try {
            const album = await storage.getAlbum(req.params.id);
            if (!album) {
                return res.status(404).json({ message: "الألبوم غير موجود" });
            }
            res.json(album);
        }
        catch (error) {
            console.error("Error fetching album:", error);
            res.status(500).json({ message: "خطأ في جلب بيانات الألبوم" });
        }
    });
    app.post('/api/albums', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            const result = insertAlbumSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const album = await storage.createAlbum(result.data);
            res.status(201).json(album);
        }
        catch (error) {
            console.error("Error creating album:", error);
            res.status(500).json({ message: "خطأ في إنشاء الألبوم" });
        }
    });
    app.delete('/api/albums/:id', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            await storage.deleteAlbum(req.params.id);
            res.json({ message: "تم حذف الألبوم بنجاح" });
        }
        catch (error) {
            console.error("Error deleting album:", error);
            res.status(500).json({ message: "خطأ في حذف الألبوم" });
        }
    });
    // Songs
    app.get('/api/songs', async (req, res) => {
        try {
            const songs = await storage.getSongs();
            res.json(songs);
        }
        catch (error) {
            console.error("Error fetching songs:", error);
            res.status(500).json({ message: "خطأ في جلب الأغاني" });
        }
    });
    app.get('/api/songs/trending', async (req, res) => {
        try {
            const songs = await storage.getTrendingSongs();
            res.json(songs);
        }
        catch (error) {
            console.error("Error fetching trending songs:", error);
            res.status(500).json({ message: "خطأ في جلب الأغاني الرائجة" });
        }
    });
    app.get('/api/songs/:id', async (req, res) => {
        try {
            const song = await storage.getSong(req.params.id);
            if (!song) {
                return res.status(404).json({ message: "الأغنية غير موجودة" });
            }
            res.json(song);
        }
        catch (error) {
            console.error("Error fetching song:", error);
            res.status(500).json({ message: "خطأ في جلب بيانات الأغنية" });
        }
    });
    app.post('/api/songs', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            const result = insertSongSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const song = await storage.createSong(result.data);
            res.status(201).json(song);
        }
        catch (error) {
            console.error("Error creating song:", error);
            res.status(500).json({ message: "خطأ في إنشاء الأغنية" });
        }
    });
    app.delete('/api/songs/:id', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            await storage.deleteSong(req.params.id);
            res.json({ message: "تم حذف الأغنية بنجاح" });
        }
        catch (error) {
            console.error("Error deleting song:", error);
            res.status(500).json({ message: "خطأ في حذف الأغنية" });
        }
    });
    app.put('/api/songs/:id/play', async (req, res) => {
        try {
            await storage.incrementPlayCount(req.params.id);
            res.json({ message: "تم تحديث عدد المشاهدات" });
        }
        catch (error) {
            console.error("Error updating play count:", error);
            res.status(500).json({ message: "خطأ في تحديث عدد المشاهدات" });
        }
    });
    // Videos
    app.get('/api/videos', async (req, res) => {
        try {
            const videos = await storage.getVideos();
            res.json(videos);
        }
        catch (error) {
            console.error("Error fetching videos:", error);
            res.status(500).json({ message: "خطأ في جلب الفيديوهات" });
        }
    });
    app.get('/api/videos/:id', async (req, res) => {
        try {
            const video = await storage.getVideo(req.params.id);
            if (!video) {
                return res.status(404).json({ message: "الفيديو غير موجود" });
            }
            res.json(video);
        }
        catch (error) {
            console.error("Error fetching video:", error);
            res.status(500).json({ message: "خطأ في جلب بيانات الفيديو" });
        }
    });
    app.post('/api/videos', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            const result = insertVideoSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const video = await storage.createVideo(result.data);
            res.status(201).json(video);
        }
        catch (error) {
            console.error("Error creating video:", error);
            res.status(500).json({ message: "خطأ في إنشاء الفيديو" });
        }
    });
    app.delete('/api/videos/:id', isAuthenticated, async (req, res) => {
        try {
            const user = req.user;
            if (!user?.isAdmin) {
                return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
            }
            await storage.deleteVideo(req.params.id);
            res.json({ message: "تم حذف الفيديو بنجاح" });
        }
        catch (error) {
            console.error("Error deleting video:", error);
            res.status(500).json({ message: "خطأ في حذف الفيديو" });
        }
    });
    app.put('/api/videos/:id/view', async (req, res) => {
        try {
            await storage.incrementViewCount(req.params.id);
            res.json({ message: "تم تحديث عدد المشاهدات" });
        }
        catch (error) {
            console.error("Error updating view count:", error);
            res.status(500).json({ message: "خطأ في تحديث عدد المشاهدات" });
        }
    });
    // Playlists
    app.get('/api/playlists', async (req, res) => {
        try {
            const playlists = await storage.getPlaylists();
            res.json(playlists);
        }
        catch (error) {
            console.error("Error fetching playlists:", error);
            res.status(500).json({ message: "خطأ في جلب قوائم التشغيل" });
        }
    });
    app.get('/api/playlists/:id', async (req, res) => {
        try {
            const playlist = await storage.getPlaylist(req.params.id);
            if (!playlist) {
                return res.status(404).json({ message: "قائمة التشغيل غير موجودة" });
            }
            res.json(playlist);
        }
        catch (error) {
            console.error("Error fetching playlist:", error);
            res.status(500).json({ message: "خطأ في جلب بيانات قائمة التشغيل" });
        }
    });
    app.post('/api/playlists', isAuthenticated, async (req, res) => {
        try {
            const result = insertPlaylistSchema.safeParse({
                ...req.body,
                userId: req.user.id
            });
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const playlist = await storage.createPlaylist(result.data);
            res.status(201).json(playlist);
        }
        catch (error) {
            console.error("Error creating playlist:", error);
            res.status(500).json({ message: "خطأ في إنشاء قائمة التشغيل" });
        }
    });
    app.delete('/api/playlists/:id', isAuthenticated, async (req, res) => {
        try {
            const playlist = await storage.getPlaylist(req.params.id);
            if (!playlist) {
                return res.status(404).json({ message: "قائمة التشغيل غير موجودة" });
            }
            if (playlist.userId !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({ message: "غير مخول لحذف هذه القائمة" });
            }
            await storage.deletePlaylist(req.params.id);
            res.json({ message: "تم حذف قائمة التشغيل بنجاح" });
        }
        catch (error) {
            console.error("Error deleting playlist:", error);
            res.status(500).json({ message: "خطأ في حذف قائمة التشغيل" });
        }
    });
    app.post('/api/playlists/:id/songs', isAuthenticated, async (req, res) => {
        try {
            const playlist = await storage.getPlaylist(req.params.id);
            if (!playlist) {
                return res.status(404).json({ message: "قائمة التشغيل غير موجودة" });
            }
            if (playlist.userId !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({ message: "غير مخول لتعديل هذه القائمة" });
            }
            const result = insertPlaylistSongSchema.safeParse({
                playlistId: req.params.id,
                songId: req.body.songId,
                position: req.body.position
            });
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            await storage.addSongToPlaylist(result.data);
            res.json({ message: "تمت إضافة الأغنية لقائمة التشغيل" });
        }
        catch (error) {
            console.error("Error adding song to playlist:", error);
            res.status(500).json({ message: "خطأ في إضافة الأغنية لقائمة التشغيل" });
        }
    });
    app.delete('/api/playlists/:id/songs/:songId', isAuthenticated, async (req, res) => {
        try {
            const playlist = await storage.getPlaylist(req.params.id);
            if (!playlist) {
                return res.status(404).json({ message: "قائمة التشغيل غير موجودة" });
            }
            if (playlist.userId !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({ message: "غير مخول لتعديل هذه القائمة" });
            }
            await storage.removeSongFromPlaylist(req.params.id, req.params.songId);
            res.json({ message: "تمت إزالة الأغنية من قائمة التشغيل" });
        }
        catch (error) {
            console.error("Error removing song from playlist:", error);
            res.status(500).json({ message: "خطأ في إزالة الأغنية من قائمة التشغيل" });
        }
    });
    // User favorites
    app.get('/api/users/:userId/favorites', isAuthenticated, async (req, res) => {
        try {
            if (req.params.userId !== req.user.id && !req.user.isAdmin) {
                return res.status(403).json({ message: "غير مخول لعرض المفضلات" });
            }
            const favorites = await storage.getUserFavorites(req.params.userId);
            res.json(favorites);
        }
        catch (error) {
            console.error("Error fetching favorites:", error);
            res.status(500).json({ message: "خطأ في جلب المفضلات" });
        }
    });
    app.post('/api/users/:userId/favorites', isAuthenticated, async (req, res) => {
        try {
            if (req.params.userId !== req.user.id) {
                return res.status(403).json({ message: "غير مخول لتعديل المفضلات" });
            }
            await storage.addToFavorites(req.params.userId, req.body.songId);
            res.json({ message: "تمت إضافة الأغنية للمفضلات" });
        }
        catch (error) {
            console.error("Error adding to favorites:", error);
            res.status(500).json({ message: "خطأ في إضافة الأغنية للمفضلات" });
        }
    });
    app.delete('/api/users/:userId/favorites/:songId', isAuthenticated, async (req, res) => {
        try {
            if (req.params.userId !== req.user.id) {
                return res.status(403).json({ message: "غير مخول لتعديل المفضلات" });
            }
            await storage.removeFromFavorites(req.params.userId, req.params.songId);
            res.json({ message: "تمت إزالة الأغنية من المفضلات" });
        }
        catch (error) {
            console.error("Error removing from favorites:", error);
            res.status(500).json({ message: "خطأ في إزالة الأغنية من المفضلات" });
        }
    });
}
