import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword, verifyPassword, generateToken } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import {
  insertArtistSchema,
  insertAlbumSchema,
  insertSongSchema,
  insertVideoSchema,
  insertPlaylistSchema,
  insertPlaylistSongSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";

// Multer configuration for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audio/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'video/';
    } else {
      uploadPath += 'other/';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, audio, and video files
    if (
      file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('audio/') || 
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بالصور والصوتيات والفيديوهات.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check route
  app.get('/api/health', async (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Serve uploaded files as static content
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for uploaded files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // File upload routes
  app.post('/api/upload/image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const fileUrl = `/uploads/${req.file.path.replace(/\\/g, '/')}`;
      res.json({
        message: "تم رفع الصورة بنجاح",
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });

  app.post('/api/upload/audio', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const fileUrl = `/uploads/${req.file.path.replace(/\\/g, '/')}`;
      res.json({
        message: "تم رفع الملف الصوتي بنجاح",
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ message: "فشل في رفع الملف الصوتي" });
    }
  });

  app.post('/api/upload/video', isAuthenticated, upload.single('video'), async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const fileUrl = `/uploads/${req.file.path.replace(/\\/g, '/')}`;
      res.json({
        message: "تم رفع الفيديو بنجاح",
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).json({ message: "فشل في رفع الفيديو" });
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      // Check if email already exists (if provided)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
        }
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const [newUser] = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(newUser.id);

      // Store token in session
      (req.session as any).token = token;
      (req.session as any).userId = newUser.id;

      res.json({
        message: "تم إنشاء الحساب بنجاح",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isAdmin: newUser.isAdmin,
        },
        token
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "فشل في إنشاء الحساب" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log("🔐 محاولة تسجيل دخول:", { username });

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user && username.includes('@')) {
        // Try to find by email if username looks like an email
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        console.log("❌ المستخدم غير موجود:", username);
        return res.status(401).json({ message: "اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      console.log("✅ تم العثور على المستخدم:", {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      });

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      console.log("🔑 نتيجة التحقق من كلمة المرور:", isValidPassword);

      if (!isValidPassword) {
        console.log("❌ كلمة المرور غير صحيحة للمستخدم:", username);
        return res.status(401).json({ message: "اسم المستخدم/البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Generate token
      const token = generateToken(user.id);

      // Store token in session
      (req.session as any).token = token;
      (req.session as any).userId = user.id;

      res.json({
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        },
        token
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(400).json({ message: "فشل في تسجيل الدخول" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    // مسح الجلسة بسرعة بدون انتظار
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
      });
    }

    // استجابة فورية بدون انتظار
    res.clearCookie('connect.sid'); // مسح الكوكي
    res.json({ message: "تم تسجيل الخروج بنجاح" });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(400).json({ message: "فشل في جلب بيانات المستخدم" });
    }
  });

  // مسار للتحقق من المستخدمين الموجودين (للتطوير فقط)
  app.get('/api/debug/users', async (req, res) => {
    try {
      // التحقق من وجود المدير
      const adminUser = await storage.getUserByUsername('admin');

      if (adminUser) {
        res.json({
          adminExists: true,
          adminInfo: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            isAdmin: adminUser.isAdmin,
          }
        });
      } else {
        res.json({
          adminExists: false,
          message: "المدير غير موجود"
        });
      }
    } catch (error) {
      console.error("Error checking users:", error);
      res.status(500).json({ message: "خطأ في التحقق من المستخدمين" });
    }
  });

  // Artists routes
  app.get("/api/artists", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutes cache
        'ETag': `artists-${Date.now()}`,
      });

      const artists = await storage.getArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.getArtist(req.params.id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.post("/api/artists", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      const artistData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(artistData);
      res.json(artist);
    } catch (error) {
      console.error("Error creating artist:", error);
      res.status(400).json({ message: "Failed to create artist" });
    }
  });

  app.put("/api/artists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      const artistData = insertArtistSchema.partial().parse(req.body);
      const artist = await storage.updateArtist(req.params.id, artistData);
      res.json(artist);
    } catch (error) {
      console.error("Error updating artist:", error);
      res.status(400).json({ message: "فشل في تحديث الفنان" });
    }
  });

  app.delete("/api/artists/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteArtist(req.params.id);
      res.json({ message: "Artist deleted successfully" });
    } catch (error) {
      console.error("Error deleting artist:", error);
      res.status(500).json({ message: "Failed to delete artist" });
    }
  });

  // Albums routes
  app.get("/api/albums", async (req, res) => {
    try {
      const albums = await storage.getAlbums();
      res.json(albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
      res.status(500).json({ message: "Failed to fetch albums" });
    }
  });

  app.get("/api/albums/:id", async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }
      res.json(album);
    } catch (error) {
      console.error("Error fetching album:", error);
      res.status(500).json({ message: "Failed to fetch album" });
    }
  });

  app.get("/api/artists/:artistId/albums", async (req, res) => {
    try {
      const albums = await storage.getAlbumsByArtist(req.params.artistId);
      res.json(albums);
    } catch (error) {
      console.error("Error fetching artist albums:", error);
      res.status(500).json({ message: "Failed to fetch artist albums" });
    }
  });

  app.get("/api/albums/:albumId/songs", async (req, res) => {
    try {
      const songs = await storage.getSongsByAlbum(req.params.albumId);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching album songs:", error);
      res.status(500).json({ message: "Failed to fetch album songs" });
    }
  });

  app.post("/api/albums", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const albumData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum(albumData);
      res.json(album);
    } catch (error) {
      console.error("Error creating album:", error);
      res.status(400).json({ message: "Failed to create album" });
    }
  });

  app.put("/api/albums/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      const albumData = insertAlbumSchema.partial().parse(req.body);
      const album = await storage.updateAlbum(req.params.id, albumData);
      res.json(album);
    } catch (error) {
      console.error("Error updating album:", error);
      res.status(400).json({ message: "فشل في تحديث الألبوم" });
    }
  });

  app.delete("/api/albums/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const albumId = req.params.id;
      await storage.deleteAlbum(albumId);
      res.json({ message: "Album deleted successfully" });
    } catch (error) {
      console.error("Error deleting album:", error);
      res.status(400).json({ message: "Failed to delete album" });
    }
  });

  // Songs routes
  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/trending", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const songs = await storage.getTrendingSongs(limit);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching trending songs:", error);
      res.status(500).json({ message: "Failed to fetch trending songs" });
    }
  });

  app.get("/api/artists/:artistId/songs", async (req, res) => {
    try {
      const songs = await storage.getSongsByArtist(req.params.artistId);
      res.json(songs);
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      res.status(500).json({ message: "Failed to fetch artist songs" });
    }
  });

  app.post("/api/songs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const songData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(songData);
      res.json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(400).json({ message: "Failed to create song" });
    }
  });

  app.put("/api/songs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      const songData = insertSongSchema.partial().parse(req.body);
      const song = await storage.updateSong(req.params.id, songData);
      res.json(song);
    } catch (error) {
      console.error("Error updating song:", error);
      res.status(400).json({ message: "فشل في تحديث الأغنية" });
    }
  });

  app.delete("/api/songs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const songId = req.params.id;
      await storage.deleteSong(songId);
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(400).json({ message: "Failed to delete song" });
    }
  });

  app.post("/api/songs/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ message: "Play count incremented" });
    } catch (error) {
      console.error("Error incrementing play count:", error);
      res.status(500).json({ message: "Failed to increment play count" });
    }
  });

  // Videos routes
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get("/api/artists/:artistId/videos", async (req, res) => {
    try {
      const videos = await storage.getVideosByArtist(req.params.artistId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching artist videos:", error);
      res.status(500).json({ message: "Failed to fetch artist videos" });
    }
  });

  app.post("/api/videos", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(400).json({ message: "Failed to create video" });
    }
  });

  app.put("/api/videos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "صلاحيات المدير مطلوبة" });
      }

      const videoData = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(req.params.id, videoData);
      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(400).json({ message: "فشل في تحديث الفيديو" });
    }
  });

  app.delete("/api/videos/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const videoId = req.params.id;
      await storage.deleteVideo(videoId);
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(400).json({ message: "Failed to delete video" });
    }
  });

  app.post("/api/videos/:id/view", async (req, res) => {
    try {
      await storage.incrementViewCount(req.params.id);
      res.json({ message: "View count incremented" });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  // Playlists routes
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPlaylists();
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.get("/api/users/:userId/playlists", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const requestedUserId = req.params.userId;

      // Users can only access their own playlists unless admin
      if (currentUserId !== requestedUserId) {
        const user = req.user;
        if (!user?.isAdmin) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const playlists = await storage.getUserPlaylists(requestedUserId);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      res.status(500).json({ message: "Failed to fetch user playlists" });
    }
  });

  app.post("/api/playlists", isAuthenticated, async (req: any, res) => {
    try {
      const playlistData = insertPlaylistSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const playlist = await storage.createPlaylist(playlistData);
      res.json(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(400).json({ message: "Failed to create playlist" });
    }
  });

  app.get("/api/playlists/:id/songs", async (req, res) => {
    try {
      const playlistSongs = await storage.getPlaylistSongs(req.params.id);
      res.json(playlistSongs);
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
      res.status(500).json({ message: "Failed to fetch playlist songs" });
    }
  });

  app.post("/api/playlists/:id/songs", isAuthenticated, async (req: any, res) => {
    try {
      const playlistSongData = insertPlaylistSongSchema.parse({
        ...req.body,
        playlistId: req.params.id,
      });
      const playlistSong = await storage.addSongToPlaylist(playlistSongData);
      res.json(playlistSong);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      res.status(400).json({ message: "Failed to add song to playlist" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites/:songId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const songId = req.params.songId;
      const favorite = await storage.addToFavorites(userId, songId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(400).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:songId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const songId = req.params.songId;
      await storage.removeFromFavorites(userId, songId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get("/api/favorites/:songId/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const songId = req.params.songId;
      const isFavorite = await storage.isFavorite(userId, songId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}