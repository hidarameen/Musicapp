import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import compression from "compression";
import { storage } from "./storage";
import { hashPassword } from "./auth";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// إنشاء مدير افتراضي
async function createDefaultAdmin() {
    try {
        const adminUsername = "admin";
        const adminEmail = "admin@music.com";
        const adminPassword = "123456";
        console.log("🔄 فحص وتنظيف المدير الافتراضي...");
        // التحقق من وجود المدير بالفعل
        const existingAdminByUsername = await storage.getUserByUsername(adminUsername);
        const existingAdminByEmail = await storage.getUserByEmail(adminEmail);
        if (existingAdminByUsername || existingAdminByEmail) {
            console.log("ℹ️  المدير الافتراضي موجود بالفعل");
            console.log("   اسم المستخدم: admin");
            console.log("   كلمة المرور: 123456");
            return;
        }
        // إنشاء المدير الجديد
        const hashedPassword = await hashPassword(adminPassword);
        await storage.createUser({
            username: adminUsername,
            password: hashedPassword,
            email: adminEmail,
            firstName: "مدير",
            lastName: "النظام",
            isAdmin: true,
        });
        console.log("✅ تم إنشاء المدير الافتراضي الجديد:");
        console.log("   اسم المستخدم: admin");
        console.log("   كلمة المرور: 123456");
        console.log("   ⚠️  يرجى تغيير كلمة المرور بعد أول تسجيل دخول!");
    }
    catch (error) {
        console.error("❌ خطأ في إنشاء المدير الافتراضي:", error);
    }
}
// Add compression middleware for better performance
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses larger than 1KB
}));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
(async () => {
    const server = await registerRoutes(app);
    // إنشاء المدير الافتراضي عند بدء تشغيل الخادم
    await createDefaultAdmin();
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await setupVite(app, server);
    }
    else {
        serveStatic(app);
    }
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    server.listen(port, host, () => {
        log(`serving on ${host}:${port}`);
    });
})();
