import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated, hashPassword, verifyPassword, generateToken } from "./auth.js";
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
} from "../shared/schema.js";

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
    try {
      // Test database connection by fetching the admin user (or any user)
      await storage.getUserByUsername('admin');
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Root health check for load balancers
  app.get('/health', async (req, res) => {
    res.status(200).send('OK');
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

  // ... باقي الكود بدون تعديل (نفس كودك السابق) ...

  // هنا نهاية الكود
  const httpServer = createServer(app);
  return httpServer;
}
