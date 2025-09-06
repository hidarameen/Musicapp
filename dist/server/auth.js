import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;
export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
    });
    return session({
        secret: process.env.SESSION_SECRET || 'your-session-secret',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: sessionTtl,
        },
    });
}
export async function setupAuth(app) {
    app.set("trust proxy", 1);
    app.use(getSession());
}
export async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}
export async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
export const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
        req.session?.token;
    if (!token) {
        return res.status(401).json({ message: "غير مخول" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "رمز غير صالح" });
    }
    try {
        const user = await storage.getUser(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "المستخدم غير موجود" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "خطأ في التحقق من الهوية" });
    }
};
