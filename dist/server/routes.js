import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated, hashPassword, verifyPassword, generateToken, verifyToken } from "./auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { loginSchema, registerSchema, } from "../shared/schema.js";
import { registerApiRoutes } from "./api-routes.js";
// Multer configuration for file uploads
const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        }
        else if (file.mimetype.startsWith('audio/')) {
            uploadPath += 'audio/';
        }
        else if (file.mimetype.startsWith('video/')) {
            uploadPath += 'video/';
        }
        else {
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
        if (file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('audio/') ||
            file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بالصور والصوتيات والفيديوهات.'));
        }
    }
});
export async function registerRoutes(app) {
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
        }
        catch (error) {
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
    app.post('/api/upload/image', isAuthenticated, upload.single('image'), async (req, res) => {
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
        }
        catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ message: "فشل في رفع الصورة" });
        }
    });
    app.post('/api/upload/audio', isAuthenticated, upload.single('audio'), async (req, res) => {
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
        }
        catch (error) {
            console.error("Error uploading audio:", error);
            res.status(500).json({ message: "فشل في رفع الملف الصوتي" });
        }
    });
    app.post('/api/upload/video', isAuthenticated, upload.single('video'), async (req, res) => {
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
        }
        catch (error) {
            console.error("Error uploading video:", error);
            res.status(500).json({ message: "فشل في رفع الفيديو" });
        }
    });
    // Authentication routes
    app.post('/api/auth/login', async (req, res) => {
        try {
            const result = loginSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const { username, password } = result.data;
            // Try to find user by username or email
            const user = await storage.getUserByUsername(username) ||
                await storage.getUserByEmail(username);
            if (!user || !user.password) {
                return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
            }
            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
            }
            // Generate token
            const token = generateToken(user.id);
            // Store token in session
            req.session.token = token;
            req.session.userId = user.id;
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
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "خطأ في تسجيل الدخول" });
        }
    });
    app.post('/api/auth/register', async (req, res) => {
        try {
            const result = registerSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    message: "بيانات غير صالحة",
                    errors: result.error.errors
                });
            }
            const { username, password, email, firstName, lastName } = result.data;
            // Check if user already exists
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser) {
                return res.status(409).json({ message: "اسم المستخدم موجود بالفعل" });
            }
            if (email) {
                const existingEmail = await storage.getUserByEmail(email);
                if (existingEmail) {
                    return res.status(409).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
                }
            }
            // Hash password
            const passwordHash = await hashPassword(password);
            // Create user
            const newUser = await storage.createUser({
                username,
                password: passwordHash,
                email: email || undefined,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                isAdmin: false,
            });
            // Generate token
            const token = generateToken(newUser.id);
            // Store token in session
            req.session.token = token;
            req.session.userId = newUser.id;
            res.status(201).json({
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
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "خطأ في إنشاء الحساب" });
        }
    });
    app.get('/api/auth/user', async (req, res) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.session?.token;
            if (!token) {
                return res.status(401).json({ message: "غير مخول" });
            }
            const decoded = verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ message: "رمز غير صالح" });
            }
            const user = await storage.getUser(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: "المستخدم غير موجود" });
            }
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
            });
        }
        catch (error) {
            console.error("Get user error:", error);
            res.status(401).json({ message: "خطأ في التحقق من الهوية" });
        }
    });
    app.post('/api/auth/logout', async (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Session destroy error:", err);
                    return res.status(500).json({ message: "خطأ في تسجيل الخروج" });
                }
                res.clearCookie('connect.sid');
                res.json({ message: "تم تسجيل الخروج بنجاح" });
            });
        }
        catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({ message: "خطأ في تسجيل الخروج" });
        }
    });
    // Register all API routes
    registerApiRoutes(app);
    const httpServer = createServer(app);
    return httpServer;
}
