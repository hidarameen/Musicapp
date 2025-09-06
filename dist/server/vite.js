import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Fallback for production builds where __dirname might be undefined
const getBasePath = () => {
    if (__dirname && __dirname !== 'undefined') {
        return __dirname;
    }
    // Fallback to current working directory
    return process.cwd();
};
const viteLogger = createLogger();
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export async function setupVite(app, server) {
    const serverOptions = {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
    };
    const vite = await createViteServer({
        ...viteConfig,
        configFile: false,
        customLogger: {
            ...viteLogger,
            error: (msg, options) => {
                viteLogger.error(msg, options);
                process.exit(1);
            },
        },
        server: serverOptions,
        appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
            const basePath = getBasePath();
            const clientTemplate = path.resolve(basePath, "..", "client", "index.html");
            // always reload the index.html file from disk incase it changes
            let template = await fs.promises.readFile(clientTemplate, "utf-8");
            template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        }
        catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
}
export function serveStatic(app) {
    const basePath = getBasePath();
    // In production, try multiple possible locations for the build output
    const possiblePaths = [
        // Docker deployment: /app/dist/public
        path.resolve("/app", "dist", "public"),
        // Local deployment from dist/server: ../../dist/public
        path.resolve(basePath, "..", "..", "dist", "public"),
        // Alternative local path
        path.resolve(process.cwd(), "dist", "public"),
    ];
    let distPath = null;
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            distPath = possiblePath;
            log(`Found static files at: ${distPath}`);
            break;
        }
    }
    if (!distPath) {
        throw new Error(`Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Make sure to build the client first`);
    }
    app.use(express.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
