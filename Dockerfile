FROM node:18-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ package.json و package-lock.json
COPY package*.json ./

# تثبيت كل الحزم بما فيها devDependencies
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع (vite + esbuild)
RUN npm run build

# فتح المنفذ 5000
EXPOSE 5000

# تثبيت tsconfig-paths لتعمل aliases في production
RUN npm install tsconfig-paths

# إنشاء ملف Health Check route إذا لم يكن موجود
RUN echo "import express from 'express';\nconst app = express();\napp.get('/health', (_req, res) => res.status(200).send('OK'));\napp.listen(process.env.PORT || 5000);" > health.js

# تشغيل التطبيق مع tsconfig-paths
CMD ["node", "-r", "tsconfig-paths/register", "dist/index.js"]
